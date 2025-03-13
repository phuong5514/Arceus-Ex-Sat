import express from 'express';
import dayjs from 'dayjs';
import superuserClient from '../superuser.js';

const router = express.Router();

const majorList = ["Kinh tế", "Tiếng Anh thương mại", "Luật", "Tiếng Nhật", "Tiếng Pháp"];
const statusList = ["Đang học", "Đã thôi học", "Đã tốt nghiệp", "Tạm dừng học"];
const genderList = ["Nam", "Nữ"];
const programList = ["Chính quy", "Chất lượng cao", "Tài năng", "Tiên tiến"];

router.get("/", async (req, res) => {
    const students = await superuserClient.collection("students").getFullList();
    
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });

    res.render("index", {title : "Student management system", students: students});
});

router.post("/students", async (req, res) => {
    const student = req.body;
    try {
        // all fields are required
        if (!student.name || student.name.trim() === "") {
            throw new Error("Tên không được để trống");
        }
        if (!student.email || student.email.trim() === "") {
            throw new Error("Email không được để trống");
        } else if (!student.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            throw new Error("Email không hợp lệ");
        }
        if (!student.phone_number || student.phone_number.trim() === "") {
            throw new Error("Số điện thoại không được để trống");
        } else if (!student.phone_number.match(/^[0-9]{10,11}$/)) {
            throw new Error("Số điện thoại phải từ 10 đến 11 chữ số");
        }
        if (!student.address || student.address.trim() === "") {
            throw new Error("Địa chỉ không được để trống");
        }
        if (!student.major || student.major.trim() === "") {
            throw new Error("Ngành học không được để trống");
        } else if (!majorList.includes(student.major)) {
            throw new Error("Ngành học không nằm trong danh sách ngành học hợp lệ");
        }
        if (!student.class_year || student.class_year.trim() === "") {
            throw new Error("Năm học không được để trống");
        } else if (!student.class_year.match(/^[0-9]{4}$/)) {
            throw new Error("Năm học phải là 4 chữ số");
        }
        if (!student.program || student.program.trim() === "") {
            throw new Error("Chương trình học không được để trống");
        } else if (!programList.includes(student.program)) {
            throw new Error("Chương trình học không nằm trong danh sách chương trình học hợp lệ");
        }
        if (!student.status || student.status.trim() === "") {
            throw new Error("Trạng thái không được để trống");
        } else if (!statusList.includes(student.status)) {
            throw new Error("Trạng thái không nằm trong danh sách trạng thái hợp lệ");
        }
        if (!student.gender || student.gender.trim() === "") {
            throw new Error("Giới tính không được để trống");
        } else if (!genderList.includes(student.gender)) {
            throw new Error("Giới tính phải là Nam hoặc Nữ");
        }
        if (!student.birthdate || student.birthdate.trim() === "") {
            throw new Error("Ngày sinh không được để trống");
        }
        
        student.birthdate = dayjs(student.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD');

        const record = await superuserClient.collection("students").create(student);
        res.status(200).json({ok: true, record});
    } catch (error) {
        if (typeof error === "ClientResponseError"){
            return res.status(400).json({ok: false, error: "Dữ liệu không hợp lệ"});
        } else {
            res.status(400).json({ok: false, error:error.message});
        }
    }
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
