import * as studentController from "../controllers/student-controller.js";
import Enrollment from "../models/enrollment-model.js";
import Class from "../models/class-model.js";

const defaultPageLimit = 20;

// Page for choosing students
export const getStudents = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || defaultPageLimit;
    const students = await studentController.getAllStudentsAcademic(page, limit);
    console.log(JSON.stringify(students.docs[0], null, 2));
    res.render("enrollment", {students});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const getEnrolledClasses = async (studentId) => {
  try {
    const enrollments = await Enrollment.find({ student_id: studentId }).lean();
    const classIds = enrollments.map(enrollment => enrollment.class_id);

    const classes = await Class.find({ _id: { $in: classIds } })
      .populate("course_id")
      .lean();
    const filteredClasses = classes.filter(enrolledClass => enrolledClass.course_id !== null);
    return filteredClasses;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getAvailableClasses = async (studentId) => {
  try{
    const availableClasses = await Class.find({ _id: { $nin: (await Enrollment.find({ student_id: studentId }).distinct("class_id")) } })
      .populate("course_id")
      .lean();
    const filteredClasses = availableClasses.filter(availableClass => availableClass.course_id !== null);
    return filteredClasses;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Get student detail academic information, including
export const getStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentController.getStudentAcademic(studentId);

    const enrolledClasses = await getEnrolledClasses(studentId);
    const availableClasses = await getAvailableClasses(studentId);
    console.log(JSON.stringify(enrolledClasses, null, 2));
    if (!student) {
      return res.status(404).send("Student not found");
    }
    res.render("enrollment-student", {student, enrolledClasses, availableClasses});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}