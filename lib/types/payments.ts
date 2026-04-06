import { Types } from "mongoose";
import { Booking } from "../mongodb/models/booking";
import { ToursAndActivity } from "../mongodb/models/ToursAndActivity";
import { VendorDetails } from "../mongodb/models/User";
import { User } from "./auth";

export interface Payments {
  booking: Types.ObjectId;
  activity: Types.ObjectId;
  vendor: Types.ObjectId;
  user: Types.ObjectId;
  requestedAt: Date;
  total: number;
  vendorPayment: number;
  commission: number;
  paymentStatus: "pending" | "paid" | "rejected";
  payout?: {
    method: "manual_eft_fast";
    reference?: string;
    sentAt?: Date;
  };
  rejected: {
    isRejected: boolean;
    reason?: string;
  };
}

export interface PaymentsPopulated {
  booking: Booking;
  activity: ToursAndActivity;
  createdAt: Date;
  vendor: {
    avatar: string;
    vendorDetails: VendorDetails;
  };
  user: User;
  PaymentsId: string;
}
