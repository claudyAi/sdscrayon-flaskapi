import os

os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

from pathlib import Path

import torch
import torch.distributed
import torch.utils
import torch.utils.data
import tqdm
import PIL.Image as Image
import numpy as np

from pathlib import Path
from skimage import io



device = "cuda" if torch.cuda.is_available() else "cpu"

# Check if using cuda device and torch version
# print(f"Using {device} device")
# print(torch.__version__)


s2_max = np.array(
    [255., 255., 255., 255., 255., 255., 255., 255., 255., 255., 255.],
    dtype="float32",
)

IMG_SIZE = (200, 200)

def read_imgs(file_name, data_dir): # reads all the files in the directory specified
    
    imgs, mask = [], []
    
    #aus
    filepath = data_dir / f"{file_name}.tif"
    if filepath.is_file():
        img_s2 = io.imread(filepath)
        img_s2 = img_s2.astype("float32")
        img_s2 = img_s2 / s2_max
    else:
        img_s2 = np.zeros(IMG_SIZE + (11,), dtype="float32")
    img = img_s2
    img = np.transpose(img, (2, 0, 1))

    imgs.append(img)
    mask.append(False)

    mask = np.array(mask)

    imgs = np.stack(imgs, axis=0)  # [t, c, h, w]

    return imgs, mask

def predict_tta(models, images, masks, ntta=1): # does predictions
    result = images.new_zeros((images.shape[0], 1, images.shape[-2], images.shape[-1]))
    n = 0
    for model in models:
        logits = model(images, masks)
        result += logits
        n += 1

        if ntta == 2:
            # hflip
            logits = model(torch.flip(images, dims=[-1]), masks)
            result += torch.flip(logits, dims=[-1])
            n += 1

        if ntta == 3:
            # vflip
            logits = model(torch.flip(images, dims=[-2]), masks)
            result += torch.flip(logits, dims=[-2])
            n += 1

        if ntta == 4:
            # hvflip
            logits = model(torch.flip(images, dims=[-2, -1]), masks)
            result += torch.flip(logits, dims=[-2, -1])
            n += 1

    result /= n * len(models)

    return result


class DS(torch.utils.data.Dataset): # set the input images in correct format to run predictions
    def __init__(self, file_paths, dir_features, dir_labels=None, augs=False):
        self.file_paths = file_paths
        self.dir_features = dir_features
        self.dir_labels = dir_labels
        self.augs = augs

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, index):
        # Get the file path for the current index
        file_path = self.file_paths[index]
        file_name = Path(file_path).stem

        # Read the image and mask (adjust the read_imgs function as necessary)
        imgs, mask = read_imgs(file_name, self.dir_features)    
        

        return imgs, mask, file_name

def main():
    # args = parse_args()
    # print(args)
    test_images_dir = "./data"
    num_workers = 8
    batch_size = 8
    tta = 1
    out_dir = './preds'
    # torch.jit.enable_onednn_fusion(True)

    # loads model from a pth file from the location specified in args.model_path
    model = torch.load("./modelo_best.pth", map_location="cpu")
    model = model.eval()
    model = model.cuda()
    model = model.to(memory_format=torch.channels_last)
    models = [model]

    
    # loads all the images from location specified in args.test_images_dir
    test_images_dir = Path(test_images_dir)
    all_files = [f for f in test_images_dir.iterdir() if f.is_file()]
    test_dataset = DS(
        file_paths=all_files,  # Pass the list of file paths
        dir_features=test_images_dir,
    )
    test_sampler = None

    num_workers = min(batch_size, 4)
    test_loader = torch.utils.data.DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        sampler=test_sampler,
        collate_fn=None,
        num_workers=num_workers,
        pin_memory=False,
        persistent_workers=True,
        drop_last=False,
    )

    out_dir = Path(out_dir)
    out_dir.mkdir(exist_ok=True, parents=True)


    # does the predictions and saves it in the folder specified in args.out_dir
    with torch.no_grad():
        with tqdm.tqdm(test_loader, leave=False, mininterval=2) as pbar:
            for images, mask, target in pbar:
                images = images.cuda(non_blocking=True)
                mask = mask.cuda(non_blocking=True)
                logits = predict_tta(models, images, mask, ntta=tta)

                logits = logits.squeeze(1).cpu().numpy()


                for pred, target in zip(logits, target):
                    original_name = Path(target).stem
                    im = Image.fromarray(pred)
                    im.save(out_dir / f"{original_name}_agbm.tif", format="TIFF", save_all=True)

                torch.cuda.synchronize()

    # frontend
    outputFilePaths = [f for f in Path(out_dir).iterdir() if f.is_file()]
    outputFilePaths_string = []
    outputFileNames_string = []
    for filepath in outputFilePaths:
        filename = filepath.name
        filepath = os.path.join(os.getcwd(), filepath)
        outputFilePaths_string.append(filepath)
        outputFileNames_string.append(filename)
    print('outputFilePaths_string', outputFilePaths_string)
    print('outputFileNames_string', outputFileNames_string)

    return ({'filepath':outputFilePaths_string, 'filename':outputFileNames_string})

if __name__ == "__main__":
    main()
