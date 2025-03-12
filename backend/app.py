from flask import Flask, request, jsonify, send_file, render_template, redirect, url_for
from flask_cors import CORS
import pdfkit
import os
import json
from datetime import datetime
from io import BytesIO
import tempfile

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
    },
    'impact': {
        'name': 'Impact',
        'description': 'A bold and dynamic design with strong visual elements.',
        'preview': '/static/templates/impact.png'
    },
    'unique': {
        'name': 'Unique',
        'description': 'A distinctive split-layout design with a professional sidebar.',
        'preview': '/static/templates/unique.png'
    }
}

# Configuration for PDF generation
PDF_OPTIONS = {
    'page-size': 'Letter',
    'margin-top': '0mm',
    'margin-right': '0mm',
    'margin-bottom': '0mm',
    'margin-left': '0mm',
    'encoding': 'UTF-8',
    'no-outline': None,
    'enable-local-file-access': None,
    'print-media-type': None,  # Use print media type to ensure proper rendering
    'disable-smart-shrinking': None,  # Prevent content from being shrunk
    'quiet': None,  # Suppress console output
    'javascript-delay': 1000,  # Wait for JavaScript to execute
    'no-stop-slow-scripts': None,  # Don't stop slow running scripts
}

@app.route('/')
def index():
    # Render the new home page
    return render_template('pages/home.html', active_page='home', templates=TEMPLATES)

@app.route('/generator')
def generator():
    template = request.args.get('template', 'modern')
    return render_template('pages/generator.html', active_page='generator', selected_template=template, templates=TEMPLATES)

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
        data = {}
        for key, value in request.form.items():
            if value:  # Only include non-empty values
                data[key] = value
        
        # Process sections data if present
        sections = {}
        for key in request.form:
            if key.startswith('section_'):
                section_parts = key.split('_')
                section_type = section_parts[1]
                section_id = section_parts[2]
                field = '_'.join(section_parts[3:])
                
                if section_type not in sections:
                    sections[section_type] = []
                
                # Find or create section
                section = None
                for s in sections[section_type]:
                    if s.get('id') == section_id:
                        section = s
                        break
                
                if not section:
                    section = {'id': section_id}
                    sections[section_type].append(section)
                
                section[field] = request.form[key]
        
        # Add processed sections to data
        for section_type, section_items in sections.items():
            data[section_type] = section_items
        
        # Get template
        template = request.form.get('template', 'classic')
        
        # Render HTML
        html = render_template(f'resume_templates/{template}.html', **data)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp:
            temp_path = temp.name
        
        # Generate PDF
        try:
            # Try to use wkhtmltopdf with the configured options
            pdfkit.from_string(html, temp_path, options=PDF_OPTIONS)
        except Exception as e:
            # Log the error
            print(f"Error generating PDF with wkhtmltopdf: {str(e)}")
            
            # Try with minimal options as fallback
            fallback_options = {
                'page-size': 'Letter',
                'quiet': None,
                'enable-local-file-access': None,
                'print-media-type': None
            }
            pdfkit.from_string(html, temp_path, options=fallback_options)
        
        # Return the PDF file
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            mimetype='application/pdf'
        )
    
    except Exception as e:
        # Log the error
        print(f"Error generating resume: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    return jsonify(TEMPLATES)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('pages/404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000) 