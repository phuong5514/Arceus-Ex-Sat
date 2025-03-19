import express, { query } from 'express';
import dayjs from 'dayjs';
import { addStudent, deleteStudents, getAllStudents, updateStudent } from '../controllers/studentController.js';

const majorList = ["Kinh tế", "Tiếng Anh thương mại", "Luật", "Tiếng Nhật", "Tiếng Pháp"];
const statusList = ["Đang học", "Đã thôi học", "Đã tốt nghiệp", "Tạm dừng học"];
const genderList = ["Nam", "Nữ"];
const programList = ["Chính quy", "Chất lượng cao", "Tài năng", "Tiên tiến"];

const router = express.Router();
const PAGE_SIZE = 20;

function formatStudentData(students) {
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });
}

router.get("/", getAllStudents);

router.post("/search", async (req, res) => {  
    const query = req.body.search;
    const search_by = req.body.search_by;

    if (!query || query.trim() === "") {
        const students = await superuserClient.collection("students").getFullList();
        formatStudentData(students);
        return res.render("index", {title : "Student management system", students: students, query: "", search_by: search_by});
    }

    const regex = /^[\p{L}\p{N}\s]+$/u;

    if (regex.test(query) === false) {
        // return res.status(400).json({ok: false, error: "Dữ liệu không hợp lệ"}) 
        return res.render("index", {title : "Student management system", students: [], query: query, search_by: search_by, error: "Dữ liệu không hợp lệ"});
    };

    const filter = `${search_by} ~ "${query}"`;
    const json = await superuserClient.collection("students").getList(
        1,
        PAGE_SIZE,
        { 
            filter
        }
    );
    const students = json.items;

    formatStudentData(students);
    res.render("index", {title : "Student management system", students: students, query: query, search_by: search_by});
});

router.post("/students", addStudent);

router.put("/students/:student_id", updateStudent);

router.delete("/students", deleteStudents);

export default router;
