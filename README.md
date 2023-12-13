# Biomass Estimation Using Advanced Predictive Modeling

This project is a combination of a Next.js app and a Flask server integrated under `/api/`.

## Table of Contents
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

 Python/Flask server mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/vercel/examples/blob/main/python/nextjs-flask/next.config.js) to map any request to `/api/:path*` to the Flask API, which is hosted in the `/api` folder.

On localhost, the rewrite will be made to the `127.0.0.1:5000` port, which is where the Flask server is running.

## Download Model File

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
