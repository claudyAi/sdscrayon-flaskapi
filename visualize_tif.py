from osgeo import gdal as GD
from pathlib import Path

import matplotlib.pyplot as plt 
import numpy as np 
import os

# Visualise TIF image and save locally
def visualise_tif(folder):
    test_images_dir = Path(folder)
    all_files = [f for f in test_images_dir.iterdir() if f.is_file()]
    print('visualise_tiff files', all_files)
    for filepath in all_files:
        print("file", filepath)
        filename = filepath.name
        print(filepath.name)
        filepath = os.path.join(os.getcwd(), filepath)
        print("updated filepath", filepath)
        data_set = GD.Open(filepath)
        print("data_set", data_set)
        filename = filename.replace('.tif','.jpg')
        print("python script file name",filename)
        if folder == 'data':
            band_1 = data_set.GetRasterBand(1)
            band_2 = data_set.GetRasterBand(2)
            band_3 = data_set.GetRasterBand(3)
            b1 = band_1.ReadAsArray()  
            b2 = band_2.ReadAsArray()  
            b3 = band_3.ReadAsArray()   
            img = np.dstack((b1, b2, b3)) 
        elif folder == 'preds':
            band_1 = data_set.GetRasterBand(1)
            b1 = band_1.ReadAsArray()    
            img = b1

        f = plt.figure()
        f.patch.set_facecolor('#17181C') 
        plt.imshow(img) 
        plt.axis('off')
        plt.savefig(f'public/{folder}/{filename}')

    jpgFilePaths = [f for f in Path(f'public/{folder}').iterdir() if f.is_file()]
    jpgFilePaths_string = []
    for filepath in jpgFilePaths:
        filename = filepath.name
        filepath = os.path.join(os.getcwd(), filepath)
        jpgFilePaths_string.append(f'/{folder}/{filename}')
    print('jpgFilePaths_string', jpgFilePaths_string)
    return jpgFilePaths_string




