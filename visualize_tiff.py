import matplotlib.pyplot as plt 
import numpy as np 
from osgeo import gdal as GD

# take in filepath and filename
def visualise_tiff(filepath, filename, folder):
    print("python script file path",filepath)
    data_set = GD.Open(filepath)
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
    plt.imshow(img) 
    plt.savefig(f'public/{folder}/{filename}') 
    print(f'public/{folder}/{filename}')
    return f'/{folder}/{filename}'




