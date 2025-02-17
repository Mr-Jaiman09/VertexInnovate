# main.py
from app import create_app
from config import Config

app, supabase = create_app(Config)

# This is required for Vercel
app.debug = False

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)