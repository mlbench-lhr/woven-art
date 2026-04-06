import { Types } from "mongoose";
import { LocationData, Traveler } from "../store/slices/addbooking";
import { VendorDetails } from "../store/slices/vendorSlice";
import { ToursAndActivity } from "../mongodb/models/ToursAndActivity";
import { User } from "./auth";
import { ReviewsType } from "../mongodb/models/Reviews";

export interface BookingWithPopulatedData {
  _id: string;
  bookingId: string;
  slotId: Types.ObjectId;
  activity: ToursAndActivity;
  vendor: {
    _id: string;
    avatar: string;
    vendorDetails: VendorDetails;
  };
  user: User;
  selectDate: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  travelers: Traveler[];
  pickupLocation: LocationData | null;
  paymentDetails: {
    paymentIntentId: string;
    customerId: string;
    amount: number;
    currency: string;
    status: string;
  };
  adultsCount: number;
  childrenCount: number;
  paymentStatus: "paid" | "pending" | "refunded";
  status:
    | "pending"
    | "upcoming"
    | "completed"
    | "cancelled"
    | "missed"
    | "in-progress";
  review?: ReviewsType | undefined | null;
}
