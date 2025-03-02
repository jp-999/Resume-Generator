from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory for storing generated PDFs and templates
UPLOAD_FOLDER = 'static/generated'
TEMPLATES_FOLDER = 'templates'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

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

        # Create PDF with improved styling
        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12
        )
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12
        )

        # Build content
        content = []
        
        # Header
        content.append(Paragraph(data['name'], title_style))
        content.append(Paragraph(f"Email: {data['email']}", normal_style))
        content.append(Paragraph(f"Phone: {data['phone']}", normal_style))
        content.append(Spacer(1, 20))

        # Sections
        sections = [
            ('Professional Summary', data.get('summary', '')),
            ('Skills', data.get('skills', '')),
            ('Experience', data.get('experience', '')),
            ('Education', data.get('education', ''))
        ]

        for title, text in sections:
            if text:
                content.append(Paragraph(title, heading_style))
                content.append(Paragraph(text, normal_style))
                content.append(Spacer(1, 12))

        # Build PDF
        doc.build(content)

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
            'preview': '/templates/professional.png',
            'style': {
                'font': 'Helvetica',
                'colors': {
                    'primary': '#2d3436',
                    'secondary': '#636e72'
                }
            }
        },
        {
            'id': 2,
            'name': 'Creative',
            'description': 'Stand out with a unique and artistic layout',
            'preview': '/templates/creative.png',
            'style': {
                'font': 'Georgia',
                'colors': {
                    'primary': '#6c5ce7',
                    'secondary': '#a29bfe'
                }
            }
        },
        {
            'id': 3,
            'name': 'Minimal',
            'description': 'Simple and elegant design focusing on content',
            'preview': '/templates/minimal.png',
            'style': {
                'font': 'Arial',
                'colors': {
                    'primary': '#2d3436',
                    'secondary': '#b2bec3'
                }
            }
        },
        {
            'id': 4,
            'name': 'Executive',
            'description': 'Sophisticated design for senior positions',
            'preview': '/templates/executive.png',
            'style': {
                'font': 'Times-Roman',
                'colors': {
                    'primary': '#2d3436',
                    'secondary': '#0984e3'
                }
            }
        }
    ]
    return jsonify(templates)

@app.route('/api/preview/<int:template_id>', methods=['POST'])
def preview_template(template_id):
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['name', 'email', 'phone']):
            return jsonify({'error': 'Missing required fields'}), 400

        # Generate preview PDF using template style
        # Implementation similar to generate_resume but with template-specific styling
        # ...

        return jsonify({'message': 'Preview generated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
