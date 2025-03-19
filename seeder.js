import connectDB from "./config/db.js";
import mongoose from "mongoose";
import Student from "./models/studentModel.js";
import Major from "./models/majorModel.js";

await connectDB()

await Student.insertMany([{
  _id: "221020271",
  name: "Hồng Phúc",
  birthdate: "2004-11-08",
  gender: "Nam",
  class_year: "2022",
  program: "CTDT",
  address: "TP HCM",
  email: "phuc21744@gmail.com",
  phone_number: "0325740149",
  status: "Đang học",
  major: "TATM"
},
{
  _id: "221020287",
  name: "Manh Phương",
  birthdate: "2004-01-01",
  gender: "Nam",
  class_year: "2022",
  program: "CTTT",
  address: "TP HCM",
  email: "manhphuong1234@gmail.com",
  phone_number: "0123456789",
  status: "Đang học",
  major: "LUAT"
}
])

