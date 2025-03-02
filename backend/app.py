from flask import Flask, request, jsonify, send_file, render_template, redirect, url_for
from flask_cors import CORS
import pdfkit
import os
import json
from datetime import datetime
from io import BytesIO

app = Flask(__name__,
    template_folder='templates',    # Point to the templates folder
    static_folder='static'         # Point to the static folder
)
CORS(app)

# Configure pdfkit to use wkhtmltopdf
WKHTMLTOPDF_PATH = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)

# Directory for storing generated PDFs
UPLOAD_FOLDER = 'static/generated'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Available templates
TEMPLATES = {
    'modern': {
        'name': 'Modern',
        'description': 'A clean and modern design perfect for tech and creative professionals.',
        'preview': '/static/templates/modern.png'
    },
    'classic': {
        'name': 'Classic',
        'description': 'A timeless design suitable for all industries and experience levels.',
        'preview': '/static/templates/classic.png'
    },
    'minimal': {
        'name': 'Minimal',
        'description': 'A minimalist design that puts your content first.',
        'preview': '/static/templates/minimal.png'
    },
    'executive': {
        'name': 'Executive',
        'description': 'An executive-style template perfect for senior positions.',
        'preview': '/static/templates/executive.png'
    }
}

@app.route('/')
def index():
    template = request.args.get('template', 'modern')
    return render_template('index.html', active_page='home', selected_template=template, templates=TEMPLATES)

@app.route('/templates')
def templates():
    return render_template('pages/templates.html', templates=TEMPLATES)

@app.route('/pages/tips')
def tips():
    return render_template('pages/tips.html', templates=TEMPLATES)

@app.route('/about')
def about():
    return render_template('pages/about.html', active_page='about', templates=TEMPLATES)

@app.route('/ats-checker')
def ats_checker():
    return render_template('pages/ats-checker.html', active_page='ats-checker', templates=TEMPLATES)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/generate', methods=['POST'])
def generate_resume():
    try:
        # Get form data
        data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'summary': request.form.get('summary'),
            'skills': request.form.get('skills'),
            'experience': request.form.get('experience'),
            'education': request.form.get('education'),
            'date': datetime.now().strftime("%B %d, %Y")
        }

        # Get selected template
        template_name = request.form.get('template', 'modern')
        
        # Convert skills, experience and education to lists if they contain newlines
        data['skills'] = data['skills'].split('\n') if data['skills'] else []
        data['experience'] = data['experience'].split('\n') if data['experience'] else []
        data['education'] = data['education'].split('\n') if data['education'] else []

        # Generate HTML from template
        html_content = render_template(f'resume_templates/{template_name}.html', **data)

        # PDF options
        options = {
            'page-size': 'Letter',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None
        }

        # Generate PDF
        pdf = pdfkit.from_string(html_content, False, options=options, configuration=config)
        
        # Create response
        return send_file(
            BytesIO(pdf),
            download_name=f"resume_{data['name'].lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    return jsonify(TEMPLATES)

if __name__ == '__main__':
    app.run(debug=True, port=5000) 