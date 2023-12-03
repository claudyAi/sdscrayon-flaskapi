"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import Header from "../../components/Header";
import "react-tiff/dist/index.css";
import { TIFFViewer } from "react-tiff";
// import Tiff from "tiff.js";
// import tiffFile from "./output.tif";

// const options: UploadWidgetConfig = {
//   apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
//     ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
//     : "free",
//   maxFileCount: 1,
//   mimeTypes: ["image/jpeg", "image/png", "image/jpg", "image/tiff"],
//   editor: { images: { crop: false } },
//   styles: {
//     colors: {
//       primary: "#2563EB", // Primary buttons & links
//       error: "#d23f4d", // Error messages
//       shade100: "#fff", // Standard text
//       shade200: "#fffe", // Secondary button text
//       shade300: "#fffd", // Secondary button text (hover)
//       shade400: "#fffc", // Welcome text
//       shade500: "#fff9", // Modal close button
//       shade600: "#fff7", // Border
//       shade700: "#fff2", // Progress indicator background
//       shade800: "#fff1", // File item background
//       shade900: "#ffff", // Various (draggable crop buttons, etc.)
//     },
//   },
// };

export default function AGBM() {
  console.log("start");
  // var xhr = new XMLHttpRequest();
  // xhr.responseType = "arraybuffer";
  // xhr.open("GET", "output.tif");
  // xhr.onload = function (e) {
  //   var arrayBuffer = this.response;
  //   Tiff.initialize({
  //     TOTAL_MEMORY: 16777216 * 10,
  //   });
  //   var tiff = new Tiff({
  //     buffer: arrayBuffer,
  //   });

  //   var dataUrI = tiff.toDataURL();
  //   let element: HTMLImageElement;
  //   element = document.getElementById("img")! as HTMLImageElement;
  //   element.src = dataUrI;
  // };
  // xhr.send();
  const [outputPath, setOutputPath] = useState("./S_k_67_2017_agbm.tif");
  const [fileList, setFileList] = useState<FileList | null>(null);
  // 👇 files is not an array, but it's iterable, spread to get an array of files
  const files = fileList ? [...fileList] : [];
  const [status, setStatus] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileList(e.target.files);
  };

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   setStatus(""); // Reset status
  //   event.preventDefault();
  //   const formData = new FormData();
  //   formData.append("avatar", file);
  //   formData.append("name", name);
  //   const resp = await axios.post(UPLOAD_ENDPOINT, formData, {
  //     headers: {
  //       "content-type": "multipart/form-data",
  //       Authorization: `Bearer ${userInfo.token}`,
  //     },
  //   });
  //   setStatus(resp.status === 200 ? "Thank you!" : "Error.");
  // };

  const handleSubmit = async () => {
    console.log("submit button pressed");
    if (!fileList) {
      console.log("empty filelist");
      return;
    }
    // 👇 Create new FormData object and append files
    const data = new FormData();

    files.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });
    data.append("num_of_files", files.length.toString());
    console.log("sending form data");
    // 👇 Uploading the files using the fetch API to the server
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: data,
    })
      .then(async (res) => {
        let output = await res.json();
        console.log(output);
      })
      // .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />

      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20 background-gradient">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
          Generate <span className="text-blue-600">AGBM predictions </span> from
          .tif
        </h1>
        <form>
          <input type="file" onChange={handleFileChange} multiple />
          <button
            className="ring-2 px-3 py-2 bg-blue-800 text-white rounded-md"
            onClick={handleSubmit}
            type="button"
          >
            Upload
          </button>
        </form>

        {outputPath ? (
          <TIFFViewer
            tiff={outputPath}
            lang="en" // en | de | fr | es | tr
            paginate="ltr" // bottom | ltr
            buttonColor="#141414"
            printable
          />
        ) : null}
        {/* <img id="img" /> */}
      </main>
    </div>
  );
}

// export default function agbm() {
//   const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
//   const [restoredImage, setRestoredImage] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
//   const [sideBySide, setSideBySide] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [photoName, setPhotoName] = useState<string | null>(null);
//   const [theme, setTheme] = useState<themeType>("Brazil");
//   const [room, setRoom] = useState<roomType>("tiff");

//   const UploadDropZone = () => (
//     <UploadDropzone
//       options={options}
//       onUpdate={({ uploadedFiles }) => {
//         if (uploadedFiles.length !== 0) {
//           const image = uploadedFiles[0];
//           const imageName = image.originalFile.originalFileName;
//           const imageUrl = UrlBuilder.url({
//             accountId: image.accountId,
//             filePath: image.filePath,
//             options: {
//               transformation: "preset",
//               transformationPreset: "thumbnail",
//             },
//           });
//           setPhotoName(imageName);
//           setOriginalPhoto(imageUrl);
//           generatePhoto(imageUrl);
//         }
//       }}
//       width="670px"
//       height="250px"
//     />
//   );

//   async function generatePhoto(fileUrl: string) {
//     await new Promise((resolve) => setTimeout(resolve, 200));
//     setLoading(true);
//     const res = await fetch("/generate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ imageUrl: fileUrl, theme, room }),
//     });

//     let newPhoto = await res.json();
//     if (res.status !== 200) {
//       setError(newPhoto);
//     } else {
//       setRestoredImage(newPhoto[1]);
//     }
//     setTimeout(() => {
//       setLoading(false);
//     }, 1300);
//   }

//   return (
//     <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
//       <Header />
//       <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
//         <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
//           Generate <span className="text-blue-600">AGMB</span> estimations
//         </h1>

//         <ResizablePanel>
//           <AnimatePresence mode="wait">
//             <motion.div className="flex justify-between items-center w-full flex-col mt-4">
//               {!restoredImage && (
//                 <>
//                   <div className="space-y-4 w-full max-w-sm">
//                     <div className="flex mt-3 items-center space-x-3">
//                       <Image
//                         src="/number-1-white.svg"
//                         width={30}
//                         height={30}
//                         alt="1 icon"
//                       />
//                       <p className="text-left font-medium">
//                         Which location does the biomass come from?
//                       </p>
//                     </div>
//                     <DropDown
//                       theme={theme}
//                       setTheme={(newTheme) =>
//                         setTheme(newTheme as typeof theme)
//                       }
//                       themes={themes}
//                     />
//                   </div>
//                   <div className="space-y-4 w-full max-w-sm">
//                     <div className="flex mt-10 items-center space-x-3">
//                       <Image
//                         src="/number-2-white.svg"
//                         width={30}
//                         height={30}
//                         alt="1 icon"
//                       />
//                       <p className="text-left font-medium">
//                         What format is the input in?
//                       </p>
//                     </div>
//                     <DropDown
//                       theme={room}
//                       setTheme={(newRoom) => setRoom(newRoom as typeof room)}
//                       themes={rooms}
//                     />
//                   </div>
//                   <div className="mt-4 w-full max-w-sm">
//                     <div className="flex mt-6 w-96 items-center space-x-3">
//                       <Image
//                         src="/number-3-white.svg"
//                         width={30}
//                         height={30}
//                         alt="1 icon"
//                       />
//                       <p className="text-left font-medium">
//                         Upload the biomass to be predicted.
//                       </p>
//                     </div>
//                   </div>
//                 </>
//               )}
//               {restoredImage && (
//                 <div>
//                   Here's the estimated AGBD from <b>{room.toLowerCase()}</b> in
//                   the <b>{theme.toLowerCase()}</b> format!{" "}
//                 </div>
//               )}
//               <div
//                 className={`${
//                   restoredLoaded ? "visible mt-6 -ml-8" : "invisible"
//                 }`}
//               >
//                 <Toggle
//                   className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
//                   sideBySide={sideBySide}
//                   setSideBySide={(newVal) => setSideBySide(newVal)}
//                 />
//               </div>
//               {restoredLoaded && sideBySide && (
//                 <CompareSlider
//                   original={originalPhoto!}
//                   restored={restoredImage!}
//                 />
//               )}
//               {!originalPhoto && <UploadDropZone />}
//               {originalPhoto && !restoredImage && (
//                 <Image
//                   alt="original photo"
//                   src={originalPhoto}
//                   className="rounded-2xl h-96"
//                   width={475}
//                   height={475}
//                 />
//               )}
//               {restoredImage && originalPhoto && !sideBySide && (
//                 <div className="flex sm:space-x-4 sm:flex-row flex-col">
//                   <div>
//                     <h2 className="mb-1 font-medium text-lg">Input Biomass</h2>
//                     <Image
//                       alt="original photo"
//                       src={originalPhoto}
//                       className="rounded-2xl relative w-full h-96"
//                       width={475}
//                       height={475}
//                     />
//                   </div>
//                   <div className="sm:mt-0 mt-8">
//                     <h2 className="mb-1 font-medium text-lg">
//                       Generated predictions
//                     </h2>
//                     <a href={restoredImage} target="_blank" rel="noreferrer">
//                       <Image
//                         alt="restored photo"
//                         src={restoredImage}
//                         className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in w-full h-96"
//                         width={475}
//                         height={475}
//                         onLoadingComplete={() => setRestoredLoaded(true)}
//                       />
//                     </a>
//                   </div>
//                 </div>
//               )}
//               {loading && (
//                 <button
//                   disabled
//                   className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 w-40"
//                 >
//                   <span className="pt-4">
//                     <LoadingDots color="white" style="large" />
//                   </span>
//                 </button>
//               )}
//               {error && (
//                 <div
//                   className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8"
//                   role="alert"
//                 >
//                   <span className="block sm:inline">{error}</span>
//                 </div>
//               )}
//               <div className="flex space-x-2 justify-center">
//                 {originalPhoto && !loading && (
//                   <button
//                     onClick={() => {
//                       setOriginalPhoto(null);
//                       setRestoredImage(null);
//                       setRestoredLoaded(false);
//                       setError(null);
//                     }}
//                     className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-blue-500/80 transition"
//                   >
//                     Generate New Predictions
//                   </button>
//                 )}
//                 {restoredLoaded && (
//                   <button
//                     onClick={() => {
//                       downloadPhoto(
//                         restoredImage!,
//                         appendNewToName(photoName!)
//                       );
//                     }}
//                     className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition"
//                   >
//                     Download Generated
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           </AnimatePresence>
//         </ResizablePanel>
//       </main>
//     </div>
//   );
// }
