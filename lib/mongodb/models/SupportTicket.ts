import mongoose, { Schema, Types, Document } from "mongoose";

export interface SupportTicketAttrs {
  user: Types.ObjectId;
  conversation?: Types.ObjectId;
  bookingId?: string;
  subject: string;
  description: string;
  status: "open" | "resolved";
  latestMessageAt?: Date;
}

export interface SupportTicketDocument extends Document, SupportTicketAttrs {
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<SupportTicketDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
    bookingId: { type: String },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    latestMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ user: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, latestMessageAt: -1 });

const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model<SupportTicketDocument>("SupportTicket", SupportTicketSchema);

export default SupportTicket;
