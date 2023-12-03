import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import path from "path";
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

// Create a new ratelimiter, that allows 5 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(5, "1440 m"),
      analytics: true,
    })
  : undefined;

const Jimp = require('jimp');

async function convertTiffToJpeg(tiffFilePath: string, jpegFilePath: string) {
  try {
    const tiffImage = await Jimp.read(tiffFilePath);
    await tiffImage.quality(100).writeAsync(jpegFilePath); // Save as JPEG with specified quality (100 is maximum)

    console.log('Conversion successful');
  } catch (error) {
    console.error('Error converting TIFF to JPEG:', error);
  }
}

// async function saveFileLocally(fileurl: any, destinationDirPath: any) {
//   const fs = require('fs');
//   const http = require('http');
//   const https = require('https');
//   const protocol = fileurl.startsWith('https') ? https : http;
//   protocol.get(fileurl, (response: any) => {
//     if (response.statusCode === 200) {
//       const fileStream = fs.createWriteStream(destinationDirPath);
//       response.pipe(fileStream);

//       fileStream.on('finish', () => {
//         fileStream.close();
//         console.log('File downloaded successfully!');
//       });
//     } else {
//       console.error(`Failed to download file. Status code: ${response.statusCode}`);
//     }
//   }).on('error', (error: any) => {
//     console.error('Error downloading file:', error);
//   }); 
// };

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

export async function POST(req: NextRequest) {
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
      // console.log('output filePath: ', jsonFinalResponse.output['filePath']);
      // console.log('output fileName: ', jsonFinalResponse.output['fileName']);

      // convertTiffToJpeg(tiffFilePath, jpegFilePath);
      // console.log('restored image----');
      // const restoredImg = jpegFilePath.replace('public\\', '/');
      // // const restoredImage = restoredImg.replace('\\', '/');
      // const restoredImage = '/gedi2.jpg'
      const restoredImage = await runPythonScriptTiff(restoreTiffFilePath, restoreTiffFileName, 'preds');

      console.log(restoredImage);
    //   if (jsonFinalResponse.status === "succeeded") {
    //     restoredImage = jsonFinalResponse.output;
    //   } else if (jsonFinalResponse.status === "failed") {
    //     break;
    //   } else {
    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    //   }
    // }
      
    return NextResponse.json(
      {"restoredImage":restoredImage ? restoredImage : "Failed to restore image",
      "originalPhoto":OriginalPhoto ? OriginalPhoto : "Failed to upload original image"}
    );
  }}


// export async function POST(request: Request) {
//   // Rate Limiter Code
//   if (ratelimit) {
//     const headersList = headers();
//     const ipIdentifier = headersList.get("x-real-ip");

//     const result = await ratelimit.limit(ipIdentifier ?? "");

//     if (!result.success) {
//       return new Response(
//         "Too many uploads in 1 day. Please try again in a 24 hours.",
//         {
//           status: 429,
//           headers: {
//             "X-RateLimit-Limit": result.limit,
//             "X-RateLimit-Remaining": result.remaining,
//           } as any,
//         }
//       );
//     }
//   }

//   const { imageUrl, theme, room } = await request.json();

//   // POST request to Replicate to start the image restoration generation process
//   let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Token " + process.env.REPLICATE_API_KEY,
//     },
//     body: JSON.stringify({
//       version:
//         "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
//       input: {
//         image: imageUrl,
//         prompt:
//           room === "Gaming Room"
//             ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
//             : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
//         a_prompt:
//           "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
//         n_prompt:
//           "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
//       },
//     }),
//   });

//   let jsonStartResponse = await startResponse.json();

//   let endpointUrl = jsonStartResponse.urls.get;

//   // GET request to get the status of the image restoration process & return the result when it's ready
//   let restoredImage: string | null = null;
//   while (!restoredImage) {
//     // Loop in 1s intervals until the alt text is ready
//     console.log("polling for result...");
//     let finalResponse = await fetch(endpointUrl, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Token " + process.env.REPLICATE_API_KEY,
//       },
//     });
//     let jsonFinalResponse = await finalResponse.json();

//     if (jsonFinalResponse.status === "succeeded") {
//       restoredImage = jsonFinalResponse.output;
//     } else if (jsonFinalResponse.status === "failed") {
//       break;
//     } else {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   }

//   return NextResponse.json(
//     restoredImage ? restoredImage : "Failed to restore image"
//   );
// }
