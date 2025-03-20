import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import Major from "../models/majorModel.js";
import dayjs from "dayjs";
import Program from "../models/programModel.js";
import Status from "../models/statusModel.js";

// export const getAllStudents = async (req, res) => {
//   try {
//     const options = {
//       pagination: false,
//       page: 1,
//       limit: 100,
//       sort: "_id",
//       lean: true, // convert to POJO
//       populate: [// reference other collections
//         "major",
//         "program",
//         "status"
//       ]
//     }
//     const results = await Student.paginate({}, options);
//     // format students data
//     results.docs.forEach(student => {
//       student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
//     });
//     const majors = await Major.find().lean();
//     const status = await Status.find().lean();
//     const programs = await Program.find().lean();
//     res.render("index", { title: "Student management system", results, majors, status, programs, queryString: "", queryData: null });
//   } catch (error) {
//     console.error("Error getting students: ", error.message);
//   }
// };


// export const addStudent = async (req, res) => {
//   const student = req.body;

//   try {
//     const majorList = await Major.distinct("_id");
//     const statusList = await Status.distinct("_id");
//     const programList = await Program.distinct("_id");
//     const genderList = ["Nam", "Nữ"]

//     // all fields are required
//     if (!student._id || student._id.trim() === "") {
//       throw new Error("MSSV không được để trống");
//     } else if (!student._id.match(/^[0-9]{8}$/)) {
//       throw new Error("MSSV phải là 8 chữ số");
//     }
//     if (!student.name || student.name.trim() === "") {
//       throw new Error("Tên không được để trống");
//     }
//     if (!student.email || student.email.trim() === "") {
//       throw new Error("Email không được để trống");
//     } else if (!student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
//       throw new Error("Email không hợp lệ");
//     }
//     if (!student.phone_number || student.phone_number.trim() === "") {
//       throw new Error("Số điện thoại không được để trống");
//     } else if (!student.phone_number.match(/^[0-9]{10,11}$/)) {
//       throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
//     }
//     if (!student.address || student.address.trim() === "") {
//       throw new Error("Địa chỉ không được để trống");
//     }
//     if (!student.major || student.major.trim() === "") {
//       throw new Error("Ngành học không được để trống");
//     } else if (!majorList.includes(student.major)) {
//       throw new Error("Ngành học không nằm trong danh sách ngành học hợp lệ");
//     }
//     if (!student.class_year || student.class_year.trim() === "") {
//       throw new Error("Năm học không được để trống");
//     } else if (!student.class_year.match(/^[0-9]{4}$/)) {
//       throw new Error("Năm học phải là 4 chữ số");
//     }
//     if (!student.program || student.program.trim() === "") {
//       throw new Error("Chương trình học không được để trống");
//     } else if (!programList.includes(student.program)) {
//       throw new Error("Chương trình học không nằm trong danh sách chương trình học hợp lệ");
//     }
//     if (!student.status || student.status.trim() === "") {
//       throw new Error("Trạng thái không được để trống");
//     } else if (!statusList.includes(student.status)) {
//       throw new Error("Trạng thái không nằm trong danh sách trạng thái hợp lệ");
//     }
//     if (!student.gender || student.gender.trim() === "") {
//       throw new Error("Giới tính không được để trống");
//     } else if (!genderList.includes(student.gender)) {
//       throw new Error("Giới tính phải là Nam hoặc Nữ");
//     }
//     if (!student.birthdate || student.birthdate.trim() === "") {
//       throw new Error("Ngày sinh không được để trống");
//     }

//     await Student.insertOne(student);

//     console.log("Student added successfully");
//     res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
//   } catch (error) {
//     console.error("Error adding students: ", error.message);
//     res.status(400).json({ ok: false, error: error.message });
//   }
// }


//MinhPhuong: modify to get all new infor of students in Ex02
export const getAllStudents = async (req, res) => {
  try {
      const options = {
          pagination: false,
          page: 1,
          limit: 100,
          sort: "_id",
          lean: true, // Convert to plain JavaScript objects
          populate: ["major", "program", "status"] // Ensure references are populated
      };

      const results = await Student.paginate({}, options);

      // ✅ Format data properly before sending to frontend
      results.docs.forEach(student => {
          student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');

          if (!student.identification || !student.identification.type) {
              student.identification = {
                  type: "Chưa có",
                  id: "Chưa có",
                  issue_date: "Chưa có",
                  expiry_date: "Chưa có",
                  issue_location: "Chưa có",
                  is_digitized: false,
                  country_code: "Chưa có",
                  notes: "Không có ghi chú"
              };
          } else {
              student.identification.issue_date = student.identification.issue_date
                  ? dayjs(student.identification.issue_date).format('DD/MM/YYYY')
                  : "Chưa có";

              student.identification.expiry_date = student.identification.expiry_date
                  ? dayjs(student.identification.expiry_date).format('DD/MM/YYYY')
                  : "Chưa có";
          }
      });

      const majors = await Major.find().lean();
      const status = await Status.find().lean();
      const programs = await Program.find().lean();

      res.render("index", {
          title: "Student management system",
          results,
          majors,
          status,
          programs,
          queryString: "",
          queryData: null
      });

  } catch (error) {
      console.error("❌ Error getting students:", error.message);
      res.status(500).json({ error: "Lỗi lấy danh sách sinh viên" });
  }
};


// export const addStudent = async (req, res) => {
//   const student = req.body;

//   try {
//     const majorList = await Major.distinct("_id");
//     const statusList = await Status.distinct("_id");
//     const programList = await Program.distinct("_id");
//     const genderList = ["Nam", "Nữ"];

//     // Validate required fields
//     if (!student._id || !student._id.match(/^[0-9]{8}$/)) {
//       throw new Error("MSSV phải là 8 chữ số");
//     }
//     if (!student.name || student.name.trim() === "") {
//       throw new Error("Tên không được để trống");
//     }
//     if (!student.email || !student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
//       throw new Error("Email không hợp lệ");
//     }
//     if (!student.phone_number || !student.phone_number.match(/^[0-9]{10,11}$/)) {
//       throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
//     }
//     if (!student.permanent_address){
//       //|| !student.permanent_address.province_city) {
//       throw new Error("Địa chỉ thường trú không được để trống");
//     }
//     if (!student.major || !majorList.includes(student.major)) {
//       throw new Error("Ngành học không hợp lệ");
//     }
//     if (!student.class_year || !student.class_year.match(/^[0-9]{4}$/)) {
//       throw new Error("Năm học phải là 4 chữ số");
//     }
//     if (!student.program || !programList.includes(student.program)) {
//       throw new Error("Chương trình học không hợp lệ");
//     }
//     if (!student.status || !statusList.includes(student.status)) {
//       throw new Error("Trạng thái không hợp lệ");
//     }
//     if (!student.gender || !genderList.includes(student.gender)) {
//       throw new Error("Giới tính phải là Nam hoặc Nữ");
//     }
//     if (!student.birthdate) {
//       throw new Error("Ngày sinh không được để trống");
//     }

//     // Handle Identification
//     let identification = null;
//     if (student.identification_type) {
//       identification = {
//         type: student.identification_type,
//         id: student.identification_number,
//         issue_date: student.identification_issue_date,
//         expiry_date: student.identification_expiry_date,
//         issue_location: student.identification_issue_location,
//       };
//       if (student.identification_type === "CCCD") {
//         identification.is_digitized = student.cccd_chip === "on";
//       }
//     }

//     const newStudent = new Student({
//       _id: student._id,
//       name: student.name,
//       email: student.email,
//       phone_number: student.phone_number,
//       permanent_address: student.permanent_address,
//       temporary_address: student.temporary_address || null,
//       mailing_address: student.mailing_address || null,
//       gender: student.gender,
//       birthdate: student.birthdate,
//       major: student.major,
//       class_year: student.class_year,
//       program: student.program,
//       status: student.status,
//       nationality: student.nationality,
//       identification: identification,
//     });

//     await newStudent.save();
//     res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
//   } catch (error) {
//     console.error("Error adding student:", error.message);
//     res.status(400).json({ ok: false, error: error.message });
//   }
// };


// export const updateStudent = async (req, res) => {
//   const studentId = req.params.student_id;
//   const student = req.body;

//   try {
//     const studentToUpdate = await Student.findOne({ _id: studentId });
//     if (!studentToUpdate) {
//       throw new Error("Không tìm thấy sinh viên cần cập nhật");
//     }
//     const majorList = await Major.distinct("_id");
//     const statusList = await Status.distinct("_id");
//     const programList = await Program.distinct("_id");
//     const genderList = ["Nam", "Nữ"]

//     // all fields are required
//     if (!student.name || student.name.trim() === "") {
//       throw new Error("Tên không được để trống");
//     }
//     if (!student.email || student.email.trim() === "") {
//       throw new Error("Email không được để trống");
//     } else if (!student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
//       throw new Error("Email không hợp lệ");
//     }
//     if (!student.phone_number || student.phone_number.trim() === "") {
//       throw new Error("Số điện thoại không được để trống");
//     } else if (!student.phone_number.match(/^[0-9]{10,11}$/)) {
//       throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
//     }
//     if (!student.address || student.address.trim() === "") {
//       throw new Error("Địa chỉ không được để trống");
//     }
//     if (!student.major || student.major.trim() === "") {
//       throw new Error("Ngành học không được để trống");
//     } else if (!majorList.includes(student.major)) {
//       throw new Error("Ngành học không nằm trong danh sách ngành học hợp lệ");
//     }
//     if (!student.class_year || student.class_year.trim() === "") {
//       throw new Error("Năm học không được để trống");
//     } else if (!student.class_year.match(/^[0-9]{4}$/)) {
//       throw new Error("Năm học phải là 4 chữ số");
//     }
//     if (!student.program || student.program.trim() === "") {
//       throw new Error("Chương trình học không được để trống");
//     } else if (!programList.includes(student.program)) {
//       throw new Error("Chương trình học không nằm trong danh sách chương trình học hợp lệ");
//     }
//     if (!student.status || student.status.trim() === "") {
//       throw new Error("Trạng thái không được để trống");
//     } else if (!statusList.includes(student.status)) {
//       throw new Error("Trạng thái không nằm trong danh sách trạng thái hợp lệ");
//     }
//     if (!student.gender || student.gender.trim() === "") {
//       throw new Error("Giới tính không được để trống");
//     } else if (!genderList.includes(student.gender)) {
//       throw new Error("Giới tính phải là Nam hoặc Nữ");
//     }
//     if (!student.birthdate || student.birthdate.trim() === "") {
//       throw new Error("Ngày sinh không được để trống");
//     }

//     studentToUpdate.name = student.name;
//     studentToUpdate.email = student.email;
//     studentToUpdate.phone_number = student.phone_number;
//     studentToUpdate.address = student.address;
//     studentToUpdate.major = student.major;
//     studentToUpdate.class_year = student.class_year;
//     studentToUpdate.program = student.program;
//     studentToUpdate.status = student.status;
//     studentToUpdate.birthdate = student.birthdate;
//     studentToUpdate.gender = student.gender;

//     await studentToUpdate.save();

//     console.log("Student updated successfully");
//     res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
//   } catch (error) {
//     console.error("Error updating students: ", error.message);
//     res.status(400).json({ ok: false, error: error.message });
//   }
// }

//

//Minh Phuong: update students with new structure

export const addStudent = async (req, res) => {
  try {
      console.log("📥 Received student data:", JSON.stringify(req.body, null, 2)); // 🔍 Debug Log

      const student = req.body;

      //Ensure identification is properly formatted
      if (student.identification && student.identification.type) {
          student.identification = {
              type: student.identification.type,
              id: student.identification.id || "Chưa có",
              issue_date: student.identification.issue_date || null,
              expiry_date: student.identification.expiry_date || null,
              issue_location: student.identification.issue_location || "Chưa có",
              is_digitized: student.identification.is_digitized || false
          };
      } else {
          student.identification = null; // Prevent validation errors
      }

      console.log("Final student data before saving:", JSON.stringify(student, null, 2));

      const newStudent = new Student(student);
      await newStudent.save();

      res.status(200).json({ ok: true, message: "Thêm sinh viên thành công" });
  } catch (error) {
      console.error("Error adding student:", error.message);
      res.status(400).json({ ok: false, error: error.message });
  }
};


export const updateStudent = async (req, res) => {
  const studentId = req.params.student_id;
  const student = req.body;

  try {
    const studentToUpdate = await Student.findOne({ _id: studentId });
    if (!studentToUpdate) {
      throw new Error("Không tìm thấy sinh viên cần cập nhật");
    }

    studentToUpdate.name = student.name;
    studentToUpdate.email = student.email;
    studentToUpdate.phone_number = student.phone_number;
    studentToUpdate.permanent_address = student.permanent_address || studentToUpdate.permanent_address;
    studentToUpdate.temporary_address = student.temporary_address || studentToUpdate.temporary_address;
    studentToUpdate.mailing_address = student.mailing_address || studentToUpdate.mailing_address;
    studentToUpdate.gender = student.gender;
    studentToUpdate.birthdate = student.birthdate;
    studentToUpdate.major = student.major;
    studentToUpdate.class_year = student.class_year;
    studentToUpdate.program = student.program;
    studentToUpdate.status = student.status;
    studentToUpdate.nationality = student.nationality;

    // Handle Identification
    if (student.identification_type) {
      studentToUpdate.identification = {
        type: student.identification_type,
        id: student.identification_number,
        issue_date: student.identification_issue_date,
        expiry_date: student.identification_expiry_date,
        issue_location: student.identification_issue_location,
      };
      if (student.identification_type === "CCCD") {
        studentToUpdate.identification.is_digitized = student.cccd_chip === "on";
      }
    }

    await studentToUpdate.save();
    res.status(200).json({ ok: true, message: "Cập nhật sinh viên thành công" });
  } catch (error) {
    console.error("Error updating student:", error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
};

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