import express from 'express';
import dayjs from 'dayjs';
import superuserClient from '../superuser.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const students = await superuserClient.collection("students").getFullList();
    
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });

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
