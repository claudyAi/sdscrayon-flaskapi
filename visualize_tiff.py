import matplotlib.pyplot as plt 
import numpy as np 
from osgeo import gdal as GD, gdal_array
from pathlib import Path
import os

# take in filepath and filename
def visualise_tiff(folder):
    test_images_dir = Path(folder)
    all_files = [f for f in test_images_dir.iterdir() if f.is_file()]
    print('visualise_tiff files', all_files)
    for filepath in all_files:
        print("file", filepath)
        filename = filepath.name
        print(filepath.name)
        filepath = os.path.join(os.getcwd(), filepath)
        print("updated filepath", filepath)
        # print("python script file path",filepath)
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
            f = plt.figure()
            f.patch.set_facecolor('#17181C') 
            plt.imshow(img) 
        elif folder == 'preds':
            band_1 = data_set.GetRasterBand(1)
            b1 = band_1.ReadAsArray()    
            img = b1

        f = plt.figure()
        f.patch.set_facecolor('#17181C') 
        plt.imshow(img) 
        plt.axis('off')
        plt.savefig(f'public/{folder}/{filename}')

    # band = data_set.GetRasterBand(1)
    # arr = band.ReadAsArray()
    # Scale the Float32 data to 8-bit
    # arr_min, arr_max = img.min(), img.max()
    # scaled_arr = ((img - arr_min) / (arr_max - arr_min) * 255).astype(np.uint8)
    # # Save as JPEG
    # gdal_array.SaveArray(scaled_arr, f'public/{folder}/{filename}', format='JPEG')


        # f = plt.figure() 
        # plt.imshow(img) 
        # plt.savefig(f'public/{folder}/{filename}')
        
        # plt.axis('off')
        # plt.tight_layout()
        # plt.show()
        # plt.subplots_adjust(top = 1, bottom = 0, right = 1, left = 0, hspace = 0, wspace = 0)

        # # f = plt.figure()
        # f = plt.imshow(img) 
        # f.axes.get_xaxis().set_visible(False)
        # f.axes.get_yaxis().set_visible(False)

        # plt.savefig(f'public/{folder}/{filename}')

    jpgFilePaths = [f for f in Path(f'public/{folder}').iterdir() if f.is_file()]
    jpgFilePaths_string = []
    jpgFileNames_string = []
    tifFileNames_string = []
    for filepath in jpgFilePaths:
        filename = filepath.name
        filepath = os.path.join(os.getcwd(), filepath)
        jpgFilePaths_string.append(f'/{folder}/{filename}')
        jpgFileNames_string.append(filename)
        tiffilename = filename.replace('.jpg', '.tif')
        tifFileNames_string.append(tiffilename)
    print('jpgFilePaths_string', jpgFilePaths_string)
    return jpgFilePaths_string
    # return ({'filepath':jpgFilePaths_string, 'filename_jpg':jpgFileNames_string, 'filename_tif':tifFileNames_string})
    # return  [f for f in Path(f'public/{folder}').iterdir() if f.is_file()]
        # print(f'public/{folder}/{filename}')
        # return f'/{folder}/{filename}'




