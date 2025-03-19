import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import Major from "../models/majorModel.js";
import dayjs from "dayjs";
import { populate } from "dotenv";
import Program from "../models/programModel.js";
import Status from "../models/statusModel.js";
import formatStudentsData from "../helpers/studentDataFormatter.js";
import { paginate } from "mongoose-paginate-v2";

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
    res.render("index", { title: "Student management system", results, majors, status, programs, query: "", search_by: "student_id" });
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

    console.log("Student updated successfully");
    res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    console.error("Error updating students: ", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
}

export const deleteStudents = async (req, res) => {
  const studentIds = req.body.student_ids;
  console.log(JSON.stringify(studentIds, null, 2));
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
    const searchTerm = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters

    let query = {_id : searchTerm};

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

    const results = await Student.paginate(query, options);
    // format students data
    formatStudentsData(results.docs);
    const majors = await Major.find().lean();
    const status = await Status.find().lean();
    const programs = await Program.find().lean();
    res.render("index", { title: "Student management system", results, majors, status, programs, query: "", search_by: "student_id" });
  } catch (error) {
    console.error("Error getting students: ", error.message);
  }
}