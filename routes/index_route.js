import express from 'express';
import dayjs from 'dayjs';
import superuserClient from '../superuser.js';

const router = express.Router();

function formatStudentData(students) {
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });
}

const PAGE_SIZE = 20;

router.get("/", async (req, res) => {
    const students = await superuserClient.collection("students").getFullList();
    console.log(students);
    // students.forEach(student => {
    //     student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    // });
    formatStudentData(students);
    res.render("index", {title : "Student management system", students: students});
});

router.post("/search", async (req, res) => {  
    const filter = `${req.body.search_by} ~ "${req.body.search}"`;
    const query = req.body.search;
    console.log(`searching for students with ${req.body.param_name}: ${query}`);
    const json = await superuserClient.collection("students").getList(
        1,
        PAGE_SIZE,
        { filter }
    );
    const students = json.items;

    console.log(students);
    formatStudentData(students);
    res.render("index", {title : "Student management system", students: students});
});

router.get("/view/:id", 
    async (req, res) => {
        const response = await fetch(`http://http://127.0.0.1:8090/api/collections/students/records/${req.params.id}`);
        const student = await response.json();
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
        res.render("student", {title : "Student management system", student: student});
    }
)

export default router;
