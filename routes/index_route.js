import express, { query } from 'express';
import dayjs from 'dayjs';
import superuserClient from '../superuser.js';


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

router.get("/", async (req, res) => {
    const students = await superuserClient.collection("students").getFullList();
    formatStudentData(students);
    res.render("index", {title : "Student management system", students: students, query: "", search_by: "student_id"});
});

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


router.put("/students/:student_id", async (req, res) => {
    const studentId = req.params.student_id;
    const student = req.body;
    
    try {
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

        student.birthdate = dayjs(student.birthdate).format('YYYY-MM-DD');

        const students = await superuserClient.collection("students").getList(1, 1, {
            filter: `student_id = "${studentId}"`,
        });

        if (students.items.length === 0) {
            throw new Error("Không tìm thấy sinh viên");
        }
        const recordId = students.items[0].id;
        const record = await superuserClient.collection("students").update(recordId, student);
        
        res.status(200).json({ok: true, record});
    } catch (error) {
        if (typeof error === "ClientResponseError"){
            return res.status(400).json({ok: false, error: "Dữ liệu không hợp lệ"});
        } else {
            res.status(400).json({ok: false, error:error.message});
        }
    }
});


router.delete("/students", async (req, res) => {
    const { student_ids } = req.body; // Extract student_ids array from request body

    try {
        // Validate input
        if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
            throw new Error("Danh sách mã số sinh viên không hợp lệ hoặc rỗng");
        }

        // Delete each student by their student_id
        const deletePromises = student_ids.map(async (student_id) => {
            // Find the student record by student_id (assuming student_id is a field, not the record ID)
            const students = await superuserClient.collection("students").getList(1, 1, {
                filter: `student_id = "${student_id}"`,
            });

            if (students.items.length === 0) {
                throw new Error(`Không tìm thấy sinh viên với MSSV: ${student_id}`);
            }

            // Delete the student record using the PocketBase record ID
            const recordId = students.items[0].id;
            return superuserClient.collection("students").delete(recordId);
        });

        // Wait for all deletions to complete
        await Promise.all(deletePromises);

        res.status(200).json({ ok: true, message: "Xóa sinh viên thành công" });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
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
