import matplotlib.pyplot as plt
import numpy as np
from osgeo import gdal, gdal_array
# import gdal as GD

# take in filepath and filename


def visualise_tiff(filepath, filename, folder):
    print("python script file path", filepath)
    # data_set = GD.Open(filepath)
    # filename = filename.replace('.tif', '.jpg')
    print("python script file name", filename)
    # if folder == 'data':
    #     band_1 = data_set.GetRasterBand(1)
    #     band_2 = data_set.GetRasterBand(2)
    #     band_3 = data_set.GetRasterBand(3)
    #     b1 = band_1.ReadAsArray()
    #     b2 = band_2.ReadAsArray()
    #     b3 = band_3.ReadAsArray()
    #     img = np.dstack((b1, b2, b3))
    # elif folder == 'preds':
    #     band_1 = data_set.GetRasterBand(1)
    #     b1 = band_1.ReadAsArray()
    #     img = b1
    # f = plt.figure()
    # plt.imshow(img)
    # plt.savefig(f'public/{folder}/{filename}')

    #instead of matplotlib, use gdal library to read the tiff file and save as jpeg
    ds = gdal.Open(filepath)
    if ds is None:
        raise IOError("Could not open the TIFF file.")

    band = ds.GetRasterBand(1)
    arr = band.ReadAsArray()

    # Scale the Float32 data to 8-bit
    arr_min, arr_max = arr.min(), arr.max()
    scaled_arr = ((arr - arr_min) / (arr_max - arr_min) * 255).astype(np.uint8)

    # Save as JPEG
    gdal_array.SaveArray(scaled_arr, f'public/{folder}/output.jpg', format='JPEG')
    
    print(f'public/{folder}/{filename}')
    # return f'/{folder}/{filename}'
    return f'/{folder}/output.jpg'
