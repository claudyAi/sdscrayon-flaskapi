import matplotlib.pyplot as plt 
import numpy as np 
from osgeo import gdal as GD, gdal_array
from pathlib import Path
import os

# take in filepath and filename
def find_array(folder, originsize, finalsize):
    test_images_dir = Path(folder)
    all_files = [f for f in test_images_dir.iterdir() if f.is_file()]
    finallist = []
    for filepath in all_files:
        print("file", filepath)
        filename = filepath.name
        print(filepath.name)
        filepath = os.path.join(os.getcwd(), filepath)
        data_set = GD.Open(filepath)
        if folder == 'preds':
            band_1 = data_set.GetRasterBand(1)
            a = band_1.ReadAsArray()
            finalarr = a.reshape([finalsize, originsize//finalsize, finalsize, originsize//finalsize]).mean(3).mean(1).round()
            # finallist.append(np.rint(finalarr).tolist())
            return np.rint(finalarr).tolist()