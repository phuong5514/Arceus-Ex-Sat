import superuserClient from "./superuser.js";

superuserClient.collections.truncate("students");
console.log("Truncated students collection successfully");

const majorList = ["Tiếng Anh thương mại", "Luật", "Tiếng Nhật", "Tiếng Pháp"];
const statusList = ["Đang học", "Đã thôi học", "Đã tốt nghiệp", "Tạm dừng học"];
const genderList = ["Nam", "Nữ"];
const programList = ["Chính quy", "Chất lượng cao", "Tài năng", "Tiên tiến"];
const addressList = ["Hà Nội", "Vũng Tàu", "TP.Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Đồng Nai", "Bình Dương", "Bà Rịa - Vũng Tàu", "Bình Thuận"];

const studentList = [
  {
    student_id: "22120271",
    name: "Dương Hoàng Hồng Phúc",
    email: "phuc21744@gmail.com",
    phone_number: "0901234567",
    address: addressList[0],
    gender: genderList[0],
    birthdate: "2000-01-01",
    major: majorList[0],
    class_year: "2022",
    program: programList[0],
    status: statusList[0]
  },
  {
    student_id: "22120272",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone_number: "0901234568",
    address: addressList[1],
    gender: genderList[0],
    birthdate: "2001-02-02",
    major: majorList[1],
    class_year: "2023",
    program: programList[1],
    status: statusList[1]
  },
  {
    student_id: "22120273",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone_number: "0901234569",
    address: addressList[2],
    gender: genderList[1],
    birthdate: "2002-03-03",
    major: majorList[2],
    class_year: "2024",
    program: programList[2],
    status: statusList[2]
  },
  {
    student_id: "22120274",
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone_number: "0901234570",
    address: addressList[3],
    gender: genderList[0],
    birthdate: "2003-04-04",
    major: majorList[2],
    class_year: "2025",
    program: programList[3],
    status: statusList[3]
  },
  {
    student_id: "22120275",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone_number: "0901234571",
    address: addressList[4],
    gender: genderList[1],
    birthdate: "2004-05-05",
    major: majorList[3],
    class_year: "2026",
    program: programList[0],
    status: statusList[0]
  },
  {
    student_id: "22120276",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone_number: "0901234572",
    address: addressList[0],
    gender: genderList[0],
    birthdate: "2005-06-06",
    major: majorList[0],
    class_year: "2027",
    program: programList[1],
    status: statusList[1]
  },
  {
    student_id: "22120277",
    name: "Nguyễn Thị F",
    email: "nguyenthif@example.com",
    phone_number: "0901234573",
    address: addressList[1],
    gender: genderList[1],
    birthdate: "2006-07-07",
    major: majorList[1],
    class_year: "2028",
    program: programList[2],
    status: statusList[2]
  },
  {
    student_id: "22120278",
    name: "Trần Văn G",
    email: "tranvang@example.com",
    phone_number: "0901234574",
    address: addressList[2],
    gender: genderList[0],
    birthdate: "2007-08-08",
    major: majorList[2],
    class_year: "2029",
    program: programList[3],
    status: statusList[3]
  },
  {
    student_id: "22120279",
    name: "Lê Thị H",
    email: "lethih@example.com",
    phone_number: "0901234575",
    address: addressList[3],
    gender: genderList[1],
    birthdate: "2008-09-09",
    major: majorList[2],
    class_year: "2030",
    program: programList[0],
    status: statusList[0]
  },
  {
    student_id: "22120280",
    name: "Phạm Văn I",
    email: "phamvani@example.com",
    phone_number: "0901234576",
    address: addressList[4],
    gender: genderList[0],
    birthdate: "2009-10-10",
    major: majorList[3],
    class_year: "2031",
    program: programList[1],
    status: statusList[1]
  },
  {
    student_id: "22120281",
    name: "Hoàng Thị J",
    email: "hoangthij@example.com",
    phone_number: "0901234577",
    address: addressList[0],
    gender: genderList[1],
    birthdate: "2010-11-11",
    major: majorList[0],
    class_year: "2032",
    program: programList[2],
    status: statusList[2]
  },
  {
    student_id: "22120282",
    name: "Nguyễn Văn K",
    email: "nguyenvank@example.com",
    phone_number: "0901234578",
    address: addressList[1],
    gender: genderList[0],
    birthdate: "2011-12-12",
    major: majorList[1],
    class_year: "2033",
    program: programList[3],
    status: statusList[3]
  },
  {
    student_id: "22120283",
    name: "Trần Thị L",
    email: "tranthil@example.com",
    phone_number: "0901234579",
    address: addressList[2],
    gender: genderList[1],
    birthdate: "2012-01-13",
    major: majorList[2],
    class_year: "2034",
    program: programList[0],
    status: statusList[0]
  },
  {
    student_id: "22120284",
    name: "Lê Văn M",
    email: "levanm@example.com",
    phone_number: "0901234580",
    address: addressList[3],
    gender: genderList[0],
    birthdate: "2013-02-14",
    major: majorList[2],
    class_year: "2035",
    program: programList[1],
    status: statusList[1]
  },
  {
    student_id: "22120285",
    name: "Phạm Thị N",
    email: "phamthin@example.com",
    phone_number: "0901234581",
    address: addressList[4],
    gender: genderList[1],
    birthdate: "2014-03-15",
    major: majorList[3],
    class_year: "2036",
    program: programList[2],
    status: statusList[2]
  },
  {
    student_id: "22120286",
    name: "Hoàng Văn O",
    email: "hoangvano@example.com",
    phone_number: "0901234582",
    address: addressList[0],
    gender: genderList[0],
    birthdate: "2015-04-16",
    major: majorList[0],
    class_year: "2037",
    program: programList[3],
    status: statusList[3]
  },
  {
    student_id: "22120287",
    name: "Nguyễn Thị P",
    email: "nguyenthiep@example.com",
    phone_number: "0901234583",
    address: addressList[1],
    gender: genderList[1],
    birthdate: "2016-05-17",
    major: majorList[1],
    class_year: "2038",
    program: programList[0],
    status: statusList[0]
  },
  {
    student_id: "22120288",
    name: "Trần Văn Q",
    email: "tranvanq@example.com",
    phone_number: "0901234584",
    address: addressList[2],
    gender: genderList[0],
    birthdate: "2017-06-18",
    major: majorList[2],
    class_year: "2039",
    program: programList[1],
    status: statusList[1]
  },
  {
    student_id: "22120289",
    name: "Lê Thị R",
    email: "lethir@example.com",
    phone_number: "0901234585",
    address: addressList[3],
    gender: genderList[1],
    birthdate: "2018-07-19",
    major: majorList[2],
    class_year: "2040",
    program: programList[2],
    status: statusList[2]
  },
  {
    student_id: "22120290",
    name: "Phạm Văn S",
    email: "phamvans@example.com",
    phone_number: "0901234586",
    address: addressList[4],
    gender: genderList[0],
    birthdate: "2019-08-20",
    major: majorList[3],
    class_year: "2041",
    program: programList[3],
    status: statusList[3]
  },
  {
    student_id: "22120291",
    name: "Hoàng Thị T",
    email: "hoangthit@example.com",
    phone_number: "0901234587",
    address: addressList[0],
    gender: genderList[1],
    birthdate: "2020-09-21",
    major: majorList[0],
    class_year: "2042",
    program: programList[0],
    status: statusList[0]
  }
];

studentList.forEach(async student => {
  try {
    const response = await superuserClient.collection("students").create(student);
    console.log(`Added student ${student.name} successfully`);
  } catch (error) {
    console.error(`Failed to add student ${student.name}`);
  }
});