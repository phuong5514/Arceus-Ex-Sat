// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { populate } from "dotenv";
import Class from "../models/class-model.js";
import Course from "../models/course-model.js";

const defaultPageLimit = 20;

const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

export const getAllClasses = async (req, res) => {
    try {
        const results = await Class.paginate({}, {
            pagination: true,
            page: req.query.page || 1,
            limit: req.query.limit || defaultPageLimit,
            sort: { created_at: -1 },
            lean: true,
            populate: [
                "course_id",
            ]
        });

        results.docs = results.docs.filter((result) => result.course_id !== null);
        console.log(results.docs);
        res.render('class', { title: 'Classes', results });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
}

export const getClassDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const current_class = await Class.findById({ _id: id }).lean();
        if (!current_class) return res.status(404).json({ ok: false, message: `Không tìm thấy lớp học với mã ${id}` });
        const formatted_created_at = current_class.created_at.toLocaleString('vi-VN', options);
        res.render('class-detail', { current_class, formatted_created_at });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: err.message });
    }
}

export const getClassDetailEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const current_class = await Class.findById({ _id: id }).lean();
        if (!current_class) return res.status(404).json({ ok: false, message: `Không tìm thấy lớp học với mã ${id}` });
        res.render('class-detail-editor', { current_class });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: err.message });
    }
}

export const getClassDetailAdd = async (req, res) => {
    try {
        res.render('class-detail-editor', { current_class: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: err.message });
    }
}

export const createClass = async (req, res) => {
    try {
        const { _id, course_id, academic_year, semester, lecturer, max_students, schedule, classroom } = req.body;

        const existingClass = await Class.findOne({ _id });
        if (existingClass) {
            throw new Error("Mã lớp học đã tồn tại.");
        }

        await checkData(req.body);

        const newClass = new Class({
            _id,
            course_id,
            academic_year,
            semester,
            lecturer,
            max_students,
            schedule: schedule || null,
            classroom: classroom || null,
            created_at: new Date()
        });

        await newClass.save();
        res.status(200).json({ ok: true, message: "" });;
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
        // res.status(500).json({ success: false, message: err.message });
        console.error(err);
    }
}

export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id, academic_year, semester, lecturer, max_students, schedule, classroom } = req.body;
        let classToUpdate = await Class.findOne({ _id: id });
        if (!classToUpdate) {
            throw new Error(`Không tìm thấy lớp học với mã ${id}`);
        }

        await checkData(req.body);

        classToUpdate.course_id = course_id || classToUpdate.course_id;
        classToUpdate.academic_year = academic_year || classToUpdate.academic_year;
        classToUpdate.semester = semester || classToUpdate.semester;
        classToUpdate.lecturer = lecturer || classToUpdate.lecturer;
        classToUpdate.max_students = max_students || classToUpdate.max_students;
        classToUpdate.schedule = schedule || classToUpdate.schedule;
        classToUpdate.classroom = classroom || classToUpdate.classroom;

        await classToUpdate.save();
        res.status(200).json({ ok: true, message: "" });
    } catch(err) {
        res.status(500).json({ ok: false, message: err.message });
        console.error(err);
    }
}

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classToDelete = await Class.findOne({ _id: id });
        if (!classToDelete) {
            throw new Error(`Không tìm thấy lớp học với mã ${id}`);
        }

        await Class.deleteOne({ _id: id });
        res.status(200).json({ ok: true, message: "" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
        console.error(err);
    }
}

async function checkData(data) {
    if (!data.course_id || !data.academic_year || !data.semester || !data.lecturer || !data.max_students) {
        throw new Error("Vui lòng điền đầy đủ thông tin.");
    }

    if (data.max_students < 1) {
        throw new Error("Số lượng sinh viên tối đa phải >= 1.");
    }

    if (data.academic_year.length !== 9 || !/^\d{4}-\d{4}$/.test(data.academic_year)) {
        throw new Error("Năm học không hợp lệ. Vui lòng nhập theo định dạng YYYY-YYYY.");
    }

    if (!["1", "2", "Hè"].includes(data.semester)) {
        throw new Error("Học kỳ không hợp lệ. Vui lòng nhập 1, 2, hoặc Hè.");
    }

    const courseExists = await Course.findOne({ _id: data.course_id });
    if (!courseExists) {
        throw new Error(`Khóa học ${data.course_id} không tồn tại.`);
    }

    return true;
}
