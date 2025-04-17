import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import Class from "../models/class-model.js";

dayjs.extend(customParseFormat);
const DEFAULT_PAGE_LIMIT = 10;

export const getAllClasses = async (req, res) => {
    try {
        const result = await Class.paginate({}, {
            pagination: true,
            page: req.query.page || 1,
            limit: req.query.limit || DEFAULT_PAGE_LIMIT,
            sort: { created_at: -1 },
            lean: true,
        });

        result.docs.forEach(current_class => {
            current_class.created_at.text = dayjs(current_class.created_at).format("DD/MM/YYYY");
        });

        res.render('class', { title: 'Classes', results: result });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
}

export const getClassDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const current_class = await Class.findById({ _id: id }).lean();
        if (!current_class) return res.status(404).json({ ok: false, message: `Không tìm thấy lớp học với mã ${id}` });
        res.render('class-detail', { current_class });

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
        res.render('class-detail-edit', { current_class });

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

        if (max_students < 1) {
            throw new Error("Số lượng sinh viên tối đa phải >= 1.");
        }

        const courseExists = await Class.findOne({ _id: course_id });
        if (!courseExists) {
            throw new Error("Khóa học không tồn tại.");
        }

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
        res.status(201).json(newClass);
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
        let classToUpdate = await Class.findOne({ id });
        if (!classToUpdate) {
            throw new Error(`Không tìm thấy lớp học với mã ${id}`);
        }

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

