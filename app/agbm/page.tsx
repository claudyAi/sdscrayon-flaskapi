"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { CompareSlider } from "../../components/CompareSlider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingDots from "../../components/LoadingDots";
import ResizablePanel from "../../components/ResizablePanel";
import Toggle from "../../components/Toggle";
import appendNewToName from "../../utils/appendNewToName";
import downloadPhoto from "../../utils/downloadPhoto";
import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.css'

// const options: UploadWidgetConfig = {
//   apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
//     ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
//     : "free",
//   // maxFileCount: 1,
//   mimeTypes: [
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//     "image/tiff",
//     "image/shp",
//     "application/octet-stream",
//     "application/x-esri-shape",
//     "application/vnd.esri.shapefile",
//   ],
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
  const [originalPhoto, setOriginalPhoto] = useState<string[] | null>(null);
  const [restoredImage, setRestoredImage] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [fileInput, setFileInput] = useState<any>();
  const [showSecondLoading, setShowSecondLoading] = useState(false);
  const [showThirdLoading, setShowThirdLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isSingleImage = originalPhoto && originalPhoto.length === 1;

  async function generatePhoto(image: any) {
    console.log("generate");
    console.log(image);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);
    const res = await fetch("/generate", {
      method: "POST",
      body: image,
    });
    let newPhoto = await res.json();
    console.log("new photo", newPhoto);
    if (res.status !== 200) {
      setError(newPhoto);
    } 
    setTimeout(() => {
      setLoading(false);
    }, 1300);
    setRestoredImage(newPhoto['restoredImage']);
    setOriginalPhoto(newPhoto['originalPhoto']);
    console.log('restoredImage at agbm', restoredImage);
    console.log('originalPhoto at agbm', originalPhoto);
  }

  const submitHandler = (event: any) => {
    // handle validations
    event.preventDefault();
    console.log("event", event.target);
    const data = new FormData(event.target);
    const uploadedFiles = data.getAll("imageInput");
    const indvFiles = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      const indvFile : File = uploadedFiles[i] as File
      console.log("indv files",  indvFile.name);
      indvFiles.append("files", uploadedFiles[i]);
      console.log(uploadedFiles[i]);
      console.log('uploadedFiles.length', uploadedFiles.length);
    }
    console.log("indvFiles",indvFiles);
    generatePhoto(indvFiles);
    for (let i = 0; i < uploadedFiles.length; i++) {
      const indvFile : File = uploadedFiles[i] as File
      if (indvFile.type != 'image/tiff') {
        uploadedFiles.length = 1;}
    }
    handlePrev(uploadedFiles.length);
    handleNext(uploadedFiles.length);
    setPhotoName('predicted'); // hardcode downloaded name for now
  };

  const handlePrev = (uploadedFilesLength:any) => {
    const newIndex = (activeIndex - 1 + uploadedFilesLength) % uploadedFilesLength;
    setActiveIndex(newIndex);
    console.log('activeIndex',activeIndex);
  };
  
  const handleNext = (uploadedFilesLength:any) => {
    const newIndex = (activeIndex + 1) % uploadedFilesLength;
    setActiveIndex(newIndex);
    console.log('newIndex',newIndex);
  };

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap");
    let secondTimer: string | number | NodeJS.Timeout | undefined;
    let thirdTimer: string | number | NodeJS.Timeout | undefined;

    if (loading) {
      // Set the second loading to appear after 0.5 seconds
      secondTimer = setTimeout(() => {
        setShowSecondLoading(true);
        // Set the third loading to appear after another 0.5 seconds (1 second in total from the start)
        thirdTimer = setTimeout(() => {
          setShowThirdLoading(true);
        }, 2000);
      }, 2000);
    }

    return () => {
      clearTimeout(secondTimer);
      clearTimeout(thirdTimer);
      setShowSecondLoading(false); // Reset the second loading state
      setShowThirdLoading(false); // Reset the third loading state
    };
  }, [loading]);

return (
  <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
    <Header />
    <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
      <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
        Generate <span className="text-blue-600">AGBM predictions </span> from
        .tif 
      </h1>
      <ResizablePanel>
        <AnimatePresence mode="wait">
          <motion.div className="flex justify-between items-center w-full flex-col mt-4">
          {/* Content before carousel */}
          {!originalPhoto && (
              <div>
                <form
                  onSubmit={submitHandler}
                  method="post"
                  encType="multipart/form-data"
                >
                  <input
                    type="file"
                    name="imageInput"
                    multiple
                    onChange={(event) => setFileInput(event.target.files)}
                  />
                  <button
                    type="submit"
                    className="ring-2 px-3 py-2 bg-blue-800 text-white rounded-md"
                  >
                    Upload
                  </button>
                </form>
              </div>
            )}
            {loading && (
              <span className="pt-4">
                <div className="space-y-4 w-full max-w-sm">
                  <div className="flex mt-10 items-center space-x-3">
                    <Image
                      src="/number-1-white.svg"
                      width={30}
                      height={30}
                      alt="1 icon"
                    />
                    <p className="text-left font-medium">
                      Sending upload to model
                    </p>
                  </div>
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </div>
              </span>
            )}
            {loading && showSecondLoading && (
              <span className="pt-4">
                <div className="space-y-4 w-full max-w-sm">
                  <div className="flex mt-10 items-center space-x-3">
                    <Image
                      src="/number-2-white.svg"
                      width={30}
                      height={30}
                      alt="2 icon"
                    />
                    <p className="text-left font-medium">
                      Model Processing Image
                    </p>
                  </div>
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </div>
              </span>
            )}
            {loading && showThirdLoading && (
              <span className="pt-4">
                <div className="space-y-4 w-full max-w-sm">
                  <div className="flex mt-10 items-center space-x-3">
                    <Image
                      src="/number-3-white.svg"
                      width={30}
                      height={30}
                      alt="1 icon"
                    />
                    <p className="text-left font-medium">
                      Estimated biomass output image
                    </p>
                  </div>
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </div>
              </span>
            )}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {/* Check if content is loaded before rendering the carousel */}
            {restoredImage! && originalPhoto! &&  (
              <div id="carouselExample" className="carousel slide">
              <div className="carousel-inner">
                  {/* Map through originalPhoto to render carousel items */}
                  {originalPhoto.map((photo, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
                  >
              {/* Content for each carousel item */}
              <div className="flex justify-between items-center w-full flex-col mt-4">
              {!restoredImage && (
                <>
                  <div className="mt-4 w-full max-w-sm"></div>
                </>
              )}
              <div className={`${restoredLoaded ? "visible mt-6 -ml-8" : "invisible"}`}>
                <Toggle
                  className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
                  sideBySide={sideBySide}
                  setSideBySide={(newVal) => setSideBySide(newVal)}
                />
              </div>
              {restoredLoaded && sideBySide && (
                <CompareSlider
                  original={originalPhoto[index]!}
                  restored={restoredImage[index]!}
                />
              )}
              {restoredImage && originalPhoto &&  !sideBySide &&(
              <div className="flex sm:space-x-4 sm:flex-row flex-col">
                      <div>
                        <h2 className="mb-1 font-medium text-lg">Uploaded Image</h2>
                        <Image
                          alt="original photo"
                          src={photo}
                          className="rounded-2xl relative w-full h-96"
                          width={475}
                          height={475}
                        />
                      </div>
                      <div className="sm:mt-0 mt-8">
                        <h2 className="mb-1 font-medium text-lg">
                          Predicted Image
                        </h2>
                        <a href={restoredImage[index]} target="_blank" rel="noreferrer">
                          <Image
                            alt="restored photo"
                            src={restoredImage[index]}
                            className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in w-full h-96"
                            width={475}
                            height={475}
                            onLoadingComplete={() => setRestoredLoaded(true)}
                          />
                        </a>
                      </div>
                    </div>)}
                    </div>
                    {!restoredImage && (
              <>
                <div className="mt-4 w-full max-w-sm"></div>
              </>
            )}
            <div className="flex space-x-2 justify-center">
              {originalPhoto && !loading && (
                <button
                  onClick={() => {
                    setOriginalPhoto(null);
                    setRestoredImage(null);
                    setRestoredLoaded(false);
                    setError(null);
                    setActiveIndex(0);
                  }}
                  className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-blue-500/80 transition"
                >
                  Upload Another Image
                </button>
              )}
              {restoredLoaded && (
                <div>
                <button
                  onClick={() => {
                    downloadPhoto(
                      restoredImage[index]!,
                      appendNewToName(restoredImage[index].replace('/preds/','').replace('.jpg', '.tif')!)
                    );
                  }}
                  className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition"
                >
                  Download Predicted Image
                </button>
                </div>)}
            </div>
            </div>
          ))}
        </div>
        {/* Carousel controls */}
        {!isSingleImage && (
        <>
        <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide="prev"
              onClick={handlePrev}
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide="next"
              onClick={handleNext}
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
            </>)}
            </div>)
            
            }
            
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
}