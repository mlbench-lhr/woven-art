"use client";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImportDialog({
  isOpen,
  onClose,
  onImport,
  importLoading,
}: any) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef: any = useRef(null);

  const handleFileSelect = (file: any) => {
    if (!file) return;

    const validTypes = [".csv", ".xls", ".xlsx"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      alert("Please upload a valid file (XLS, XLSX, or CSV)");
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      alert("File size must be less than 25MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e: any) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleImportClick = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? "border-[#B32053] bg-[#B32053]/5"
                : "border-gray-300 hover:border-[#B32053] hover:bg-gray-50"
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-gray-600">
              {selectedFile ? (
                <div className="flex items-center gap-2 flex-col ">
                  <Upload className="w-5 h-5 text-[#B32053]" />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-base font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    XLS, XLSX, CSV ( Maximum size 25 MB )
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".csv,.xls,.xlsx"
          className="hidden"
        />

        {/* Footer Buttons */}
        <div className="gap-3 mt-6 grid grid-cols-2 w-full">
          <Button
            variant="outline"
            onClick={handleClose}
            className="col-span-1 h-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportClick}
            disabled={!selectedFile}
            variant={"main_green_button"}
            loading={importLoading}
            className="col-span-1"
          >
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}
