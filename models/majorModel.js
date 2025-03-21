import mongoose from "mongoose";

const MajorSchema = mongoose.Schema({
  _id : String,
  major_name : String
});

const Major = mongoose.model("Major", MajorSchema, "majors");

export default Major;
