import mongoose from "mongoose";

const ProgramSchema = mongoose.Schema({
  _id : String,
  program_name : String
});

const Program = mongoose.model("Program", ProgramSchema, "programs");

export default Program;
