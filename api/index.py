from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api

from python_scripts.visualize_tif import visualise_tif
from python_scripts.run_model import main
from python_scripts.shp2tif import convert_shp2tif
from python_scripts.grid import find_array

import os

app = Flask(__name__)
CORS(app)
api = Api(app)

# Check that flask is working
@app.route('/')
def home():
    return 'Flask working'

# Run Python Script to run model
@app.route('/predict', methods=['GET'])
def upload_image():
    print("receive post")
    print(request)
    return jsonify(main())

# Run Python Script to open TIF image and get array
@app.route('/tifarr', methods=['POST'])
def convert_tiff2arr():
    print("receive tiff2arr post")
    folder = request.json['folder']
    print('folder', folder)
    result = find_array(folder, 200, 8)
    return jsonify({'result': result})

# Run Python Script to open TIF image and save as JPG 
@app.route('/tif2jpg', methods=['POST'])
def convert_tif2jpg():
    print("receive tif2jpg post")
    folder = request.json['folder']
    print('folder', folder)
    return visualise_tif(folder)

# Run Python Script to convert SHP to TIF image 
@app.route('/shp2tif', methods=['POST'])
def convert_shp2tiff_files():
    print("receive shp2tif post")
    print("request",request)
    print("request.form",request.form)
    
    filepath_list = request.form.getlist('filePath')
    filename_list = request.form.getlist('fileName')

    rootlst = []
    filepathlst = []
    # Loop through received files to find SHP files
    for filepath, filename_with_extension in zip(filepath_list, filename_list):
        root, extension = os.path.splitext(filename_with_extension)
        if extension == '.shp':
            filename = root
            print("Filename without extension:", filename)
            rootlst.append(filename)
            filepathlst.append(filepath)
            
    return jsonify(convert_shp2tif(filepathlst, rootlst))


if __name__ == '__main__':
    app.run(debug=True)

