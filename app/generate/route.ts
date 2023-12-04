import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import path from "path";
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

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

async function createFile(file:string){
  const fs = require('fs-extra');
  const dir = `./${file}`;
  fs.ensureDirSync(dir);
}

export async function POST(req: NextRequest) {
  createFile('data');
  createFile('preds');
  createFile('public/data');
  createFile('public/preds');
  console.log('done creating folders');
  console.log("--------------------------");
  const data = await req.json();
  const fileName = data['image']['originalFile']['originalFileName'];
  const fileurl = data['image']['originalFile']['fileUrl'];
  const destinationDirPath = path.join(process.cwd(), "/data", fileName);
  console.log(destinationDirPath);

  const uploadedJpegFilePath = destinationDirPath.replace('.tif', '.jpg');
  console.log(uploadedJpegFilePath);

  await saveFileLocally(fileurl, destinationDirPath);

  const OriginalPhoto = await runPythonScriptTiff(destinationDirPath, fileName, 'data');
  console.log("original photo",OriginalPhoto);
  let restoredImage: string | null = null;
    while (!restoredImage) {
      // Loop in 1s intervals until the alt text is ready
      console.log("polling for result...");
      let finalResponse = await fetch('http://127.0.0.1:5000/predict', {
        method: "GET",
      });
      let jsonFinalResponse = await finalResponse.json();
      console.log('jsonFinalResponse: ', jsonFinalResponse);
      console.log('output : ', jsonFinalResponse.output);
      const splitOutput = jsonFinalResponse.output.split(' ');
      const restoreTiffFilePath = splitOutput[0].replace('\\','/');
      const restoreTiffFileName = splitOutput[1];
      const restoredImage = await runPythonScriptTiff(restoreTiffFilePath, restoreTiffFileName, 'preds');
      console.log(restoredImage);
      
    return NextResponse.json(
      {"restoredImage":restoredImage ? restoredImage : "Failed to restore image",
      "originalPhoto":OriginalPhoto ? OriginalPhoto : "Failed to upload original image"}
    );
  }}