import Student from "../models/student-model.js";
import Major from "../models/major-model.js";
import dayjs from "dayjs";
import Program from "../models/program-model.js";
import Status from "../models/status-model.js";
import Address from "../models/address-model.js";
import IdentityCard from "../models/identity-card-model.js";
import Passport from "../models/passport-model.js";
import path from 'path';
import { writeLog } from '../helpers/logger.js';
import * as guidance from '../helpers/guidance-format.js';
import { formatAddress, formatIdentificationDocument, formatIdentityCard, formatPassport } from '../helpers/student-data-formatter.js'; 

import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { fileURLToPath } from "url";
// import {body} from "express-validator";
// import { validationResult } from "express-validator";
// import { assert } from "console";
// import "../config/business-rule.json";

// import fs from "fs";
// const config = JSON.parse(fs.readFileSync(new URL("../config/business-rule.json", import.meta.url), "utf-8"));

dayjs.extend(customParseFormat);


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
      "identity_card",
      "passport"
    ]
  };

  const finalOptions = { ...defaultOptions, ...options };
  const results = await Student.paginate(query, finalOptions);

  // format students data
  results.docs.forEach(student => {
    student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');

    const addresses = [student.permanent_address, student.temporary_address, student.mailing_address];

    addresses.forEach(address => {
      if (address) {
        address.text = formatAddress(address);
      } else {
        address = emptyAddress();
        address.text = "";
      }
    });

    formatIdentificationDocument(student.identity_card, formatIdentityCard);
    formatIdentificationDocument(student.passport, formatPassport);
  });

  return results;
};

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
      console.error("Error getting students:", error.message);
      res.status(500).json({ error: "Lỗi lấy danh sách sinh viên" });
  }
};

export const addStudent = async (req, res) => {
  const student = req.body;

  try {
    const newStudent = await preprocessStudent(student);

    await Student.insertOne(student);

    console.log("Student added successfully");
    writeLog('CREATE', 'SUCCESS', `Thêm sinh viên ${student._id} thành công`);
    res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
  } catch (error) {
    writeLog('CREATE', 'ERROR', `Thêm sinh viên thất bại: ${error.message}`);
    console.error("Error adding student:", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
};

async function preprocessStudent(student) {
  const majorList = await Major.distinct("_id");
  const statusList = await Status.distinct("_id");
  const programList = await Program.distinct("_id");
  const genderList = ["Nam", "Nữ"]

  // all fields are required
  // const inputFields = [
  //   student.name, student.email, student.phone_number, student.address,
  //   student.major, student.class_year, student.program, student.gender,
  //   student.status, student.birthdate];
  // const texts = ["Tên", "Email", "Số điện thoại", "Địa chỉ", "Ngành học", "Năm học", "Chương trình học", "Giới tính", "Trạng thái", "Ngày sinh"];
  // inputFields.forEach((field, index) => {
  //   if (!field || field.trim() === "") {
  //     throw new Error(`${texts[index]} không được để trống`);
  //   }
  // });

  // validate email
  // if (!student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
  //   throw new Error("Email không hợp lệ");
  // }

  // // validate phone number
  // if (!student.phone_number.match(/^[0-9]{10,11}$/)) {
  //   throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
  // }

  // // validate class year
  // if (!student.class_year.match(/^[0-9]{4}$/)) {
  //   throw new Error("Năm học phải là 4 chữ số");
  // }

  // // validate major
  // if (!majorList.includes(student.major)) {
  //   throw new Error("Ngành học không nằm trong danh sách ngành học hợp lệ");
  // }

  // // validate program
  // if (!programList.includes(student.program)) {
  //   throw new Error("Chương trình học không nằm trong danh sách chương trình học hợp lệ");
  // }  

  // // validate status
  // if (!statusList.includes(student.status)) {
  //   throw new Error("Trạng thái không nằm trong danh sách trạng thái hợp lệ");
  // }

  // // validate gender
  // if (!genderList.includes(student.gender)) {
  //   throw new Error("Giới tính phải là Nam hoặc Nữ");
  // }

  // validate addresses
  // addresses are objects that need to be added to the Address collection
  const addresses = [student.permanent_address, student.temporary_address, student.mailing_address];
  const addressIds = [student._id + "ADDRPMNT", student._id + "ADDRTMP", student._id + "ADDRMAIL"];
  const addressfields = ["house_number", "street", "ward", "district", "city", "country", "postal_code"];
  addresses.forEach(async (address, index) => {
    if (address) {
      const storedAddress = await Address.findOne({ _id: addressIds[index] }); 

      if (storedAddress) {
        addressfields.forEach(field => {
          storedAddress[field] = address[field];
        });
        await storedAddress.save();
      } else {
        const newAddress = address;
        newAddress._id = addressIds[index];
        await Address.insertOne(newAddress);
      }

      address = addressIds[index];
    
    } else {
      address = "";
    }
  });

  // // addresses are objects that need to be added to the Address collection
  // if (student.permanent_address) {
  //   const addressId = student._id + "ADDRPMNT";
  //   // check if address existed
  //   const address = await Address.findOne({ _id: addressId });
  //   if (address) {
  //     address.house_number = student.permanent_address.house_number;
  //     address.street = student.permanent_address.street;
  //     address.ward = student.permanent_address.ward;
  //     address.district = student.permanent_address.district;
  //     address.city = student.permanent_address.city;
  //     address.country = student.permanent_address.country;
  //     address.postal_code = student.permanent_address.postal_code;
  //     await address.save();
  //   } else {
  //     const newAddress = student.permanent_address;
  //     newAddress._id = addressId;
  //     await Address.insertOne(newAddress);
  //   }
  //   student.permanent_address = addressId;
  // } else {
  //   student.permanent_address = "";
  // }
  // if (student.temporary_address) {
  //   const addressId = student._id + "ADDRTMP";
  //   // check if address existed
  //   const address = await Address.findOne({ _id: addressId });
  //   if (address) {
  //     address.house_number = student.temporary_address.house_number;
  //     address.street = student.temporary_address.street;
  //     address.ward = student.temporary_address.ward;
  //     address.district = student.temporary_address.district;
  //     address.city = student.temporary_address.city;
  //     address.country = student.temporary_address.country;
  //     address.postal_code = student.temporary_address.postal_code;
  //     await address.save();
  //   }
  //   else {
  //     const newAddress = student.temporary_address;
  //     newAddress._id = addressId;
  //     await Address.insertOne(newAddress);
  //   }
  //   student.temporary_address = addressId;
  // } else {
  //   student.temporary_address = "";
  // }
  // if (student.mailing_address) {
  //   const addressId = student._id + "ADDRMAIL";
  //   // check if address existed
  //   const address = await Address.findOne({ _id: addressId });
  //   if (address) {
  //     address.house_number = student.mailing_address.house_number;
  //     address.street = student.mailing_address.street;
  //     address.ward = student.mailing_address.ward;
  //     address.district = student.mailing_address.district;
  //     address.city = student.mailing_address.city;
  //     address.country = student.mailing_address.country;
  //     address.postal_code = student.mailing_address.postal_code;
  //     await address.save();
  //   }
  //   else {
  //     const newAddress = student.mailing_address;
  //     newAddress._id = addressId;
  //     await Address.insertOne(newAddress);
  //   }
  //   student.mailing_address = addressId;
  // } else {
  //   student.mailing_address = "";
  // }


  if (student.identity_card) {
    // check if identity card existed
    const identityCard = await IdentityCard.findOne({ _id: student.identity_card._id });
    if (identityCard) {
      identityCard.issue_date = student.identity_card.issue_date;
      if (!dayjs(identityCard.issue_date).isValid()) {
        throw new Error("Ngày cấp CCCD/CMND không hợp lệ");
      }
      identityCard.expiry_date = student.identity_card.expiry_date;
      if (!dayjs(identityCard.expiry_date).isValid()) {
        throw new Error("Ngày hết hạn CCCD/CMND không hợp lệ");
      }
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
  if (student.passport) {
    // check if passport existed
    const passport = await Passport.findOne({ _id: student.passport._id });
    if (passport) {
      passport.type = student.passport.type;
      passport.country_code = student.passport.country_code;
      passport.issue_date = student.passport.issue_date;
      if (!dayjs(passport.issue_date).isValid()) {
        throw new Error("Ngày cấp hộ chiếu không hợp lệ");
      }
      passport.expiry_date = student.passport.expiry_date;
      if (!dayjs(passport.expiry_date).isValid()) {
        throw new Error("Ngày hết hạn hộ chiếu không hợp lệ");
      }
      passport.issue_location = student.passport.issue_location;
      console.log("Updating existing passport: ", passport);
      await passport.save();
    } else {
      console.log("Inserting new passport: ", student.passport);
      await Passport.insertOne(student.passport);
    }
    student.passport = student.passport._id;
  } else {
    student.passport = "";
  }
  return student;
};

export const updateStudent = async (req, res) => {
  const studentId = req.params.student_id;
  const student = req.body;

  try {
    const studentToUpdate = await Student.findOne({ _id: studentId });
    if (!studentToUpdate) {
      throw new Error("Không tìm thấy sinh viên cần cập nhật");
    }
    const processedStudent = await preprocessStudent(student);
    
    studentToUpdate.name = processedStudent.name;
    studentToUpdate.email = processedStudent.email;
    studentToUpdate.phone_number = processedStudent.phone_number;
    studentToUpdate.address = processedStudent.address;
    studentToUpdate.major = processedStudent.major;
    studentToUpdate.class_year = processedStudent.class_year;
    studentToUpdate.program = processedStudent.program;
    studentToUpdate.status = processedStudent.status;
    studentToUpdate.birthdate = processedStudent.birthdate;
    studentToUpdate.gender = processedStudent.gender;
    studentToUpdate.permanent_address = processedStudent.permanent_address;
    studentToUpdate.temporary_address = processedStudent.temporary_address;
    studentToUpdate.mailing_address = processedStudent.mailing_address;
    studentToUpdate.identity_card = processedStudent.identity_card;
    studentToUpdate.passport = processedStudent.passport;
    studentToUpdate.nationality = processedStudent.national;
    
    await studentToUpdate.save();

    writeLog('UPDATE', 'SUCCESS', `Cập nhật sinh viên ${studentId} thành công`);
    console.log("Student updated successfully");
    res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    writeLog('UPDATE', 'ERROR', `Cập nhật sinh viên ${studentId} thất bại: ${error.message}`);
    console.error("Error updating student:", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
};

export const deleteStudents = async (req, res) => {
  const studentIds = req.body.student_ids;
  try {
    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error("Danh sách MSSV không hợp lệ hoặc rỗng");
    }

    // Delete each student by their student_id
    const result = await Student.deleteMany({ _id: { $in: studentIds } });
    if (result.deletedCount === 0) {
      throw new Error(`Không tìm thấy sinh viên nào nằm trong danh sách cần xóa`);
    }
    writeLog('DELETE', 'SUCCESS', `Xóa ${result.deletedCount} sinh viên thành công`);    writeLog('DELETE', 'SUCCESS', `Xóa ${result.deletedCount} sinh viên thành công`);
    console.log(`Deleted ${result.deletedCount} students successfully`);
    res.status(200).json({ ok: true, message: "Xóa sinh viên thành công" });
  } catch (error) {
    writeLog('DELETE', 'ERROR', `Xóa sinh viên thất bại: ${error.message}`);
    console.error("Error deleting students:", error.message);
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
    res.render("index", { title: "Student management system", results, majors, status, programs, queryString, queryData });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
};

export const showImportPage = (req, res) => {
  res.render("import", { title: "Import Students" });
};

export const importStudents = async (req, res) => {
  try {
    // Kiểm tra file
    if (!req.files || !req.files.file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để import'
      });
    }
    
    
    const file = req.files.file;
    const fileType = req.body.fileType;

    // Kiểm tra định dạng file
    if (fileType === 'csv' && !file.name.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        message: 'File phải có định dạng .csv'
      });
    }
    // HOTFIX: Somehow file extension will change from "".json" to "j.son"
    if (fileType === 'json' && !file.name.toLowerCase().endsWith('.json') && !file.name.toLowerCase().endsWith('j.son')) {
      return res.status(400).json({
        success: false,
        message: 'File phải có định dạng .json'
      });
    }

    // Đọc nội dung file
    const fileContent = file.data.toString('utf8');
    const students = [];

    switch (fileType) {
      case 'csv':{
        // Xử lý CSV
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'File CSV phải có ít nhất header và một dòng dữ liệu'
          });
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = Object.keys(guidance.importCSVGuidance);

        // Kiểm tra header
        if (!expectedHeaders.every(h => headers.includes(h))) {
          return res.status(400).json({
            success: false,
            message: `File CSV phải có đầy đủ các cột: ${expectedHeaders.join(', ')}`
          });
        }

        // Map vị trí các cột
        const headerMap = {};
        expectedHeaders.forEach((headerName, headerIndex) => {
          headerMap[headerName] = headerIndex;
        });

        // Đọc từng dòng dữ liệu
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length !== headers.length) {
            console.log(`Bỏ qua dòng ${i + 1} vì số cột không khớp`);
            continue;
          }
          
          // Kiểm tra xem có trường nào bị thiếu không
          // const hasEmptyFields = values.some(v => !v);
          // if (hasEmptyFields) {
          //   console.log(`Bỏ qua dòng ${i + 1} vì có trường dữ liệu trống`);
          //   continue;
          // }

          const newStudent = {
            _id: values[headerMap['_id']],
            name: values[headerMap['name']],
            birthdate: values[headerMap['birthdate']],
            gender: values[headerMap['gender']],
            major: values[headerMap['major']],
            class_year: values[headerMap['class_year']],
            program: values[headerMap['program']],
            email: values[headerMap['email']],
            phone_number: values[headerMap['phone_number']],
            status: values[headerMap['status']],
            permanent_address: {
              _id: values[headerMap['permanent_address.id']],
              house_number: values[headerMap['permanent_address.house_number']],
              street: values[headerMap['permanent_address.street']],
              ward: values[headerMap['permanent_address.ward']],
              district: values[headerMap['permanent_address.district']],
              city: values[headerMap['permanent_address.city']],
              country: values[headerMap['permanent_address.country']],
              postal_code: values[headerMap['permanent_address.postal_code']]
            },
            temporary_address: {
              _id: values[headerMap['temporary_address.id']],
              house_number: values[headerMap['temporary_address.house_number']],
              street: values[headerMap['temporary_address.street']],
              ward: values[headerMap['temporary_address.ward']],
              district: values[headerMap['temporary_address.district']],
              city: values[headerMap['temporary_address.city']],
              country: values[headerMap['temporary_address.country']],
              postal_code: values[headerMap['temporary_address.postal_code']]
            },
            mailing_address: {
              _id: values[headerMap['mailing_address.id']],
              house_number: values[headerMap['mailing_address.house_number']],
              street: values[headerMap['mailing_address.street']],
              ward: values[headerMap['mailing_address.ward']],
              district: values[headerMap['mailing_address.district']],
              city: values[headerMap['mailing_address.city']],
              country: values[headerMap['mailing_address.country']],
              postal_code: values[headerMap['mailing_address.postal_code']]
            },
            identity_card: {
              _id: values[headerMap['identity_card._id']],
              issue_date: values[headerMap['identity_card.issue_date']],
              expiry_date: values[headerMap['identity_card.expiry_date']],
              issue_location: values[headerMap['identity_card.issue_location']],
              is_digitized: values[headerMap['identity_card.is_digitized']],
              chip_attached: values[headerMap['identity_card.chip_attached']]
            },
            passport: {
              _id: values[headerMap['passport._id']],
              type: values[headerMap['passport.type']],
              country_code: values[headerMap['passport.country_code']],
              issue_date: values[headerMap['passport.issue_date']],
              expiry_date: values[headerMap['passport.expiry_date']],
              issue_location: values[headerMap['passport.issue_location']],
              notes: values[headerMap['passport.notes']]
            },
            nationality: values[headerMap['nationality']]
          };

          await processStudentImport(newStudent, (err)=>{
            if (err){
              console.error("Bỏ qua dòng", i + 1, "vì dữ liệu không hợp lệ: ", err.message);
            } else {
              console.log("Thêm sinh viên", newStudent._id, "thành công");
              students.push(newStudent);
              console.log(students.length);
            }
          });
        }
        break;
      }
      case 'json': {  
        // Xử lý JSON
        try {
          const jsonData = JSON.parse(fileContent);
          if (!Array.isArray(jsonData)) {
            return res.status(400).json({
              success: false,
              message: 'File JSON phải chứa một mảng các sinh viên'
            });
          }
          for (let i = 0; i < jsonData.length; i++) {
            await processStudentImport(jsonData[i], (err)=>{
              if (err){
                console.error("Bỏ qua dòng", i + 1, "vì dữ liệu không hợp lệ: ", err.message);
              } else {
                console.log("Thêm sinh viên", jsonData[i]._id, "thành công");
                students.push(jsonData[i]);
              }
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'File JSON không hợp lệ'
          });
        }
      }
    }

    // Kiểm tra dữ liệu trống
    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu nào được import'
      });
    }

    // Import vào database
    await Student.insertMany(students);

    // Ghi log và trả về kết quả
    writeLog('IMPORT', 'SUCCESS', `Import ${students.length} sinh viên thành công`);
    return res.status(200).json({
      success: true,
      message: `Import thành công ${students.length} sinh viên`
    });

  } catch (error) {
    console.error('Import error:', error);
    writeLog('IMPORT', 'ERROR', `Import sinh viên thất bại: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi import: ' + error.message
    });
  }
};


// This function validates and alter the student data before inserting into the database
async function processStudentImport(student, resultCallback) {
  const requiredFields = [
    "_id", "name", "birthdate", "gender", "class_year", "program", // "address", old address field 
    "email", "phone_number", "status", "major", "nationality",
    // {"permanent_address": ["house_number", "street", "ward", "district", "city", "country", "postal_code"]},
    // {"temporary_address": ["house_number", "street", "ward", "district", "city", "country", "postal_code"]},
    // {"mailing_address": ["house_number", "street", "ward", "district", "city", "country", "postal_code"]},
    {"identity_card": ["_id", "issue_date", "expiry_date", "issue_location", "is_digitized", "chip_attached"]},
    {"passport": ["_id", "type", "country_code", "issue_date", "expiry_date", "issue_location"]},
    // passport_notes is optional
  ];

  // Check if all required fields are present
  if (!checkRequiredFields(student, requiredFields, resultCallback)) {
    return;
  }

  // Check if student id is new
  const studentExist = await Student.findOne({ _id: student._id });
  if (studentExist) {
    resultCallback(new Error(`Sinh viên ${student._id} đã tồn tại trong hệ thống`));
    return;
  }

  if (!/^\d{8}$/.test(student._id)) {
    resultCallback(new Error("MSSV phải là 8 chữ số"));
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    resultCallback(new Error("Định dạng email không hợp lệ"));
    return;
  }

  if (!/^\d{10,11}$/.test(student.phone_number)) {
    resultCallback(new Error("Số điện thoại phải từ 10 đến 11 chữ số"));
    return;
  }

  if (!["Nam", "Nữ"].includes(student.gender)) {
    resultCallback(new Error("Giới tính phải là Nam hoặc Nữ"));
    return;
  }

  if (!/^\d{4}$/.test(student.class_year)) {
    resultCallback(new Error("Năm học phải là 4 chữ số"));
    return;
  }

  if (!dayjs(student.birthdate).isValid()) {
    resultCallback(new Error("Ngày sinh không hợp lệ"));
    return;
  } else {
    student.birthdate = dayjs(student.birthdate, "DD/MM/YYYY").format("YYYY-MM-DD");
  }

  if (!dayjs(student.identity_card.issue_date, "DD/MM/YYYY", true).isValid()) {
    resultCallback(new Error("Ngày cấp CCCD/CMND phải thuộc định dạng DD/MM/YYYY"));
    return;
  } else {
    student.identity_card.issue_date = dayjs(student.identity_card.issue_date, "DD/MM/YYYY").format("YYYY-MM-DD");
  }

  if (!dayjs(student.identity_card.expiry_date, "DD/MM/YYYY", true).isValid()) {
    resultCallback(new Error("Ngày hết hạn CCCD/CMND phải thuộc định dạng DD/MM/YYYY"));
    return;
  } else {
    student.identity_card.expiry_date = dayjs(student.identity_card.expiry_date, "DD/MM/YYYY").format("YYYY-MM-DD");
  }

  if (!dayjs(student.passport.issue_date, "DD/MM/YYYY", true).isValid()) {
    resultCallback(new Error("Ngày cấp hộ chiếu phải thuộc định dạng DD/MM/YYYY"));
    return;
  } else {
    student.passport.issue_date = dayjs(student.passport.issue_date, "DD/MM/YYYY").format("YYYY-MM-DD");
  }

  if (!dayjs(student.passport.expiry_date).isValid()) {
    resultCallback(new Error("Ngày hết hạn hộ chiếu phải thuộc định dạng DD/MM/YYYY"));
    return;
  } else {
    student.passport.expiry_date = dayjs(student.passport.expiry_date, "DD/MM/YYYY").format("YYYY-MM-DD");
  }

  // Run check on major and change to its id 
  if (student.major){
    const major = await Major.findOne({major_name: student.major});
    if (major){
      student.major = major._id;
    } else {
      resultCallback(new Error(`Ngành học ${major} không nằm trong danh sách ngành học có sẵn`));
      return;
    }
  }
  // Run check on status and change to its id
  if (student.status){
    const status = Status.findOne({status_name: student.status});
    if (status){
      student.status = status._id;
    } else {
      resultCallback(new Error(`Trạng thái ${student.status} không nằm trong danh sách trạng thái có sẵn`));
      return;
    }
  }
  // Run check on program and change to its id
  if (student.program){
    const program = Program.findOne({program_name: student.program});
    if (program){
      student.program = program._id;
    } else {
      resultCallback(new Error("Trạng thái không nằm trong danh sách trạng thái có sẵn"));
      return;
    }
  }
  // Add in new address if needed
  if (student.permanent_address){
    const addressId = student._id + "ADDRPMNT";
    const address = await Address.find({ _id: addressId });
    if (!address){
      student.permanent_address._id = addressId;
      await Address.insertOne(student.permanent_address);
    }
    student.permanent_address = addressId;
  }
  if (student.temporary_address){
    const addressId = student._id + "ADDRTMP";
    const address = await Address.find({ _id: addressId });
    if (!address){
      student.temporary_address._id = addressId;
      await Address.insertOne(student.temporary_address);
    }
    student.temporary_address = addressId;
  }
  if (student.mailing_address){
    const addressId = student._id + "ADDRMAIL";
    const address = await Address.find({ _id: addressId });
    if (!address){
      student.mailing_address._id = addressId;
      await Address.insertOne(student.mailing_address);
    }
    student.mailing_address = addressId;
  }

  resultCallback(null);
}

const checkRequiredFields = (student, requiredFields, resultCallback) => {
  const checkFields = (obj, fields, parent = '') => {
    for (const field of fields) {
      if (typeof field === "string") {
        if (!obj[field]) {
          resultCallback(new Error(`Trường ${parent}${field} không được để trống`));
          return false;
        }
      } else if (typeof field === "object") {
        const parentField = Object.keys(field)[0];
        if (!obj[parentField]) {
          resultCallback(new Error(`Trường ${parent}${parentField} không được để trống`));
          return false;
        }
        if (!checkFields(obj[parentField], field[parentField], `${parent}${parentField}.`)) {
          return false;
        }
      }
    }
    return true;
  };

  return checkFields(student, requiredFields);
};

export const exportAllStudents = async (req, res) => {
  try {
    const format = req.query.format || 'json'; // Default to JSON if no format specified
    const data = await fetchAndFormatStudents();
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    if (data.docs.length === 0) {
      writeLog('EXPORT', 'ERROR', 'Không có sinh viên nào để xuất');
      res.status(400).json({ok: false, error: "Không có sinh viên nào để xuất" });
    }

    if (format === 'csv') {
      // Flatten student data for CSV
      const flattenedData = data.docs.map(student => ({
        '_id': student._id,
        'name': student.name,
        'birthdate': student.birthdate,
        'gender': student.gender,
        'class_year': student.class_year,
        'program': student.program?.program_name || '',
        'address': student.address || '',
        'email': student.email,
        'phone_number': student.phone_number,
        'status': student.status?.status_name || '',
        'major': student.major?.major_name || '',
        'nationality': student.nationality,
        // Permanent address
        'permanent_address.house_number': student.permanent_address?.house_number || '',
        'permanent_address.street': student.permanent_address?.street || '',
        'permanent_address.ward': student.permanent_address?.ward || '',
        'permanent_address.district': student.permanent_address?.district || '',
        'permanent_address.city': student.permanent_address?.city || '',
        'permanent_address.country': student.permanent_address?.country || '',
        'permanent_address.postal_code': student.permanent_address?.postal_code || '',
        // Temporary address
        'temporary_address.house_number': student.temporary_address?.house_number || '',
        'temporary_address.street': student.temporary_address?.street || '',
        'temporary_address.ward': student.temporary_address?.ward || '',
        'temporary_address.district': student.temporary_address?.district || '',
        'temporary_address.city': student.temporary_address?.city || '',
        'temporary_address.country': student.temporary_address?.country || '',
        'temporary_address.postal_code': student.temporary_address?.postal_code || '',
        // Mailing address
        'mailing_address.house_number': student.mailing_address?.house_number || '',
        'mailing_address.street': student.mailing_address?.street || '',
        'mailing_address.ward': student.mailing_address?.ward || '',
        'mailing_address.district': student.mailing_address?.district || '',
        'mailing_address.city': student.mailing_address?.city || '',
        'mailing_address.country': student.mailing_address?.country || '',
        'mailing_address.postal_code': student.mailing_address?.postal_code || '',
        // Identity card
        'identity_card._id': student.identity_card?._id || '',
        'identity_card.issue_date': student.identity_card?.issue_date || '',
        'identity_card.expiry_date': student.identity_card?.expiry_date || '',
        'identity_card.issue_location': student.identity_card?.issue_location || '',
        'identity_card.is_digitized': student.identity_card?.is_digitized || false,
        'identity_card.chip_attached': student.identity_card?.chip_attached || false,
        // Passport
        'passport._id': student.passport?._id || '',
        'passport.type': student.passport?.type || '',
        'passport.country_code': student.passport?.country_code || '',
        'passport.issue_date': student.passport?.issue_date || '',
        'passport.expiry_date': student.passport?.expiry_date || '',
        'passport.issue_location': student.passport?.issue_location || '',
        'passport.notes': student.passport?.notes || ''
      }));
      
      const header =  Object.keys(flattenedData[0]).join(',') + '\n';
      const rows = flattenedData.map(student => Object.values(student).join(',')).join('\n');
      
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      res.setHeader('Content-Type', 'text/csv', 'charset=utf-8');
      res.write('\ufeff'); // UTF-8 BOM for Excel
      res.write(header + rows);
      res.end();
      writeLog('EXPORT', 'SUCCESS', `Export ${data.docs.length} sinh viên sang CSV thành công`);
    } else {
      const jsonData = JSON.stringify(data.docs, null, 2);

      res.setHeader('Content-Disposition', 'attachment; filename=students.json');
      res.setHeader('Content-Type', 'application/json');
      res.write(jsonData);
      res.end();
      writeLog('EXPORT', 'SUCCESS', `Export ${data.docs.length} sinh viên sang JSON thành công`);
    }
  } catch (error) {
    console.error("Error exporting students:", error.message);
    writeLog('EXPORT', 'ERROR', `Export sinh viên thất bại: ${error.message}`);
    res.status(500).json({ok: false, error: "Lỗi xuất dữ liệu sinh viên" });
  }
};


// export const validateAddStudent = [
//   body('_id')
//     .trim().notEmpty().withMessage('MSSV không được để trống').bail()
//     .isNumeric().withMessage('MSSV phải là số').bail()
//     .isLength({ min: 8, max: 8 }).withMessage('MSSV phải có 8 chữ số').bail()
//     .custom(async (value) => { // Check if student id already existed
//       const student = await Student.findOne({ _id: value });
//       if (student) {
//         return Promise.reject('MSSV đã tồn tại');
//       }
//     }).bail(),

//   body('name')
//     .trim().notEmpty().withMessage('Họ tên không được để trống').bail(),

//   body('email')
//     .trim().notEmpty().withMessage('Email không được để trống').bail()
//     .isEmail().withMessage('Email không hợp lệ').bail()
//     .custom(async (value) => { // Check if email already existed
//       const student = await Student.findOne({ email: value });
//       if (student) {
//         return Promise.reject('Email đã tồn tại');
//       }
//     }).bail()
//     .custom(email => email.endsWith(config.emailDomain) ? true : Promise.reject("Email phải thuộc domain cho phép")),

//   body('phone_number')
//     .trim().notEmpty().withMessage('Số điện thoại không được để trống').bail()
//     .isLength({ min: 10, max: 11 }).withMessage('Số điện thoại phải từ 10 đến 11 chữ số').bail()
//     .custom(async (value) => { // Check if phone number already existed
//       const student = await Student.findOne({ phone_number: value });
//       if (student) {
//         return Promise.reject('Số điện thoại đã tồn tại');
//       }
//     }).bail()
//     .matches(config.phoneRegex).withMessage("Số điện thoại phải có định dạng hợp lệ").bail(),

//   body('birthdate')
//     .trim().notEmpty().withMessage('Ngày sinh không được để trống').bail()
//     .isISO8601().withMessage('Ngày sinh không hợp lệ').bail(),

//   body('gender')
//     .trim().notEmpty().withMessage('Giới tính không được để trống').bail()
//     .isIn(['Nam', 'Nữ']).withMessage('Giới tính phải là Nam hoặc Nữ').bail(),

//   body('class_year')
//     .trim().notEmpty().withMessage('Khóa không được để trống').bail()
//     .isLength({ min: 4, max: 4 }).withMessage('Năm học phải là 4 chữ số').bail(),

//   body('major')
//     .trim().notEmpty().withMessage('Khoa không được để trống').bail()
//     .custom(async (value) => {
//       const major = await Major.findOne({ _id: value });
//       if (!major) {
//         return Promise.reject('Ngành học không nằm trong danh sách ngành học có sẵn');
//       }
//     }).bail(),

//   body('program')
//     .trim().notEmpty().withMessage('Chương trình học không được để trống').bail()
//     .custom(async (value) => {
//       const program = await Program.findOne({ _id: value });
//       if (!program) {
//         return Promise.reject('Chương trình học không nằm trong danh sách chương trình học có sẵn');
//       }
//     }).bail(),

//   body('status')
//     .trim().notEmpty().withMessage('Trạng thái không được để trống').bail()
//     .custom(async (value) => {
//       const status = await Status.findOne({ _id: value });
//       if (!status) {
//         return Promise.reject('Trạng thái không nằm trong danh sách trạng thái có sẵn');
//       }
//     }).bail(),

//   body('nationality')
//     .trim().notEmpty().withMessage('Quốc tịch không được để trống').bail(),

//   body('identity_card._id')
//     .optional({ checkFalsy: true }).trim().bail(),

//   body('identity_card.issue_date')
//     .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp CCCD/CMND không hợp lệ").bail(),

//   body('identity_card.expiry_date')
//     .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn CCCD/CMND không hợp lệ").bail(),

//   body('passport._id')
//     .optional({ checkFalsy: true }).trim().bail(),

//   body('passport.issue_date')
//     .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp hộ chiếu không hợp lệ").bail(),

//   body('passport.expiry_date')
//     .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn hộ chiếu không hợp lệ").bail(),

//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.error("Validation error:", errors.array());
//       return res.status(400).json({ ok: false, error: errors.array()[0].msg });
//     }

//     next();
//   }
// ];