import mongoose, { type Document, Schema } from "mongoose";

// ----------- Interfaces -----------
export interface AdminSettingsType extends Document {
  _id: string;
  promotionalImages: string[];
  section1Slides: string[];
  section1SlidesData: { image: string; title: string; subtitle: string }[];
  section3MainImages: string[];
  section3TabIcons: string[];
  section3Heading?: string;
  section3Description?: string;
  section3TabData?: { image: string; title: string; description: string }[];
  section4Background: string;
  section4Thumbs: string[];
  section4Heading?: string;
  section4Description?: string;
  section6Image: string;
  section6Heading?: string;
  section7Image: string;
  section7Text?: string;
  section8Background: string;
  section8Heading?: string;
  authImages?: string[];
  dashboardSliderImages?: string[];
  discount?: {
    percentage: number;
    text: string;
    startDate: Date;
    endDate: Date;
    image?: string;
  };
}

// ----------- Schema -----------
const AdminSettingSchema = new Schema<AdminSettingsType>(
  {
    promotionalImages: [{ type: String }],
    section1Slides: [{ type: String }],
    section1SlidesData: [
      new Schema(
        {
          image: { type: String },
          title: { type: String },
          subtitle: { type: String },
        },
        { _id: false }
      ),
    ],
    section3MainImages: [{ type: String }],
    section3TabIcons: [{ type: String }],
    section3Heading: { type: String },
    section3Description: { type: String },
    section3TabData: [
      new Schema(
        {
          image: { type: String },
          title: { type: String },
          description: { type: String },
        },
        { _id: false }
      ),
    ],
    section4Background: { type: String },
    section4Thumbs: [{ type: String }],
    section4Heading: { type: String },
    section4Description: { type: String },
    section6Image: { type: String },
    section6Heading: { type: String },
    section7Image: { type: String },
    section7Text: { type: String },
    section8Background: { type: String },
    section8Heading: { type: String },
    authImages: [{ type: String }],
    dashboardSliderImages: [{ type: String }],
    discount: new Schema(
      {
        percentage: { type: Number },
        text: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        image: { type: String },
      },
      { _id: false }
    ),
  },
  { timestamps: true }
);

export default mongoose.models.AdminSetting ||
  mongoose.model<AdminSettingsType>("AdminSetting", AdminSettingSchema);
