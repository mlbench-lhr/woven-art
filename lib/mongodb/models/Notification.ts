import mongoose, { Schema, Types, Document } from "mongoose";

export interface NotificationAttrs {
  userId: Types.ObjectId;
  name: string;
  type: string;
  message?: string;
  image?: string;
  link?: string;
  relatedId?: string;
  endDate?: Date | null;
  isUnread?: boolean;
}

export interface NotificationDocument extends Document, NotificationAttrs {
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String },
    image: { type: String },
    link: { type: String },
    relatedId: { type: String },
    endDate: { type: Date, default: null },
    isUnread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);

export default Notification;
