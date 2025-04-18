import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePagination from "mongoose-aggregate-paginate-v2";

const DepartmentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  department_name: { type: String, required: true },
  description: { type: String },
});

DepartmentSchema.plugin(paginate);
DepartmentSchema.plugin(aggregatePagination);

const Department = mongoose.model(
  "Department",
  DepartmentSchema,
  "departments"
);

export default Department;