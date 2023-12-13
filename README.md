# Biomass Estimation Using Advanced Predictive Modeling

This project is a combination of a Next.js app and a Flask server integrated under `/api/`.

## Table of Contents
- [How It Works](#how-it-works)
- [Setup](#setup)
  - [Environment Setup](#environment-setup)
  - [Dependency Installation](#dependency-installation)
  - [Authentication](#authentication)
  - [File Replacement](#file-replacement)
  - [Start Development Server](#start-development-server)

## How It Works

 Python/Flask server mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/vercel/examples/blob/main/python/nextjs-flask/next.config.js) to map any request to `/api/:path*` to the Flask API, which is hosted in the `/api` folder.

On localhost, the rewrite will be made to the `127.0.0.1:5000` port, which is where the Flask server is running.

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
pip install -r requirements.txt

pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu117
```

Install JavaScript dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

### Authentication

Run the authentication process in the `python_scripts` folder:

```bash
jupyter notebook authenticate_connection.ipynb
# Execute all cells and follow authentication steps
```

### File Replacement

Replace `decoder.py` in `path-to-conda-env\Lib\site-packages\segmentation_models_pytorch\decoders\unet` with the `decoder.py` file in `python_scripts` folder.

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
