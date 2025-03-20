import express, { query } from 'express';
import dayjs from 'dayjs';
import { addStudent, deleteStudents, getAllStudents, updateStudent, searchStudents } from '../controllers/studentController.js';

const router = express.Router();
const PAGE_SIZE = 20;

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

export default router;
