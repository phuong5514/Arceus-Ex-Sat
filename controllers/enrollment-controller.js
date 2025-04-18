import * as studentController from "../controllers/student-controller.js";
import Enrollment from "../models/enrollment-model.js";
import Transcript from "../models/transcript-model.js";
import Course from "../models/course-model.js";
import Class from "../models/class-model.js";
import puppeteer from "puppeteer";
import fs from "fs";

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
    const grades = await Transcript.find({ student_id: studentId }).lean();
    const classIds = grades.map(grade => grade.class_id);
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    const courseIds = classes.map(enrolledClass => enrolledClass.course_id);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean(); 


    // gradeInfo: class_id, course_id, course_name, grade
    const gradeInfos = grades.map(grade => {
      const enrolledClass = classes.find(enrolledClass => enrolledClass._id.toString() === grade.class_id.toString());
      const course = courses.find(course => course._id.toString() === enrolledClass.course_id.toString());
      return {
        class_id: enrolledClass._id,
        course_id: course._id,
        course_name: course.course_name,
        grade: grade.grade,
        recorded_at: grade.recorded_at,
      };
    });

    if (!student) {
      return res.status(404).send("Student not found");
    }
    res.render("enrollment-student", {student, enrolledClasses, availableClasses, gradeInfos});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const getTranscript = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentController.getStudentAcademic(studentId);

    const grades = await Transcript.find({ student_id: studentId }).lean();
    const classIds = grades.map(grade => grade.class_id);
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    const courseIds = classes.map(enrolledClass => enrolledClass.course_id);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    let totalCredits = 0;
    let totalGradePoints = 0;

    const gradeInfos = grades.map(grade => {
      const enrolledClass = classes.find(enrolledClass => enrolledClass._id.toString() === grade.class_id.toString());
      const course = courses.find(course => course._id.toString() === enrolledClass.course_id.toString());
      totalGradePoints += (grade.grade || 0) * course.credits;
      totalCredits += course.credits;
      return {
        class_id: enrolledClass._id,
        course_id: course._id,
        course_name: course.course_name,
        grade: grade.grade,
        recorded_at: grade.recorded_at,
        credits: course.credits
      };
    });

    const gpa = totalGradePoints / totalCredits || 0;
    const gpaFormatted = gpa.toFixed(2);

    const gpa_base_4 = (gpa / 10) * 4;
    const gpa_base_4_formatted = gpa_base_4.toFixed(2);

    if (!student) {
      return res.status(404).send("Student not found");
    }


    const generatedHTML = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đăng ký học phần</title>
      </head>
      <body class="bg-grey-100">
        <div class="flex-column m-16 gap-16">
          <div class="max-w-1000 align-self-center flex-column gap-16">
            <div class="flex-column gap-16 align-center">
              <div class="grid grid-gap-8 border-box w-full box bg-grey-200 px-32 pt-16 pb-16">
                <h2 class="grid-colspan-12 text-center">Thông tin học tập</h2>
                <div class="grid-colspan-4 border-right font-bold">MSSV</div>
                <div class="grid-colspan-8">${student._id}</div>
                <div class="grid-colspan-4 border-right font-bold">Họ tên</div>
                <div class="grid-colspan-8">${student.name}</div>
                <div class="grid-colspan-4 border-right font-bold">Ngày sinh</div>
                <div class="grid-colspan-8">${new Date(student.birthdate).toLocaleDateString('vi-VN')}</div>
                <div class="grid-colspan-4 border-right font-bold">Giới tính</div>
                <div class="grid-colspan-8">${student.gender}</div>
                <div class="grid-colspan-4 border-right font-bold">Chương trình</div>
                <div class="grid-colspan-8">${student.program ? `${student.program._id} - ${student.program.program_name}` : 'N/A'}</div>
                <div class="grid-colspan-4 border-right font-bold">Ngành học</div>
                <div class="grid-colspan-8">${student.major ? `${student.major._id} - ${student.major.major_name}` : 'N/A'}</div>
                <div class="grid-colspan-4 border-right font-bold">Trạng thái</div>
                <div class="grid-colspan-8">${student.status ? `${student.status._id} - ${student.status.status_name}` : 'N/A'}</div>
                <div class="grid-colspan-4 border-right font-bold">Điểm trung bình tích lũy</div>
                <div class="grid-colspan-8">${gpaFormatted} / 10  ---  ${gpa_base_4_formatted} / 4</div>
                <div class="grid-colspan-4 border-right font-bold">Tổng số tín chỉ</div>
                <div class="grid-colspan-8">${totalCredits}</div>
              </div>
              <div class="grid grid-gap-8 border-box w-full box bg-grey-200 px-32 pt-16 pb-16">
                <h2 class="grid-colspan-12 text-center">Bảng điểm các học phần</h2>
                <table class="table grid-colspan-12 border-box">
                  <thead>
                    <tr>
                      <th class="font-bold text-left">Mã lớp</th>
                      <th class="font-bold text-left">Mã học phần</th>
                      <th class="font-bold text-left">Tên học phần</th>
                      <th class="font-bold text-left">Điểm</th>
                      <th class="font-bold text-left">Số tín chỉ</th>
                      <th class="font-bold text-left">Ngày ghi điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${gradeInfos.length > 0 ? gradeInfos.map(grade => `

                      <tr>
                        <td style="width: 20%;">${grade.class_id}</td>
                        <td style="width: 20%;">${grade.course_id}</td>
                        <td style="width: 20%;">${grade.course_name}</td>
                        <td style="width: 10%;">${grade.grade || 'Chưa có'}</td>
                        <td style="width: 10%;">${grade.credits}</td>
                        <td style="width: 20%;">${new Date(grade.recorded_at).toLocaleDateString("vi-VN")}</td>
                      </tr>
                    `).join('') : `
                      <tr class="text-center font-italic">
                        <td colspan="5" class="text-center">(Không có dữ liệu)</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </body>
      <style>
      :root {
      --grey_50: #eeeeee;
      --grey_100: #efefef;
      --grey_200: #d9d9d9;
      --grey_700: #636363;
      --green_500: #04AA6D;
      --green_600: #1a9668;
      }

      body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: x-small;
      margin: 0;
      padding: 0;
      }

      .flex-column {
      display: flex;
      flex-direction: column;
      }

      .gap-16 {
      gap: 16px;
      }

      .align-center {
      align-items: center;
      }

      .align-self-center {
      align-self: center;
      }

      .m-16 {
      margin: 16px;
      }

      .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      }

      .grid-gap-8 {
      gap: 8px;
      }

      .grid-colspan-12 {
      grid-column: span 12;
      }

      .grid-colspan-8 {
      grid-column: span 8;
      }

      .grid-colspan-4 {
      grid-column: span 4;
      }

      .border-box {
      box-sizing: border-box;
      }

      .w-full {
      width: 100%;
      }

      .box {
      border: 1px solid var(--grey_700);
      padding: 8px;
      }

      .bg-grey-100 {
      background-color: var(--grey_100);
      }

      .bg-grey-200 {
      background-color: var(--grey_200);
      }

      .px-32 {
      padding-left: 32px;
      padding-right: 32px;
      }

      .pt-16 {
      padding-top: 16px;
      }

      .pb-16 {
      padding-bottom: 16px;
      }

      .font-bold {
      font-weight: bold;
      }

      .border-right {
      border-right: 1px solid var(--grey_700);
      }

      .text-center {
      text-align: center;
      }

      .table {
      border-collapse: collapse;
      }

      th, td {
      text-align: left;
      padding: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      }

      th {
      background-color: var(--green_500);
      color: white;
      font-weight: bold;
      }

      tr:nth-child(even) {
      background-color: var(--grey_50);
      }

      tr:nth-child(odd) {
      background-color: white;
      }

      .font-italic {
      font-style: italic;
      }
      </style>
      </html>
    `;

    // HTML to PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(generatedHTML, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
    await page.pdf({ path: `transcript_${studentId}.pdf`, format: 'A4', printBackground: true });
    await browser.close();

    res.download(`transcript_${studentId}.pdf`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error generating PDF");
      } else {
        // Optionally delete the file after download
        fs.unlink(`transcript_${studentId}.pdf`, (err) => {
          if (err) console.error(err);
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

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
