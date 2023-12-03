import os
from flask import Flask, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path
from PIL import Image

app = Flask(__name__)
CORS(app)


def check_if_folder_exists(directory):

    if not os.path.exists(directory):
        print(directory, "does not exist, creating...")
        os.makedirs(directory)
    else:
        print(directory, "folder exists")


@app.route('/')
def home():
    return 'Flask working'


@app.route('/predict', methods=['POST'])
def upload_image():
    print("receive post")
    # print(request.files)
    num_of_images = request.form.get('num_of_files', 0)
    print("Number of images: ", num_of_images)
    # if 'file' not in request.files:
    #     return 'No image provided', 400  # error string and code
    image_file_list = []
    for i in range(int(num_of_images)):
        image_file = request.files[f'file-{i}']
        print(image_file)
        image_file_list.append(image_file)
        filename = secure_filename(image_file.filename)
        folder_dir = os.getcwd() + "/data"
        check_if_folder_exists(folder_dir)
        image_file.save(os.path.join(folder_dir, filename))

    # Run Python script
    import subprocess
    subprocess.run(['python3', 'submitflask.py'])
    print("model done")

    preds_folder_dir = Path(os.getcwd() + "/preds")
    all_files = [f for f in preds_folder_dir.iterdir() if f.is_file()]
    # file = open(all_files[0])
    print(str(all_files[0].resolve()))
    with Image.open(all_files[0]) as img:
        img.save("output.png", format='PNG')
    return send_file()


if __name__ == '__main__':
    app.run(debug=True)
