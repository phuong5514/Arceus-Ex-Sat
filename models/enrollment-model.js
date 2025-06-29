import mongoose from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const EnrollmentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  student_id: { type: String, ref: "Student", required: true },
  class_id: { type: String, ref: "Class", required: true },
  enrolled_at: { type: Date, default: Date.now },
  canceled: { type: Boolean, default: false },
  canceled_reason: { type: String, default: null },
  canceled_at: { type: Date, default: null }
});

EnrollmentSchema.plugin(paginate);
EnrollmentSchema.plugin(aggregatePaginate);

EnrollmentSchema.index({ student_id: 1, class_id: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema, "enrollments");
export default Enrollment;
