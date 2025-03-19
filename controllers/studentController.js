import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import dayjs from "dayjs";

export const getAllStudents = async(req, res) => {
  try {
    const students = await Student.find().lean(); // Convert to POJO object
    students.forEach(student => {
      student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });
    res.render("index", {title : "Student management system", students : students, query: "", search_by: "student_id"});
  } catch (error) {
    console.error("Error getting students: ", error.message);
  }
};
