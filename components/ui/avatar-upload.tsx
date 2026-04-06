"use client";

import type React from "react";

import { useState, useRef, Dispatch, SetStateAction } from "react";
import { Camera, Loader, Pencil, Sprout, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { uploadFile } from "@/lib/utils/upload";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpload: (url: string) => void;
  className?: string;
  size?: number;
  setLoading?: Dispatch<SetStateAction<boolean>>;
  opportunity?: Boolean;
  blog?: Boolean;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarUpload,
  className,
  size = 96,
  setLoading,
  opportunity = false,
  blog = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Validate file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      alert("Image size should be less than 25MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    if (setLoading) {
      setLoading(true);
    }
    try {
      const url = await uploadFile(file, "avatars");
      onAvatarUpload(url);
      setPreviewUrl(null); // Clear preview since we have the uploaded URL
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Upload failed. Please try again.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  const displayImage = previewUrl || currentAvatar;
  console.log("displayImage------", displayImage);

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {isUploading ? (
          <div className="w-full h-full rounded-full overflow-hidden bg-[#F8FAF6] flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="w-full h-full rounded-full overflow-hidden bg-[#F8FAF6]">
            {displayImage ? (
              <Image
                src={displayImage || "/placeholder.svg"}
                alt="Avatar"
                width={size}
                height={size}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {opportunity ? (
                  <Sprout className="w-8 h-8 text-[#B32053]" />
                ) : blog ? (
                  <Trophy className="w-8 h-8 text-[#B32053]" />
                ) : (
                  <User className="w-8 h-8 text-[#B32053]" />
                )}
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute top-0 right-0 p-2 text-white rounded-full transition-colors disabled:opacity-50 bg-primary"
        >
          <Pencil color="white" size={14} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
