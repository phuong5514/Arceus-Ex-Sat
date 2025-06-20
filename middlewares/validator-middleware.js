import { body, param, validationResult } from "express-validator";
import Student from "../models/student-model.js";
import Major from "../models/major-model.js";
import Program from "../models/program-model.js";
import Status from "../models/status-model.js";
import t from "../helpers/translator.js";

import fs from "fs";
const config = JSON.parse(fs.readFileSync(new URL("../config/business-rules.json", import.meta.url), "utf-8"));

const validateStudentIdParam = () =>
    param("student_id").trim().notEmpty().isNumeric().isLength({min: 8, max: 8}).withMessage('Có lỗi xảy ra khi truyền dữ liệu');

const validateStudentId = () =>
    body('_id')
        .trim().notEmpty().withMessage((value, { req, location, path }) => t(req.res?.locals?.t, 'student_id_required')).bail() // empty check
        .isNumeric().withMessage('MSSV phải là số').bail() // numeric check
        .isLength({ min: 8, max: 8 }).withMessage('MSSV phải có 8 chữ số').bail() // length check
        .custom(async (value) => { // Check if student id already existed
        const student = await Student.findOne({ _id: value });
        if (student) {
            return Promise.reject('MSSV đã tồn tại');
        }
        }).bail();

const validateName = () =>
    body('name')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'name_required')).bail();

const validateEmail = () =>
    body('email')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'email_required')).bail()
        .isEmail().withMessage((value, { req }) => t(req.res?.locals?.t, 'email_invalid')).bail()
        .custom(async (value) => {
            const student = await Student.findOne({ email: value });
            if (student) {
                return Promise.reject(t(req.res?.locals?.t, 'email_exists'));
            }
        }).bail()
        .custom(email => email.endsWith(config.emailDomain) ? true : Promise.reject(t(req.res?.locals?.t, 'email_domain', config.emailDomain))).bail();

const validateUpdateEmail = () =>
    body('email')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'email_required')).bail()
        .isEmail().withMessage((value, { req }) => t(req.res?.locals?.t, 'email_invalid')).bail()
        .custom(email => email.endsWith(config.emailDomain) ? true : Promise.reject(t(req.res?.locals?.t, 'email_domain', config.emailDomain))).bail();

const validatePhoneNumber = () =>
    body('phone_number')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'phone_required')).bail()
        .custom(async (value) => {
            const student = await Student.findOne({ phone_number: value });
            if (student) {
                return Promise.reject('Số điện thoại đã tồn tại');
            }
        }).bail()
        .matches(config.phoneRegex).withMessage("Số điện thoại phải có định dạng hợp lệ").bail();

const validateUpdatePhoneNumber = () =>
    body('phone_number')
        .trim().notEmpty().withMessage('Số điện thoại không được để trống').bail()
        .custom(async (value, {req}) => {
            const student = await Student.findOne({ phone_number: value });
            if (student && student._id != req.params.student_id) {
                return Promise.reject('Số điện thoại đã tồn tại');
            }
        }).bail()
        .matches(config.phoneRegex).withMessage("Số điện thoại phải có định dạng hợp lệ").bail();

const validateBirthdate = () =>
    body('birthdate')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'birthdate_required')).bail()
        .isISO8601().withMessage((value, { req }) => t(req.res?.locals?.t, 'birthdate_invalid')).bail();

const validateGender = () =>
    body('gender')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'gender_required')).bail()
        .isIn(['Nam', 'Nữ']).withMessage((value, { req }) => t(req.res?.locals?.t, 'gender_invalid')).bail();

const validateClassYear = () =>
    body('class_year')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'class_year_required')).bail()
        .isLength({ min: 4, max: 4 }).withMessage((value, { req }) => t(req.res?.locals?.t, 'class_year_invalid')).bail();

const validateMajor = () =>
    body('major')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'major_required')).bail()
        .custom(async (value) => {
            const major = await Major.findOne({ _id: value });
            if (!major) {
                return Promise.reject(t(req.res?.locals?.t, 'major_not_in_list'));
            }
        }).bail();

const validateProgram = () =>
    body('program')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'program_required')).bail()
        .custom(async (value) => {
            const program = await Program.findOne({ _id: value });
            if (!program) {
                return Promise.reject(t(req.res?.locals?.t, 'program_not_in_list'));
            }
        }).bail();

const validateStatus = () =>
    body('status')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'status_required')).bail()
        .custom(async (value) => {
            const status = await Status.findOne({ _id: value });
            if (!status) {
                return Promise.reject(t(req.res?.locals?.t, 'status_not_in_list'));
            }
        }).bail();


const validateStatusUpdate = () => 
    body('status')
        .trim().notEmpty().withMessage('Trạng thái không được để trống').bail()
        .custom(async (value) => {
            const status = await Status.findOne({ _id: value });
            if (!status) {
                return Promise.reject('Trạng thái không nằm trong danh sách trạng thái có sẵn');
            }
        }).bail()
        .custom(async (value, { req }) => {
            const student = await Student.findOne({ _id: req.params.student_id }).lean();
            if (student == null){
                return Promise.reject('Sinh viên cần sửa không tồn tại');
            }
            const prevStatus = student.status;
            const passlist = config.statusRules[prevStatus];
            if (value != prevStatus && !passlist.includes(value)) {
                return Promise.reject('Không thể chuyển trạng thái từ ' + prevStatus + ' sang ' + value);
            }
        }).bail();

const validateNationality = () =>
    body('nationality')
        .trim().notEmpty().withMessage((value, { req }) => t(req.res?.locals?.t, 'nationality_required')).bail();

const validateIdentityCard = () => [
    body('identity_card._id')
        .optional({ checkFalsy: true }).trim()
        .isLength({ min: 9, max: 12 }).withMessage('CCCD/CMND phải từ 9 đến 12 chữ số').bail()
        // Check if identity card already existed
        .custom(async (value) => {
            const student = await Student.findOne({ "identity_card": value });
            if (student) {
                return Promise.reject('CCCD/CMND đã tồn tại');
            }
        }).bail(),
    body('identity_card.issue_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp CCCD/CMND không hợp lệ").bail(),
    body('identity_card.expiry_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn CCCD/CMND không hợp lệ").bail()
];

const validateUpdateIdentityCard = () => [
    body('identity_card._id')
        .optional({ checkFalsy: true }).trim()
        .isLength({ min: 9, max: 12 }).withMessage('CCCD/CMND phải từ 9 đến 12 chữ số').bail()
        // Check if identity card belongs to another student
        .custom(async (value, { req }) => {
            const student = await Student.findOne({ "identity_card": value });
            if (student && student._id !== req.params.student_id) {
                return Promise.reject('CCCD/CMND đã tồn tại');
            }
        }).bail(),
    body('identity_card.issue_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp CCCD/CMND không hợp lệ").bail(),
    body('identity_card.expiry_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn CCCD/CMND không hợp lệ").bail()
];

const validateUpdatePassport = () => [
    body('passport._id')
        .optional({ checkFalsy: true }).trim()
        .isLength({ min: 9, max: 12 }).withMessage('Hộ chiếu phải từ 9 đến 12 chữ số').bail()
        // Check if passport belongs to another student
        .custom(async (value, { req }) => {
            const student = await Student.findOne({ "passport": value });
            if (student && student._id !== req.params.student_id) {
                return Promise.reject('Hộ chiếu đã tồn tại');
            }
        }).bail(),
    body('passport.issue_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp hộ chiếu không hợp lệ").bail(),
    body('passport.expiry_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn hộ chiếu không hợp lệ").bail()
];

const validatePassport = () => [
    body('passport._id')
        .optional({ checkFalsy: true }).trim()
        .isLength({ min: 9, max: 12 }).withMessage('Hộ chiếu phải từ 9 đến 12 chữ số').bail()
        // Check if passport already existed
        .custom(async (value) => {
            const student = await Student.findOne({ "passport": value });
            if (student) {
                return Promise.reject('Hộ chiếu đã tồn tại');
            }
        }).bail(),
    body('passport.issue_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp hộ chiếu không hợp lệ").bail(),
    body('passport.expiry_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn hộ chiếu không hợp lệ").bail()
];


const handleValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation error:", errors.array());
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
    }

    next();
};

export const validateAddStudent = [
    validateStudentId(),
    validateName(),
    validateEmail(),
    validatePhoneNumber(),
    validateBirthdate(),
    validateGender(),
    validateClassYear(),
    validateMajor(),
    validateProgram(),
    validateStatus(),
    validateNationality(),
    validateIdentityCard(),
    validatePassport(),
    handleValidationResult
];

export const validateUpdateStudent = [
    validateStudentIdParam(),
    validateName(),
    validateUpdateEmail(),
    validateUpdatePhoneNumber(),
    validateBirthdate(),
    validateGender(),
    validateClassYear(),
    validateMajor(),
    validateProgram(),
    validateStatusUpdate(),
    validateNationality(),
    validateUpdateIdentityCard(),
    validateUpdatePassport(),
    handleValidationResult
];