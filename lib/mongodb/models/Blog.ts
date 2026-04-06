import mongoose, { type Document, Schema } from "mongoose";

// ----------- Interfaces -----------
export interface BlogsType extends Document {
  _id: string;
  coverImage: string;
  title: string;
  text: string;
}

// ----------- Schema -----------
const Blogschema = new Schema<BlogsType>(
  {
    coverImage: { type: String },
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Blog ||
  mongoose.model<BlogsType>("Blog", Blogschema);
