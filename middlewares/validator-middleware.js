import {body} from "express-validator";
import { validationResult } from "express-validator";
import { assert } from "console";

import fs from "fs";
const config = JSON.parse(fs.readFileSync(new URL("../config/business-rule.json", import.meta.url), "utf-8"));

const validateStudentId = () =>
    body('_id')
        .trim().notEmpty().withMessage('MSSV không được để trống').bail() // empty check
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
        .trim().notEmpty().withMessage('Họ tên không được để trống').bail();

const validateEmail = () =>
    body('email')
        .trim().notEmpty().withMessage('Email không được để trống').bail()
        .isEmail().withMessage('Email không hợp lệ').bail()
        .custom(async (value) => {
            const student = await Student.findOne({ email: value });
            if (student) {
                return Promise.reject('Email đã tồn tại');
            }
        }).bail()
        .custom(email => email.endsWith(config.emailDomain) ? true : Promise.reject("Email phải thuộc domain cho phép"));

const validatePhoneNumber = () =>
    body('phone_number')
        .trim().notEmpty().withMessage('Số điện thoại không được để trống').bail()
        .isLength({ min: 10, max: 11 }).withMessage('Số điện thoại phải từ 10 đến 11 chữ số').bail()
        .custom(async (value) => {
            const student = await Student.findOne({ phone_number: value });
            if (student) {
                return Promise.reject('Số điện thoại đã tồn tại');
            }
        }).bail()
        .matches(config.phoneRegex).withMessage("Số điện thoại phải có định dạng hợp lệ").bail();

const validateBirthdate = () =>
    body('birthdate')
        .trim().notEmpty().withMessage('Ngày sinh không được để trống').bail()
        .isISO8601().withMessage('Ngày sinh không hợp lệ').bail();

const validateGender = () =>
    body('gender')
        .trim().notEmpty().withMessage('Giới tính không được để trống').bail()
        .isIn(['Nam', 'Nữ']).withMessage('Giới tính phải là Nam hoặc Nữ').bail();

const validateClassYear = () =>
    body('class_year')
        .trim().notEmpty().withMessage('Khóa không được để trống').bail()
        .isLength({ min: 4, max: 4 }).withMessage('Năm học phải là 4 chữ số').bail();

const validateMajor = () =>
    body('major')
        .trim().notEmpty().withMessage('Khoa không được để trống').bail()
        .custom(async (value) => {
            const major = await Major.findOne({ _id: value });
            if (!major) {
                return Promise.reject('Ngành học không nằm trong danh sách ngành học có sẵn');
            }
        }).bail();

const validateProgram = () =>
    body('program')
        .trim().notEmpty().withMessage('Chương trình học không được để trống').bail()
        .custom(async (value) => {
            const program = await Program.findOne({ _id: value });
            if (!program) {
                return Promise.reject('Chương trình học không nằm trong danh sách chương trình học có sẵn');
            }
        }).bail();

const validateStatus = () =>
    body('status')
        .trim().notEmpty().withMessage('Trạng thái không được để trống').bail()
        .custom(async (value) => {
            const status = await Status.findOne({ _id: value });
            if (!status) {
                return Promise.reject('Trạng thái không nằm trong danh sách trạng thái có sẵn');
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
        .custom(async (value) => {
            const oldStatus = await Student.findOne({ _id: req.params.student_id }).select('status');
            const passlist = config.statusRules[oldStatus][value];
            if (!passlist.includes(req.user.role)) {
                return Promise.reject('Không thể chuyển trạng thái từ ' + oldStatus + ' sang ' + value);
            }
        }).bail();

const validateNationality = () =>
    body('nationality')
        .trim().notEmpty().withMessage('Quốc tịch không được để trống').bail();

const validateIdentityCard = () => [
    body('identity_card._id')
        .optional({ checkFalsy: true }).trim().bail(),
    body('identity_card.issue_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày cấp CCCD/CMND không hợp lệ").bail(),
    body('identity_card.expiry_date')
        .optional({ checkFalsy: true }).trim().isISO8601().withMessage("Ngày hết hạn CCCD/CMND không hợp lệ").bail()
];

const validatePassport = () => [
    body('passport._id')
        .optional({ checkFalsy: true }).trim().bail(),
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
    validateName(),
    validateEmail(),
    validatePhoneNumber(),
    validateBirthdate(),
    validateGender(),
    validateClassYear(),
    validateMajor(),
    validateProgram(),
    validateStatusUpdate(),
    validateNationality(),
    validateIdentityCard(),
    validatePassport(),
    handleValidationResult
];