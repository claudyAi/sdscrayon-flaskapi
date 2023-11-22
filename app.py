from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def upload_image():
    print("receive post")
    print(request.files)
    if 'file' not in request.files:
        return 'No image provided', 400
    image_file = request.files['file']
    print(image_file)
    # Save the uploaded image to a directory or perform operations as needed

    # Run your Python script
    import subprocess
    subprocess.run(['python', 'submitflask.py'])

    return 'Image uploaded and script executed successfully'

if __name__ == '__main__':
    app.run(debug=True)
