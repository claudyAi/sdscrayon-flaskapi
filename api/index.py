# from flask import Flask
# app = Flask(__name__)


# @app.route("/")
# def hello():
#     return "FUCKING WORKS"


# if __name__ == "__main__":
#     app.run()

from flask import Flask, request
from flask_cors import CORS
from flask import jsonify
from visualize_tiff import visualise_tiff
from submitflask import main
from flask_restful import reqparse, Api, Resource
from shp2tiff import convert_shp2tif
import os

app = Flask(__name__)
CORS(app)
api = Api(app)

@app.route('/')
def home():
    return 'Flask working'

# Run Python Script to run model
@app.route('/predict', methods=['GET'])
def upload_image():
    print("receive post")
    print(request)

    # # Run Python script
    # import subprocess
    # result = subprocess.run(['python', 'submitflask.py'], capture_output=True, text=True)
    # print("model done")
    # print("result", result)
    # # Check if the subprocess ran successfully
    # output = result.stdout  # Get the output of the subprocess
    # print('output', output)
    # response_data = {
    #     'message': 'Python script executed successfully',
    #     'output': output.replace('\n','')
    # }
    return jsonify(main())

# Run Python Script to open TIF image and save as JPG 
@app.route('/tiff2jpg', methods=['POST'])
def convert_tiff2jpg():
    print("receive tiff2jpg post")
    # filepath = request.json['filepath'] 
    # filename = request.json['filename']
    folder = request.json['folder']
    # print('filepath', filepath)
    # print('filename', filename)
    print('folder', folder)
    return visualise_tiff(folder)

# Run Python Script to convert SHP to TIFF image 
@app.route('/shp2tiff', methods=['POST'])
def convert_shp2tifff_files():
    print("receive shp2tiff post")
    print("request",request)
    print("request.form",request.form)
    # filepaths = request.form.getlist('filePath')
    # filenames = request.form.getlist('fileName')
    # print("File Paths:", filepaths)
    # print("File Names:", filenames)
    
    filepath = request.form['filePath']
    filename_with_extension = request.form['fileName']
    # Split the filename and extension
    root, extension = os.path.splitext(filename_with_extension)
    # Get the filename without extension
    filename = root
    print("Filename without extension:", filename)
    print(jsonify(convert_shp2tif(filepath, filename)))
    # for i in request.form:
    #     print('indv',i)
    # print(request.form['filePath'])
    # print(request.form['fileName'])
    # for i in request.form['filePath']:
    #     print(i)
    # filepath = request.form['filePath'] 
    # filename = request.form['fileName'].replace('.shp', ' ')
    # print('filepath', filepath)
    # print('filename', filename)
    return jsonify(convert_shp2tif(filepath, filename))

if __name__ == '__main__':
    app.run(debug=True)

