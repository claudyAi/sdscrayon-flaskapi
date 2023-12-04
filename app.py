from flask import Flask, request
from flask_cors import CORS
from flask import jsonify
from visualize_tiff import visualise_tiff

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'Flask working'

@app.route('/predict', methods=['GET'])
def upload_image():
    print("receive post")
    print(request)

    # Run Python script
    import subprocess
    result = subprocess.run(['python', 'submitflask.py'], capture_output=True, text=True)
    print("model done")
    print("result", result)
    # Check if the subprocess ran successfully
    output = result.stdout  # Get the output of the subprocess
    print('output', output)
    response_data = {
        'message': 'Python script executed successfully',
        'output': output.replace('\n','')
    }
    return jsonify(response_data)

@app.route('/tiff2jpg', methods=['POST'])
def convert_tiff2jpg():
    print("receive tiff2jpg post")
    filepath = request.json['filepath'] 
    filename = request.json['filename']
    folder = request.json['folder']
    print('filepath', filepath)
    print('filename', filename)
    print('folder', folder)
    return jsonify(visualise_tiff(filepath, filename, folder))

if __name__ == '__main__':
    app.run(debug=True)
