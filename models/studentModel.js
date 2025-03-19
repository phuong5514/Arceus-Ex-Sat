import mongoose, { SchemaTypes } from "mongoose";
import paginate from 'mongoose-paginate-v2';

const StudentSchema = mongoose.Schema({
  _id: String,
  name: String,
  birthdate: Date,
  gender: String,
  class_year: Number,
  program: { type: String, ref: "Program" },
  address: String,
  email: String,
  phone_number: String,
  status: { type: String, ref: "Status" },
  major: { type: String, ref: "Major" }
});

StudentSchema.plugin(paginate);

const Student = mongoose.model("Student", StudentSchema, "students");

export default Student;
