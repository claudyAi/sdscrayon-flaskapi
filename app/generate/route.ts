import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

// Run python script to open TIF file in '/data' and save as JPG in '/public/data' 
async function runPythonScriptTiff(folder:string) {
  try{
    let finalResponse = await fetch('http://127.0.0.1:5000/tiff2jpg', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({folder:folder}),
    });
    let jsonTiffResponse = await finalResponse.json();
    console.log('jsonTiffResponse: ', jsonTiffResponse); 
    return jsonTiffResponse 
  }catch(e){
    console.log("runPythonScriptTiff got Error:", e)
  }
     
}

async function runPythonScriptArr(folder:string) {
  try{
    let finalResponse = await fetch('http://127.0.0.1:5000/tifarr', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({folder:folder}),
    });
    let jsonTiffResponse = await finalResponse.json();
    console.log('jsonTiffResponse: ', jsonTiffResponse); 
    return jsonTiffResponse
  }catch(e){
    console.log("runPythonScriptTiff got Error:", e)
  }
     
}

// Create folder if it does not exist
async function createFolder(file:string){
  var fs = require('fs');
  var dir = `./${file}`;

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
}

async function deleteFolder(dir_path:string){
const fs = require('node:fs');
if (fs.existsSync(dir_path)) {
  fs.readdirSync(dir_path).forEach(function(entry:any) {
      var entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        deleteFolder(entry_path);
      } else {
          fs.unlinkSync(entry_path);
      }
  });
  fs.rmdirSync(dir_path);
}}

const foldersToDeleteAndCreate = [
  'data',
  'preds',
  'public/data',
  'public/preds',
  'public/shp2tif',
  'public/download',
];
const deleteAndCreateFolders = async () => {
  for (const folder of foldersToDeleteAndCreate) {
    await deleteFolder(folder);
    await createFolder(folder);
  }
  console.log('Done deleting and creating folders');
  console.log('--------------------------');
};

export async function POST(req: NextRequest) {
  deleteAndCreateFolders();
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
  var fileType;
  var fileName;
  const allFileNames = [];

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
    allFileNames.push(fileName);

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

    console.log("newformData",newformData); 
    console.log("allFileNames",allFileNames);  
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
      const OriginalPhoto = await runPythonScriptTiff('data');
      console.log("originalphoto", OriginalPhoto);

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
        // Convert TIF image to JPG 
        const restoredImage = await runPythonScriptTiff('preds');
        const dataarr = await runPythonScriptArr('preds');
        console.log(restoredImage);
        console.log(dataarr);
        console.log('restoredImage', restoredImage);
        console.log('dataArray', dataarr);
        console.log('originalPhoto', OriginalPhoto);
    
    const fs = require('fs-extra');
    try {
      fs.copy("preds","public/download")
      console.log('Files copied successfully!')
    }catch(e){
      console.error(e)
    }
    
    return NextResponse.json(
      {"restoredImage":restoredImage ? restoredImage : "Failed to restore image",
      "originalPhoto":OriginalPhoto ? OriginalPhoto : "Failed to upload original image",
      "dataArray": dataarr ? dataarr : "Failed to get data array"}
    );
    }}