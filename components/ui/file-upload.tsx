"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "./button";
import { X, Upload, ImageIcon, Download, Trash, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadMultipleFiles } from "@/lib/utils/upload";
import { User } from "@/lib/types/auth";
import { useAppSelector } from "@/lib/store/hooks";

interface FileUploadProps {
  onFileUpload: (urls: string[]) => void;
  onFileRemove: (index: string) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileUpload,
  onFileRemove,
  multiple = false,
  accept = "image/*,.pdf",
  maxSize = 25,
  className,
  label = "Upload Files",
  description = "Drag and drop files here or click to browse",
}: FileUploadProps) {
  const userData = useAppSelector((s) => s.auth.user);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Validate file size
    const validFiles = files.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });

    if (validFiles?.length > 0) {
      setIsUploading(true);
      try {
        const urls = await uploadMultipleFiles(validFiles, "transcripts");
        onFileUpload(urls);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <ImageIcon className="w-4 h-4" />;
  };
  const handleFileDownload = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileUrl.split("/").pop() || "download"; // fallback name
      document.body.appendChild(link);
      link.click();

      // cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "w-full h-[144px] border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-gray-300",
          "hover:border-primary hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-full h-full justify-center flex flex-col items-center space-y-2">
          <div>
            <p className="plan-text-style-2">
              {isUploading
                ? "Uploading...."
                : "Click to upload or drag and drop"}
            </p>
            <p className="plan-text-style-3">
              PDF, JPG or PNG ( Maximum size {maxSize}MB )
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 rounded-lg w-full">
        {userData?.academicInfo?.transcript &&
          userData?.academicInfo?.transcript?.length > 0 &&
          userData?.academicInfo?.transcript?.map((file, index) => (
            <div
              key={index}
              className="col-span-12 sm:col-span-12 lg:col-span-12 flex bg-[#D8E6DD] rounded-[8px] py-[8px] px-[16px] items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4" color="#B32053" />{" "}
                <span className="text-sm truncate max-w-[200px]">
                  {file.split("/").pop()}
                </span>
              </div>
              <div className="flex justify-start items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileDownload(file)}
                >
                  <Download className="w-4 h-4" />
                </Button>{" "}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(file)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
