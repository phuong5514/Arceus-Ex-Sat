import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import Major from "../models/majorModel.js";
import dayjs from "dayjs";
import Program from "../models/programModel.js";
import Status from "../models/statusModel.js";
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { writeLog } from '../helpers/logger.js';

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
        "status"
      ]
    }
    const results = await Student.paginate({}, options);
    // format students data
    results.docs.forEach(student => {
      student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
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
    if (!student.address || student.address.trim() === "") {
      throw new Error("Địa chỉ không được để trống");
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

    await Student.insertOne(student);
    writeLog('CREATE', 'SUCCESS', `Thêm sinh viên ${student._id} thành công`);
    res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
  } catch (error) {
    writeLog('CREATE', 'ERROR', `Thêm sinh viên thất bại: ${error.message}`);
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
    if (!student.address || student.address.trim() === "") {
      throw new Error("Địa chỉ không được để trống");
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

    await studentToUpdate.save();
    writeLog('UPDATE', 'SUCCESS', `Cập nhật sinh viên ${studentId} thành công`);
    res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    writeLog('UPDATE', 'ERROR', `Cập nhật sinh viên ${studentId} thất bại: ${error.message}`);
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
    writeLog('DELETE', 'SUCCESS', `Xóa ${result.deletedCount} sinh viên thành công`);
    res.status(200).json({ ok: true, message: "Xóa sinh viên thành công" });
  } catch (error) {
    writeLog('DELETE', 'ERROR', `Xóa sinh viên thất bại: ${error.message}`);
    res.status(400).json({ ok: false, error: error.message });
  }
}

export const searchStudents = async (req, res) => {
  try {
    const queryData = req.query;
    const searchTerm = queryData.search || "";
    const searchBy = queryData.search_by || "_id";
    const searchByMajor = queryData.search_by_major || "";
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

      if (searchByMajor){
        query = {$and: [
          {major : searchByMajor},
          {[searchBy] : new RegExp(`.*${searchTerm}.*`, "i")}
        ]};
      } else {
        query = {[searchBy] : new RegExp(`.*${searchTerm}.*`, "i")};
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

export const showImportPage = (req, res) => {
    res.render("import", { title: "Import Students" });
};

export const importStudents = async (req, res) => {
    try {
        // Kiểm tra file
        if (!req.files || !req.files.file) {
            return res.status(400).json({
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
        if (fileType === 'json' && !file.name.toLowerCase().endsWith('.json')) {
            return res.status(400).json({
                success: false,
                message: 'File phải có định dạng .json'
            });
        }

        // Đọc nội dung file
        const fileContent = file.data.toString('utf8');
        let students = [];

        if (fileType === 'csv') {
            // Xử lý CSV
            const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'File CSV phải có ít nhất header và một dòng dữ liệu'
                });
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const expectedHeaders = ['MSSV', 'Họ tên', 'Ngày sinh', 'Giới tính', 'Khoa', 'Khóa', 'Chương trình', 'Địa chỉ', 'Email', 'SĐT', 'Tình trạng'];
            
            // Kiểm tra header
            if (!expectedHeaders.every(h => headers.includes(h))) {
                return res.status(400).json({
                    success: false,
                    message: `File CSV phải có đầy đủ các cột: ${expectedHeaders.join(', ')}`
                });
            }

            // Map vị trí các cột
            const headerIndexes = {};
            expectedHeaders.forEach(header => {
                headerIndexes[header] = headers.indexOf(header);
            });

            // Đọc từng dòng dữ liệu
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v ? v.trim() : '');
                if (values.length !== headers.length) {
                    console.log(`Bỏ qua dòng ${i + 1} vì số cột không khớp`);
                    continue;
                }

                // Kiểm tra xem có trường nào bị thiếu không
                const hasEmptyFields = values.some(v => !v);
                if (hasEmptyFields) {
                    console.log(`Bỏ qua dòng ${i + 1} vì có trường dữ liệu trống`);
                    continue;
                }

                students.push({
                    _id: values[headerIndexes['MSSV']],
                    name: values[headerIndexes['Họ tên']],
                    birthdate: values[headerIndexes['Ngày sinh']],
                    gender: values[headerIndexes['Giới tính']],
                    major: values[headerIndexes['Khoa']],
                    class_year: values[headerIndexes['Khóa']],
                    program: values[headerIndexes['Chương trình']],
                    address: values[headerIndexes['Địa chỉ']],
                    email: values[headerIndexes['Email']],
                    phone_number: values[headerIndexes['SĐT']],
                    status: values[headerIndexes['Tình trạng']]
                });
            }
        } else if (fileType === 'json') {
            // Xử lý JSON
            try {
                const jsonData = JSON.parse(fileContent);
                if (!Array.isArray(jsonData)) {
                    return res.status(400).json({
                        success: false,
                        message: 'File JSON phải chứa một mảng các sinh viên'
                    });
                }
                students = jsonData.map(student => ({
                    _id: student.MSSV,
                    name: student['Họ tên'],
                    birthdate: student['Ngày sinh'],
                    gender: student['Giới tính'],
                    major: student['Khoa'],
                    class_year: student['Khóa'],
                    program: student['Chương trình'],
                    address: student['Địa chỉ'],
                    email: student['Email'],
                    phone_number: student['SĐT'],
                    status: student['Tình trạng']
                }));
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'File JSON không hợp lệ'
                });
            }
        }

        // Kiểm tra dữ liệu trống
        if (students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu hợp lệ để import'
            });
        }

        // Validate từng sinh viên
        for (const student of students) {
            // MSSV: 8 chữ số
            if (!student._id || !/^\d{8}$/.test(student._id)) {
                return res.status(400).json({
                    success: false,
                    message: `MSSV ${student._id} không hợp lệ. MSSV phải là 8 chữ số.`
                });
            }

            // Họ tên: không được trống
            if (!student.name || student.name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: `Họ tên của sinh viên ${student._id} không được để trống`
                });
            }

            // Email: đúng định dạng
            if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
                return res.status(400).json({
                    success: false,
                    message: `Email ${student.email} của sinh viên ${student._id} không hợp lệ`
                });
            }

            // Số điện thoại: 10-11 chữ số
            if (!student.phone_number || !/^\d{10,11}$/.test(student.phone_number)) {
                return res.status(400).json({
                    success: false,
                    message: `Số điện thoại ${student.phone_number} của sinh viên ${student._id} không hợp lệ`
                });
            }

            // Giới tính: Nam hoặc Nữ
            if (!['Nam', 'Nữ'].includes(student.gender)) {
                return res.status(400).json({
                    success: false,
                    message: `Giới tính ${student.gender} của sinh viên ${student._id} không hợp lệ. Phải là Nam hoặc Nữ`
                });
            }

            // Ngày sinh: định dạng DD/MM/YYYY
            if (!student.birthdate || !/^\d{2}\/\d{2}\/\d{4}$/.test(student.birthdate)) {
                return res.status(400).json({
                    success: false,
                    message: `Ngày sinh ${student.birthdate} của sinh viên ${student._id} không hợp lệ. Định dạng phải là DD/MM/YYYY`
                });
            }

            // Khóa: 4 chữ số
            if (!student.class_year || !/^\d{4}$/.test(student.class_year)) {
                return res.status(400).json({
                    success: false,
                    message: `Khóa ${student.class_year} của sinh viên ${student._id} không hợp lệ. Phải là 4 chữ số`
                });
            }
        }

        // Lấy danh sách các giá trị hợp lệ từ database
        const [majors, programs, statuses] = await Promise.all([
            Major.find().lean(),
            Program.find().lean(),
            Status.find().lean()
        ]);

        // Log để debug
        console.log('Available majors:', majors.map(m => m.major_name));
        console.log('Available programs:', programs.map(p => p.program_name));
        console.log('Available statuses:', statuses.map(s => s.status_name));

        // Kiểm tra và chuyển đổi dữ liệu
        const processedStudents = [];
        for (const student of students) {
            // Kiểm tra xem student.major có tồn tại và không phải undefined
            if (!student.major) {
                return res.status(400).json({
                    success: false,
                    message: `Ngành học của sinh viên ${student._id} không được để trống`
                });
            }

            // Tìm major
            const major = majors.find(m => m.major_name && student.major && 
                m.major_name.toLowerCase() === student.major.toLowerCase());
            if (!major) {
                return res.status(400).json({
                    success: false,
                    message: `Ngành học "${student.major}" của sinh viên ${student._id} không hợp lệ. Các ngành hợp lệ: ${majors.map(m => m.major_name).join(', ')}`
                });
            }

            // Kiểm tra program
            if (!student.program) {
                return res.status(400).json({
                    success: false,
                    message: `Chương trình học của sinh viên ${student._id} không được để trống`
                });
            }

            // Tìm program
            const program = programs.find(p => p.program_name && student.program && 
                p.program_name.toLowerCase() === student.program.toLowerCase());
            if (!program) {
                return res.status(400).json({
                    success: false,
                    message: `Chương trình "${student.program}" của sinh viên ${student._id} không hợp lệ. Các chương trình hợp lệ: ${programs.map(p => p.program_name).join(', ')}`
                });
            }

            // Kiểm tra status
            if (!student.status) {
                return res.status(400).json({
                    success: false,
                    message: `Trạng thái của sinh viên ${student._id} không được để trống`
                });
            }

            // Tìm status
            const status = statuses.find(s => s.status_name && student.status && 
                s.status_name.toLowerCase() === student.status.toLowerCase());
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: `Trạng thái "${student.status}" của sinh viên ${student._id} không hợp lệ. Các trạng thái hợp lệ: ${statuses.map(s => s.status_name).join(', ')}`
                });
            }

            // Chuyển đổi ngày sinh sang định dạng YYYY-MM-DD
            const [day, month, year] = student.birthdate.split('/');
            const formattedBirthdate = `${year}-${month}-${day}`;

            // Thêm vào danh sách sinh viên đã xử lý
            processedStudents.push({
                _id: student._id,
                name: student.name,
                birthdate: formattedBirthdate,
                gender: student.gender,
                major: major._id,
                class_year: student.class_year,
                program: program._id,
                address: student.address,
                email: student.email,
                phone_number: student.phone_number,
                status: status._id
            });
        }

        // Import vào database
        await Student.insertMany(processedStudents);

        // Ghi log và trả về kết quả
        writeLog('IMPORT', 'SUCCESS', `Import ${processedStudents.length} sinh viên thành công`);
        return res.status(200).json({
            success: true,
            message: `Import thành công ${processedStudents.length} sinh viên`
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