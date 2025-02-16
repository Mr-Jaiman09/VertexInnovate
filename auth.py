from functools import wraps
from flask import request, jsonify
from jose import jwt
from app import supabase

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
            
        try:
            # Verify JWT token
            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token,
                supabase._client.supabase_key,
                algorithms=['HS256']
            )
            request.user_id = payload['sub']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
            
    return decorated
