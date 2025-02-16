from app import create_app
from config import Config

app, supabase = create_app(Config)

if __name__ == '__main__':
    app.run(debug=True)