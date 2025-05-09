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
    
    # Para PDF: manter apenas caracteres Latin-1
    cleaned = ''.join(char for char in text if ord(char) < 256 or char.isspace())
    
    # Para Excel: remover caracteres inválidos em nomes de abas
    if for_excel:
        invalid_chars = [':', '*', '?', '/', '\\', '[', ']']
        for char in invalid_chars:
            cleaned = cleaned.replace(char, '')
    
    return cleaned

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
            self.modalidades = mod_response.json()
            logger.info(f"Found {len(self.modalidades)} modalities: {list(self.modalidades.keys())}")

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

    def process_data(self, trains_data, start_date=None, end_date=None):
        if not isinstance(trains_data, list):
            raise ValueError("Expected list of trains data")
        
        if start_date is None or end_date is None:
            start_date, end_date = self.get_current_semester_bounds()
    
        player_hours = {}
        train_count = 0
        player_count = 0
        current_semester_train_count = 0
    
        for train in trains_data:
            if not isinstance(train, dict):
                logger.warning(f"Invalid train data: {train}")
                continue
            if train.get("Status") != "ENDED":
                continue
            train_timestamp = train.get("StartTimestamp")
            if not train_timestamp or not (start_date <= train_timestamp <= end_date):
                continue
            modality_id = train.get("ModalityId")
            if not modality_id:
                logger.warning(f"Train missing ModalityId: {train}")
                continue
            modality = self.modalidades.get(str(modality_id))
            if not modality or not isinstance(modality, dict):
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
                
                    if player_id not in player_hours:
                        player_hours[player_id] = {
                            "name": player_id,
                            "hours": 0,
                            "team": modality.get("Name", "Unknown"),
                            "last_train_date": 0
                        }
                
                    player_hours[player_id]["hours"] += duration
                    player_count += 1
                    if train_timestamp > player_hours[player_id]["last_train_date"]:
                        player_hours[player_id]["last_train_date"] = train_timestamp
                    
                except (TypeError, KeyError) as e:
                    logger.warning(f"Error processing player data: {e}, player: {player}")
                    continue
                
        logger.info(f"Processed {train_count} total trains (current semester: {current_semester_train_count})")
        logger.info(f"Current semester players: {player_count} attendances")
    
        self.times_data = {mod.get("Name", f"Team_{idx}"): {} 
                           for idx, mod in enumerate(self.modalidades.values())}
        logger.info(f"Initialized times_data with teams: {list(self.times_data.keys())}")
    
        for player_id, data in player_hours.items():
            team_name = data["team"]
            if team_name in self.times_data:
                self.times_data[team_name][player_id] = data
            else:
                logger.warning(f"Team {team_name} not found in times_data")
        
        logger.info(f"Populated times_data: { {k: len(v) for k, v in self.times_data.items()} }")

    def generate_pdf(self, teams):
        try:
            logger.info(f"Generating PDF for teams: {teams}")
            pdf = FPDF()
            # Adicionar fonte DejaVuSans
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
                pdf.cell(200, 10, f"Relatório PAE - {team_name}", 0, 1, 'C')
                pdf.cell(200, 10, f"Semestre: {self.semestre_atual}", 0, 1, 'C')
                pdf.ln(10)
                
                pdf.set_font("DejaVu", "", 12)
                pdf.cell(100, 10, "Jogador", 1)
                pdf.cell(40, 10, "Horas", 1, 1)
                
                pdf.set_font("DejaVu", "", 12)
                for player in sorted(team_data.values(), 
                                    key=lambda x: x["hours"], 
                                    reverse=True):
                    pdf.cell(100, 10, player["name"], 1)
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
                    
                    # Limpar o nome da equipe para Excel (remover caracteres inválidos para abas)
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
        
        teams = data.get('teams')
        if not teams:
            logger.error("Missing teams parameter in request")
            return jsonify({"error": "Missing teams parameter"}), 400
        
        reporter.fetch_data()
        pdf_data = reporter.generate_pdf(teams)
        
        filename = f'relatorio_pae_{"todas_modalidades" if len(teams) > 1 else teams[0]}_{reporter.semestre_atual}.pdf'
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
        
        teams = data.get('teams')
        if not teams:
            logger.error("Missing teams parameter in request")
            return jsonify({"error": "Missing teams parameter"}), 400
        
        reporter.fetch_data()
        excel_data = reporter.generate_excel(teams)
        
        filename = f'relatorio_pae_{"todas_modalidades" if len(teams) > 1 else teams[0]}_{reporter.semestre_atual}.xlsx'
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