import { Types } from "mongoose";
import { Booking } from "../mongodb/models/booking";
import { ToursAndActivity } from "../mongodb/models/ToursAndActivity";
import { VendorDetails } from "../mongodb/models/User";
import { User } from "./auth";

export interface Invoice {
  booking: Types.ObjectId;
  activity: Types.ObjectId;
  vendor: Types.ObjectId;
  user: Types.ObjectId;
  invoicesId: string;
}

export interface InvoicePopulated {
  booking: Booking;
  activity: ToursAndActivity;
  createdAt: Date;
  vendor: {
    avatar: string;
    vendorDetails: VendorDetails;
  };
  user: User;
  invoicesId: string;
}
