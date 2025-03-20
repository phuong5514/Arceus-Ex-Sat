import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import Major from "../models/majorModel.js";
import dayjs from "dayjs";
import Program from "../models/programModel.js";
import Status from "../models/statusModel.js";
import Address from "../models/addressModel.js";

function formatAddress(address){
  if (!address){
    return "";
  }
  const addressArray = Object.entries(address)
    .filter(([key, value]) => key !== "_id" && typeof value !== "undefined" && value)
    .map(([key, value]) => value);
  return addressArray.join(", ");
}

function emptyAddress(){
  return {
    house_number: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    postal_code: ""
  };
}

export const getAllStudents = async (req, res) => {
  try {
    const options = {
      pagination: false,
      page: 1,
      limit: 100,
      sort: "_id",
      lean: true, // convert to POJO
      populate: [// reference other collections
        "major",
        "program",
        "status",
        "permanent_address",
        "temporary_address",
        "mailing_address"
      ]
    }
    const results = await Student.paginate({}, options);
    // format students data
    results.docs.forEach(student => {
      student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
      if (student.permanent_address){
        student.permanent_address.text = formatAddress(student.permanent_address);
      } else {
        student.permanent_address = emptyAddress();
        student.permanent_address.text = ""; 
      }
      if (student.temporary_address){
        student.temporary_address.text = formatAddress(student.temporary_address);
      } else {
        student.temporary_address = emptyAddress();
        student.temporary_address.text = "";
      }
      if (student.mailing_address){
        student.mailing_address.text = formatAddress(student.mailing_address);
      } else {
        student.mailing_address = emptyAddress();
        student.mailing_address.text = "";
      }
    });
    const majors = await Major.find().lean();
    const status = await Status.find().lean();
    const programs = await Program.find().lean();
    res.render("index", { title: "Student management system", results, majors, status, programs, queryString: "", queryData: null });
  } catch (error) {
    console.error("Error getting students: ", error.message);
  }
};


export const addStudent = async (req, res) => {
  const student = req.body;

  try {
    const majorList = await Major.distinct("_id");
    const statusList = await Status.distinct("_id");
    const programList = await Program.distinct("_id");
    const genderList = ["Nam", "Nữ"]

    // all fields are required
    if (!student._id || student._id.trim() === "") {
      throw new Error("MSSV không được để trống");
    } else if (!student._id.match(/^[0-9]{8}$/)) {
      throw new Error("MSSV phải là 8 chữ số");
    }
    if (!student.name || student.name.trim() === "") {
      throw new Error("Tên không được để trống");
    }
    if (!student.email || student.email.trim() === "") {
      throw new Error("Email không được để trống");
    } else if (!student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      throw new Error("Email không hợp lệ");
    }
    if (!student.phone_number || student.phone_number.trim() === "") {
      throw new Error("Số điện thoại không được để trống");
    } else if (!student.phone_number.match(/^[0-9]{10,11}$/)) {
      throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
    }
    if (!student.major || student.major.trim() === "") {
      throw new Error("Ngành học không được để trống");
    } else if (!majorList.includes(student.major)) {
      throw new Error("Ngành học không nằm trong danh sách ngành học hợp lệ");
    }
    if (!student.class_year || student.class_year.trim() === "") {
      throw new Error("Năm học không được để trống");
    } else if (!student.class_year.match(/^[0-9]{4}$/)) {
      throw new Error("Năm học phải là 4 chữ số");
    }
    if (!student.program || student.program.trim() === "") {
      throw new Error("Chương trình học không được để trống");
    } else if (!programList.includes(student.program)) {
      throw new Error("Chương trình học không nằm trong danh sách chương trình học hợp lệ");
    }
    if (!student.status || student.status.trim() === "") {
      throw new Error("Trạng thái không được để trống");
    } else if (!statusList.includes(student.status)) {
      throw new Error("Trạng thái không nằm trong danh sách trạng thái hợp lệ");
    }
    if (!student.gender || student.gender.trim() === "") {
      throw new Error("Giới tính không được để trống");
    } else if (!genderList.includes(student.gender)) {
      throw new Error("Giới tính phải là Nam hoặc Nữ");
    }
    if (!student.birthdate || student.birthdate.trim() === "") {
      throw new Error("Ngày sinh không được để trống");
    }

    // addresses are objects that need to be added to the Address collection
    if (student.permanent_address){
      const addressId = student._id + "ADDRPMNT";
      // check if address existed
      const address = await Address.findOne({ _id: addressId });
      if (address){
        address.house_number = student.permanent_address.house_number;
        address.street = student.permanent_address.street;
        address.ward = student.permanent_address.ward;
        address.district = student.permanent_address.district;
        address.city = student.permanent_address.city;
        address.country = student.permanent_address.country;
        address.postal_code = student.permanent_address.postal_code;
        await address.save();
      } else {
        const newAddress = student.permanent_address;
        newAddress._id = addressId;
        await Address.insertOne(newAddress);
      }
      student.permanent_address = addressId;
    } else {
      student.permanent_address = "";
    }
    if (student.temporary_address){
      const addressId = student._id + "ADDRTMP";
      // check if address existed
      const address = await Address.findOne({ _id: addressId });
      if (address){
        address.house_number = student.temporary_address.house_number;
        address.street = student.temporary_address.street;
        address.ward = student.temporary_address.ward;
        address.district = student.temporary_address.district;
        address.city = student.temporary_address.city;
        address.country = student.temporary_address.country;
        address.postal_code = student.temporary_address.postal_code;
        await address.save();
      }
      else {
        const newAddress = student.temporary_address;
        newAddress._id = addressId;
        await Address.insertOne(newAddress);
      }
      student.temporary_address = addressId;
    } else {
      student.temporary_address = "";
    }
    if (student.mailing_address){
      const addressId = student._id + "ADDRMAIL";
      // check if address existed
      const address = await Address.findOne({ _id: addressId });
      if (address){
        address.house_number = student.mailing_address.house_number;
        address.street = student.mailing_address.street;
        address.ward = student.mailing_address.ward;
        address.district = student.mailing_address.district;
        address.city = student.mailing_address.city;
        address.country = student.mailing_address.country;
        address.postal_code = student.mailing_address.postal_code;
        await address.save();
      }
      else {
        const newAddress = student.mailing_address;
        newAddress._id = addressId;
        await Address.insertOne(newAddress);
      }
      student.mailing_address = addressId;
    } else {
      student.mailing_address = "";
    }

    await Student.insertOne(student);

    console.log("Student added successfully");
    res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
  } catch (error) {
    console.error("Error adding students: ", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
}

export const updateStudent = async (req, res) => {
  const studentId = req.params.student_id;
  const student = req.body;

  try {
    const studentToUpdate = await Student.findOne({ _id: studentId });
    if (!studentToUpdate) {
      throw new Error("Không tìm thấy sinh viên cần cập nhật");
    }
    const majorList = await Major.distinct("_id");
    const statusList = await Status.distinct("_id");
    const programList = await Program.distinct("_id");
    const genderList = ["Nam", "Nữ"]

    // all fields are required
    if (!student.name || student.name.trim() === "") {
      throw new Error("Tên không được để trống");
    }
    if (!student.email || student.email.trim() === "") {
      throw new Error("Email không được để trống");
    } else if (!student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      throw new Error("Email không hợp lệ");
    }
    if (!student.phone_number || student.phone_number.trim() === "") {
      throw new Error("Số điện thoại không được để trống");
    } else if (!student.phone_number.match(/^[0-9]{10,11}$/)) {
      throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
    }
    // if (!student.address || student.address.trim() === "") {
    //   throw new Error("Địa chỉ không được để trống");
    // }
    if (!student.major || student.major.trim() === "") {
      throw new Error("Ngành học không được để trống");
    } else if (!majorList.includes(student.major)) {
      throw new Error("Ngành học không nằm trong danh sách ngành học hợp lệ");
    }
    if (!student.class_year || student.class_year.trim() === "") {
      throw new Error("Năm học không được để trống");
    } else if (!student.class_year.match(/^[0-9]{4}$/)) {
      throw new Error("Năm học phải là 4 chữ số");
    }
    if (!student.program || student.program.trim() === "") {
      throw new Error("Chương trình học không được để trống");
    } else if (!programList.includes(student.program)) {
      throw new Error("Chương trình học không nằm trong danh sách chương trình học hợp lệ");
    }
    if (!student.status || student.status.trim() === "") {
      throw new Error("Trạng thái không được để trống");
    } else if (!statusList.includes(student.status)) {
      throw new Error("Trạng thái không nằm trong danh sách trạng thái hợp lệ");
    }
    if (!student.gender || student.gender.trim() === "") {
      throw new Error("Giới tính không được để trống");
    } else if (!genderList.includes(student.gender)) {
      throw new Error("Giới tính phải là Nam hoặc Nữ");
    }
    if (!student.birthdate || student.birthdate.trim() === "") {
      throw new Error("Ngày sinh không được để trống");
    }

    studentToUpdate.name = student.name;
    studentToUpdate.email = student.email;
    studentToUpdate.phone_number = student.phone_number;
    studentToUpdate.address = student.address;
    studentToUpdate.major = student.major;
    studentToUpdate.class_year = student.class_year;
    studentToUpdate.program = student.program;
    studentToUpdate.status = student.status;
    studentToUpdate.birthdate = student.birthdate;
    studentToUpdate.gender = student.gender;
    
    console.log(JSON.stringify(student, null, 2));
    // addresses are objects that need to be added to the Address collection
    if (student.permanent_address) {
      const addressId = student._id + "ADDRPMNT";
      // check if address existed
      const address = await Address.findOne({ _id: addressId });
      if (address) {
        address.house_number = student.permanent_address.house_number;
        address.street = student.permanent_address.street;
        address.ward = student.permanent_address.ward;
        address.district = student.permanent_address.district;
        address.city = student.permanent_address.city;
        address.country = student.permanent_address.country;
        address.postal_code = student.permanent_address.postal_code;
        await address.save();
      } else {
        const newAddress = student.permanent_address;
        newAddress._id = addressId;
        await Address.insertOne(newAddress);
      }
      student.permanent_address = addressId;
    } else {
      student.permanent_address = "";
    }
    if (student.temporary_address) {
      const addressId = student._id + "ADDRTMP";
      // check if address existed
      const address = await Address.findOne({ _id: addressId });
      if (address) {
        address.house_number = student.temporary_address.house_number;
        address.street = student.temporary_address.street;
        address.ward = student.temporary_address.ward;
        address.district = student.temporary_address.district;
        address.city = student.temporary_address.city;
        address.country = student.temporary_address.country;
        address.postal_code = student.temporary_address.postal_code;
        await address.save();
      }
      else {
        const newAddress = student.temporary_address;
        newAddress._id = addressId;
        await Address.insertOne(newAddress);
      }
      student.temporary_address = addressId;
    } else {
      student.temporary_address = "";
    }
    if (student.mailing_address) {
      const addressId = student._id + "ADDRMAIL";
      // check if address existed
      const address = await Address.findOne({ _id: addressId });
      if (address) {
        address.house_number = student.mailing_address.house_number;
        address.street = student.mailing_address.street;
        address.ward = student.mailing_address.ward;
        address.district = student.mailing_address.district;
        address.city = student.mailing_address.city;
        address.country = student.mailing_address.country;
        address.postal_code = student.mailing_address.postal_code;
        await address.save();
      }
      else {
        const newAddress = student.mailing_address;
        newAddress._id = addressId;
        await Address.insertOne(newAddress);
      }
      student.mailing_address = addressId;
    } else {
      student.mailing_address = "";
    }

    studentToUpdate.permanent_address = student.permanent_address;
    studentToUpdate.temporary_address = student.temporary_address;
    studentToUpdate.mailing_address = student.mailing_address;

    await studentToUpdate.save();

    console.log("Student updated successfully");
    res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    console.error("Error updating students: ", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
}

export const deleteStudents = async (req, res) => {
  const studentIds = req.body.student_ids;
  try {
    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error("Danh sách mã số sinh viên không hợp lệ hoặc rỗng");
    }

    // Delete each student by their student_id
    const result = await Student.deleteMany({ _id: { $in: studentIds } });
    if (result.deletedCount === 0) {
      throw new Error(`Không tìm thấy sinh viên nào nằm trong danh sách cần xóa`);
    }

    res.status(200).json({ ok: true, message: "Xóa sinh viên thành công" });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}

export const searchStudents = async (req, res) => {
  try {
    const queryData = req.query;
    const searchTerm = queryData.search || "";
    const searchBy = queryData.search_by || "_id";
    let queryString = "";

    const populateMap = {
      major: {path: "major"},
      program: {path: "program"},
      status: {path: "status"},
    }
    
    const options = {
      pagination: false,
      page: 1,
      limit: 100,
      sort: "_id",
      lean: true, // convert to POJO
      populate: Object.values(populateMap) // reference other collections
    }


    let query = {};
    console.log(`Searching for ${searchTerm} by ${searchBy}`);

    if (searchTerm !== "" && searchBy !== ""){
      queryString = new URLSearchParams(queryData); 

      switch (searchBy) {
        case "major":
          const matchedMajors = await Major.find({"major_name": new RegExp(`.*${searchTerm}.*`, "i")});
          const matchedMajorIds = matchedMajors.map(major => major._id);
          query = {major : {$in: matchedMajorIds}};
          break;
        default:
          query = { [searchBy] : {$regex: searchTerm, $options: "i"}};
          break;
      }
    }

    const results = await Student.paginate(query, options);

    // format students data
    results.docs.forEach(student => {
      student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });

    const majors = await Major.find().lean();
    const status = await Status.find().lean();
    const programs = await Program.find().lean();
    
    res.render("index", { title: "Student management system", results, majors, status, programs, queryString, queryData});
  } catch (error) {
    console.error("Error searching for students: ", error.message);
  }
}