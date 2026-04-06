import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Skeleton } from "./ui/skeleton";
import { X } from "lucide-react";

export default function UpdatableImageGallery({
  imagesParam = [],
  isUploading = false,
  editable = false,
  onRemove,
}: {
  imagesParam: string[] | undefined;
  isUploading?: boolean;
  editable?: boolean;
  onRemove?: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const images = imagesParam.map((item, index) => {
    return { src: item, alt: "Image" + index };
  });

  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setOpen(true);
  };

  const count = images.length;

  const Img = ({
    src,
    alt,
    index,
    className,
    onClick,
  }: {
    src: string;
    alt: string;
    index: number;
    className?: string;
    onClick?: () => void;
  }) => {
    return (
      <div className="relative h-full">
        <img src={src} alt={alt} className={className} onClick={onClick} />
        {editable && (
          <button
            type="button"
            className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-black hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove(index);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  // Layout renderer based on image count
  const renderLayout = () => {
    switch (count) {
      case 4:
        return (
          <div className="w-full grid grid-cols-10 h-[360px]  gap-1 md:gap-2 ">
            {/* First Image */}
            <div
              className={`col-span-10 md:col-span-4 rounded-[14px] overflow-hidden h-full cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => handleImageClick(0)}
            >
              <Img
                src={images[0]?.src}
                alt={images[0]?.alt}
                index={0}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {images.length > 1 && (
              <div
                className="col-span-10 md:col-span-2 rounded-[14px] overflow-hidden h-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              >
                <Img
                  src={images[1]?.src}
                  alt={images[1]?.alt}
                  index={1}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Third and Fourth Images Container */}
            <div className="col-span-10 md:col-span-4 grid grid-cols-2 md:grid-cols-none md:grid-rows-2 rounded-[14px] overflow-hidden h-full  gap-1 md:gap-2 ">
              {images.length > 2 && (
                <div
                  className="row-span-1 rounded-[14px] overflow-hidden h-full col-span-1 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(2)}
                >
                  <Img
                    src={images[2]?.src}
                    alt={images[2]?.alt}
                    index={2}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
              {images.length > 3 && (
                <div
                  className="row-span-1 rounded-[14px] overflow-hidden h-full col-span-1 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(3)}
                >
                  <Img
                    src={images[3]?.src}
                    alt={images[3]?.alt}
                    index={3}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="grid grid-cols-6  gap-1 md:gap-2 ">
            {/* First two images on left */}
            <div className="col-span-3 md:col-span-2 row-span-1 md:row-span-2">
              <Img
                src={images[0].src}
                alt={images[0].alt}
                index={0}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            {/* Center large image */}
            <div className="col-span-3 md:col-span-2 row-span-1 md:row-span-2">
              <Img
                src={images[1].src}
                alt={images[1].alt}
                index={1}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            {/* Three images on right stacked */}
            <div className="col-span-2 md:col-span-2">
              <Img
                src={images[2].src}
                alt={images[2].alt}
                index={2}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Img
                src={images[3].src}
                alt={images[3].alt}
                index={3}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Img
                src={images[4].src}
                alt={images[4].alt}
                index={4}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="grid grid-cols-4  gap-1 md:gap-2  h-fit">
            {/* Large image top left */}
            <div className="col-span-2 row-span-1">
              <Img
                src={images[0].src}
                alt={images[0].alt}
                index={0}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-1 row-span-1">
              <Img
                src={images[1].src}
                alt={images[1].alt}
                index={1}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-1 row-span-1">
              <Img
                src={images[2].src}
                alt={images[2].alt}
                index={2}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            {/* Bottom row */}
            <div className="col-span-1">
              <Img
                src={images[3].src}
                alt={images[3].alt}
                index={3}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[4].src}
                alt={images[4].alt}
                index={4}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
            <div className="col-span-2 row-span-1">
              <Img
                src={images[5].src}
                alt={images[5].alt}
                index={5}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(5)}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="grid grid-cols-6  gap-1 md:gap-2  h-fit">
            {/* Top row - 3 images */}
            <div className="col-span-2">
              <Img
                src={images[0].src}
                alt={images[0].alt}
                index={0}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[1].src}
                alt={images[1].alt}
                index={1}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[2].src}
                alt={images[2].alt}
                index={2}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            {/* Bottom row - 4 images */}
            <div className="col-span-2">
              <Img
                src={images[3].src}
                alt={images[3].alt}
                index={3}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[4].src}
                alt={images[4].alt}
                index={4}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[5].src}
                alt={images[5].alt}
                index={5}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(5)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[6].src}
                alt={images[6].alt}
                index={6}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(6)}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="grid grid-cols-6  gap-1 md:gap-2  h-fit">
            {/* Top row - large + 2 small */}
            <div className="col-span-3 row-span-1">
              <Img
                src={images[0].src}
                alt={images[0].alt}
                index={0}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[1].src}
                alt={images[1].alt}
                index={1}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[2].src}
                alt={images[2].alt}
                index={2}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            {/* Bottom row - 5 images */}
            <div className="col-span-1">
              <Img
                src={images[3].src}
                alt={images[3].alt}
                index={3}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[4].src}
                alt={images[4].alt}
                index={4}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[5].src}
                alt={images[5].alt}
                index={5}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(5)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[6].src}
                alt={images[6].alt}
                index={6}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(6)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[7].src}
                alt={images[7].alt}
                index={7}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(7)}
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="grid grid-cols-8  gap-1 md:gap-2  h-fit">
            {/* Top row - large + 3 small */}
            <div className="col-span-4 row-span-2">
              <Img
                src={images[0].src}
                alt={images[0].alt}
                index={0}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[1].src}
                alt={images[1].alt}
                index={1}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[2].src}
                alt={images[2].alt}
                index={2}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            {/* Second row right side */}
            <div className="col-span-2">
              <Img
                src={images[3].src}
                alt={images[3].alt}
                index={3}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[4].src}
                alt={images[4].alt}
                index={4}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
            {/* Bottom row - 5 images */}
            <div className="col-span-2">
              <Img
                src={images[5].src}
                alt={images[5].alt}
                index={5}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(5)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[6].src}
                alt={images[6].alt}
                index={6}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(6)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[7].src}
                alt={images[7].alt}
                index={7}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(7)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[8].src}
                alt={images[8].alt}
                index={8}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(8)}
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="grid grid-cols-8  gap-1 md:gap-2  h-fit">
            {/* Top row - large + 3 small */}
            <div className="col-span-4 row-span-2">
              <Img
                src={images[0].src}
                alt={images[0].alt}
                index={0}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[1].src}
                alt={images[1].alt}
                index={1}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[2].src}
                alt={images[2].alt}
                index={2}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            {/* Second row right side */}
            <div className="col-span-2">
              <Img
                src={images[3].src}
                alt={images[3].alt}
                index={3}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[4].src}
                alt={images[4].alt}
                index={4}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
            {/* Bottom row - 5 images */}
            <div className="col-span-2">
              <Img
                src={images[5].src}
                alt={images[5].alt}
                index={5}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(5)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[6].src}
                alt={images[6].alt}
                index={6}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(6)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[7].src}
                alt={images[7].alt}
                index={7}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(7)}
              />
            </div>
            <div className="col-span-1">
              <Img
                src={images[8].src}
                alt={images[8].alt}
                index={8}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(8)}
              />
            </div>
            <div className="col-span-2">
              <Img
                src={images[9].src}
                alt={images[9].alt}
                index={9}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(9)}
              />
            </div>
          </div>
        );

      default:
        // Fallback for any other count
        return (
          <div className="grid grid-cols-3  gap-1 md:gap-2 ">
            {images.map((image, index) => (
              <div key={index}>
                <Img
                  src={image.src}
                  alt={image.alt}
                  index={index}
                  className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </div>
        );
    }
  };
  if (isUploading) {
    return (
      <div className="w-full grid grid-cols-10 h-[360px] gap-1 md:gap-2">
        <div className="col-span-10 md:col-span-4 rounded-[14px] overflow-hidden h-full">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="col-span-10 md:col-span-2 rounded-[14px] overflow-hidden h-full hidden md:block">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="col-span-10 md:col-span-4 grid grid-cols-2 md:grid-cols-none md:grid-rows-2 rounded-[14px] overflow-hidden h-full gap-1 md:gap-2">
          <div className="row-span-1 rounded-[14px] overflow-hidden h-full col-span-1">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="row-span-1 rounded-[14px] overflow-hidden h-full col-span-1">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-fit">
      {renderLayout()}

      {/* Lightbox Component */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={photoIndex}
        slides={images}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .9)" },
        }}
        animation={{ fade: 250 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
