from flask import jsonify, request
from app.api import bp
from app import supabase
from app.ml import skill_analyzer, career_matcher
from app.utils.auth import require_auth

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@bp.route('/analyze-skills', methods=['POST'])
@require_auth
def analyze_skills():
    try:
        data = request.get_json()
        user_id = request.user_id
        
        # Get user's profile from Supabase
        profile = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
        
        # Analyze skills using ML model
        skills_analysis = skill_analyzer.analyze(data['skills'])
        
        # Store analysis results
        supabase.table('skill_assessments').insert({
            'user_id': user_id,
            'assessment_data': skills_analysis,
            'timestamp': 'now()'
        }).execute()
        
        return jsonify(skills_analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/career-recommendations', methods=['GET'])
@require_auth
def get_career_recommendations():
    try:
        user_id = request.user_id
        
        # Get user's skill assessment
        assessment = supabase.table('skill_assessments')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('timestamp', desc=True)\
            .limit(1)\
            .execute()
            
        if not assessment.data:
            return jsonify({'error': 'No skill assessment found'}), 404
            
        # Generate career recommendations
        recommendations = career_matcher.get_recommendations(assessment.data[0])
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

