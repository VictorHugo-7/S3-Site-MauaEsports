import io
import requests
import pandas as pd
from fpdf import FPDF
from datetime import datetime
from config import Config
import logging
from flask import Flask, request, Response, jsonify
from flask_cors import CORS

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Suporte a CORS

def clean_text(text, for_excel=False):
    """
    Limpa o texto para remover caracteres não suportados.
    - Para PDF: remove caracteres fora do intervalo Latin-1 (0-255).
    - Para Excel: remove caracteres inválidos em nomes de abas (:, *, ?, /, \, [, ]).
    """
    if not text:
        return text
    
    cleaned = ''.join(char for char in text if ord(char) < 256 or char.isspace())
    
    if for_excel:
        invalid_chars = [':', '*', '?', '/', '\\', '[', ']']
        for char in invalid_chars:
            cleaned = cleaned.replace(char, '')
    
    return cleaned

def extract_ra_from_email(email):
    """
    Extrai o RA do email institucional (ex: '123456@maua.br' -> '123456').
    """
    if not email:
        return None
    try:
        return email.split("@")[0]
    except IndexError:
        logger.warning(f"Formato de email inválido: {email}")
        return None

class HorasPaeReporter:
    def __init__(self):
        self.config = Config()
        self.modalidades = {}
        self.times_data = {}
        self.semestre_atual = self.get_current_semester()
        self.api_token = self.config.API_TOKEN
        self.api_base_url = self.config.API_BASE_URL

    def get_current_semester(self):
        now = datetime.now()
        return f"{now.year}.1" if now.month <= 6 else f"{now.year}.2"

    def get_current_semester_bounds(self):
        now = datetime.now()
        year = now.year
        if now.month <= 6:
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 6, 30, 23, 59, 59)
        else:
            start_date = datetime(year, 7, 1)
            end_date = datetime(year, 12, 31, 23, 59, 59)
        return int(start_date.timestamp() * 1000), int(end_date.timestamp() * 1000)

    def fetch_data(self):
        try:
            logger.info("Fetching modalities data...")
            mod_response = requests.get(
                f"{self.api_base_url}/modality/all",
                headers={"Authorization": f"Bearer {self.api_token}"},
                timeout=60
            )
            mod_response.raise_for_status()
            mod_data = mod_response.json()
            logger.info(f"Raw modality data: {mod_data}")

            # Handle dictionary or list response
            if isinstance(mod_data, dict):
                # Dictionary of modalities (e.g., {"6360944b04a823de3a359357": {"_id": ..., "Name": ...}})
                self.modalidades = mod_data
                # Validate that each modality has required fields
                for mod_id, mod in self.modalidades.items():
                    if not isinstance(mod, dict) or "_id" not in mod or "Name" not in mod:
                        logger.warning(f"Invalid modality data for ID {mod_id}: {mod}")
                        raise ValueError(f"Invalid modality data for ID {mod_id}")
            elif isinstance(mod_data, list):
                if mod_data and isinstance(mod_data[0], str):
                    # List of team names (e.g., ["Valorant Feminino", "ValorantMisBlue"])
                    self.modalidades = {name: {"Name": name} for name in mod_data}
                elif mod_data and isinstance(mod_data[0], dict):
                    # List of dictionaries (e.g., [{"_id": "mod123", "Name": "Valorant Feminino"}])
                    self.modalidades = {str(mod["_id"]): mod for mod in mod_data}
                else:
                    logger.warning("Unexpected modality data format or empty list")
                    self.modalidades = {}
            else:
                logger.error(f"Expected dict or list from /modality/all, got: {type(mod_data)}")
                raise ValueError("Invalid modality data format")

            logger.info(f"Processed {len(self.modalidades)} modalities: {list(self.modalidades.keys())}")

            logger.info("Fetching trains data...")
            trains_response = requests.get(
                f"{self.api_base_url}/trains/all",
                headers={"Authorization": f"Bearer {self.api_token}"},
                timeout=10
            )
            trains_response.raise_for_status()
            trains_data = trains_response.json()
            logger.info(f"Received {len(trains_data)} trains")

            self.process_data(trains_data)

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            raise Exception(f"Erro na API: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
            raise

    def fetch_user_data(self, discord_ids):
        """
        Busca dados de usuários por Discord IDs e retorna um mapeamento de Discord ID para RA/email.
        """
        try:
            if not discord_ids:
                logger.info("Nenhum Discord ID para buscar.")
                return {}
            discord_ids_param = ",".join(discord_ids)
            logger.info(f"Fetching user data for {len(discord_ids)} Discord IDs")
            response = requests.get(
                f"{self.api_base_url}/usuarios/por-discord-ids?ids={discord_ids_param}",
                headers={"Authorization": f"Bearer {self.api_token}"},
                timeout=10
            )
            response.raise_for_status()
            users = response.json()
            user_map = {}
            for user in users:
                if user.get("discordID"):
                    ra = extract_ra_from_email(user.get("email"))
                    user_map[user["discordID"]] = {
                        "email": user.get("email"),
                        "ra": ra if ra else user["discordID"],
                    }
            logger.info(f"Fetched user data for {len(user_map)} Discord IDs")
            return user_map
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch user data: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Error processing user data: {str(e)}")
            return {}

    def process_data(self, trains_data, start_date=None, end_date=None):
        if not isinstance(trains_data, list):
            raise ValueError("Expected list of trains data")
        
        if start_date is None or end_date is None:
            start_date, end_date = self.get_current_semester_bounds()
    
        player_hours = {}
        train_count = 0
        player_count = 0
        current_semester_train_count = 0
        discord_ids = set()

        # Coleta todos os Discord IDs dos treinos válidos
        for train in trains_data:
            if not isinstance(train, dict):
                logger.warning(f"Invalid train data: {train}")
                continue
            if train.get("Status") != "ENDED":
                continue
            train_timestamp = train.get("StartTimestamp")
            if not train_timestamp or not (start_date <= train_timestamp <= end_date):
                continue
            attended_players = train.get("AttendedPlayers", [])
            if not isinstance(attended_players, list):
                logger.warning(f"Invalid AttendedPlayers in train: {train}")
                continue
            for player in attended_players:
                if player.get("PlayerId"):
                    discord_ids.add(str(player["PlayerId"]))
        
        # Busca dados de usuários para os Discord IDs coletados
        user_map = self.fetch_user_data(discord_ids)
        logger.info(f"User map contains {len(user_map)} entries")
    
        # Calcula horas por jogador e por time
        for train in trains_data:
            if not isinstance(train, dict):
                logger.warning(f"Invalid train data: {train}")
                continue
            if train.get("Status") != "ENDED":
                continue
            train_timestamp = train.get("StartTimestamp")
            if not train_timestamp or not (start_date <= train_timestamp <= end_date):
                continue
            modality_id = str(train.get("ModalityId"))
            if not modality_id:
                logger.warning(f"Train missing ModalityId: {train}")
                continue
            modality = self.modalidades.get(modality_id)
            if not modality:
                logger.warning(f"Modality not found for ModalityId: {modality_id}")
                continue
            attended_players = train.get("AttendedPlayers", [])
            if not isinstance(attended_players, list):
                logger.warning(f"Invalid AttendedPlayers in train: {train}")
                continue
            
            train_count += 1
            current_semester_train_count += 1
        
            for player in attended_players:
                try:
                    if not all(k in player for k in ["PlayerId", "EntranceTimestamp", "ExitTimestamp"]):
                        logger.warning(f"Invalid player data: {player}")
                        continue
                    entrance_ts = player["EntranceTimestamp"]
                    exit_ts = player["ExitTimestamp"]
                    if not (start_date <= entrance_ts <= end_date) or not (start_date <= exit_ts <= end_date):
                        continue
                    player_id = str(player["PlayerId"])
                    duration = (exit_ts - entrance_ts) / (1000 * 60 * 60)
                
                    user_data = user_map.get(player_id, {})
                    display_name = user_data.get("ra", player_id)
                
                    if player_id not in player_hours:
                        player_hours[player_id] = {
                            "name": display_name,
                            "total_hours": 0,
                            "teams": {},
                            "last_train_date": 0
                        }
                
                    if modality_id not in player_hours[player_id]["teams"]:
                        player_hours[player_id]["teams"][modality_id] = {
                            "hours": 0,
                            "team_name": modality["Name"]
                        }
                
                    player_hours[player_id]["teams"][modality_id]["hours"] += duration
                    player_hours[player_id]["total_hours"] += duration
                    player_count += 1
                    if train_timestamp > player_hours[player_id]["last_train_date"]:
                        player_hours[player_id]["last_train_date"] = train_timestamp
                    
                except (TypeError, KeyError) as e:
                    logger.warning(f"Error processing player data: {e}, player: {player}")
                    continue
                
        logger.info(f"Processed {train_count} total trains (current semester: {current_semester_train_count})")
        logger.info(f"Current semester players: {player_count} attendances")
    
        # Inicializa times_data com todos os times
        self.times_data = {mod["Name"]: {} for mod in self.modalidades.values()}
        logger.info(f"Initialized times_data with teams: {list(self.times_data.keys())}")
    
        # Atribui jogadores ao time principal (com mais horas)
        for player_id, data in player_hours.items():
            if not data["teams"]:
                logger.warning(f"Player {player_id} has no team assignments")
                continue
            main_team_id = max(data["teams"], key=lambda k: data["teams"][k]["hours"], default=None)
            if not main_team_id:
                logger.warning(f"Player {player_id} has no valid main team")
                continue
            main_team_name = data["teams"][main_team_id]["team_name"]
            if main_team_name in self.times_data:
                self.times_data[main_team_name][player_id] = {
                    "name": data["name"],
                    "hours": data["total_hours"],
                    "team": main_team_name,
                    "last_train_date": data["last_train_date"]
                }
            else:
                logger.warning(f"Main team {main_team_name} not found in times_data for player {player_id}")
        
        logger.info(f"Populated times_data: {{ {', '.join(f'{k}: {len(v)} players' for k, v in self.times_data.items())} }}")

    def generate_pdf(self, teams):
        try:
            logger.info(f"Generating PDF for teams: {teams}")
            pdf = FPDF()
            pdf.add_font("DejaVu", "", "./fonts/DejaVuSans.ttf", uni=True)
            pdf.set_font("DejaVu", "", 12)
            teams = teams if isinstance(teams, list) else [teams]
            teams_found = [team for team in teams if team in self.times_data]
            
            logger.info(f"Teams found in times_data: {teams_found}")
            if not teams_found:
                raise ValueError(f"Nenhum time válido encontrado: {teams}")

            for team_index, team_name in enumerate(teams_found):
                team_data = self.times_data.get(team_name, {})
                if not team_data:
                    logger.warning(f"No data for team '{team_name}'")
                    continue
                
                if team_index > 0:
                    pdf.add_page()
                
                pdf.add_page()
                pdf.set_font("DejaVu", "", 16)
                pdf.cell(200, 10, f"Relatório PAE - {clean_text(team_name)}", 0, 1, 'C')
                pdf.cell(200, 10, f"Semestre: {self.semestre_atual}", 0, 1, 'C')
                pdf.ln(10)
                
                pdf.set_font("DejaVu", "", 12)
                pdf.cell(100, 10, "Jogador", 1)
                pdf.cell(40, 10, "Horas", 1, 1)
                
                pdf.set_font("DejaVu", "", 12)
                for player in sorted(team_data.values(), 
                                    key=lambda x: x["hours"], 
                                    reverse=True):
                    pdf.cell(100, 10, clean_text(player["name"]), 1)
                    pdf.cell(40, 10, str(round(player["hours"], 1)), 1, 1)
            
            if not pdf.page_no():
                raise ValueError("Nenhum dado disponível para gerar o PDF")
            
            return pdf.output(dest='S')
        
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise

    def generate_excel(self, teams):
        try:
            logger.info(f"Generating Excel for teams: {teams}")
            teams = teams if isinstance(teams, list) else [teams]
            teams_found = [team for team in teams if team in self.times_data]
            
            logger.info(f"Teams found in times_data: {teams_found}")
            if not teams_found:
                raise ValueError(f"Nenhum time válido encontrado: {teams}")

            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                for team_name in teams_found:
                    team_data = self.times_data.get(team_name, {})
                    if not team_data:
                        logger.warning(f"No data for team '{team_name}'")
                        continue
                    
                    df = pd.DataFrame(list(team_data.values()))
                    df = df.sort_values(by='hours', ascending=False)
                    df['Horas'] = df['hours'].apply(lambda x: round(x, 1))
                    df = df[['name', 'Horas']]
                    df.columns = ['Jogador', 'Horas']
                    
                    clean_team_name = clean_text(team_name, for_excel=True)[:31]
                    df.to_excel(writer, index=False, sheet_name=clean_team_name)
                    worksheet = writer.sheets[clean_team_name]
                    worksheet.column_dimensions['A'].width = 30
                    worksheet.column_dimensions['B'].width = 15
                
                if not writer.sheets:
                    raise ValueError("Nenhum dado disponível para gerar o Excel")
            
            output.seek(0)
            return output.getvalue()
        
        except Exception as e:
            logger.error(f"Excel generation failed: {str(e)}")
            raise

# Endpoints Flask
reporter = HorasPaeReporter()

@app.route('/api/generate-pdf-report', methods=['POST'])
def generate_pdf_report():
    try:
        data = request.get_json()
        logger.info(f"Received request data: {data}")
        if not data:
            logger.error("No JSON data provided in request")
            return jsonify({"error": "No JSON data provided"}), 400
        
        teams = data.get('team')
        if not teams:
            logger.error("Missing team parameter in request")
            return jsonify({"error": "Missing team parameter"}), 400
        
        reporter.fetch_data()
        pdf_data = reporter.generate_pdf(teams)
        
        filename = f'relatorio_pae_{"todas_modalidades" if len(teams) > 1 else clean_text(teams[0])}_{reporter.semestre_atual}.pdf'
        return Response(
            pdf_data,
            mimetype='application/pdf',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
    except Exception as e:
        logger.error(f"PDF endpoint error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-excel-report', methods=['POST'])
def generate_excel_report():
    try:
        data = request.get_json()
        logger.info(f"Received request data: {data}")
        if not data:
            logger.error("No JSON data provided in request")
            return jsonify({"error": "No JSON data provided"}), 400
        
        teams = data.get('team')
        if not teams:
            logger.error("Missing team parameter in request")
            return jsonify({"error": "Missing team parameter"}), 400
        
        reporter.fetch_data()
        excel_data = reporter.generate_excel(teams)
        
        filename = f'relatorio_pae_{"todas_modalidades" if len(teams) > 1 else clean_text(teams[0])}_{reporter.semestre_atual}.xlsx'
        return Response(
            excel_data,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
    except Exception as e:
        logger.error(f"Excel endpoint error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)