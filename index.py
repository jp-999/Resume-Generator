from backend.app import app
from flask import Flask, Response, request

# This file is needed for Vercel deployment
# The app instance is imported directly from backend/app.py

def handler(request, **kwargs):
    """
    Vercel serverless function handler
    This converts the Vercel request to WSGI format for Flask
    """
    environ = {
        'wsgi.input': request.body,
        'wsgi.errors': None,
        'wsgi.version': (1, 0),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
        'wsgi.url_scheme': request.url.scheme,
        'SERVER_SOFTWARE': 'Vercel',
        'REQUEST_METHOD': request.method,
        'PATH_INFO': request.path,
        'QUERY_STRING': request.query,
        'SERVER_NAME': 'vercel',
        'SERVER_PORT': '443',
        'HTTP_HOST': request.headers.get('host', ''),
    }

    # Add all the headers from the request
    for key, value in request.headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            key = f'HTTP_{key}'
        environ[key] = value

    def start_response(status, headers):
        nonlocal response_headers, status_code
        status_code = int(status.split(' ')[0])
        response_headers = dict(headers)

    status_code = 500
    response_headers = {}
    response_body = []

    # Call the Flask app with the WSGI interface
    for data in app(environ, start_response):
        response_body.append(data)

    # Combine all response parts into a single body
    body = b''.join(response_body)
    
    # Return Vercel response format
    return Response(
        status_code=status_code,
        headers=response_headers,
        body=body
    )

# For local development, if needed
if __name__ == '__main__':
    app.run() 