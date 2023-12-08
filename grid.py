import matplotlib.pyplot as plt 
import numpy as np 
from osgeo import gdal as GD

# take in filepath and filename
def find_array(filepath, folder):
    print("python script file path",filepath)
    data_set = GD.Open(filepath)
    if folder == 'preds':
        band_1 = data_set.GetRasterBand(1)
        b1 = band_1.ReadAsArray()    
    return b1

