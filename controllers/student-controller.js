import Student from "../models/student-model.js";
import Major from "../models/major-model.js";
import dayjs from "dayjs";
import Program from "../models/program-model.js";
import Status from "../models/status-model.js";
import Address from "../models/address-model.js";
import IdentityCard from "../models/identity-card-model.js";
import Passport from "../models/passport-model.js";
import { writeLog } from '../helpers/logger.js';
import * as guidance from '../helpers/guidance-format.js';
import { formatAddress, formatIdentificationDocument, formatIdentityCard, formatPassport } from '../helpers/student-data-formatter.js'; 

import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { promises as fs }  from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

import {studentAddSchema, studentUpdateSchema} from '../validators/student-validator.js';
import { console } from "inspector";
import { ZodError } from "zod";
import { populate } from "dotenv";

import QueryValuesEnum from "../helpers/query-values.js";

dayjs.extend(customParseFormat);

const fetchAndFormatStudents = async (query = {}, options = {}) => {
  const defaultOptions = {
    pagination: true,
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
    // Birthday ISO -> DD/MM/YYYY
    student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    const addresses = [student.permanent_address, student.temporary_address, student.mailing_address];
    for (let index = 0; index < addresses.length; index++) {
      if (addresses[index] != null){
        addresses[index].text = formatAddress(addresses[index]);
      } else {
        addresses[index] = emptyAddress();
        addresses[index].text = ""
      }
    }
    student.permanent_address = addresses[0];
    student.temporary_address = addresses[1];
    student.mailing_address = addresses[2];
    writeLog("Student", student._id, ":", student.permanent_address, student.temporary_address, student.mailing_address);

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
    const results = await fetchAndFormatStudents({}, {
      page: req.query.page || QueryValuesEnum.DEFAULT_QUERY_PAGE,
      limit: req.query.limit || QueryValuesEnum.DEFAULT_PAGE_LIMIT,
    });
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
    const newStudent = await preprocessStudent(student, studentAddSchema);

    await Student.insertOne(newStudent);

    console.log("Student added successfully");
    writeLog('CREATE', 'SUCCESS', `Thêm sinh viên ${student._id} thành công`);
    res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
  } catch (error) {
    writeLog('CREATE', 'ERROR', `Thêm sinh viên thất bại: ${error.message}`);
    console.error("Error adding student:", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
};

export async function preprocessStudent(studentToProcess, validator) {
  
  const existingStudent = await Student.findOne({ _id: studentToProcess._id });
  if (existingStudent) {
    throw new Error('Duplicate ID');
  }
  
  let student;
  try {
    student = await validator.parseAsync(studentToProcess);
  } catch (error) {
    if (error instanceof  ZodError) {
      console.error("Validation error:", error.issues);
      throw new Error(error.issues.map(issue => `${issue.message} at  ${issue.path}`).join(", "));  
    }
  }
  

  const addresses = [student.permanent_address, student.temporary_address, student.mailing_address];
  const addressIds = [student._id + "ADDRPMNT", student._id + "ADDRTMP", student._id + "ADDRMAIL"];
  const addressFields = ["house_number", "street", "ward", "district", "city", "country", "postal_code"];

  for (let index = 0; index < addresses.length; index++) {
    let address = addresses[index];

    const storedAddress = await Address.findOne({ _id: addressIds[index] });

    if (storedAddress) {
      addressFields.forEach(field => {
        storedAddress[field] = address[field];
      });
      await storedAddress.save();
    } else {
      const newAddress = { ...address, _id: addressIds[index] };
      await Address.insertOne(newAddress);
    }

    addresses[index] = addressIds[index];
  }

  student.set({
    permanent_address: addresses[0],
    temporary_address: addresses[1],
    mailing_address: addresses[2]
  })

  if (student.identity_card && student.identity_card._id) {
    // check if identity card existed
    const identityCard = await IdentityCard.findOne({ _id: student.identity_card._id });
    
    writeLog("IdentityCard" + JSON.stringify(student.identityCard));
    if (identityCard) {
      identityCard.set({
        issue_date: student.identity_card.issue_date,
        expiry_date: student.identity_card.expiry_date,
        issue_location: student.identity_card.issue_location,
        is_digitized: student.identity_card.is_digitized,
        chip_attached: student.identity_card.chip_attached
      });
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


  if (student.passport && student.passport._id) {
    // check if passport existed
    const passport = await Passport.findOne({ _id: student.passport._id });
    if (passport) {
      passport.set({
        type: student.passport.type,
        country_code: student.passport.country_code,
        issue_date: student.passport.issue_date,
        expiry_date: student.passport.expiry_date,
        issue_location: student.passport.issue_location,
        // notes: student.passport.notes
      });
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
    const processedStudent = await preprocessStudent(student, studentUpdateSchema);
    // Update all fields from processedStudent to studentToUpdate
    studentToUpdate.set({
      name: processedStudent.name,
      email: processedStudent.email,
      phone_number: processedStudent.phone_number,
      address: processedStudent.address,
      major: processedStudent.major,
      class_year: processedStudent.class_year,
      program: processedStudent.program,
      status: processedStudent.status,
      birthdate: processedStudent.birthdate,
      gender: processedStudent.gender,
      permanent_address: processedStudent.permanent_address,
      temporary_address: processedStudent.temporary_address,
      mailing_address: processedStudent.mailing_address,
      identity_card: processedStudent.identity_card,
      passport: processedStudent.passport,
      nationality: processedStudent.nationality
    });

    await studentToUpdate.save();

    // TODO: wrap these part into a function
    writeLog('UPDATE', 'SUCCESS', `Cập nhật sinh viên ${studentId} thành công`);
    console.log("Student updated successfully");
    res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    // TODO: wrap these parts into a function

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
    writeLog('DELETE', 'SUCCESS', `Xóa ${result.deletedCount} sinh viên thành công`);
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
    const results = await fetchAndFormatStudents(query, {
      page: queryData.page || QueryValuesEnum.DEFAULT_QUERY_PAGE,
      limit: queryData.limit || QueryValuesEnum.DEFAULT_PAGE_LIMIT
    });
    const majors = await Major.find().lean();
    const status = await Status.find().lean();
    const programs = await Program.find().lean();
    res.render("index", { title: "Student management system", results, majors, status, programs, queryString, queryData });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
};

export const showImportPage = async (req, res) => {
  const template_dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../import_templates");
  const json_template = await fs.readFile(path.join(template_dir, "json-import.txt"), "utf-8");
  const csv_template = await fs.readFile(path.join(template_dir, "csv-import.txt"), "utf-8");
  res.render("import", { title: "Import Students", json_template, csv_template});
};

function formatExtraLogs(extra_logs){
  if (extra_logs.length > 0){
    return `Chi tiết:\n ${extra_logs.join('\n')}`
  } else {
    return `Chi tiết:\n (Không có)`
  }
}

// TODO: seperate this function into multiple
export const importStudents = async (req, res) => {
  try {
    // Kiểm tra file
    if (!req.files || !req.files.file) {
      res.status(400).json({
        ok: false,
        message: 'Vui lòng chọn file để import'
      });
    }
    
    const file = req.files.file;
    const fileType = req.body.fileType;

    // Kiểm tra định dạng file
    if (fileType === 'csv' && !file.name.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({
        ok: false,
        message: 'File phải có định dạng .csv'
      });
    }
    // HOTFIX: Somehow file extension will change from "".json" to "j.son"
    if (fileType === 'json' && !file.name.toLowerCase().endsWith('.json') && !file.name.toLowerCase().endsWith('j.son')) {
      return res.status(400).json({
        ok: false,
        message: 'File phải có định dạng .json'
      });
    }

    // Đọc nội dung file
    const fileContent = file.data.toString('utf8');
    const students = [];
    const extra_error_logs = [];

    switch (fileType) {
      case 'csv':{
        // Xử lý CSV
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) {
          return res.status(400).json({
            ok: false,
            message: 'File CSV phải có ít nhất header và một dòng dữ liệu'
          });
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = Object.keys(guidance.importCSVGuidance);

        // Kiểm tra header
        if (!expectedHeaders.every(h => headers.includes(h))) {
          return res.status(400).json({
            ok: false,
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
            console.log(`Bỏ qua dòng ${i + 1}: Số cột không khớp`);
            continue;
          }
          
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
              console.error("Bỏ qua dòng", i + 1, ": ", err.message);
            } else {
              console.log("Thêm sinh viên", newStudent._id, "thành công");
              students.push(newStudent);
            }
          });
        }
        break;
      }
      case 'json': {  
        try {
          const jsonData = JSON.parse(fileContent);
          if (!Array.isArray(jsonData)) {
            return res.status(400).json({
              ok: false,
              message: 'File JSON phải chứa một mảng các sinh viên'
            });
          }
          for (let i = 0; i < jsonData.length; i++) {
            writeLog("Student", JSON.stringify(jsonData[i]) );
            await processStudentImport(jsonData[i], (student, err)=>{
              let msg = "";
              if (err){
                msg = `Bỏ qua dòng ${i + 1}: ${err.message}`;
                extra_error_logs.push(msg);
                console.error(msg);
              } else {
                msg = `Thêm sinh viên ${student._id} thành công`;
                students.push(student);
              }
            });
          }
        } catch (error) {
          console.error(error.message || error);
          return res.status(400).json({
            ok: false,
            message: 'File JSON không hợp lệ'
          });
        }
      }
    }

    // Kiểm tra dữ liệu trống
    if (students.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Không có dữ liệu nào được import\n' + formatExtraLogs(extra_error_logs)
      });
    }

    // Import vào database
    await Student.insertMany(students);

    // Ghi log và trả về kết quả
    writeLog('IMPORT', 'SUCCESS', `Import ${students.length} sinh viên thành công`);
    return res.status(200).json({
      ok: true,
      message: `Import thành công ${students.length} sinh viên\n ` + formatExtraLogs(extra_error_logs)
    });

  } catch (error) {
    console.error('Import error:', error);
    writeLog('IMPORT', 'ERROR', `Import sinh viên thất bại: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'Có lỗi xảy ra khi import: ' + error.message
    });
  }
};


// This function validates and alter the student data before inserting into the database
async function processStudentImport(studentToProcess, resultCallback) {
  try {
    const student = await preprocessStudent(studentToProcess, studentAddSchema);
    resultCallback(student, null);
  } catch (error) {
    resultCallback(null, error);
  }
}

const checkRequiredFields = (student, requiredFields, resultCallback) => {
  const checkFields = (obj, fields, parent = '') => {
    for (const field of fields) {
      if (typeof field === "string") {
        if (obj[field] === undefined) {
          resultCallback(new Error(`Trường ${parent}${field} không được để trống`));
          return false;
        }
      } else if (typeof field === "object") {
        const parentField = Object.keys(field)[0];
        if (obj[parentField] === undefined) {
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

// TODO: seperate this function into multiple
export const exportAllStudents = async (req, res) => {
  try {
    const format = req.query.format || 'json'; // Default to JSON if no format specified
    const data = await fetchAndFormatStudents();
    
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
    res.status(500).json({ok: false, message: "Lỗi xuất dữ liệu sinh viên" });
  }
};

export const getStudentAcademic = (studentId) => {
  try {
    const options = {
      lean: true,
      populate: [
        "major",
        "program",
        "status",
      ]
    }

    return Student.findOne({ _id: studentId }, {}, options);
  } catch (error) {
    console.error("Error getting student:", error.message);
    return null;
  }
}

export const getAllStudentsAcademic = (page, limit) => {
  try {
    const options = {
      pagination: true,
      page,
      limit,
      lean: true,
      populate: [
        "major",
        "program",
        "status",
      ]
    }

    return Student.paginate({}, options);
  } catch (error) {
    console.error("Error getting students:", error.message);
    return null;
  }
};

export const searchAllStudentAcademic = (query, page, limit) => {
  try {
    const options = {
      pagination: true,
      page,
      limit,
      lean: true,
      populate: [
        "major",
        "program",
        "status",
      ]
    }

    return Student.paginate(query, options);
  } catch (error) {
    console.error("Error getting students:", error.message);
    return null;
  }
}