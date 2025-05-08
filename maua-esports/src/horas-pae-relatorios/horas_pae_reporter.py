import io
import requests
import pandas as pd
from fpdf import FPDF
from datetime import datetime
from config import Config
import logging

logger = logging.getLogger(__name__)

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
        """Retorna (start_timestamp, end_timestamp) do semestre atual em milissegundos"""
        now = datetime.now()
        year = now.year
    
        # Semestre 1: Janeiro-Junho (mês 1-6)
        # Semestre 2: Julho-Dezembro (mês 7-12)
        if now.month <= 6:
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 6, 30, 23, 59, 59)
        else:
            start_date = datetime(year, 7, 1)
            end_date = datetime(year, 12, 31, 23, 59, 59)
    
        # Converte para timestamp em milissegundos (igual ao formato JavaScript)
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
            logger.info(f"Found {len(self.modalidades)} modalities")

            logger.info("Fetching trains data...")
            trains_response = requests.get(
                f"{self.api_base_url}/trains/all",
                headers={"Authorization": f"Bearer {self.api_token}"},
                timeout=10
            )
            trains_response.raise_for_status()
            trains_data = trains_response.json()
            logger.info(f"Processed {len(trains_data)} trains")
            
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
        
            # Se não forem fornecidas datas, usa o semestre atual
        if start_date is None or end_date is None:
            start_date, end_date = self.get_current_semester_bounds()
    
        player_hours = {}
        train_count = 0
        player_count = 0
        current_semester_train_count = 0
    
        for train in trains_data:
            if not isinstance(train, dict):
                continue
            
            # Filtra por status
            if train.get("Status") != "ENDED":
                continue
            
            # Filtra por data do treino (dentro do semestre atual)
            train_timestamp = train.get("StartTimestamp")
            if not train_timestamp or not (start_date <= train_timestamp <= end_date):
                continue
            
            modality_id = train.get("ModalityId")
            if not modality_id:
                continue
            
            modality = self.modalidades.get(str(modality_id))  # Ensure string key
            if not modality or not isinstance(modality, dict):
                continue
            
            attended_players = train.get("AttendedPlayers", [])
            if not isinstance(attended_players, list):
                continue
            
            train_count += 1
            current_semester_train_count += 1
        
            for player in attended_players:
                try:
                    # Verifica campos obrigatórios
                    if not all(k in player for k in ["PlayerId", "EntranceTimestamp", "ExitTimestamp"]):
                        continue
                    
                    # Garante que os timestamps estão dentro do semestre
                    entrance_ts = player["EntranceTimestamp"]
                    exit_ts = player["ExitTimestamp"]
                
                    if not (start_date <= entrance_ts <= end_date) or not (start_date <= exit_ts <= end_date):
                        continue
                    
                    player_id = str(player["PlayerId"])
                    duration = (exit_ts - entrance_ts) / (1000 * 60 * 60)  # Converte para horas
                
                    if player_id not in player_hours:
                        player_hours[player_id] = {
                            "name": player_id,
                            "hours": 0,
                            "team": modality.get("Name", "Unknown"),
                            "last_train_date": 0
                        }
                
                    player_hours[player_id]["hours"] += duration
                    player_count += 1
                
                    # Atualiza a data do último treino
                    if train_timestamp > player_hours[player_id]["last_train_date"]:
                        player_hours[player_id]["last_train_date"] = train_timestamp
                    
                except (TypeError, KeyError) as e:
                    logger.warning(f"Error processing player data: {e}")
                    continue
                
        logger.info(f"Processed {train_count} total trains (current semester: {current_semester_train_count})")
        logger.info(f"Current semester players: {player_count} attendances")
    
        # Organiza por time
        self.times_data = {mod.get("Name", f"Team_{idx}"): {} 
                      for idx, mod in enumerate(self.modalidades.values())}
    
        for player_id, data in player_hours.items():
            team_name = data["team"]
            if team_name in self.times_data:
                self.times_data[team_name][player_id] = data

    def generate_pdf(self, team_name):
        try:
            if team_name not in self.times_data:
                raise ValueError(f"Time '{team_name}' não encontrado")
            
            team_data = self.times_data[team_name]
            if not team_data:
                raise ValueError(f"Nenhum dado de jogador para o time '{team_name}'")
        
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", "B", 16)
        
            # Cabeçalho
            pdf.cell(200, 10, f"Relatório PAE - {team_name}", 0, 1, 'C')
            pdf.cell(200, 10, f"Semestre: {self.semestre_atual}", 0, 1, 'C')
            pdf.ln(10)
        
            # Tabela
            pdf.set_font("Arial", "B", 12)
            pdf.cell(100, 10, "Jogador", 1)
            pdf.cell(40, 10, "Horas", 1)
            pdf.cell(50, 10, "Rank", 1, 1)
        
            pdf.set_font("Arial", "", 12)
            for player in sorted(team_data.values(), 
                           key=lambda x: x["hours"], 
                           reverse=True):
                pdf.cell(100, 10, player["name"], 1)
                pdf.cell(40, 10, str(round(player["hours"], 1)), 1)
                pdf.cell(50, 10, self.get_rank_name(player["hours"]), 1, 1)
        
            # SOLUÇÃO: Remova o .encode('latin-1') pois output() já retorna bytes
            return pdf.output(dest='S')  # Modificado aqui
        
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise

    def generate_excel(self, team_name):
        try:
            if team_name not in self.times_data:
                raise ValueError(f"Team '{team_name}' not found in data")
                
            team_data = self.times_data[team_name]
            if not team_data:
                raise ValueError(f"No player data available for team '{team_name}'")
                
            # Create DataFrame
            df = pd.DataFrame(list(team_data.values()))
            df = df.sort_values(by='hours', ascending=False)
            df['Rank'] = df['hours'].apply(self.get_rank_name)
            df['Horas'] = df['hours'].apply(lambda x: round(x, 1))
            df = df[['name', 'Horas', 'Rank']]
            df.columns = ['Jogador', 'Horas', 'Rank']
            
            # Create Excel file in memory
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Relatorio PAE')
                worksheet = writer.sheets['Relatorio PAE']
                worksheet.column_dimensions['A'].width = 30
                worksheet.column_dimensions['B'].width = 15
                worksheet.column_dimensions['C'].width = 25
                
            output.seek(0)
            return output.getvalue()
        except Exception as e:
            logger.error(f"Excel generation failed: {str(e)}")
            raise

    def get_rank_name(self, hours):
        if not isinstance(hours, (int, float)):
            return "N/A"
            
        if hours >= 80: return "Lenda (Diamante)"
        if hours >= 70: return "Mestre (Vermelho)"
        if hours >= 60: return "Elite (Roxo)"
        if hours >= 50: return "Veterano (Esmeralda)"
        if hours >= 35: return "Experiente (Azul)"
        if hours >= 25: return "Avançado (Ouro)"
        if hours >= 15: return "Intermediário (Prata)"
        if hours >= 10: return "Novato (Bronze)"
        if hours >= 1: return "Iniciante (Branco)"
        return "Sem rank"