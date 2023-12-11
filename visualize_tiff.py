import matplotlib.pyplot as plt 
import numpy as np 
from osgeo import gdal as GD, gdal_array
from pathlib import Path
import os
import cv2
import PIL.Image as Image

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

        data_data_set = GD.Open(filepath)
        preds_data_set = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)
        # print("data_set", data_set)
        filename = filename.replace('.tif','')
        print("python script file name",filename)

        if folder == 'data':
            band_1 = data_data_set.GetRasterBand(1)
            band_2 = data_data_set.GetRasterBand(2)
            band_3 = data_data_set.GetRasterBand(3)
            b1 = band_1.ReadAsArray()  
            b2 = band_2.ReadAsArray()  
            b3 = band_3.ReadAsArray()   
            img = np.dstack((b1, b2, b3)) 
            f = plt.figure()
            f.patch.set_facecolor('#17181C') 
            plt.imshow(img) 
            plt.axis('off')
            plt.savefig(f'public/{folder}/{filename}.jpg')
        elif folder == 'preds':
            # band_1 = preds_data_set.GetRasterBand(1)
            # b1 = band_1.ReadAsArray()    
            # img = b1
            # f = plt.figure()
            # f.patch.set_facecolor('#17181C') 
            # plt.imshow(img, cmap='hot') 
            pred_colored = cv2.applyColorMap(preds_data_set, cv2.COLORMAP_OCEAN)
            im = Image.fromarray(pred_colored)

            # Resize the image to 250x250
            im_resized = im.resize((350, 350))

            # Create a new blank image with size 640x480 and fill it with #17181C color
            padded_image = Image.new('RGB', (640, 480), '#17181C')
            
            # Calculate the center coordinates for pasting the resized image
            center_x = (640 - im_resized.width) // 2
            center_y = (480 - im_resized.height) // 2

            # Paste the resized image onto the padded image
            padded_image.paste(im_resized, (center_x, center_y))

            im.save(f"public/download/{filename}.tif", format="TIFF", save_all=True)
            padded_image.save(f"public/{folder}/{filename}.jpg")

        # plt.axis('off')
        # plt.savefig(f'public/{folder}/{filename}')

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




