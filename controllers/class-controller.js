import Class from "../models/class-model.js";
import Course from "../models/course-model.js";
import * as courseController from "./course-controller.js";
import t from "../helpers/translator.js";

import { return_error } from "../helpers/error-handler.js";
import QueryValuesEnum from "../helpers/query-values.js";


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
            page: req.query.page || QueryValuesEnum.DEFAULT_QUERY_PAGE,
            limit: req.query.limit || QueryValuesEnum.DEFAULT_PAGE_LIMIT,
            sort: { created_at: QueryValuesEnum.DEFAULT_SORT_ORDER },
            lean: true,
            populate: [
                "course_id",
            ]
        });

        results.docs = results.docs.filter((result) => result.course_id !== null);
        res.render('class', { title: 'Classes', results });
    } catch (err) {
        return_error(res, 500, t(res.locals.t, "internal_server_error"), true)
    }
}

export const getClassDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const current_class = await Class.findById({ _id: id }).lean();
        if (!current_class) return res.status(404).json({ ok: false, message: t(res.locals.t, "class_not_found", id) });
        const formatted_created_at = current_class.created_at.toLocaleString('vi-VN', options);
        res.render('class-detail', { current_class, formatted_created_at });

    } catch (err) {
        return_error(res, 500, t(res.locals.t, "internal_server_error"), true)
    }
}

export const getClassDetailEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const current_class = await Class.findById({ _id: id }).lean();
        if (!current_class) return res.status(404).json({ ok: false, message: t(res.locals.t, "class_not_found", id) });
        const courses = await courseController.getAvailableCourses();

        res.render('class-detail-edit', { current_class, courses });

    } catch (err) {
        return_error(res, 500, t(res.locals.t, "internal_server_error"), true)
    }
}

export const getClassDetailAdd = async (_req, res) => {
    try {
        const courses = await courseController.getAvailableCourses();
        res.render('class-detail-edit', { current_class: null, courses });
    } catch (err) {
        return_error(res, 500, t(res.locals.t, "internal_server_error"), true)
    }
}

export const createClass = async (req, res) => {
    try {
        const { _id, course_id, academic_year, semester, lecturer, max_students, schedule, classroom } = req.body;

        const existingClass = await Class.findOne({ _id });
        if (existingClass) {
            throw new Error(t(res.locals.t, "class_already_exists"));
        }

        await checkData(res, req.body);

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
        res.status(200).json({ ok: true, message: t(res.locals.t, "add_class_success") });
    } catch (err) {
        return_error(res, 400, err.message, true)
    }
}

export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id, academic_year, semester, lecturer, max_students, schedule, classroom } = req.body;
        let classToUpdate = await Class.findOne({ _id: id });
        if (!classToUpdate) {
            throw new Error(t(res.locals.t, "class_not_found", id));
        }

        await checkData(res, req.body);

        classToUpdate.set({
            course_id: course_id ?? classToUpdate.course_id,
            academic_year: academic_year ?? classToUpdate.academic_year,
            semester: semester ?? classToUpdate.semester,
            lecturer: lecturer ?? classToUpdate.lecturer,
            max_students: max_students ?? classToUpdate.max_students,
            schedule: schedule ?? classToUpdate.schedule,
            classroom: classroom ?? classToUpdate.classroom,
        });

        await classToUpdate.save();
        res.status(200).json({ ok: true, message: t(res.locals.t, "update_class_success") });
    } catch(err) {
        return_error(res, 400, err.message, true)
    }
}

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classToDelete = await Class.findOne({ _id: id });
        if (!classToDelete) {
            throw new Error(t(res.locals.t, "class_not_found", id));
        }

        await Class.deleteOne({ _id: id });
        res.status(200).json({ ok: true, message: t(res.locals.t, "delete_class_success") });
    } catch (err) {
        return_error(res, 400, err.message, true)
    }
}

async function checkData(res, data) {
    checkMissingField(res, data)
    checkMaxStudentCount(res, data.max_students)
    checkAcademicYear(res, data.academic_year)
    checkSemester(res, data.semester)
    await checkCourse(res, data.course_id)

    return true;
}

function checkMissingField(res, data) {
    const missingFields = [];
    if (!data.course_id) {
        missingFields.push(t(res.locals.t, "courses"));
    }
    if (!data.academic_year) {
        missingFields.push(t(res.locals.t, "academic_year"));
    }
    if (!data.semester) {
        missingFields.push(t(res.locals.t, "semester"));
    }
    if (!data.lecturer) {
        missingFields.push(t(res.locals.t, "lecturer"));
    }
    if (!data.max_students) {
        missingFields.push(t(res.locals.t, "total_students"));
    }
    if (missingFields.length > 0) {
        throw new Error(t(res.locals.t, "fill_all_required_fields", missingFields.join(", ")));
    }
}

function checkMaxStudentCount(res, max_students) {
    const num = Number(max_students);
    if (!Number.isInteger(num)) {
        throw new Error(t(res.locals.t, "max_students_must_be_integer"));
    }
    if (num < 1) {
        throw new Error(t(res.locals.t, "max_students_must_be_positive"));
    }
}

function checkAcademicYear(res, year) {
    const regex = /^\d{4}-\d{4}$/;
    if (!regex.test(year)) {
        throw new Error(t(res.locals.t, "invalid_academic_year_format"));
    }
}

function checkSemester(res, semester) {
    // TODO: change the hard coded array
    if (!["1", "2", "summer"].includes(semester)) {
        throw new Error(t(res.locals.t, "invalid_semester", semester));
    }
}

async function checkCourse(res, course_id) {
    const courseExists = await Course.findOne({ _id: course_id });
    if (!courseExists) {
        throw new Error(t(res.locals.t, "course_not_found", course_id));
    }
}