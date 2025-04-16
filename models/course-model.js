import mongoose from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const CourseSchema = new mongoose.Schema({
  course_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true, min: 2 },
  department: { type: String, required: true },
  description: { type: String },
  prerequisite_course_id: { type: String, ref: "Course", default: null },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

CourseSchema.plugin(paginate);
CourseSchema.plugin(aggregatePaginate);

const Course = mongoose.model("Course", CourseSchema, "courses");
export default Course;
