const express = require('express');
const router = express.Router();

// import dayjs from "dayjs";
const dayjs = require('dayjs');

router.get("/", async (req, res) => {
    const response = await fetch('http://127.0.0.1:8090/api/collections/students/records');
    const data = await response.json();
    // console.log(data);
    const students = data.items;
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

module.exports = router;
