import mongoose, { type Document, Schema, Types } from "mongoose";

// ----------- Interfaces -----------
export interface ReviewsType extends Document {
  _id: string;
  booking: Types.ObjectId;
  user: Types.ObjectId;
  vendor: Types.ObjectId;
  activity: Types.ObjectId;
  rating: number;
  review: {
    addedBy: "user" | "vendor";
    text: string;
    uploads: string[];
  }[];
}

// ----------- Schema -----------
const ReviewSchema = new Schema<ReviewsType>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    activity: {
      type: Schema.Types.ObjectId,
      ref: "ToursAndActivity",
      required: true,
    },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: [
      {
        addedBy: {
          type: String,
          enum: ["user", "vendor"],
          required: true,
        },
        text: { type: String, required: true },
        uploads: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Review ||
  mongoose.model<ReviewsType>("Review", ReviewSchema);
