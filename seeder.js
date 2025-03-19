import connectDB from "./config/db.js";
import mongoose from "mongoose";
import Student from "./models/studentModel.js";
import Major from "./models/majorModel.js";
import IndentityCard from "./models/identityCardModel.js";
import Passport from "./models/passportModel.js";
import IdentityCard from "./models/identityCardModel.js";

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

await IdentityCard.insertMany([{
  _id: "221020271",
  issue_date: "2021-11-08",
  expiry_date: "2026-11-08",
  issue_location: "TP HCM",
  is_digitized: true
},
{
  _id: "221020287",
  issue_date: "2021-01-01",
  expiry_date: "2026-01-01",
  issue_location: "TP HCM",
  is_digitized: true
}
])

await Passport.insertMany([{
  _id: "221020271",
  type: "Passport",
  country_code: "VN",
  passport_number: "123456789",
  issue_date: "2021-11-08",
  expiry_date: "2026-11-08",
  issue_location: "TP HCM"
},
{
  _id: "221020287",
  type: "Passport",
  country_code: "VN",
  passport_number: "987654321",
  issue_date: "2021-01-01",
  expiry_date: "2026-01-01",
  issue_location: "TP HCM"
}
])
