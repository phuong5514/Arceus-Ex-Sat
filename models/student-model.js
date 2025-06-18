import mongoose, { SchemaTypes } from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const StudentSchema = mongoose.Schema({
  _id: String,
  name: String,
  birthdate: Date,
  gender: String,
  class_year: Number,
  program: { type: String, ref: "Program" },
  address: String,
  email: { type: String, unique: true },
  phone_number: String,
  status: { type: String, ref: "Status" },
  major: { type: String, ref: "Major" },
  permanent_address: {type: String, ref: "Address"},
  temporary_address: {type: String, ref: "Address"},
  mailing_address: {type: String, ref: "Address"},
  nationality: String,
  identity_card: {type: String, ref: "IdentityCard"}, 
  passport: {type: String, ref: "Passport"}, 
});

StudentSchema.plugin(paginate);
StudentSchema.plugin(aggregatePaginate);

const Student = mongoose.model("Student", StudentSchema, "students");
export default Student;

