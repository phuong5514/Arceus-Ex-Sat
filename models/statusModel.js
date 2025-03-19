import mongoose from "mongoose";

const StatusSchema = mongoose.Schema({
  _id : String,
  status_name : String
});

const Status = mongoose.model("Status", StatusSchema, "status");

export default Status;
