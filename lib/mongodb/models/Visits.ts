// models/Visit.ts
import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema({
  path: { type: String, required: true },
  userId: { type: String, default: null }, // optional
  date: { type: String, required: true }, // YYYY-MM-DD format
  count: { type: Number, default: 0 },
});

export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
