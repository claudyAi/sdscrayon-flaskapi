import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import path from "path";
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { writeFile } from "fs/promises";

// Save uploaded TIF file locally from imageURL
const saveFileLocally = async (fileurl: any, destinationDirPath: any) => {
  const protocol = fileurl.startsWith('https') ? https : http;
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(destinationDirPath);
    protocol.get(fileurl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log('File downloaded successfully!');
          resolve(); // Resolve the promise when download is complete
        });
      } else {
        console.error(`Failed to download file. Status code: ${response.statusCode}`);
        reject(`Failed to download file. Status code: ${response.statusCode}`);
      }
    }).on('error', (error) => {
      console.error('Error downloading file:', error);
      reject(error);
    });
  });
};

// Run python script to open TIF file in '/data' and save as JPG in '/public/data' 
async function runPythonScriptTiff(filepath:string, filename:string, folder:string) {
  let finalResponse = await fetch('http://127.0.0.1:5000/tiff2jpg', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({filepath: filepath, filename: filename, folder:folder}),
    });
    let jsonTiffResponse = await finalResponse.json();
    console.log('jsonTiffResponse: ', jsonTiffResponse); 
    return jsonTiffResponse    
}

// Create folder if it does not exist
async function createFolder(file:string){
  var fs = require('fs');
  var dir = `./${file}`;

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  // Create folder if it does not exist
  createFolder('data');
  createFolder('preds');
  createFolder('public/data');
  createFolder('public/preds');
  createFolder('public/shp2tif');
  console.log('done creating folders');
  console.log("--------------------------");

  console.log('reach generate')
  const formData = await req.formData();
  console.log(formData);
  const fileEntries = formData.getAll('files');
  console.log("fileEntries", fileEntries);
  const fileLength = fileEntries.length;
  console.log('Number of files:', fileLength);
  // const filesData = [];
  console.log('file entry:', fileEntries);
  const newformData = new FormData();

  var filePath;
  var originalTiffFilePath;
  var originalTiffFileName;
  var fileType;
  var fileName;

  for (let i = 0; i < fileLength; i++) {
    const f = fileEntries[i];
    console.log('f:', f);

    if (!f) {
      return NextResponse.json({}, { status: 400 });
    }

    const file = f as File;
    fileName = file.name;
    fileType = file.type;

    console.log(`File name: ${file.name}`);
    console.log(`Content-Length: ${file.size}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const destinationDirPath = path.join(process.cwd(), "data/" + fileName);
    console.log('destinationDirPath', destinationDirPath);

    if (fileType != 'image/tiff') {
      console.log("non tiff file type detected");
      filePath = path.join(process.cwd(), "public/shp2tif/" + fileName);
    } 
    else {
      filePath = path.join(process.cwd(), "data/" + fileName);
    }
    await writeFile(filePath, buffer);
    console.log('filepath', filePath);
    newformData.append('filePath', filePath);
    newformData.append('fileName', fileName);}

      
    if (fileType != 'image/tiff') {
    console.log("newformData", newformData);

      const res = await fetch("http://127.0.0.1:5000/shp2tiff", {
        method: "POST",
        body: newformData,
      });

      let jsonFinalResponse = await res.json();
      console.log('jsonFinalResponse: ', jsonFinalResponse);
      console.log('filepath : ', jsonFinalResponse['filepath']);
      console.log('filename : ', jsonFinalResponse['filename']);
      filePath = jsonFinalResponse['filepath'];
      fileName = jsonFinalResponse['filename']; }

      // Convert TIF image to JPG 
      const OriginalPhoto = await runPythonScriptTiff(filePath, fileName, 'data');

      // let destinationDirPath = await res.json();
      // console.log("destinationDirPath",destinationDirPath);
    
    // }

    // await writeFile(destinationDirPath, buffer);

    // const OriginalPhoto = await runPythonScriptTiff(destinationDirPath, fileName, 'data');
    // console.log("original photo",OriginalPhoto);

    // Run model
    let restoredImage: string | null = null;
      while (!restoredImage) {
        // Loop in 1s intervals until the alt text is ready
        console.log("polling for result...");
        let finalResponse = await fetch('http://127.0.0.1:5000/predict', {
          method: "GET",
        });
        // Receive response after model is done predicting
        let jsonFinalResponse = await finalResponse.json();
        // let loadingResponse = finalResponse.json();
        // console.log('loadingResponse',loadingResponse);
        console.log('jsonFinalResponse: ', jsonFinalResponse);
        console.log('filepath : ', jsonFinalResponse['filepath']);
        console.log('filename : ', jsonFinalResponse['filename']);
        const restoreTiffFilePath = jsonFinalResponse['filepath'];
        const restoreTiffFileName = jsonFinalResponse['filename'];
        // Convert TIF image to JPG 
        const restoredImage = await runPythonScriptTiff(restoreTiffFilePath, restoreTiffFileName, 'preds');
        console.log(restoredImage);

  //   const destinationDirPath = path.join(process.cwd(), "data");
  //   console.log(destinationDirPath);

  //   const fileArrayBuffer = await file.arrayBuffer();

    // if (!existsSync(destinationDirPath)) {
    //   fs.mkdir(destinationDirPath, { recursive: true });
    // }
    // await fs.writeFile(
    //   path.join(destinationDirPath, file.name),
    //   Buffer.from(fileArrayBuffer)
    // );

    // filesData.push({
    //   fileName: file.name,
    //   size: file.size,
    //   lastModified: new Date(file.lastModified),
    // }); }

    // const response = await fetch('http://127.0.0.1:5000/predict', {
    //       method: 'GET',
    //     });

  // return NextResponse.json({});}
  // const fileName = data['image']['originalFile']['originalFileName'];
  // const fileurl = data['image']['originalFile']['fileUrl'];
  // const fileType = data['image']['originalFile']['mime'];
  // const destinationDirPath = path.join(process.cwd(), "/data", fileName);
  // console.log(destinationDirPath);
  // const uploadedJpegFilePath = destinationDirPath.replace('.tif', '.jpg');
  // console.log(uploadedJpegFilePath);

  // // Save uploaded TIF image locally
  // await saveFileLocally(fileurl, destinationDirPath);

  // // Convert TIF image to JPG 
  // const OriginalPhoto = await runPythonScriptTiff(destinationDirPath, fileName, 'data');
  // console.log("original photo",OriginalPhoto);
  
  // // Run model
  // let restoredImage: string | null = null;
  //   while (!restoredImage) {
  //     // Loop in 1s intervals until the alt text is ready
  //     console.log("polling for result...");
  //     let finalResponse = await fetch('http://127.0.0.1:5000/predict', {
  //       method: "GET",
  //     });
  //     // Receive response after model is done predicting
  //     let jsonFinalResponse = await finalResponse.json();
  //     let loadingResponse = finalResponse.json();
  //     console.log('loadingResponse',loadingResponse);
  //     console.log('jsonFinalResponse: ', jsonFinalResponse);
  //     console.log('filepath : ', jsonFinalResponse['filepath']);
  //     console.log('filename : ', jsonFinalResponse['filename']);
  //     const restoreTiffFilePath = jsonFinalResponse['filepath'];
  //     const restoreTiffFileName = jsonFinalResponse['filename'];
  //     // Convert TIF image to JPG 
  //     const restoredImage = await runPythonScriptTiff(restoreTiffFilePath, restoreTiffFileName, 'preds');
  //     console.log(restoredImage);
      
    return NextResponse.json(
      {"restoredImage":restoredImage ? restoredImage : "Failed to restore image",
      "originalPhoto":OriginalPhoto ? OriginalPhoto : "Failed to upload original image"}
    );
  }}