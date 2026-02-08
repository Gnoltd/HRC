from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import io

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Define categories as a constant
CATEGORIES = ['Science', 'Technology', 'Engineering', 'Mathematics', 'Arts', 'Social Sciences']

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            # Initialize with storage bucket
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'hsbresearchprj.appspot.com'
            })
        else:
            # For development/testing without credentials
            # You'll need to add firebase_credentials.json for production
            print("Warning: Firebase credentials not found. Running in demo mode.")
            return None, None
    
    try:
        bucket = storage.bucket()
    except:
        bucket = None
    
    return firestore.client(), bucket

db, bucket = initialize_firebase()

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/projects')
def projects():
    """Display all approved projects"""
    projects_list = []
    
    if db:
        try:
            # Get only approved projects from Firebase
            projects_ref = db.collection('projects').where('approved', '==', True)
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
        if db is None:
            return render_template('submit.html', 
                                 message='Database not configured. Please <a href="/setup">visit the setup page</a> to configure Firebase.', 
                                 message_type='error')
        
        try:
            # Handle file upload
            file_url = None
            file_name = None
            if 'project_file' in request.files:
                file = request.files['project_file']
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    # Add timestamp to filename to avoid conflicts
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    unique_filename = f"{timestamp}_{filename}"
                    
                    if bucket:
                        try:
                            # Upload to Firebase Storage
                            blob = bucket.blob(f'projects/{unique_filename}')
                            blob.upload_from_string(
                                file.read(),
                                content_type='application/pdf'
                            )
                            # Make file accessible with token (or public if needed)
                            blob.make_public()
                            file_url = blob.public_url
                            file_name = filename
                        except Exception as e:
                            print(f"Error uploading file: {e}")
                            return render_template('submit.html', 
                                                 message=f'Error uploading file: {str(e)}', 
                                                 message_type='error')
            
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
                'created_at': datetime.now(),
                'approved': False,  # New projects require approval
                'status': 'pending',  # pending, approved, rejected
                'file_url': file_url,
                'file_name': file_name
            }
            
            # Validate required fields
            if not project_data['title'] or not project_data['category'] or not project_data['description']:
                return render_template('submit.html', 
                                     message='Please fill in all required fields (Title, Category, Description).', 
                                     message_type='error')
            
            # Add to Firebase
            db.collection('projects').add(project_data)
            
            return render_template('submit.html', 
                                 message='Project submitted successfully! It will be visible after admin approval.', 
                                 message_type='success')
        except Exception as e:
            error_msg = str(e)
            print(f"Error submitting project: {error_msg}")
            
            # Provide more specific error messages with setup link
            if 'PERMISSION_DENIED' in error_msg or 'permission' in error_msg.lower():
                return render_template('submit.html', 
                                     message='Permission denied. Please check Firestore security rules. <a href="/setup">Visit setup page</a> for help.', 
                                     message_type='error')
            elif 'NOT_FOUND' in error_msg or 'not found' in error_msg.lower() or 'does not exist' in error_msg.lower():
                return render_template('submit.html', 
                                     message='Database not found. The Firestore database needs to be created. <a href="/setup">Visit setup page</a> for step-by-step instructions.', 
                                     message_type='error')
            else:
                return render_template('submit.html', 
                                     message=f'Error submitting project: {error_msg}. <a href="/setup">Visit setup page</a> for troubleshooting help.', 
                                     message_type='error')
    
    return render_template('submit.html')

@app.route('/setup')
def setup():
    """Firebase setup and status page"""
    return render_template('setup.html', db_configured=(db is not None))

@app.route('/admin')
def admin():
    """Admin panel to manage projects"""
    pending_projects = []
    approved_projects = []
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
                
                # Separate pending and approved projects
                if project_data.get('approved', False):
                    approved_projects.append(project_data)
                else:
                    pending_projects.append(project_data)
                
                # Count active projects (deadline not passed)
                try:
                    deadline = datetime.strptime(project_data.get('deadline', ''), '%Y-%m-%d')
                    if deadline > datetime.now():
                        active_projects += 1
                except (ValueError, TypeError):
                    pass
            
            total_projects = len(pending_projects) + len(approved_projects)
        except Exception as e:
            print(f"Error fetching projects: {e}")
    
    return render_template('admin.html', 
                         pending_projects=pending_projects,
                         approved_projects=approved_projects,
                         total_projects=total_projects,
                         active_projects=active_projects,
                         num_categories=len(CATEGORIES))

@app.route('/api/projects/<project_id>/approve', methods=['POST'])
def approve_project(project_id):
    """Approve a project (Admin only)"""
    if db:
        try:
            db.collection('projects').document(project_id).update({
                'approved': True,
                'status': 'approved'
            })
            return jsonify({'success': True, 'message': 'Project approved successfully'})
        except Exception as e:
            print(f"Error approving project: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        return jsonify({'success': False, 'message': 'Database not configured'}), 500

@app.route('/api/projects/<project_id>/reject', methods=['POST'])
def reject_project(project_id):
    """Reject a project (Admin only)"""
    if db:
        try:
            db.collection('projects').document(project_id).update({
                'approved': False,
                'status': 'rejected'
            })
            return jsonify({'success': True, 'message': 'Project rejected successfully'})
        except Exception as e:
            print(f"Error rejecting project: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        return jsonify({'success': False, 'message': 'Database not configured'}), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project (API endpoint)"""
    if db:
        try:
            # Get project data to delete file if exists
            doc_ref = db.collection('projects').document(project_id)
            doc = doc_ref.get()
            if doc.exists and bucket:
                project_data = doc.to_dict()
                file_url = project_data.get('file_url')
                if file_url:
                    try:
                        # Extract blob name from URL and delete from storage
                        file_name = project_data.get('file_name', '')
                        if file_name:
                            blob = bucket.blob(f'projects/{file_name}')
                            blob.delete()
                    except Exception as e:
                        print(f"Error deleting file from storage: {e}")
            
            # Delete the project document
            doc_ref.delete()
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
