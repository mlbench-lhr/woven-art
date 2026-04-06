import mongoose from "mongoose";
import { VendorDetails } from "../mongodb/models/User";

export interface User {
  _id?: string;
  id: string;
  email: string;
  currencyPreference?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatar?: string;
  isEmailVerified: boolean;
  isRoleVerified: boolean;
  roleRejected: {
    isRoleRejected: boolean;
    reason?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  phoneNumber: string;
  blogTier: "Tier 1" | "Tier 2" | "Tier 3";
  role: "admin" | "user" | "vendor";
  profileUpdated: boolean;
  dataUpdated: boolean;
  vendorDetails: VendorDetails;
  favorites: string[];
}
export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  state: string;
  city: string;
  annualIncome: string;
  firstGenerationCollegeStudent: boolean;
  hispanicOrLatino: boolean;
  race: string;
}
export interface AcademicInfo {
  gradeLevel: string;
  school: string;
  gpaType: "Unweighted GPA" | "Weighted GPA";
  gpa: string;
  testScores: "SAT" | "ACT" | "PSAT" | "PACT" | "N/A";
  reading: string;
  maths: string;
  transcript: string[];
  manualCourse: manualCourse[];
}
export interface DreamsAndGoals {
  dreamSchool: string[];
  majors: string[];
  intendedMajors: string[];
  careerAspiration: string[];
  intendedMajorsNotInterested: string[];
  careerAspirationNotInterested: string[];
}
export interface extracurricularsAndAwards {
  awards: awards[];
  extracurricularActivity: extracurricularActivity[];
}
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatar?: string;
  isEmailVerified: boolean;
}

// array of objects
type manualCourse = {
  courseName: string;
  grade: string;
  gradeLevel: string;
};

type awards = {
  awardName: string;
  gradeLevel: string;
  recognitionLevel: string;
  description: string;
};

type extracurricularActivity = {
  activityType: string;
  activityTitle: string;
  organization: string;
  description: string;
  grade: string[];
  timing: string;
  hourPerWeek: number;
  weekPerYear: number;
};
// Add this to your types file (e.g., lib/types/auth.ts)
export interface UpdateProfileFormData {
  personalInfo: PersonalInfo;
  academicInfo: AcademicInfo;
  dreamsAndGoals: DreamsAndGoals;
  extracurricularsAndAwards: extracurricularsAndAwards;
}
