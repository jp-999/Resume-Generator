from .app import app

# This handler is used by Vercel to run your Flask app
def handler(request, **kwargs):
    return app(request.environ, lambda s, h, b: [s, h, [b if isinstance(b, bytes) else b.encode('utf-8')]]) 