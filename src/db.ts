import mongoose, { Schema } from "mongoose";

const CourseCodeSchema = new Schema(
  {
    code: { type: String, required: true, index: true },
    name: { type: String, required: true },
  },
  { collection: "CourseCode", timestamps: true },
);

const RetakeSubmissionSchema = new Schema(
  {
    _id: { type: String, required: true, index: true }, // Student ID
    name: { type: String, required: true },
    intake: { type: Schema.Types.Int32, required: true },
    section: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    courseCodes: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { collection: "RetakeSubmission", timestamps: true },
);

// Check if we're in a development environment
const isDev = process.env.NODE_ENV === "development";

mongoose.connect(process.env.MONGO_URL!, {
  dbName: "bubt",
  appName: "RetakeImprovementWizard",
  retryWrites: true,
  compressors: ["zstd"],
});

// Get or create models
const getModel = <T>(name: string, schema: Schema) =>
  mongoose.models[name] ?? mongoose.model<T>(name, schema);

// Initialize models
const CourseCode = getModel("CourseCode", CourseCodeSchema);
const RetakeSubmission = getModel("RetakeSubmission", RetakeSubmissionSchema);

export const db = {
  CourseCode,
  RetakeSubmission,
};

export default db;
