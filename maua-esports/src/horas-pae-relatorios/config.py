import os

class Config:
    def __init__(self):
        self.API_BASE_URL = os.getenv('API_BASE_URL', 'https://api-esports.lcstuber.net')
        self.API_TOKEN = os.getenv('API_TOKEN', 'frontendmauaesports')
        self.DEBUG = os.getenv('DEBUG', 'True') == 'True'