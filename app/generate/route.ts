import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

var fs = require('fs');

// Run python script to open TIF file in specified folder and save as JPG in specified folder in 'public' 
async function runPythonScriptTif(folder:string) {
  try{
    let finalResponse = await fetch('http://127.0.0.1:5000/tif2jpg', {
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
    console.log("runPythonScriptTif got Error:", e)
  }
     
}

// Run python script to get data arrays of predicted image
async function runPythonScriptArr(folder:string) {
  try{
    let finalResponse = await fetch('http://127.0.0.1:5000/tifarr', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({folder:folder}),
    });
    let jsonArrResponse = await finalResponse.json();
    console.log('jsonArrResponse: ', jsonArrResponse); 
    return jsonArrResponse
  }catch(e){
    console.log("runPythonScriptArr got Error:", e)
  }
     
}


// Create folder if it does not exist
async function createFolder(file:string){
  var dir = `./${file}`;
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
}

// Delete folder if it exists
async function deleteFolder(dir_path:string){
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
};


export async function POST(req: NextRequest) {
  deleteAndCreateFolders();
  console.log('reach generate')
  const formData = await req.formData();
  const fileEntries = formData.getAll('files');
  const fileLength = fileEntries.length;
  console.log("fileEntries", fileEntries);
  console.log('Number of files:', fileLength);
  console.log('file entry:', fileEntries);

  const newformData = new FormData();
  const allFileNames = [];
  var filePath;
  var fileType;
  var fileName;

  // Loop through all files received
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

    // Different file paths depending on the file type 
    if (fileType != 'image/tiff') {
      console.log("non tiff file type detected");
      filePath = path.join(process.cwd(), "public/shp2tif/" + fileName);
    } 
    else {
      filePath = path.join(process.cwd(), "data/" + fileName);
    }
    // Save uploaded files locally
    await writeFile(filePath, buffer);
    console.log('filepath', filePath);
    newformData.append('filePath', filePath);
    newformData.append('fileName', fileName);}

    console.log("newformData",newformData); 
    console.log("allFileNames",allFileNames);  

    // Convert uploaded shapefile to TIF
    if (fileType != 'image/tiff') 
    {
      console.log("newformData", newformData);

      const res = await fetch("http://127.0.0.1:5000/shp2tif", 
      {
        method: "POST",
        body: newformData,
      });

      let jsonFinalResponse = await res.json();
      console.log('jsonFinalResponse: ', jsonFinalResponse);
      console.log('filepath : ', jsonFinalResponse['filepath']);
      console.log('filename : ', jsonFinalResponse['filename']);
      filePath = jsonFinalResponse['filepath'];
      fileName = jsonFinalResponse['filename']; 
    }

    // Convert uploaded TIF image to JPG 
    const OriginalPhoto = await runPythonScriptTif('data');
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
      console.log('jsonFinalResponse: ', jsonFinalResponse);
      console.log('filepath : ', jsonFinalResponse['filepath']);
      console.log('filename : ', jsonFinalResponse['filename']);
      // Convert predicted TIF image to JPG 
      const restoredImage = await runPythonScriptTif('preds');
      const dataarr = await runPythonScriptArr('preds');
      console.log('restoredImage', restoredImage);
      console.log('dataArray', dataarr);
      console.log('originalPhoto', OriginalPhoto);

      // Copy predicted TIF image in 'preds' to 'public/download' in order to download TIF image in the frontend
      try {
        const fs = require('fs-extra');
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
  }
}