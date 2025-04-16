import mongoose from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const ClassSchema = new mongoose.Schema({
  class_id: { type: String, required: true, unique: true },
  course_id: { type: String, ref: "Course", required: true },
  academic_year: { type: String, required: true }, // e.g., "2024-2025"
  semester: { type: String, required: true }, // e.g., "1", "2", "Summer"
  lecturer: { type: String },
  max_students: { type: Number, required: true },
  schedule: { type: String }, // optional text for simplicity, e.g., "Mon 7-9 Room A"
  classroom: { type: String },
  created_at: { type: Date, default: Date.now }
});

ClassSchema.plugin(paginate);
ClassSchema.plugin(aggregatePaginate);

const Class = mongoose.model("Class", ClassSchema, "classes");
export default Class;
