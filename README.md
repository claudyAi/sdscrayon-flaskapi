# Biomass Estimation Using Advanced Predictive Modeling

## Project Description

The aim of this project is to optimise the Aboveground Biomass (AGBM) estimation through improved predictive modeling and data utilization. We will be focusing on predicting the AGBM values for 2,000 x 2,000 meter patches of Australian forests.

## Model Approach

The project is based on an U-Net model with a shared encoder with aggregation via attention. The inputs to the encoder are 11-band images with a resolution of 200x200 from Sentinel-2 satellite missions. The outputs are aggregated via self-attention. Finally, a decoder takes as inputs the aggregated features and predicts the AGBM of the intended region. We directly optimize `RMSE` using `AdamW` optimizer and `CosineAnnelingLR` scheduler.

## Table of Contents
- [Project Description](#project-description)
- [Model Approach](#model-approach)
- [How It Works](#how-it-works)
- [Download Model File](#download-model-file)
- [Setup](#setup)
  - [Environment Setup](#environment-setup)
  - [Dependency Installation](#dependency-installation)
  - [Authentication](#authentication)
  - [File Replacement](#file-replacement)
  - [Start Development Server](#start-development-server)
  - [Debug Error](#debug-error)

## How It Works

This project is a combination of a Next.js app and a Flask server integrated under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/vercel/examples/blob/main/python/nextjs-flask/next.config.js) to map any request to `/api/:path*` to the Flask API, which is hosted in the `/api` folder.

On localhost, the rewrite will be made to the `127.0.0.1:5000` port, which is where the Flask server is running.

## Download Model File
The pre-trained model has been developed with a training dataset of Sentinel 2 2000m x 2000m images, and a validation dataset of 2000m x 2000m Biomass CCI images. The input dataset is collated via the openEO API, and consists of 11-band Sentinel 2 images, while the validation dataset is collected via manual clippings from the Biomass CCI dataset from the CEDA Archives at https://data.ceda.ac.uk/neodc/esacci/biomass/data/agb/maps/v4.0/geotiff/2020.

To use the pre-trained model for this project, follow these steps to download and save the `model.pth` file in the root directory:

1. **Access the Model File**:
   - Download the `model.pth` file [here](https://drive.google.com/drive/folders/1w74Ye16XEJrh27o4AK09qxgPPbpzjml3?usp=sharing).

2. **Save in Root Directory**:
   - Once downloaded, move the `model.pth` file to the root directory of this project.

3. **Confirmation**:
   - Ensure that `model.pth` is placed in the root directory before running the application.

## Setup

### Environment Setup

Ensure you have Python 3.8.10 installed. Create and activate a Conda environment:

```bash
conda create -n yourenvname python=3.8.10 
conda activate yourenvname 
```

### Dependency Installation

Install Python dependencies:

```bash
# installs Python packages listed in requirements.txt
pip install -r requirements.txt
# installs specific versions of PyTorch with CUDA support
pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu117
# installs GDAL
python -m pip install setup/GDAL-3.4.3-cp38-cp38-win_amd64.whl
```

Install JavaScript dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Authentication

Run the authentication process in the `setup` folder:

```bash
jupyter notebook authenticate_connection.ipynb
# Execute all cells and follow authentication steps
```

### File Replacement

Replace `decoder.py` in `path-to-conda-env\Lib\site-packages\segmentation_models_pytorch\decoders\unet` with the `decoder.py` file in `setup` folder.

### Start Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Access the app at [http://localhost:3000](http://localhost:3000).

The Flask server will be running on [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Debug Error

If you happen to encounter an error: `errno: -4071` with `code: 'EINVAL'` related to `syscall:readlink`. Deleting the `.next` folder and re-running `npm run dev` can sometimes resolve such issues related to corrupted build artifacts or symbolic links.
