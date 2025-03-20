import connectDB from "./config/db.js";
import Student from "./models/studentModel.js";
import Passport from "./models/passportModel.js";
import Major from "./models/majorModel.js";
import IdentityCard from "./models/identityCardModel.js";
import Program from "./models/programModel.js";
import Status from "./models/statusModel.js";
import Address from "./models/addressModel.js";

await connectDB();

// try {
//   Student.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate students collection");
// }
// try {
//   IdentityCard.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate identity cards collection");
// }
// try {
//   Passport.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate passports collection");
// }
// try {
//   Major.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate majors collection");
// }
// try {
//   Program.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate programs collection");
// }
// try {
//   Status.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate status collection");
// }
// try {
//   Address.deleteMany({});
// } catch (error) {
//   console.error("Unabled to truncate addresses collection");
// }

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
    major: "TATM",
    nationality: "Việt Nam",
    permanent_address: "",
    temporary_address: "",
    mailing_address: ""
  },
  {
    _id: "22120287",
    name: "Mạnh Phương",
    birthdate: "2004-01-01",
    gender: "Nam",
    class_year: "2022",
    program: "CTTT",
    address: "TP HCM",
    email: "manhphuong1234@gmail.com",
    phone_number: "0123456789",
    status: "TTDH",
    major: "LUAT",
    nationality: "Việt Nam",
    permanent_address: "",
    temporary_address: "",
    mailing_address: ""
  }
  ])
} catch (error) {
  console.error("Unabled to seed students");
}

try {
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
} catch (error) {
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
} catch (error) {
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
} catch (error) {
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
} catch (error) {
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
} catch (error) {
  console.error("Unabled to seed status");
}
try {
  await Address.insertMany([{
    house_number: "123",
    street: "Nguyễn Văn Cừ",
    ward: "Phường 1",
    district: "Quận 5",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    house_number: "456",
    street: "Nguyễn Trãi",
    ward: "Phường 2",
    district: "Quận 5",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    house_number: "789",
    street: "Lê Lợi",
    ward: "Phường 3",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    house_number: "101",
    street: "Trần Hưng Đạo",
    ward: "Phường 4",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    house_number: "202",
    street: "Hai Bà Trưng",
    ward: "Phường 5",
    district: "Quận 3",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    house_number: "303",
    street: "Điện Biên Phủ",
    ward: "Phường 6",
    district: "Quận 3",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  }]);
} catch (error) {
  console.error("Unabled to seed addresses");
}


process.exit(0);