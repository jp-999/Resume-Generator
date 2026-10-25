from flask import Flask, request, jsonify, send_file, render_template, redirect, url_for, make_response
from flask_cors import CORS
import pdfkit
import os
import json
from datetime import datetime
import platform
from io import BytesIO
import tempfile
import PyPDF2
from docx import Document
import re
from werkzeug.utils import secure_filename

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
GENERATED_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'generated')
os.makedirs(GENERATED_FOLDER, exist_ok=True)

# Configure upload folder for resume files
UPLOAD_FOLDER = os.path.join('static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
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

@app.route('/parse-resume', methods=['POST'])
def parse_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get file extension
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        
        if file_ext not in ['pdf', 'docx', 'txt']:
            return jsonify({'error': 'Invalid file format'}), 400
            
        # Save the file temporarily to serve to the client-side parser
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # For PDF files, we'll use the client-side JS parser
        if file_ext == 'pdf':
            # Return the file URL for client-side processing
            file_url = url_for('static', filename=f'uploads/{filename}')
            return jsonify({
                'fileUrl': file_url,
                'usePdfParser': True
            })
        
        # For non-PDF files, use the server-side parser
        text = ''
        
        # Handle DOCX files
        if file_ext == 'docx':
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + '\n'
        # Handle TXT files
        elif file_ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
        # Parse the extracted text
        parsed_data = parse_resume_text(text)
        return jsonify(parsed_data)
        
    except Exception as e:
        print(f"Resume parsing error: {str(e)}")
        return jsonify({'error': f'Failed to parse resume: {str(e)}'}), 500

def parse_resume_text(text):
    # Initialize parsed data
    parsed_data = {
        'name': '',
        'email': '',
        'phone': '',
        'summary': '',
        'skills': [],
        'experience': [],  # Changed from string to array
        'education': []    # Changed from string to array
    }
    
    # Split text into lines and sections
    lines = text.split('\n')
    
    # Common section headers
    section_headers = {
        'summary': ['summary', 'professional summary', 'profile', 'objective', 'about'],
        'experience': ['experience', 'work experience', 'employment history', 'work history', 'professional experience'],
        'education': ['education', 'educational background', 'academic background', 'academic qualifications'],
        'skills': ['skills', 'technical skills', 'core competencies', 'expertise', 'qualifications']
    }
    
    # Extract email
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    email_matches = re.findall(email_pattern, text)
    if email_matches:
        parsed_data['email'] = email_matches[0]
    
    # Extract phone
    phone_patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Standard US format
        r'\+\d{1,3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{4}\b',  # International format
        r'\(\d{3}\)\s*\d{3}[-.]?\d{4}\b'  # (123) 456-7890 format
    ]
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            parsed_data['phone'] = phone_match.group()
            break
    
    # Extract name (usually first line that's not email/phone/section header)
    for line in lines[:5]:  # Check first 5 lines
        line = line.strip()
        if line and not re.search(email_pattern, line) and not any(pattern in line.lower() for pattern in sum(section_headers.values(), [])):
            if not re.search(r'\d', line):  # Avoid lines with numbers (likely phone)
                parsed_data['name'] = line
                break
    
    # Process text into sections
    current_section = []
    current_type = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a section header
        line_lower = line.lower()
        section_type = None
        
        for key, headers in section_headers.items():
            if any(header in line_lower for header in headers):
                section_type = key
                break
        
        if section_type:
            # Save previous section
            if current_type and current_section:
                if current_type == 'skills':
                    # Process skills section
                    skills_text = ' '.join(current_section)
                    parsed_data['skills'] = extract_skills(skills_text)
                elif current_type == 'experience':
                    # Convert experience section to array format with at least one entry
                    parsed_data['experience'] = [{
                        'company': '',
                        'position': '',
                        'startDate': '',
                        'endDate': '',
                        'description': '\n'.join(current_section)
                    }]
                elif current_type == 'education':
                    # Convert education section to array format with at least one entry
                    parsed_data['education'] = [{
                        'degree': '',
                        'institution': '',
                        'startDate': '',
                        'endDate': '',
                        'description': '\n'.join(current_section)
                    }]
                else:
                    parsed_data[current_type] = '\n'.join(current_section)
            
            current_type = section_type
            current_section = []
        else:
            current_section.append(line)
    
    # Save last section
    if current_type and current_section:
        if current_type == 'skills':
            skills_text = ' '.join(current_section)
            parsed_data['skills'] = extract_skills(skills_text)
        elif current_type == 'experience':
            parsed_data['experience'] = [{
                'company': '',
                'position': '',
                'startDate': '',
                'endDate': '',
                'description': '\n'.join(current_section)
            }]
        elif current_type == 'education':
            parsed_data['education'] = [{
                'degree': '',
                'institution': '',
                'startDate': '',
                'endDate': '', 
                'description': '\n'.join(current_section)
            }]
        else:
            parsed_data[current_type] = '\n'.join(current_section)
    
    # If no explicit summary section found, try to extract it from the beginning
    if not parsed_data['summary']:
        summary_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(header in line.lower() for header in sum(section_headers.values(), [])):
                if not re.search(email_pattern, line) and not re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', line):
                    summary_lines.append(line)
            if len(summary_lines) >= 3:  # Limit to first few lines
                break
        if summary_lines:
            parsed_data['summary'] = '\n'.join(summary_lines)
    
    # If no skills found in skills section, try to extract from whole text
    if not parsed_data['skills']:
        parsed_data['skills'] = extract_skills(text)
    
    # Ensure experience and education are always arrays
    if not isinstance(parsed_data['experience'], list):
        parsed_data['experience'] = []
    
    if not isinstance(parsed_data['education'], list):
        parsed_data['education'] = []
    
    # Make sure experience and education have at least one empty entry
    if not parsed_data['experience']:
        parsed_data['experience'] = [{
            'company': '',
            'position': '',
            'startDate': '',
            'endDate': '',
            'description': ''
        }]
    
    if not parsed_data['education']:
        parsed_data['education'] = [{
            'degree': '',
            'institution': '',
            'startDate': '',
            'endDate': '',
            'description': ''
        }]
    
    print("Parsed resume data:", parsed_data)
    return parsed_data

def extract_skills(text):
    # Common technical skills and keywords
    common_skills = {
        'programming': ['python', 'java', 'javascript', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'golang', 'rust',
                       'html', 'css', 'sql', 'nosql', 'react', 'angular', 'vue', 'node.js', 'django', 'flask',
                       'spring', 'express', 'typescript'],
        'tools': ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'terraform', 'ansible',
                 'jira', 'confluence', 'bitbucket', 'github', 'gitlab', 'maven', 'gradle', 'npm', 'yarn'],
        'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server',
                     'dynamodb', 'cassandra', 'firebase'],
        'methodologies': ['agile', 'scrum', 'kanban', 'waterfall', 'tdd', 'bdd', 'ci/cd', 'devops', 'lean'],
        'soft_skills': ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
                       'project management', 'time management', 'critical thinking', 'collaboration']
    }
    
    found_skills = set()
    text_lower = text.lower()
    
    # Extract skills from each category
    for category, skills in common_skills.items():
        for skill in skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.add(skill)
    
    # Also look for comma or bullet-separated lists that might be skills
    skill_lists = re.findall(r'(?:^|\n)(?:[•\-\*]\s*|\w+:\s*)([^.\n]+)(?:\n|$)', text)
    for skill_list in skill_lists:
        skills = [s.strip().lower() for s in re.split(r'[,•\-\*]', skill_list)]
        for skill in skills:
            if len(skill) > 2 and not re.search(r'\d', skill):  # Avoid numbers and very short terms
                found_skills.add(skill)
    
    return sorted(list(found_skills))

@app.errorhandler(404)
def page_not_found(e):
    return render_template('pages/404.html'), 404

if __name__ == '__main__':
    # Print startup information
    print(f"Operating System: {platform.system()}")
    print(f"wkhtmltopdf path: {WKHTMLTOPDF_PATH}")
    print(f"PDF config: {'Configured' if config else 'Not configured'}")
    
    app.run(debug=True, port=5000) 