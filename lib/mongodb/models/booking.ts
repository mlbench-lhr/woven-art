import mongoose, { Schema, Types, Document } from "mongoose";
import { LocationData, Traveler } from "@/lib/store/slices/addbooking";

// ----------- Sub-Schemas -----------

const LatLngSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const LocationDataSchema = new Schema<LocationData>(
  {
    address: { type: String, required: true },
    coordinates: { type: LatLngSchema, default: null },
    locationName: { type: String, required: false, default: "" },
  },
  { _id: false }
);

const TravelerSchema = new Schema<Traveler>(
  {
    fullName: { type: String, required: true },
    dob: { type: String, required: true },
    nationality: { type: String, required: true },
    passport: { type: String, required: true },
  },
  { _id: false }
);

// ----------- Main Schema -----------

export interface Booking {
  _id: string;
  bookingId: string;
  slotId: Types.ObjectId;
  activity: Types.ObjectId;
  vendor: Types.ObjectId;
  user: Types.ObjectId;
  review: Types.ObjectId;
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
  completedAt: Date;
  paymentStatus: "paid" | "pending" | "refunded";
  status:
    | "pending"
    | "upcoming"
    | "completed"
    | "cancelled"
    | "missed"
    | "in-progress";
}

export interface BookingDocument extends Booking, Document {
  _id: string;
}

const BookingSchema = new Schema<Booking>(
  {
    bookingId: { type: String, required: true, unique: true },

    activity: {
      type: Schema.Types.ObjectId,
      ref: "ToursAndActivity",
      required: true,
    },

    slotId: { type: Schema.Types.ObjectId, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    review: { type: Schema.Types.ObjectId, ref: "Review" },

    selectDate: { type: String, required: true },

    email: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    travelers: { type: [TravelerSchema], required: true },

    pickupLocation: {
      type: LocationDataSchema,
      required: false,
      default: null,
    },
    adultsCount: { type: Number, required: true },
    childrenCount: { type: Number, required: true },
    // Update paymentDetails to allow partial data initially
    paymentDetails: {
      paymentIntentId: { type: String, required: false, default: "" },
      customerId: { type: String, required: false, default: "" },
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: "usd" },
      status: { type: String, required: false, default: "pending" },
    },
    completedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "upcoming",
        "completed",
        "cancelled",
        "missed",
        "in-progress",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<Booking>("Booking", BookingSchema);
