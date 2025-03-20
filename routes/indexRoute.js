import express, { query } from 'express';
import dayjs from 'dayjs';
import { addStudent, deleteStudents, getAllStudents, updateStudent, searchStudents, showImportPage, importStudents } from '../controllers/studentController.js';
import fileUpload from 'express-fileupload';

const majorList = ["Kinh tế", "Tiếng Anh thương mại", "Luật", "Tiếng Nhật", "Tiếng Pháp"];
const statusList = ["Đang học", "Đã thôi học", "Đã tốt nghiệp", "Tạm dừng học"];
const genderList = ["Nam", "Nữ"];
const programList = ["Chính quy", "Chất lượng cao", "Tài năng", "Tiên tiến"];

const router = express.Router();
const PAGE_SIZE = 20;

// Cấu hình file upload
router.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    abortOnLimit: true,
    responseOnLimit: "File size is too large",
    safeFileNames: true,
    preserveExtension: true
}));

function formatStudentData(students) {
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });
}

router.get("/", getAllStudents);

router.get("/search", searchStudents);

router.post("/students", addStudent);

router.put("/students/:student_id", updateStudent);

router.delete("/students", deleteStudents);

// Routes
router.get('/import', showImportPage);
router.post('/import', importStudents);

export default router;
