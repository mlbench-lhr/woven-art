import mongoose, { Schema, Types, Document } from "mongoose";

export interface SupportMessageAttrs {
  ticket: Types.ObjectId;
  sender: Types.ObjectId; // user or admin
  text: string;
}

export interface SupportMessageDocument
  extends Document,
    SupportMessageAttrs {
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<SupportMessageDocument>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "SupportTicket", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

SupportMessageSchema.index({ ticket: 1, createdAt: 1 });

const SupportMessage =
  mongoose.models.SupportMessage ||
  mongoose.model<SupportMessageDocument>("SupportMessage", SupportMessageSchema);

export default SupportMessage;
