import mongoose from "mongoose";

const StudentSchema = mongoose.Schema({
  _id : String,
  name : String,
  birthdate : Date,
  gender: String,
  class_year: Number,
  program: String,
  address: String,
  email: String,
  phone_number: String,
  status: String,
  major: String
});

const Student = mongoose.model("Student", StudentSchema, "students");

export default Student;
