from flask import Flask, render_template, request, redirect, url_for, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os

app = Flask(__name__)

# Define categories as a constant
CATEGORIES = ['Science', 'Technology', 'Engineering', 'Mathematics', 'Arts', 'Social Sciences']

# Initialize Firebase
def initialize_firebase():
    """Initialize Firebase with credentials"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize Firebase with service account
        if os.path.exists('firebase_credentials.json'):
            cred = credentials.Certificate('firebase_credentials.json')
            firebase_admin.initialize_app(cred)
        else:
            # For development/testing without credentials
            # You'll need to add firebase_credentials.json for production
            print("Warning: Firebase credentials not found. Running in demo mode.")
            return None
    
    return firestore.client()

db = initialize_firebase()

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/projects')
def projects():
    """Display all projects"""
    projects_list = []
    
    if db:
        try:
            # Get all projects from Firebase
            projects_ref = db.collection('projects')
            docs = projects_ref.order_by('created_at', direction=firestore.Query.DESCENDING).stream()
            
            for doc in docs:
                project_data = doc.to_dict()
                project_data['id'] = doc.id
                # Format date for display
                if 'created_at' in project_data:
                    project_data['created_at'] = project_data['created_at'].strftime('%Y-%m-%d')
                projects_list.append(project_data)
        except Exception as e:
            print(f"Error fetching projects: {e}")
    
    return render_template('projects.html', projects=projects_list)

@app.route('/project/<project_id>')
def project_detail(project_id):
    """Display single project details"""
    project = None
    
    if db:
        try:
            # Get specific project from Firebase
            doc_ref = db.collection('projects').document(project_id)
            doc = doc_ref.get()
            
            if doc.exists:
                project = doc.to_dict()
                project['id'] = doc.id
                # Format date for display
                if 'created_at' in project:
                    project['created_at'] = project['created_at'].strftime('%Y-%m-%d')
        except Exception as e:
            print(f"Error fetching project: {e}")
    
    if project:
        return render_template('project_detail.html', project=project)
    else:
        return "Project not found", 404

@app.route('/submit', methods=['GET', 'POST'])
def submit():
    """Submit a new project"""
    if request.method == 'POST':
        if db:
            try:
                # Get form data
                project_data = {
                    'title': request.form.get('title'),
                    'category': request.form.get('category'),
                    'description': request.form.get('description'),
                    'supervisor': request.form.get('supervisor'),
                    'department': request.form.get('department', ''),
                    'duration': request.form.get('duration', ''),
                    'deadline': request.form.get('deadline'),
                    'requirements': request.form.get('requirements', ''),
                    'contact': request.form.get('contact'),
                    'created_at': datetime.now()
                }
                
                # Add to Firebase
                db.collection('projects').add(project_data)
                
                return render_template('submit.html', 
                                     message='Project submitted successfully!', 
                                     message_type='success')
            except Exception as e:
                print(f"Error submitting project: {e}")
                return render_template('submit.html', 
                                     message='Error submitting project. Please try again.', 
                                     message_type='error')
        else:
            return render_template('submit.html', 
                                 message='Database not configured. Please add Firebase credentials.', 
                                 message_type='error')
    
    return render_template('submit.html')

@app.route('/admin')
def admin():
    """Admin panel to manage projects"""
    projects_list = []
    total_projects = 0
    active_projects = 0
    
    if db:
        try:
            # Get all projects from Firebase
            projects_ref = db.collection('projects')
            docs = projects_ref.order_by('created_at', direction=firestore.Query.DESCENDING).stream()
            
            for doc in docs:
                project_data = doc.to_dict()
                project_data['id'] = doc.id
                # Format date for display
                if 'created_at' in project_data:
                    project_data['created_at'] = project_data['created_at'].strftime('%Y-%m-%d')
                projects_list.append(project_data)
                
                # Count active projects (deadline not passed)
                try:
                    deadline = datetime.strptime(project_data.get('deadline', ''), '%Y-%m-%d')
                    if deadline > datetime.now():
                        active_projects += 1
                except (ValueError, TypeError):
                    pass
            
            total_projects = len(projects_list)
        except Exception as e:
            print(f"Error fetching projects: {e}")
    
    return render_template('admin.html', 
                         projects=projects_list, 
                         total_projects=total_projects,
                         active_projects=active_projects,
                         num_categories=len(CATEGORIES))

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project (API endpoint)"""
    if db:
        try:
            db.collection('projects').document(project_id).delete()
            return jsonify({'success': True, 'message': 'Project deleted successfully'})
        except Exception as e:
            print(f"Error deleting project: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        return jsonify({'success': False, 'message': 'Database not configured'}), 500

@app.route('/api/projects', methods=['GET'])
def get_projects_api():
    """Get all projects as JSON"""
    projects_list = []
    
    if db:
        try:
            projects_ref = db.collection('projects')
            docs = projects_ref.stream()
            
            for doc in docs:
                project_data = doc.to_dict()
                project_data['id'] = doc.id
                # Convert datetime to string for JSON serialization
                if 'created_at' in project_data:
                    project_data['created_at'] = project_data['created_at'].isoformat()
                projects_list.append(project_data)
        except Exception as e:
            print(f"Error fetching projects: {e}")
            return jsonify({'error': str(e)}), 500
    
    return jsonify(projects_list)

if __name__ == '__main__':
    # Run the application
    # Debug mode should be disabled in production
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
