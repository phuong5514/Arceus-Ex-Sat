import connectDB from "./config/db.js";
import Student from "./models/studentModel.js";
import Passport from "./models/passportModel.js";
import Major from "./models/majorModel.js";
import IdentityCard from "./models/identityCardModel.js";
import Program from "./models/programModel.js";
import Status from "./models/statusModel.js";

await connectDB()

try {
  await Student.insertMany([{
    _id: "22120271",
    name: "Hồng Phúc",
    birthdate: "2004-11-08",
    gender: "Nam",
    class_year: "2022",
    program: "CTDT",
    address: "TP HCM",
    email: "phuc21744@gmail.com",
    phone_number: "0325740149",
    status: "TTDH",
    major: "TATM"
  },
  {
    _id: "22120287",
    name: "Manh Phương",
    birthdate: "2004-01-01",
    gender: "Nam",
    class_year: "2022",
    program: "CTTT",
    address: "TP HCM",
    email: "manhphuong1234@gmail.com",
    phone_number: "0123456789",
    status: "TTDH",
    major: "LUAT"
  }
  ])
} catch(error){
  console.error("Unabled to seed students");
}

try{
  await IdentityCard.insertMany([{
    _id: "22120271",
    issue_date: "2021-11-08",
    expiry_date: "2026-11-08",
    issue_location: "TP HCM",
    is_digitized: true
  },
  {
    _id: "22120287",
    issue_date: "2021-01-01",
    expiry_date: "2026-01-01",
    issue_location: "TP HCM",
    is_digitized: true
  }
  ])
} catch (error){
  console.error("Unabled to seed identity cards");
}

try {
  await Passport.insertMany([{
    _id: "22120271",
    type: "Passport",
    country_code: "VN",
    passport_number: "123456789",
    issue_date: "2021-11-08",
    expiry_date: "2026-11-08",
    issue_location: "TP HCM"
  },
  {
    _id: "22120287",
    type: "Passport",
    country_code: "VN",
    passport_number: "987654321",
    issue_date: "2021-01-01",
    expiry_date: "2026-01-01",
    issue_location: "TP HCM"
  }
  ])
} catch (error){
  console.error("Unabled to seed passports");
}

try {
  await Major.insertMany([{
    _id: "KHOATATM",
    major_name: "Tiếng Anh Thương mại"
  },
  {
    _id: "KHOALUAT",
    major_name: "Luật"
  },
  {
    _id: "KHOANHAT",
    major_name: "Tiếng Nhật"
  },
  {
    _id: "KHOAPHAP",
    major_name: "Tiếng Pháp"
  }
  ])
} catch (error){
  console.error("Unabled to seed majors");
}

try {
  await Program.insertMany([{
    _id: "CTDT",
    program_name: "Đại trà"
  },
  {
    _id: "CTTN",
    program_name: "Tài năng"
  },
  {
    _id: "CTTT",
    program_name: "Tiên tiến"
  },
  {
    _id: "CTCLC",
    program_name: "Chất lượng cao"
  }
  ])
} catch (error){
  console.error("Unabled to seed programs");
}

try {
  await Status.insertMany([{
    _id: "TTDH",
    status_name: "Đang học"
  },
  {
    _id: "TTTN",
    status_name: "Đã tốt nghiệp"
  },
  {
    _id: "TTTH",
    status_name: "Đã thôi học"
  },
  {
    _id: "TTTD",
    status_name: "Tạm ngừng học"
  }
  ])
} catch (error){
  console.error("Unabled to seed status");
}


process.exit(0);