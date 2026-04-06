import mongoose, { Document, Schema } from "mongoose";

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId; // ref to User
  opportunity: mongoose.Types.ObjectId; // ref to Opportunity
  status: "applied" | "in-progress" | "completed" | "withdrawn";
  appliedAt: Date;
  updatedAt: Date;
  notes?: string; // optional for tracking extra info
  externalLink?: string; // store link in case it changes later
}

const ApplicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "in-progress", "completed", "withdrawn"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: null,
    },
    externalLink: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);
