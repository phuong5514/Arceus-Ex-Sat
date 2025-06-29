# Tiêu Chuẩn Mã Nguồn - Hệ Thống Quản Lý Sinh Viên

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
3. [Quy Ước Đặt Tên](#quy-ước-đặt-tên)
4. [Quy Tắc Viết Mã](#quy-tắc-viết-mã)
5. [Xử Lý Lỗi và Validation](#xử-lý-lỗi-và-validation)
6. [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
7. [API Design](#api-design)
8. [Testing](#testing)
9. [Logging](#logging)

## Tổng Quan

Tài liệu này mô tả các tiêu chuẩn mã nguồn được áp dụng trong dự án Hệ Thống Quản Lý Sinh Viên. Các tiêu chuẩn này được thiết kế để đảm bảo tính nhất quán, khả năng bảo trì và mở rộng của hệ thống.

## Cấu Trúc Dự Án

Dự án được tổ chức theo cấu trúc MVC (Model-View-Controller) với các thư mục chính sau:

```
project/
├── config/         # Cấu hình hệ thống
│   ├── db.js
│   └── business-rules.json
├── controllers/    # Xử lý logic nghiệp vụ
├── helpers/        # Các hàm tiện ích
├── middlewares/    # Middleware Express
│   ├── logger-middleware.js
│   └── validator-middleware.js
├── models/         # Schema và model database
├── public/         # Tài nguyên tĩnh
│   ├── css/
│   ├── images/
│   └── javascripts/
├── routes/         # Định nghĩa route
├── test/          # Unit test
├── validators/    # Xác thực dữ liệu
└── views/         # Template EJS
```

## Quy Ước Đặt Tên

### File và Thư Mục
- Sử dụng kebab-case cho tên file và thư mục
- Ví dụ: `student-controller.js`, `class-model.js`

### Class và Interface
- Sử dụng PascalCase cho tên class và interface
- Ví dụ: `StudentController`, `ClassModel`

### Hàm và Biến
- Sử dụng camelCase cho tên hàm và biến
- Ví dụ: `getAllStudents()`, `studentList`

## Quy Tắc Viết Mã

### Import/Export
- Sử dụng ES modules thay vì CommonJS
- Nhóm các import theo thứ tự: external packages, internal modules
- Ví dụ:
```javascript
import express from 'express';
import { Student } from '../models/student-model.js';
import { validateStudent } from '../validators/student-validator.js';
```

### Định Dạng Mã
- Sử dụng 2 khoảng trắng cho thụt lề
- Độ dài tối đa của một dòng: 100 ký tự
- Sử dụng dấu chấm phẩy ở cuối câu lệnh
- Sử dụng dấu ngoặc nhọn cho tất cả các khối lệnh

## Xử Lý Lỗi và Validation

### Xử Lý Lỗi
- Sử dụng try-catch cho tất cả các thao tác bất đồng bộ
- Trả về response với format chuẩn:
```javascript
{
  ok: false,
  message: "Mô tả lỗi"
}
```

### Validation
- Sử dụng express-validator và zod cho validation
- Tách biệt logic validation vào các file riêng trong thư mục `validators/`
- Validate tất cả dữ liệu đầu vào trước khi xử lý

### Response Format
```javascript
{
  ok: true/false,
  data: {}, // Dữ liệu trả về
  message: "" // Thông báo
}
```

Ví dụ:

1. Hàm `getAllStudents` trong `controllers/student-controller.js`:
```javascript
export const getAllStudents = async (req, res) => {
  try {
    const results = await fetchAndFormatStudents({}, {
      page: req.query.page || QueryValuesEnum.DEFAULT_QUERY_PAGE,
      limit: req.query.limit || QueryValuesEnum.DEFAULT_PAGE_LIMIT,
    });
    const majors = await Major.find().lean();
    const status = await Status.find().lean();
    const programs = await Program.find().lean();
    res.render("index", { title: "Student management system", results, majors, status, programs, queryString: "", queryData: null });
  } catch (error) {
    console.error("Error getting students:", error.message);
    res.status(500).json({ ok: false, message: "Lỗi lấy danh sách sinh viên: " + error.message });
  }
};
```

2. Hàm `handleValidationResult` trong `middlewares/validator-middleware.js`:
```javascript
const handleValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation error:", errors.array());
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
    }
    next();
};
```

Các hàm này minh họa cách xử lý response theo chuẩn:
- Thành công: Trả về `ok: true` kèm dữ liệu hoặc thông báo
- Thất bại: Trả về `ok: false` kèm thông báo lỗi
- Sử dụng HTTP status code phù hợp (200, 400, 500, etc.)

## Cơ Sở Dữ Liệu

### Schema Design
- Định nghĩa rõ ràng các kiểu dữ liệu trong Mongoose Schema
- Sử dụng các validation có sẵn của Mongoose
- Ví dụ:
```javascript
const StudentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});
```

### Queries
- Sử dụng async/await cho tất cả các thao tác database
- Implement pagination cho các danh sách lớn
- Sử dụng lean queries khi có thể

## API Design

### RESTful Endpoints
- Sử dụng danh từ số nhiều cho tên resource
- Tuân thủ các HTTP methods:
  - GET: Lấy dữ liệu
  - POST: Tạo mới
  - PUT/PATCH: Cập nhật
  - DELETE: Xóa

### Response Format
```javascript
{
  ok: true/false,
  data: {}, // Dữ liệu trả về
  message: "" // Thông báo
}
```

## Testing

### Unit Tests
- Sử dụng Jest làm testing framework
- Viết test cho tất cả các hàm quan trọng
- Tách biệt test setup và teardown

### Test Structure
```javascript
describe('Component Name', () => {
  beforeAll(() => {
    // Setup
  });

  afterAll(() => {
    // Cleanup
  });

  test('should do something', () => {
    // Test case
  });
});
```

## Logging

### Logging Standards
- Sử dụng middleware logging cho tất cả các request
- Log các thông tin: timestamp, method, URL, status code, duration
- Phân loại log theo mức độ: error, warn, info, debug

### Log Format
```
[timestamp] method url - statusCode - duration
```