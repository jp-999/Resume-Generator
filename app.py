from flask import Flask, render_template, request, send_file 
from reportlab.lib.pagesizes import letter 
from reportlab.pdfgen import canvas 
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_resume():
    try:
        name = request.form.get('name', 'N/A').strip()
        email = request.form.get('email', 'N/A').strip()
        phone = request.form.get('phone', 'N/A').strip()
        summary = request.form.get('summary', 'N/A').strip()
        skills = request.form.get('skills', 'N/A').strip()
        experience = request.form.get('experience', 'N/A').strip()
        education = request.form.get('education', 'N/A').strip()
        
        if not name or not email or not phone:
            return "Missing required fields", 400
        
        pdf_filename = f"{name.replace(' ', '_')}_resume.pdf"
        pdf_path = os.path.join("static", pdf_filename)
        os.makedirs("static", exist_ok=True)
        
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, f"{name}")
        c.setFont("Helvetica", 12)
        c.drawString(100, 730, f"Email: {email}")
        c.drawString(100, 710, f"Phone: {phone}")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, 680, "Professional Summary:")
        c.setFont("Helvetica", 12)
        # Split summary into multiple lines if needed
        summary_lines = [summary[i:i+60] for i in range(0, len(summary), 60)]
        y_position = 660
        for line in summary_lines:
            c.drawString(120, y_position, line)
            y_position -= 20
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, y_position - 20, "Skills:")
        c.setFont("Helvetica", 12)
        c.drawString(120, y_position - 40, skills)
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, y_position - 70, "Experience:")
        c.setFont("Helvetica", 12)
        c.drawString(120, y_position - 90, experience)
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, y_position - 120, "Education:")
        c.setFont("Helvetica", 12)
        c.drawString(120, y_position - 140, education)
        
        c.save()
        
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True)
