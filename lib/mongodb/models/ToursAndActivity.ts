import { VendorDetails } from "@/lib/store/slices/vendorSlice";
import mongoose, { type Document, Schema, Types } from "mongoose";
import "@/lib/mongodb/models/User";

// ----------- Interfaces -----------

export interface ToursAndActivity {
  _id: string;
  vendor: Types.ObjectId;
  title: string;
  category?: "Tour" | "Activity";
  description?: string;
  uploads: string[];
  languages: string[];
  pickupAvailable: boolean;
  kidsAllowed?: boolean;
  allowPayLater?: boolean;
  payLaterDeadlineDays?: number;
  included: string[];
  notIncluded: string[];
  notSuitableFor?: string[];
  importantInformation?: string[];
  childAgeRange?: { min: number; max: number };
  itinerary: string[];
  cancellationPolicy: string;
  duration: number;
  durationStartTime?: string;
  durationEndTime?: string;
  locations?: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
    locationName?: string;
  }[];
  location?: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
  };
  active: boolean;
  status: "pending admin approval" | "active" | "rejected" | "upcoming";
  slots: [
    {
      _id: string;
      startDate: Date;
      endDate: Date;
      adultPrice: number;
      childPrice?: number;
      seatsAvailable: number;
    }
  ];
  stopBookingDates: [Date];
  isVerified: boolean;
  rejected: {
    isRejected: boolean;
    reason?: string;
  };
  recommended?: boolean;
  popular?: boolean;
  topRated?: boolean;
  rating: { average: number | 0; total: number | 0 };
}
export interface ToursAndActivityWithVendor {
  _id: string;
  title: string;
  category?: "Tour" | "Activity";
  description?: string;
  uploads: string[];
  languages: string[];
  pickupAvailable: boolean;
  kidsAllowed?: boolean;
  allowPayLater?: boolean;
  payLaterDeadlineDays?: number;
  included: string[];
  notIncluded: string[];
  notSuitableFor?: string[];
  importantInformation?: string[];
  childAgeRange?: { min: number; max: number };
  itinerary: string[];
  cancellationPolicy: string;
  duration: number;
  durationStartTime?: string;
  durationEndTime?: string;
  locations?: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
    locationName?: string;
  }[];
  location?: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
  };
  active: boolean;
  status: "pending admin approval" | "active" | "rejected" | "upcoming";
  slots: [
    {
      _id: string;
      startDate: Date;
      endDate: Date;
      adultPrice: number;
      childPrice?: number;
      seatsAvailable: number;
    }
  ];
  stopBookingDates: [Date];
  isVerified: boolean;
  rejected: {
    isRejected: boolean;
    reason?: string;
  };
  vendor: {
    _id: string;
    avatar: string;
    vendorDetails: VendorDetails;
  };
  recommended?: boolean;
  popular?: boolean;
  topRated?: boolean;
  rating: { average: number | 0; total: number | 0 };
}
export interface ToursAndActivityDocument extends ToursAndActivity, Document {
  _id: string;
}

// ----------- Schema -----------

const ToursAndActivitySchema = new Schema<ToursAndActivity>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String },
    active: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending admin approval", "active", "rejected", "upcoming"],
      default: "pending admin approval",
    },
    description: { type: String },
    uploads: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    pickupAvailable: { type: Boolean, default: false },
    kidsAllowed: { type: Boolean, default: true },
    allowPayLater: { type: Boolean, default: false },
    payLaterDeadlineDays: { type: Number, default: 0 },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    notSuitableFor: { type: [String], default: [] },
    importantInformation: { type: [String], default: [] },
    childAgeRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 7 },
    },
    itinerary: { type: [String], default: [] },
    cancellationPolicy: { type: String, required: true },
    duration: { type: Number, required: true },
    durationStartTime: { type: String },
    durationEndTime: { type: String },
    locations: [
      {
        address: { type: String },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
        locationName: { type: String },
      },
    ],
    location: {
      address: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    slots: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        adultPrice: { type: Number, required: true },
        childPrice: { type: Number, required: false, default: 0 },
        seatsAvailable: { type: Number, required: true },
      },
    ],
    stopBookingDates: [{ type: Date, required: false }],
    isVerified: { type: Boolean, default: false },
    rejected: {
      isRejected: { type: Boolean, default: false },
      reason: { type: String },
    },
    rating: {
      average: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    recommended: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    topRated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.ToursAndActivity ||
  mongoose.model<ToursAndActivity>("ToursAndActivity", ToursAndActivitySchema);
