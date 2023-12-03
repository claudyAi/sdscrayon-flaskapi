from flask import Flask, request
from flask_cors import CORS
from submitflask import process_image

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return 'Flask working'


@app.route('/predict', methods=['POST'])
def upload_image():
    print("receive post")
    print(request.files)
    if 'file' not in request.files:
        return 'No image provided', 400  # error string and code
    image_file = request.files['file-0']
    print(image_file)

    # Run Python script
    # import subprocess
    # subprocess.run(['python3', 'submitflask.py'])
    # print("model done")

    return 'Python script executed successfully'


if __name__ == '__main__':
    app.run(debug=True)
