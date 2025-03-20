import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import Major from "../models/majorModel.js";
import dayjs from "dayjs";
import Program from "../models/programModel.js";
import Status from "../models/statusModel.js";
import Address from "../models/addressModel.js";
import IdentityCard from "../models/identityCardModel.js";

const fetchAndFormatStudents = async (query = {}, options = {}) => {
  const defaultOptions = {
    pagination: false,
    page: 1,
    limit: 100,
    sort: "_id",
    lean: true, // convert to POJO
    populate: [ // reference other collections
      "major",
      "program",
      "status",
      "permanent_address",
      "temporary_address",
      "mailing_address",
      "identity_card"
    ]
  };

  const finalOptions = { ...defaultOptions, ...options };
  const results = await Student.paginate(query, finalOptions);

  // format students data
  results.docs.forEach(student => {
    student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    if (student.permanent_address) {
      student.permanent_address.text = formatAddress(student.permanent_address);
    } else {
      student.permanent_address = emptyAddress();
      student.permanent_address.text = "";
    }
    if (student.temporary_address) {
      student.temporary_address.text = formatAddress(student.temporary_address);
    } else {
      student.temporary_address = emptyAddress();
      student.temporary_address.text = "";
    }
    if (student.mailing_address) {
      student.mailing_address.text = formatAddress(student.mailing_address);
    } else {
      student.mailing_address = emptyAddress();
      student.mailing_address.text = "";
    }
    if (student.identity_card) {
      student.identity_card.issue_date = dayjs(student.identity_card.issue_date).format('YYYY-MM-DD');
      student.identity_card.expiry_date = dayjs(student.identity_card.expiry_date).format('YYYY-MM-DD');  
      student.identity_card.text = formatIdentityCard(student.identity_card);
    } else {
      student.identity_card = null;
    }
  });

  return results;
};

function formatAddress(address) {
  if (!address) {
    return "";
  }
  return Object.entries(address)
    .filter(([key, value]) => (key === "city" || key === "country") && typeof value !== "undefined" && value)
    .map(([key, value]) => value)
    .join(", ");

  const fieldNames = {
    house_number: "Số",
    street: "Đường",
    ward: "Phường",
    district: "Quận/Huyện",
    city: "TP",
    country: "",
    postal_code: "Mã bưu điện"
  };

  return Object.entries(address)
    .filter(([key, value]) => key !== "_id" && typeof value !== "undefined" && value)
    .map(([key, value]) => `${fieldNames[key]} ${value}`)
    .join(", ");
}

// TODO: Make formatted text more readable by adding field name before each value
function formatIdentityCard(identityCard){
  if (!identityCard){
    return "";
  }

  return identityCard._id;

  const fieldNames = {
    issue_date: "NC",
    expiry_date: "NHH",
    issue_location: "NC",
    is_digitized: "CCCD",
    chip_attached: "Chip"
  };

  return Object.entries(identityCard)
    .filter(([key, value]) => key !== "_id" && typeof value !== "undefined" && value)
    .map(([key, value]) => {
      if (key === "issue_date" || key === "expiry_date"){
        return `${fieldNames[key]}: ${dayjs(value).format('DD/MM/YYYY')}`;
      }
      if (key === "is_digitized" || key === "chip_attached"){
        return `${fieldNames[key]}: ${value ? "Có" : "Không"}`;
      }
      return `${fieldNames[key]}: ${value}`;
    })
    .join(", ");

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
    const results = await fetchAndFormatStudents();
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

    if (student.identity_card){
      // check if identity card existed
      const identityCard = await IdentityCard.findOne({ _id: student.identity_card._id });
      if (identityCard){
        identityCard.issue_date = student.identity_card.issue_date;
        identityCard.expiry_date = student.identity_card.expiry_date;
        identityCard.issue_location = student.identity_card.issue_location;
        identityCard.is_digitized = student.identity_card.is_digitized;
        identityCard.chip_attached = student.identity_card.chip_attached;
        console.log("Updating existing identity card: ", identityCard);
        await identityCard.save();
      } else {
        console.log("Inserting new identity card: ", student.identity_card);
        await IdentityCard.insertOne(student.identity_card);
      }
    }
    else {
      student.identity_card = "";
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
    
    if (student.identity_card) {
      // check if identity card existed
      const identityCard = await IdentityCard.findOne({ _id: student.identity_card._id });
      if (identityCard) {
        identityCard.issue_date = student.identity_card.issue_date;
        identityCard.expiry_date = student.identity_card.expiry_date;
        identityCard.issue_location = student.identity_card.issue_location;
        identityCard.is_digitized = student.identity_card.is_digitized;
        identityCard.chip_attached = student.identity_card.chip_attached;
        console.log("Updating existing identity card: ", identityCard);
        await identityCard.save();
      } else {
        console.log("Inserting new identity card: ", student.identity_card);
        await IdentityCard.insertOne(student.identity_card);
      }
      student.identity_card = student.identity_card._id;
    } else {
      student.identity_card = "";
    }

    studentToUpdate.permanent_address = student.permanent_address;
    studentToUpdate.temporary_address = student.temporary_address;
    studentToUpdate.mailing_address = student.mailing_address;
    studentToUpdate.identity_card = student.identity_card;

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
    const searchByMajor = queryData.search_by_major || "";
    const queryString = new URLSearchParams(queryData); 
    let query = {};
    console.log(`Searching for ${searchTerm} by ${searchBy}`);
    if (searchByMajor){
      if (!searchTerm){
        query = {major : searchByMajor};
      } else {
        query = {$and: [
          {major : searchByMajor},
          {[searchBy] : new RegExp(`.*${searchTerm}.*`, "i")}
        ]};
      }
    } else if (searchTerm){
      query = {[searchBy] : new RegExp(`.*${searchTerm}.*`, "i")};
    }

    console.log("Search completed!")
    const results = await fetchAndFormatStudents(query);
    const majors = await Major.find().lean();
    const status = await Status.find().lean();
    const programs = await Program.find().lean();
    res.render("index", { title: "Student management system", results, majors, status, programs, queryString: req.query.search, queryData: req.query });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
};