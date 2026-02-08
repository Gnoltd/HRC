#!/usr/bin/env python3
"""
Simple test script to verify the application setup
"""

def test_imports():
    """Test that all required modules can be imported"""
    try:
        import flask
        import firebase_admin
        print("✓ All Python packages imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_templates():
    """Test that all template files exist"""
    import os
    templates = ['index.html', 'projects.html', 'project_detail.html', 'submit.html', 'admin.html']
    all_exist = True
    for template in templates:
        path = os.path.join('templates', template)
        if os.path.exists(path):
            print(f"✓ Template found: {template}")
        else:
            print(f"✗ Template missing: {template}")
            all_exist = False
    return all_exist

def test_static_files():
    """Test that static files exist"""
    import os
    static_files = [
        'static/css/style.css',
        'static/js/main.js'
    ]
    all_exist = True
    for file in static_files:
        if os.path.exists(file):
            print(f"✓ Static file found: {file}")
        else:
            print(f"✗ Static file missing: {file}")
            all_exist = False
    return all_exist

def test_app_structure():
    """Test the Flask app structure"""
    try:
        import app
        
        # Check that CATEGORIES is defined
        if hasattr(app, 'CATEGORIES'):
            print(f"✓ Categories defined: {len(app.CATEGORIES)} categories")
        else:
            print("✗ CATEGORIES not defined")
            return False
            
        # Check Flask app exists
        if hasattr(app, 'app'):
            print("✓ Flask app created successfully")
        else:
            print("✗ Flask app not found")
            return False
            
        return True
    except Exception as e:
        print(f"✗ Error testing app structure: {e}")
        return False

def main():
    print("=" * 50)
    print("Education Projects Platform - Setup Test")
    print("=" * 50)
    print()
    
    results = []
    
    print("Testing imports...")
    results.append(test_imports())
    print()
    
    print("Testing templates...")
    results.append(test_templates())
    print()
    
    print("Testing static files...")
    results.append(test_static_files())
    print()
    
    print("Testing app structure...")
    results.append(test_app_structure())
    print()
    
    print("=" * 50)
    if all(results):
        print("✓ All tests passed! Application is ready to run.")
        print()
        print("To start the application, run:")
        print("  python app.py")
        print()
        print("Then visit: http://localhost:5000")
    else:
        print("✗ Some tests failed. Please check the output above.")
    print("=" * 50)

if __name__ == '__main__':
    main()
