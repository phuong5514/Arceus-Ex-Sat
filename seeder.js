import connectDB from "./config/db.js";
import Student from "./models/studentModel.js";
import Passport from "./models/passportModel.js";
import Major from "./models/majorModel.js";
import IdentityCard from "./models/identityCardModel.js";
import Program from "./models/programModel.js";
import Status from "./models/statusModel.js";
import Address from "./models/addressModel.js";

try {
  await connectDB();
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Unable to connect to MongoDB", error);
  process.exit(1);
}

const students = [
  {
    _id: "22120271",
    name: "Dương Hoàng Hồng Phúc",
    birthdate: "2004-11-08",
    gender: "Nam",
    class_year: "2022",
    program: "CTDT",
    address: "TP HCM",
    email: "phuc21744@gmail.com",
    phone_number: "0325740149",
    status: "TTDH",
    major: "KHOATATM",
    nationality: "Việt Nam",
    permanent_address: "22120271ADDRPMNT",
    temporary_address: "22120271ADDRTMP",
    mailing_address: "22120271ADDRMAIL",
    identity_card: "012345678910",
    passport: "C1234567"
  },
  {
    _id: "22120287",
    name: "Nguyễn Mạnh Phương",
    birthdate: "2004-01-01",
    gender: "Nam",
    class_year: "2022",
    program: "CTTT",
    address: "TP HCM",
    email: "manhphuong1234@gmail.com",
    phone_number: "0123456789",
    status: "TTDH",
    major: "KHOALUAT",
    nationality: "Việt Nam",
    permanent_address: "22120287ADDRPMNT",
    temporary_address: "22120287ADDRTMP",
    mailing_address: "22120287ADDRMAIL",
    identity_card: "987654321010",
    passport: "C9876543"
  },
  // Add more student entries here
  {
    _id: "22120288",
    name: "Trần Văn A",
    birthdate: "2003-12-12",
    gender: "Nam",
    class_year: "2022",
    program: "CTCLC",
    address: "TP HCM",
    email: "tranvana@gmail.com",
    phone_number: "0987654321",
    status: "TTDH",
    major: "KHOANHAT",
    nationality: "Việt Nam",
    permanent_address: "22120288ADDRPMNT",
    temporary_address: "22120288ADDRTMP",
    mailing_address: "22120288ADDRMAIL",
    identity_card: "123456789012",
    passport: "C1234568"
  },
  {
    _id: "22120289",
    name: "Lê Thị B",
    birthdate: "2004-05-05",
    gender: "Nữ",
    class_year: "2022",
    program: "CTTN",
    address: "TP HCM",
    email: "lethib@gmail.com",
    phone_number: "0912345678",
    status: "TTDH",
    major: "KHOAPHAP",
    nationality: "Việt Nam",
    permanent_address: "22120289ADDRPMNT",
    temporary_address: "22120289ADDRTMP",
    mailing_address: "22120289ADDRMAIL",
    identity_card: "234567890123",
    passport: "C2345678"
  }
];

const identityCards = [
  {
    _id: "012345678910",
    issue_date: "2020-05-26",
    expiry_date: "2060-05-26",
    issue_location: "TP HCM",
    is_digitized: true,
    chip_attached: true
  },
  {
    _id: "987654321010",
    issue_date: "2021-01-01",
    expiry_date: "2026-01-01",
    issue_location: "TP HCM",
    is_digitized: true,
    chip_attached: false
  },
  // Add more identity card entries here
  {
    _id: "123456789012",
    issue_date: "2019-03-15",
    expiry_date: "2029-03-15",
    issue_location: "TP HCM",
    is_digitized: true,
    chip_attached: true
  },
  {
    _id: "234567890123",
    issue_date: "2018-07-20",
    expiry_date: "2028-07-20",
    issue_location: "TP HCM",
    is_digitized: true,
    chip_attached: false
  }
];

const passports = [
  {
    _id: "C1234567",
    type: "Regular",
    country_code: "VNM",
    issue_date: "2021-11-08",
    expiry_date: "2026-11-08",
    issue_location: "TP HCM",
    notes: ""
  },
  {
    _id: "C9876543",
    type: "Regular",
    country_code: "VNM",
    issue_date: "2021-01-01",
    expiry_date: "2026-01-01",
    issue_location: "TP HCM",
    notes: "Đã gia hạn"
  },
  // Add more passport entries here
  {
    _id: "C1234568",
    type: "Regular",
    country_code: "VNM",
    issue_date: "2020-02-02",
    expiry_date: "2025-02-02",
    issue_location: "TP HCM",
    notes: ""
  },
  {
    _id: "C2345678",
    type: "Regular",
    country_code: "VNM",
    issue_date: "2019-03-03",
    expiry_date: "2024-03-03",
    issue_location: "TP HCM",
    notes: ""
  }
];

const majors = [
  {
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
  },
  // Add more major entries here
  {
    _id: "KHOATQ",
    major_name: "Tiếng Trung Quốc"
  },
  {
    _id: "KHOADL",
    major_name: "Du lịch"
  }
];

const programs = [
  {
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
  },
  // Add more program entries here
  {
    _id: "CTQT",
    program_name: "Quốc tế"
  },
  {
    _id: "CTDL",
    program_name: "Du lịch"
  }
];

const statuses = [
  {
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
  },
  // Add more status entries here
  {
    _id: "TTBV",
    status_name: "Bảo vệ luận văn"
  },
  {
    _id: "TTCT",
    status_name: "Chuyển trường"
  }
];

const addresses = [
  {
    _id: "22120271ADDRPMNT",
    house_number: "123",
    street: "Nguyễn Văn Cừ",
    ward: "Phường 1",
    district: "Quận 5",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120271ADDRTMP",
    house_number: "456",
    street: "Nguyễn Trãi",
    ward: "Phường 2",
    district: "Quận 5",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120271ADDRMAIL",
    house_number: "789",
    street: "Lê Lợi",
    ward: "Phường 3",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120287ADDRPMNT",
    house_number: "101",
    street: "Trần Hưng Đạo",
    ward: "Phường 4",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120287ADDRTMP",
    house_number: "202",
    street: "Hai Bà Trưng",
    ward: "Phường 5",
    district: "Quận 3",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120287ADDRMAIL",
    house_number: "303",
    street: "Điện Biên Phủ",
    ward: "Phường 6",
    district: "Quận 3",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  // Add more address entries here
  {
    _id: "22120288ADDRPMNT",
    house_number: "404",
    street: "Lý Thường Kiệt",
    ward: "Phường 7",
    district: "Quận 10",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120288ADDRTMP",
    house_number: "505",
    street: "Nguyễn Thị Minh Khai",
    ward: "Phường 8",
    district: "Quận 3",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120288ADDRMAIL",
    house_number: "606",
    street: "Cách Mạng Tháng 8",
    ward: "Phường 9",
    district: "Quận 10",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120289ADDRPMNT",
    house_number: "707",
    street: "Phạm Ngũ Lão",
    ward: "Phường 10",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120289ADDRTMP",
    house_number: "808",
    street: "Bùi Viện",
    ward: "Phường 11",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  },
  {
    _id: "22120289ADDRMAIL",
    house_number: "909",
    street: "Đề Thám",
    ward: "Phường 12",
    district: "Quận 1",
    city: "TP HCM",
    country: "Việt Nam",
    postal_code: "700000",
  }
];

try {
  await Student.insertMany(students);
  console.log("Students seeded successfully");
} catch (error) {
  console.error("Unable to seed students", error);
}

try {
  await IdentityCard.insertMany(identityCards);
  console.log("Identity cards seeded successfully");
} catch (error) {
  console.error("Unable to seed identity cards", error);
}

try {
  await Passport.insertMany(passports);
  console.log("Passports seeded successfully");
} catch (error) {
  console.error("Unable to seed passports", error);
}

try {
  await Major.insertMany(majors);
  console.log("Majors seeded successfully");
} catch (error) {
  console.error("Unable to seed majors", error);
}

try {
  await Program.insertMany(programs);
  console.log("Programs seeded successfully");
} catch (error) {
  console.error("Unable to seed programs", error);
}

try {
  await Status.insertMany(statuses);
  console.log("Statuses seeded successfully");
} catch (error) {
  console.error("Unable to seed statuses", error);
}

try {
  await Address.insertMany(addresses);
  console.log("Addresses seeded successfully");
} catch (error) {
  console.error("Unable to seed addresses", error);
}

process.exit(0);