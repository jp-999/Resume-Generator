from flask import Flask, request, jsonify, send_file, render_template, redirect, url_for, make_response
from flask_cors import CORS
import pdfkit
import os
import json
from datetime import datetime
import platform
from io import BytesIO
import tempfile

app = Flask(__name__,
    template_folder='templates',    # Point to the templates folder
    static_folder='static'         # Point to the static folder
)
CORS(app)

# Configure wkhtmltopdf path based on OS
if platform.system() == 'Windows':
    WKHTMLTOPDF_PATH = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
    if not os.path.exists(WKHTMLTOPDF_PATH):
        WKHTMLTOPDF_PATH = os.environ.get('WKHTMLTOPDF_PATH', 'wkhtmltopdf')
else:
    WKHTMLTOPDF_PATH = 'wkhtmltopdf'

try:
    config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)
except Exception as e:
    print(f"Warning: Could not configure wkhtmltopdf: {str(e)}")
    config = None

# Directory for storing generated PDFs
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'generated')
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

@app.route('/preview-resume', methods=['POST'])
def preview_resume():
    try:
        # Get form data
        data = request.form.to_dict()
        
        # Store the form data in session or pass directly
        return render_template('pages/preview.html', 
                             resume_data=data, 
                             active_page='preview',
                             templates=TEMPLATES)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download-pdf', methods=['POST'])
def download_pdf():
    try:
        if config is None:
            return jsonify({
                'error': 'PDF generation is not configured. Please install wkhtmltopdf: https://wkhtmltopdf.org/downloads.html'
            }), 500

        # Get form data
        data = request.form.to_dict()
        
        # Render the PDF-specific template with the form data
        html_content = render_template('resume_templates/pdf_template.html', resume_data=data)
        
        try:
            # PDF options for better rendering
            pdf_options = {
                'page-size': 'Letter',
                'margin-top': '20mm',
                'margin-right': '20mm',
                'margin-bottom': '20mm',
                'margin-left': '20mm',
                'encoding': 'UTF-8',
                'no-outline': None,
                'enable-local-file-access': None,
                'print-media-type': None,
                'disable-smart-shrinking': None,
            }
            
            # Convert HTML to PDF using the configuration
            pdf = pdfkit.from_string(html_content, False, configuration=config, options=pdf_options)
            
            # Create response with PDF
            response = make_response(pdf)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f'attachment; filename={data.get("name", "resume").lower().replace(" ", "_")}.pdf'
            
            return response
            
        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            return jsonify({
                'error': f'PDF generation failed: {str(e)}. Please make sure wkhtmltopdf is installed correctly.'
            }), 500
            
    except Exception as e:
        print(f"General Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_resume():
    action = request.form.get('action', 'preview')
    if action == 'download':
        return download_pdf()
    return preview_resume()

@app.route('/api/templates', methods=['GET'])
def get_templates():
    return jsonify(TEMPLATES)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('pages/404.html'), 404

if __name__ == '__main__':
    # Print startup information
    print(f"Operating System: {platform.system()}")
    print(f"wkhtmltopdf path: {WKHTMLTOPDF_PATH}")
    print(f"PDF config: {'Configured' if config else 'Not configured'}")
    
    app.run(debug=True, port=5000) 