import mongoose, { Schema, Document } from "mongoose";
import "@/lib/mongodb/models/booking";
import "@/lib/mongodb/models/ToursAndActivity";
import "@/lib/mongodb/models/User";
import { Payments } from "@/lib/types/payments";

export interface BookingDocument extends Payments, Document {
  _id: string;
}

const PaymentsSchema = new Schema<Payments>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    activity: {
      type: Schema.Types.ObjectId,
      ref: "ToursAndActivity",
      required: true,
    },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedAt: { type: Date, default: Date.now },
    total: { type: Number },
    vendorPayment: { type: Number },
    commission: { type: Number },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "rejected"],
    },
    payout: {
      method: { type: String, enum: ["manual_eft_fast"], default: null },
      reference: { type: String, default: "" },
      sentAt: { type: Date, default: null },
    },
    rejected: {
      isRejected: { type: Boolean, default: false },
      reason: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payments ||
  mongoose.model<Payments>("Payments", PaymentsSchema);
