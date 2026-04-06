import { User } from "./auth";

export type VendorDetailsType = User & {
  latestUploads: string[];
  totalBookings: number;
  activeTours: number;
};
