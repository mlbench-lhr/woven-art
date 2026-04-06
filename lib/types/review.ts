import { VendorDetails } from "../store/slices/vendorSlice";
import { User } from "./auth";
import { BookingDocument } from "../mongodb/models/booking";
import { ToursAndActivityDocument } from "../mongodb/models/ToursAndActivity";

export interface ReviewWithPopulatedData {
  _id: string;
  booking: BookingDocument;
  activity: ToursAndActivityDocument;
  rating: number;
  createdAt: Date;
  review: {
    addedBy: "user" | "vendor";
    text: string;
    uploads: string[];
  }[];
  vendor: {
    _id: string;
    avatar: string;
    vendorDetails: VendorDetails;
  };
  user: User;
}
