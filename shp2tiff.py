from shapely.geometry import Polygon
import numpy as np
from shapely.prepared import prep
import geopandas as gpd
import matplotlib.pyplot as plt
from geojson import Feature
import openeo
from openeo.processes import ProcessBuilder
import geopandas as gpd
import os
from osgeo import gdal as GD  

def grid_bounds(geom):
    minx, miny, maxx, maxy = geom.bounds
    nx = int((maxx - minx)/0.021)
    ny = int((maxy - miny)/0.018)
    gx, gy = np.linspace(minx,maxx,nx), np.linspace(miny,maxy,ny)
    grid = []
    for i in range(len(gx)-1):
        for j in range(len(gy)-1):
            poly_ij = Polygon([[gx[i],gy[j]],[gx[i],gy[j+1]],[gx[i+1],gy[j+1]],[gx[i+1],gy[j]]])
            grid.append( poly_ij )
    if grid == []:
        grid.append(geom)
    return grid

def partition(geom):
    prepared_geom = prep(geom)
    grid = list(filter(prepared_geom.intersects, grid_bounds(geom)))
    return grid

# define child process, use ProcessBuilder
def scale_function(x: ProcessBuilder):
    return x.linear_scale_range(0, 6000, 0, 255)

def get_tif(polygonlist, filename):
    # connection to sent2 data
    connection = openeo.connect(url="https://openeo.dataspace.copernicus.eu/openeo/1.1")
    connection.authenticate_oidc()
    for i in range(len(polygonlist)):
        polygon = Feature(geometry=polygonlist[i])
        s2_cube = connection.load_collection(
            "SENTINEL2_L2A",
            temporal_extent= ("2022-02-01", "2022-02-28"),
            spatial_extent = polygon,
            bands=["B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B11", "B12", "SCL"],
            max_cloud_cover=60,
        )           
        scl_band = s2_cube.band("SCL")
        cloud_mask = (scl_band == 3) | (scl_band == 8) | (scl_band == 9)
            
        cloud_mask = cloud_mask.resample_cube_spatial(s2_cube)
        cube_masked = s2_cube.mask(cloud_mask)
        s2_cube= cube_masked.mean_time()
        s2_cube = s2_cube.apply(scale_function)
        s2_cube.download(f"public/shp2tif/{filename}_sent2.tif")
        return f"public/shp2tif/{filename}_sent2.tif"

# # file resize
# def resizefiles(directory):
#     for filename in os.listdir(directory):
#         f = os.path.join(directory, filename)
#         # checking if it is a file
#         if os.path.isfile(f):
#             # print(filename)
#             file_path = directory + filename # change accordingly
#             # print(file_path)
#             output_path = directory + "resized/" + filename # change accordingly
#             # print(output_path)
#             # gdal.translate -outsize 200 200 {file_path} {output_path}
#             dataset = GD.Open(file_path)
#             GD.Translate(output_path,dataset,width=200,height=200,resampleAlg='cubic')
#             pass 

# file resize
# def resizefiles(convertedTifFilePath, output_resizedFilePath):
#     dataset = GD.Open(convertedTifFilePath)
#     GD.Translate(output_resizedFilePath,dataset,width=200,height=200,resampleAlg='cubic')
#     return output_resizedFilePath 

def resizefiles(convertedTifFilePath, output_resizedFilePath):
    try:
        dataset = GD.Open(convertedTifFilePath)
        GD.Translate(output_resizedFilePath, dataset, width=200, height=200, resampleAlg='cubic')
    except Exception as e:
        # Ignore the error and continue
        print(f"An error occurred: {e}")
        pass

    return output_resizedFilePath

# file cleanup
def removefiles(directory) :
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f):
            os.remove(f)

def convert_shp2tif(filepathlst, filenamelst):
    output_pathlst = []
    output_filenamelst = []
    for filepath, filename in zip(filepathlst, filenamelst):
        shapefile = gpd.read_file(filepath)
        print(shapefile)
        # list of polygons
        outputlst = []
        for i in range(len(shapefile)):
            grid = partition(shapefile.geometry[i])
            outputlst += grid
        # specify time
        t = ("2022-02-01", "2022-02-28")
        # visualisation
        # fig, ax = plt.subplots(figsize=(15, 15))
        # gpd.GeoSeries(grid).boundary.plot(ax=ax)
        # gpd.GeoSeries(shapefile.geometry[7]).boundary.plot(ax=ax,color="red")
        # plt.show()
        # a = []
        # a.append(grid[0])
        # len(a)
        convertedTifFilePath = get_tif(grid, filename)
        print("convertedTifFilePath",convertedTifFilePath)
        output_resizedFilePath = convertedTifFilePath.replace('public/shp2tif', 'data')
        print("output_resizedFilePath", output_resizedFilePath)     
        resizefiles(convertedTifFilePath, output_resizedFilePath)
        print("resizefiles", resizefiles)
        
        output_pathlst.append(output_resizedFilePath)
        output_filenamelst.append(f"{filename}_sent2.tif")
        
    return ({'filepath':output_pathlst,'filename':output_filenamelst})