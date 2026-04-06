// components/FavoriteButton.tsx
import { HeartIcon } from "@/public/allIcons/page";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useMemo, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { TextAreaInputComponent } from "./InputComponents";
import { Label } from "../ui/label";
import Rating from "./RatingField";
import { Loader2, X } from "lucide-react";
import { uploadFile } from "@/lib/utils/upload";
import Image from "next/image";
import { Button } from "../ui/button";

interface ReviewButtonProps {
  _id?: string;
  booking?: string;
  user?: string;
  vendor?: string;
  activity?: string;
  type: "edit" | "add";
  triggerComponent?: React.ReactNode | React.ComponentType<any>;
  onSuccess?: () => void;
  textProp?: string;
  ratingProp?: number;
  uploadsProp?: string[];
}

export const ReviewModal = ({
  _id,
  booking,
  user,
  vendor,
  activity,
  type,
  triggerComponent,
  onSuccess,
  textProp,
  ratingProp,
  uploadsProp,
}: ReviewButtonProps) => {
  const TriggerComponent = triggerComponent;
  const userData = useAppSelector((state) => state.auth.user);
  const [text, setText] = useState<string>(textProp || "");
  const [rating, setRating] = useState<number>(ratingProp || 0);
  const [uploads, setUploads] = useState<string[]>(uploadsProp || []);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleReviewsUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        rating,
        review: {
          addedBy: "user",
          text,
          uploads,
        },
      };
      console.log("payload----", payload);
      const response = await axios.put("/api/reviews/update/" + _id, payload);
      console.log("response----", response.data);
      setLoading(false);
      setOpen(false);
      onSuccess && onSuccess();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleReviewsAdd = async () => {
    try {
      setLoading(true);
      const payload = {
        booking,
        user,
        vendor,
        activity,
        rating,
        review: {
          addedBy: "user",
          text,
          uploads,
        },
      };
      console.log("payload----", payload);
      const response = await axios.post("/api/reviews/add", payload);
      console.log("response----", response.data);
      setLoading(false);
      setOpen(false);
      onSuccess && onSuccess();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      alert("Image size should be less than 25MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();

    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const url = await uploadFile(file, "avatars");
      console.log("url-----", url);
      setUploads([...uploads, url]);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = (index: number) => {
    console.log("index---", index);
    console.log("uploads1---", uploads);
    console.log("uploads.splice(index, 1)---", uploads.splice(index, 1));
    setUploads(uploads.splice(index, 1));
    console.log("uploads2---", uploads);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="w-full"
        onClick={() => {
          setOpen(true);
        }}
      >
        {TriggerComponent &&
          (typeof TriggerComponent === "function" ? (
            <TriggerComponent />
          ) : (
            TriggerComponent
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-center w-full ">
          {type === "add" ? "Leave A Review" : "Edit Review"}
        </DialogTitle>
        <DialogDescription className="mt-2 space-y-4">
          <Label>Rate this vendor</Label>
          <Rating value={rating} setValue={setRating} />
          <TextAreaInputComponent
            label="Tell us about your experience…"
            value={text}
            placeholder="Write your review here…"
            onChange={(e) => setText(e)}
          />
          <Label>Upload Photos (optional)</Label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              ) : (
                <span className="text-sm text-gray-600">
                  Click to upload documents (PDF or JPG)
                </span>
              )}
            </label>
          </div>
          <div className="w-full grid grid-cols-3 gap-2">
            {uploads.map((url, index) => (
              <div
                key={index}
                className="flex relative w-full items-center justify-between"
              >
                <Image
                  src={url}
                  alt=""
                  width={100}
                  height={113}
                  className="w-full h-[113px]"
                />
                <button
                  type="button"
                  onClick={() => handleFileRemove(index)}
                  className=" ml-2 absolute top-1 right-1 p-1 rounded-full bg-white text-black hover:text-red-500"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant={"main_green_button"}
            className="w-full"
            onClick={() => {
              type === "add" ? handleReviewsAdd() : handleReviewsUpdate();
            }}
            loading={loading || isUploading}
          >
            Submit Review
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
