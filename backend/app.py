from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory for storing generated PDFs
UPLOAD_FOLDER = 'static/generated'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/generate', methods=['POST'])
def generate_resume():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['name', 'email', 'phone']):
            return jsonify({'error': 'Missing required fields'}), 400

        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{data['name'].replace(' ', '_')}_{timestamp}.pdf"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Create PDF
        doc = canvas.Canvas(filepath, pagesize=letter)
        
        # Add content to PDF
        y_position = 750
        
        # Header
        doc.setFont("Helvetica-Bold", 16)
        doc.drawString(100, y_position, data['name'])
        y_position -= 20
        
        doc.setFont("Helvetica", 12)
        doc.drawString(100, y_position, f"Email: {data['email']}")
        y_position -= 20
        doc.drawString(100, y_position, f"Phone: {data['phone']}")
        y_position -= 40

        # Sections
        sections = [
            ('Professional Summary', data.get('summary', '')),
            ('Skills', data.get('skills', '')),
            ('Experience', data.get('experience', '')),
            ('Education', data.get('education', ''))
        ]

        for title, content in sections:
            if content:
                doc.setFont("Helvetica-Bold", 14)
                doc.drawString(100, y_position, title)
                y_position -= 20
                
                doc.setFont("Helvetica", 12)
                # Split content into lines to avoid text overflow
                words = content.split()
                line = []
                for word in words:
                    line.append(word)
                    if len(' '.join(line)) > 60:  # Approximate characters per line
                        doc.drawString(100, y_position, ' '.join(line[:-1]))
                        line = [line[-1]]
                        y_position -= 15
                if line:
                    doc.drawString(100, y_position, ' '.join(line))
                y_position -= 30

        doc.save()

        return send_file(
            filepath,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    templates = [
        {
            'id': 1,
            'name': 'Professional',
            'description': 'Clean and modern design suitable for any industry',
            'preview': '/templates/professional.png'
        },
        {
            'id': 2,
            'name': 'Creative',
            'description': 'Stand out with a unique and artistic layout',
            'preview': '/templates/creative.png'
        },
        {
            'id': 3,
            'name': 'Minimal',
            'description': 'Simple and elegant design focusing on content',
            'preview': '/templates/minimal.png'
        },
        {
            'id': 4,
            'name': 'Executive',
            'description': 'Sophisticated design for senior positions',
            'preview': '/templates/executive.png'
        }
    ]
    return jsonify(templates)

if __name__ == '__main__':
    app.run(debug=True, port=5000) 