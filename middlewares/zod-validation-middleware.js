import { z } from 'zod';
import Student from '../models/student-model.js';
import Major from '../models/major-model.js';
import Program from '../models/program-model.js';
import Status from '../models/status-model.js';
import fs from 'fs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

const config = JSON.parse(
  fs.readFileSync(new URL('../config/business-rules.json', import.meta.url), 'utf-8')
);

function zodMergeSchemas(schema1, schema2) {
  return z.object({
    ...schema1.shape,
    ...schema2.shape,
  });
}

function zodAddress() {
  return z.object({
    _id: z.string().trim().optional(),
    house_number: z.string().optional(),
    street: z.string().trim().optional(),
    ward: z.string().trim().optional(),
    district: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
  });
}

function zodDateTimeFormat(format, dateName = "Ngày") {
  return z.string().trim().refine((data) => {
    const parsedDate = dayjs(data, format, true);
    return parsedDate.isValid();
  }, {message: `${dateName} không thuộc định dạng ${format}`})
  .transform(data => {
    const parsedDate = dayjs(data, format, true);
    return parsedDate.isValid() ? parsedDate.toISOString() : null;
  });
}

dayjs.extend(customParseFormat);

// Base schema
export const studentBaseSchema = z.object({
  _id: z.string().regex(/^\d{8}$/, 'MSSV phải có 8 chữ số'),
  name: z.string().trim().min(1, 'Họ tên không được để trống'),
  email: z.string().trim().email('Email không thuộc định dạng hợp lệ').refine(email => email.endsWith(config.emailDomain), {
    message: `Email phải thuộc domain: ${config.emailDomain}`,
  }),
  phone_number: z.string().trim().regex(new RegExp(config.phoneRegex), 'Số điện thoại không thuộc định dạng hợp lệ'),
  birthdate: zodDateTimeFormat('YYYY-MM-DD', 'Ngày sinh'),
  gender: z.enum(['Nam', 'Nữ']),
  class_year: z.number().int('Khóa phải là số nguyên').gte(2000, 'Khóa phải lớn hơn hoặc bằng 2000').lte(2100, 'Khóa phải nhỏ hơn hoặc bằng 2100'),
  major: z.string().trim(),
  program: z.string().trim(),
  status: z.string().trim(),
  nationality: z.string().trim(),
  identity_card: z
    .object({
      _id: z.string().trim().min(9).max(12),
      issue_date: zodDateTimeFormat('YYYY-MM-DD', 'Ngày cấp CMND/CCCD').optional(),
      expiry_date: zodDateTimeFormat('YYYY-MM-DD', 'Ngày hết hạn CMND/CCCD').optional(),
    })
    .optional().nullable(),
  passport: z
    .object({
      _id: z.string().trim().min(8).max(12),
      issue_date: zodDateTimeFormat('YYYY-MM-DD', 'Ngày cấp hộ chiếu').optional(),
      expiry_date: zodDateTimeFormat('YYYY-MM-DD', 'Ngày hết hạn hộ chiếu').optional(),
    })
    .optional().nullable(),
  permanent_address: zodAddress().optional().nullable(),
  temporary_address: zodAddress().optional().nullable(),
  mailing_address: zodAddress().optional().nullable(),
});

export const studentCategorySchema = z.object()
  .superRefine(async (data, ctx) => {
    if (!(await Status.findOne({ _id: data.status }))) {
      ctx.addIssue({
      path: ['status'],
      message: `Trạng thái ${data.status} không nằm trong mã trạng thái có sẵn`,
      code: z.ZodIssueCode.custom,
      });
    }

    if (!(await Program.findOne({ _id: data.program }))) {
      ctx.addIssue({
        path: ['program'],
        message: `Chương trình ${data.program} không nằm trong mã chương trình có sẵn`,
        code: z.ZodIssueCode.custom,
      })
    }

    if (!(await Major.findById({ _id: data.major }))) {
      ctx.addIssue({
        path: ['major'],
        message: `Chuyên ngành ${data.major} không nằm trong mã chuyên ngành có sẵn`,
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const studentAddSchema = zodMergeSchemas(studentBaseSchema, studentCategorySchema)
  .superRefine(async (data, ctx) => {
    if (await Student.findOne({ _id: data._id })) {
      ctx.addIssue({
        path: ['_id'],
        message: 'MSSV đã tồn tại',
        code: z.ZodIssueCode.custom,
      });
    }

    if (await Student.findOne({ email: data.email })) {
      ctx.addIssue({
        path: ['email'],
        message: 'Email đã tồn tại',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const studentUpdateSchema = zodMergeSchemas(studentBaseSchema, studentCategorySchema)
  .superRefine(async (data, ctx) => {
    if (!(await Student.findOne({ _id: data._id }))) {
      ctx.addIssue({
        path: ['_id'],
        message: 'MSSV không tồn tại',
        code: z.ZodIssueCode.custom,
      });
    }

    const studentWithSameEmail = await Student.findOne({ email: data.email, _id: { $ne: data._id } });
    if (studentWithSameEmail) {
      ctx.addIssue({
        path: ['email'],
        message: `Email đã tồn tại cho sinh viên ${studentWithSameEmail._id}`,
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.identity_card) {
      const studentWithSameIdCard = await Student.findOne({
        'identity_card._id': data.identity_card?._id,
        _id: { $ne: data._id },
      });
      if (studentWithSameIdCard){
        ctx.addIssue({
          path: ['identity_card'],
          message: `Số CMND/CCCD đã tồn tại cho sinh viên ${studentWithSameIdCard._id}`,
          code: z.ZodIssueCode.custom,
        })
      }
    }

    if (data.passport) {
      const studentWithSamePassport = await Student.findOne({
        'passport._id': data.passport?._id,
        _id: { $ne: data._id },
      });
      if (studentWithSamePassport) {
        ctx.addIssue({
        path: ['passport'],
        message: `Số hộ chiếu đã tồn tại cho sinh viên ${studentWithSamePassport._id}`,
        code: z.ZodIssueCode.custom,
        });
      }
    }

  });