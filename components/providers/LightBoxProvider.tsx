import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function LightboxProvider({
  children,
  images,
}: {
  children: React.ReactNode;
  images: string[];
}) {
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const imagesMapped = images.map((item, index) => {
    return { src: item, alt: "Image " + index };
  });

  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setOpen(true);
  };

  return (
    <div className="w-full cursor-pointer" onClick={() => handleImageClick(0)}>
      {children}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={photoIndex}
        slides={imagesMapped}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .9)" },
        }}
        animation={{ fade: 250 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
