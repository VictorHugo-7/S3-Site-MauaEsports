from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from horas_pae_reporter import HorasPaeReporter
from config import Config
import io
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["OPTIONS", "POST"],
        "allow_headers": ["Authorization", "Content-Type"]
    }
})
app.config.from_object(Config)

@app.route('/api/generate-pdf-report', methods=['POST', 'OPTIONS'])
def generate_pdf():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authorization
        auth_header = request.headers.get('Authorization')
        if auth_header != 'Bearer frontendmauaesports':
            logger.warning("Unauthorized access attempt")
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data or 'team' not in data:
            logger.error("Missing team parameter")
            return jsonify({'error': 'Missing team parameter'}), 400
            
        logger.info(f"Generating PDF report for team: {data['team']}")
        reporter = HorasPaeReporter()
        reporter.fetch_data()
        
        pdf_data = reporter.generate_pdf(data['team'])
        logger.info("PDF generated successfully")
        
        return send_file(
            io.BytesIO(pdf_data),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"relatorio_pae_{data['team']}_{reporter.semestre_atual}.pdf"
        )
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500

@app.route('/api/generate-excel-report', methods=['POST', 'OPTIONS'])
def generate_excel():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authorization
        auth_header = request.headers.get('Authorization')
        if auth_header != 'Bearer frontendmauaesports':
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data or 'team' not in data:
            return jsonify({'error': 'Missing team parameter'}), 400
            
        logger.info(f"Generating Excel report for team: {data['team']}")
        reporter = HorasPaeReporter()
        reporter.fetch_data()
        
        excel_data = reporter.generate_excel(data['team'])
        logger.info("Excel generated successfully")
        
        return send_file(
            io.BytesIO(excel_data),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f"relatorio_pae_{data['team']}_{reporter.semestre_atual}.xlsx"
        )
    except Exception as e:
        logger.error(f"Error generating Excel: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)