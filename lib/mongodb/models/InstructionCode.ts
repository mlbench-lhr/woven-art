import mongoose, { Schema, type Document } from "mongoose";

export interface IInstructionCode extends Document {
  code: string;
  credits: number;
  email: string | null;
  shopifyOrderId: string | null;
  shopifyLineItemId: string | null;
  redeemedBy: string | null;
  redeemedAt: Date | null;
  createdAt: Date;
}

const InstructionCodeSchema = new Schema<IInstructionCode>(
  {
    code: { type: String, required: true, unique: true, trim: true, index: true },
    credits: { type: Number, default: 3 },
    email: { type: String, default: null, index: true, lowercase: true, trim: true },
    shopifyOrderId: { type: String, default: null, index: true },
    shopifyLineItemId: { type: String, default: null, index: true },
    redeemedBy: { type: String, default: null, index: true },
    redeemedAt: { type: Date, default: null },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

InstructionCodeSchema.index({ shopifyOrderId: 1, shopifyLineItemId: 1 }, { unique: true, sparse: true });

export const InstructionCode =
  mongoose.models.InstructionCode ?? mongoose.model<IInstructionCode>("InstructionCode", InstructionCodeSchema);
