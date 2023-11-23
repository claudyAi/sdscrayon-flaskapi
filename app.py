from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'Flask working'

@app.route('/predict', methods=['GET'])
def upload_image():
    print("receive post")
    # print(request.files)
    # if 'file' not in request.files:
    #     return 'No image provided', 400
    # image_file = request.files['file']
    # print(image_file)

    # Run Python script
    import subprocess
    subprocess.run(['python', 'submitflask.py'])
    print("model done")

    return 'Python script executed successfully'

if __name__ == '__main__':
    app.run(debug=True)
