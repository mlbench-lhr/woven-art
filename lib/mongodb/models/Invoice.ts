import { Invoice } from "@/lib/types/invoices";
import mongoose, { Schema, Document } from "mongoose";
import "@/lib/mongodb/models/booking";
import "@/lib/mongodb/models/ToursAndActivity";
import "@/lib/mongodb/models/User";

export interface BookingDocument extends Invoice, Document {
  _id: string;
}

const InvoiceSchema = new Schema<Invoice>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    activity: {
      type: Schema.Types.ObjectId,
      ref: "ToursAndActivity",
      required: true,
    },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invoicesId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice ||
  mongoose.model<Invoice>("Invoice", InvoiceSchema);
