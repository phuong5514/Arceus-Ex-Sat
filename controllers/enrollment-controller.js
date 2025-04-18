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
    res.render("enrollment", {students});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const getEnrolledStudentCount = async (classId) => {
  try {
    // This assumes every enrollment is unique for a student and class
    const students = await Enrollment.distinct("student_id", { class_id: classId, canceled: false });
    const count = students.length;
    return count;
  } catch (error) {
    console.error(error);
    return -1;
  }
}

export const getEnrolledClasses = async (studentId) => {
  try {
    const enrollments = await Enrollment.find({ student_id: studentId, canceled: false }).lean();
    const classIds = enrollments.map(enrollment => enrollment.class_id);

    const classes = await Class.find({ _id: { $in: classIds } })
      .populate("course_id")
      .lean();
    
    const filteredClasses = classes.filter(enrolledClass => enrolledClass.course_id !== null);
    
    for (const enrolledClass of filteredClasses) {
      const studentCount = await getEnrolledStudentCount(enrolledClass._id);
      enrolledClass.student_count = studentCount;
    }

    console.log(filteredClasses);

    return filteredClasses;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getAvailableClasses = async (studentId) => {
  try{
    const canceledClasses = await Enrollment.find({ student_id: studentId, canceled: false }).distinct("class_id");
    const availableClasses = await Class.find({ 
      _id: { $nin: canceledClasses } 
    })
      .populate("course_id")
      .lean();

    const filteredClasses = availableClasses.filter(availableClass => availableClass.course_id !== null && availableClass.course_id.is_active);
    
    for (const enrolledClass of filteredClasses) {
      const studentCount = await getEnrolledStudentCount(enrolledClass._id);
      enrolledClass.student_count = studentCount;
    }

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
    if (!student) {
      return res.status(404).send("Student not found");
    }
    res.render("enrollment-student", {student, enrolledClasses, availableClasses});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const registerClasses = async (req, res) => {
  try {
    const classes = req.body;
    const studentId = req.params.id;
    // Check if student exits
    const student = await studentController.getStudentAcademic(studentId);
    if (!student) {
      return res.status(404).json({ok: false, message: `Không tìm thấy sinh viên với mã số ${studentId}`});
    }
    // Check if classes is a subset of available classes
    const availableClasses = await getAvailableClasses(studentId);
    const classesToRegister = [];

    for (const classId of classes) {
      const classIdx = availableClasses.findIndex(availableClass => availableClass._id === classId);
      if (classIdx < 0) {
        return res.status(400).json({ok: false, message: `Lớp học ${classId} không nằm trong danh sách lớp học có thể đăng ký`});
      }
      classesToRegister.push(availableClasses[classIdx]);
    }

    // Delete all canceled enrollments for the student
    for (const c of classesToRegister) {
      await Enrollment.deleteMany({
        student_id: studentId,
        class_id: c._id,
        canceled: true
      });
    }

    // Enrolled courses of this guy
    const enrolledCourses = (await getEnrolledClasses(studentId)).map(c => c.course_id._id);

    // Create new enrollments
    for (const c of classesToRegister) {
      // Check if class is full
      const student_count = await getEnrolledStudentCount(c._id);
      const max_students = c.max_students;
      if (student_count >= max_students) {
        return res.status(400).json({ok: false, message: `Lớp học ${c._id} đã đầy`});
      }

      // Check prerequisites
      if (c.course_id.prerequisite_course && !enrolledCourses.includes(c.course_id.prerequisite_course)) {
        return res.status(400).json({ok: false, message: `Sinh viên chưa hoàn thành khóa học ${c.course_id.prerequisite_course} để đăng ký lớp học này`});
      }

      const newEnrollment = new Enrollment({
        _id: `ERN${studentId}_${c._id}_${Date.now()}`,
        student_id: studentId,
        class_id: c._id,
        enrolled_at: new Date(),
        canceled: false,
        canceled_reason: "",
        canceled_at: null
      });
      await newEnrollment.save();
    }

    res.status(200).json({ok: true, message: ""});
  } catch (error){
    console.error(error);
    res.status(500).json({ok: false, message: error.message});
  }
};

export const unregisterClasses = async (req, res) => {
  try {
    const classes = req.body;
    const studentId = req.params.id;

    // Update enrollments to mark them as canceled
    for (const classId of classes) {
      // TODO: It should just be updateOne, since {student_id, class_id} in theory should be unique
      // but during testing, there would be duplicate. This helps to avoid removing the duplicates multiple times
      // during testing
      const result = await Enrollment.updateMany(
        { student_id: studentId, class_id: classId },
        {
          $set: {
            canceled: true,
            canceled_reason: "Student requested to cancel enrollment",
            canceled_at: new Date()
          }
        }
      );
    }

    res.status(200).json({ok: true, message: ""});
  } catch (error){
    console.error(error);
    res.status(500).json({ok: false, message: error.message});
  }
}
