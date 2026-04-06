import mongoose, { Schema, Document, Types } from "mongoose";
import "@/lib/mongodb/models/User";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  chatKey: string;
  latestMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    chatKey: { type: String, required: true, unique: true },
    latestMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
