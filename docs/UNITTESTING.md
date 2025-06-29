# Hướng Dẫn Unit Testing Arceus-Ex-Sat

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Framework Testing](#framework-testing)
3. [Hướng Dẫn Unit Testing](#hướng-dẫn-unit-testing)
4. [Cấu Trúc và Tổ Chức Test](#cấu-trúc-và-tổ-chức-test)
5. [Viết Test Hiệu Quả](#viết-test-hiệu-quả)
6. [Testing Database](#testing-database)
7. [Testing Validation](#testing-validation)
8. [Best Practices](#best-practices)
9. [Quy Trình Phát Triển](#quy-trình-phát-triển)
10. [Xử Lý Sự Cố](#xử-lý-sự-cố)

## Tổng Quan

Hướng dẫn này cung cấp các hướng dẫn Unit Testing toàn diện cho Hệ Thống Quản Lý Sinh Viên Arceus-Ex-Sat. Unit testing là một thực hành cơ bản để đảm bảo độ tin cậy và khả năng bảo trì của mã trong ứng dụng Node.js, Express.js và MongoDB của chúng ta.

### Tính Năng Testing Chính
- **Jest Framework**: Framework testing chính với MongoDB Memory Server
- **Testing Cô Lập**: Mỗi test chạy độc lập với trạng thái database sạch
- **Bao Phủ Toàn Diện**: CRUD operations, validation, business logic
- **Factory Pattern**: Tạo dữ liệu test nhất quán
- **Validation Testing**: Zod schema validation với business rules

## Framework Testing

### Cấu Hình Jest
Dự án sử dụng Jest làm framework testing chính với cấu hình sau:

```javascript
// tests/jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transform: {} // Tắt transformations cho ES modules
};
```

### Thiết Lập Môi Trường Test
Môi trường test sử dụng MongoDB Memory Server để testing cô lập:

```javascript
// tests/helpers/test-setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

export const connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
```

## Hướng Dẫn Unit Testing

### Tổng Quan
Unit testing là một thực hành cơ bản trong dự án Arceus-Ex-Sat để đảm bảo độ tin cậy và khả năng bảo trì của mã. Phần này cung cấp hướng dẫn toàn diện để viết unit test hiệu quả dựa trên best practices của ngành và nhu cầu cụ thể của Hệ Thống Quản Lý Sinh Viên của chúng ta.

### Nguyên Tắc Cốt Lõi
1. **Cô Lập**: Mỗi test phải độc lập và không phụ thuộc vào các test khác
2. **Trách Nhiệm Đơn**: Mỗi test phải kiểm tra một hành vi cụ thể
3. **Dễ Đọc**: Tên test phải mô tả rõ ràng hành vi mong đợi
4. **Dễ Bảo Trì**: Test phải dễ hiểu và sửa đổi
5. **Đáng Tin Cậy**: Test phải xác định và không bị lỗi

### Unit Tests Hiện Có trong Arceus-Ex-Sat

Dự án hiện bao gồm unit tests toàn diện cho tất cả các thành phần chính:

#### 1. Tests Quản Lý Sinh Viên (`tests/unit/student.test.js`)
**Kích Thước File**: 22KB, 714 dòng
**Bao Phủ**: CRUD operations hoàn chỉnh, validation, chức năng tìm kiếm

**Danh Mục Test**:
- **CRUD Operations**: Tạo, Đọc, Cập Nhật, Xóa hồ sơ sinh viên
- **Validation Tests**: Định dạng email, ngày sinh, số điện thoại, giới tính, năm lớp
- **Chức Năng Tìm Kiếm**: Tìm kiếm theo tên, tìm kiếm nhiều tiêu chí
- **Tính Toàn Vẹn Dữ Liệu**: Quan hệ khóa ngoại với Address, IdentityCard, Passport
- **Trường Hợp Đặc Biệt**: Ký tự đặc biệt, độ dài tối đa, thao tác đồng thời

**Ví Dụ Test Chính**:
```javascript
// CRUD Operations
test('should successfully add a new student with valid data', async () => {
  const { sampleStudent } = await setupTestData();
  const newStudent = await Student.create(sampleStudent);
  
  expect(newStudent).toBeDefined();
  expect(newStudent._id).toBe('22120286');
  expect(newStudent.name).toBe('Lê Võ Minh Phương');
  expect(newStudent.email).toBe('phuc21744@student.university.edu.vn');
});

// Validation Tests
test('should handle student with various email formats', async () => {
  const testEmails = [
    'student1@student.university.edu.vn',
    'student.name@student.university.edu.vn',
    'student+id@student.university.edu.vn'
  ];
  // Test implementation...
});
```

#### 2. Tests Quản Lý Khóa Học (`tests/unit/course.test.js`)
**Kích Thước File**: 11KB, 344 dòng
**Bao Phủ**: CRUD khóa học, validation, tìm kiếm, lập lịch

**Danh Mục Test**:
- **CRUD Operations**: Tạo, Đọc, Cập Nhật, Xóa hồ sơ khóa học
- **Validation Tests**: Giá trị tín chỉ, validation khoa, độ dài tên
- **Chức Năng Tìm Kiếm**: Tìm kiếm theo khoa, khóa học đang hoạt động, tìm kiếm theo tên
- **Lập Lịch Khóa Học**: Tạo lịch học, phát hiện xung đột
- **Business Rules**: Validation phạm vi tín chỉ (tối thiểu 2 tín chỉ)

**Ví Dụ Test Chính**:
```javascript
// Validation Tests
test('should throw validation error for invalid credit value', async () => {
  const invalidCredits = [0, 1];
  for (const credits of invalidCredits) {
    const course = { ...sampleCourse, credits };
    await expect(Course.create(course)).rejects.toThrow(/minimum allowed value/);
  }
});

// Search Functionality
test('should find courses by credit range', async () => {
  const courses = await Course.find({ 
    credits: { $gte: 2, $lte: 4 } 
  });
  expect(courses).toHaveLength(1);
});
```

#### 3. Tests Quản Lý Đăng Ký (`tests/unit/enrollment.test.js`)
**Kích Thước File**: 15KB, 452 dòng
**Bao Phủ**: CRUD đăng ký, validation, business logic

**Danh Mục Test**:
- **CRUD Operations**: Tạo, Đọc, Cập Nhật, Xóa hồ sơ đăng ký
- **Validation Tests**: Ngăn chặn đăng ký trùng lặp, validation ngày tháng
- **Business Logic**: Quản lý trạng thái đăng ký, logic hủy đăng ký
- **Quan Hệ**: Quan hệ Sinh Viên-Khóa Học-Lớp
- **Ràng Buộc**: Ràng buộc đăng ký duy nhất

#### 4. Tests Quản Lý Học Tập (`tests/unit/academic.test.js`)
**Kích Thước File**: 18KB, 517 dòng
**Bao Phủ**: Tính toán GPA, xếp loại học tập, quản lý bảng điểm

**Danh Mục Test**:
- **Tính Toán GPA**: GPA học kỳ, GPA tích lũy
- **Xếp Loại Học Tập**: Đánh giá thành tích, xác định xếp loại
- **Quản Lý Bảng Điểm**: Ghi điểm, theo dõi tín chỉ
- **Business Rules**: Quy tắc tiến bộ học tập, yêu cầu tốt nghiệp
- **Chỉ Số Thành Tích**: Tính toán điểm, theo dõi giờ tín chỉ

#### 5. Integration Tests (`tests/integration/student-controller.test.js`)
**Kích Thước File**: 6.7KB, 198 dòng
**Bao Phủ**: Tương tác controller-model, quy trình API

**Danh Mục Test**:
- **Controller Operations**: CRUD operations của student controller
- **API Workflows**: Quy trình end-to-end quản lý sinh viên
- **Error Handling**: Phản hồi lỗi controller và validation
- **Data Flow**: Xử lý request và tạo response

### Thống Kê Test
- **Tổng Số File Test**: 5 files
- **Tổng Số Dòng Code**: ~2,225 dòng
- **Danh Mục Test**: 4 danh mục unit test + 1 integration test
- **Khu Vực Bao Phủ**: Quản lý Sinh viên, Khóa học, Đăng ký, Học tập
- **Pattern Test**: CRUD, Validation, Search, Business Logic, Edge Cases

### Pattern Cấu Trúc Test
Theo pattern AAA (Arrange-Act-Assert) và best practices từ tài liệu tham khảo:

```javascript
describe('Component Name', () => {
  // Setup - Khởi tạo môi trường test
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('Feature Category', () => {
    test('should perform specific action when condition is met', async () => {
      // Arrange - Thiết lập dữ liệu test và điều kiện
      const testData = await setupTestData();
      
      // Act - Thực hiện thao tác đang được test
      const result = await someOperation(testData);
      
      // Assert - Xác minh kết quả mong đợi
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
  });
});
```

## Cấu Trúc và Tổ Chức Test

### Thiết Lập Test Cơ Bản
```javascript
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/test-setup.js';
import Student from '../../models/student-model.js';
// ... other imports

// Thiết lập môi trường testing
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());
```

### Factory Pattern cho Test Data
```javascript
const setupTestData = async () => {
  const sampleMajor = { _id: 'TATM', major_name: 'Tiếng Anh Thương mại' };
  const sampleProgram = { _id: 'DT', program_name: 'Đại trà' };
  const sampleStatus = { _id: 'DH', status_name: 'Đang học' };
  
  // Tạo dữ liệu test
  await Major.create(sampleMajor);
  await Program.create(sampleProgram);
  await Status.create(sampleStatus);
  
  return { sampleMajor, sampleProgram, sampleStatus };
};
```

## Viết Test Hiệu Quả

### Tests CRUD Operations
```javascript
describe('CRUD Operations', () => {
  test('should successfully add a new student with valid data', async () => {
    const { sampleStudent } = await setupTestData();
    const newStudent = await Student.create(sampleStudent);
    
    expect(newStudent).toBeDefined();
    expect(newStudent._id).toBe('22120286');
    expect(newStudent.name).toBe('Lê Võ Minh Phương');
    expect(newStudent.email).toBe('phuc21744@student.university.edu.vn');
  });

  test('should find a student by ID', async () => {
    const { sampleStudent } = await setupTestData();
    await Student.create(sampleStudent);
    
    const foundStudent = await Student.findById('22120286');
    
    expect(foundStudent).toBeDefined();
    expect(foundStudent._id).toBe('22120286');
    expect(foundStudent.name).toBe('Lê Võ Minh Phương');
  });

  test('should update student information', async () => {
    const { sampleStudent } = await setupTestData();
    await Student.create(sampleStudent);
    
    const updatedInfo = { name: 'Lê Võ Phương' };
    const updatedStudent = await Student.findByIdAndUpdate(
      '22120286',
      updatedInfo,
      { new: true }
    );
    
    expect(updatedStudent).toBeDefined();
    expect(updatedStudent.name).toBe('Lê Võ Phương');
  });

  test('should delete a student', async () => {
    const { sampleStudent } = await setupTestData();
    await Student.create(sampleStudent);
    
    await Student.findByIdAndDelete('22120286');
    const deletedStudent = await Student.findById('22120286');
    
    expect(deletedStudent).toBeNull();
  });
});
```

### Tests Validation
```javascript
describe('Validation Tests', () => {
  test('should handle student with various email formats', async () => {
    const { sampleStudent } = await setupTestData();
    const testEmails = [
      'student1@student.university.edu.vn',
      'student.name@student.university.edu.vn',
      'student+id@student.university.edu.vn'
    ];

    for (const email of testEmails) {
      const student = {
        ...sampleStudent,
        _id: `2212028${testEmails.indexOf(email)}`,
        email
      };
      const newStudent = await Student.create(student);
      expect(newStudent.email).toBe(email);
    }
  });

  test('should handle student with various birthdates', async () => {
    const { sampleStudent } = await setupTestData();
    const testDates = [
      new Date('2000-01-01'),
      new Date('2004-11-08'),
      new Date()
    ];

    for (const date of testDates) {
      const student = {
        ...sampleStudent,
        _id: `2212028${testDates.indexOf(date)}`,
        birthdate: date
      };
      const newStudent = await Student.create(student);
      expect(newStudent.birthdate.getTime()).toBe(date.getTime());
    }
  });
});
```

### Tests Chức Năng Tìm Kiếm
```javascript
describe('Search Functionality', () => {
  test('should find students by name with partial match', async () => {
    const { sampleStudent } = await setupTestData();
    await Student.create(sampleStudent);
    
    const students = await Student.find({ 
      name: { $regex: 'Phương', $options: 'i' } 
    });
    
    expect(students).toHaveLength(1);
    expect(students[0].name).toBe('Lê Võ Minh Phương');
  });

  test('should find students by multiple criteria', async () => {
    const { sampleStudent } = await setupTestData();
    await Student.create(sampleStudent);
    
    const students = await Student.find({ 
      major: 'TATM',
      class_year: 2022,
      status: 'DH'
    });
    
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120286');
  });
});
```

## Testing Database

### In-Memory Database
Dự án sử dụng MongoDB Memory Server để testing nhằm đảm bảo:
- **Cô Lập**: Mỗi test chạy độc lập
- **Tốc Độ**: Không phụ thuộc database bên ngoài
- **Trạng Thái Sạch**: Database mới cho mỗi test
- **Thực Thi Song Song**: Tests có thể chạy đồng thời

### Quản Lý Test Data
```javascript
// Thiết lập dữ liệu test trước mỗi test
beforeEach(async () => {
  testData = createTestData();
  await Major.create(testData.major);
  await Program.create(testData.program);
  await Status.create(testData.status);
  // ... tạo dữ liệu test khác
});

// Dọn dẹp sau mỗi test
afterEach(async () => {
  await Student.deleteMany({});
  await Major.deleteMany({});
  await Program.deleteMany({});
  await Status.deleteMany({});
  // ... dọn dẹp các collection khác
});
```

## Testing Validation

### Zod Schema Validation
Ứng dụng sử dụng Zod để validation dữ liệu toàn diện:

```javascript
// Ví dụ validation schema
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
```

### Ví Dụ Test Validation
```javascript
test('should validate student information updates', async () => {
  const invalidUpdate = {
    email: 'invalid-email',
    phone_number: '123'
  };

  try {
    await Student.findByIdAndUpdate(student._id, invalidUpdate, { new: true });
    fail('Expected validation to fail');
  } catch (error) {
    expect(error).toBeDefined();
  }
});
```

## Best Practices

### 1. Tổ Chức Test
- **Nhóm Test Liên Quan**: Sử dụng `describe` blocks để tổ chức test liên quan
- **Tên Test Rõ Ràng**: Sử dụng tên test mô tả giải thích hành vi mong đợi
- **Arrange-Act-Assert**: Tuân theo pattern AAA cho cấu trúc test

### 2. Quản Lý Dữ Liệu
- **Cô Lập Test Data**: Mỗi test phải có dữ liệu riêng
- **Dọn Dẹp**: Luôn dọn dẹp dữ liệu test để tránh can thiệp
- **Test Data Factories**: Sử dụng factory functions để tạo dữ liệu test nhất quán

### 3. Assertions
- **Assertions Cụ Thể**: Test giá trị cụ thể thay vì chỉ kiểm tra sự tồn tại
- **Nhiều Assertions**: Test tất cả khía cạnh liên quan của thao tác
- **Điều Kiện Lỗi**: Test cả kịch bản thành công và thất bại

### 4. Hiệu Suất
- **Async/Await**: Sử dụng pattern async/await phù hợp
- **Database Operations**: Giảm thiểu database calls trong tests
- **Thực Thi Song Song**: Thiết kế tests để chạy song song khi có thể

### 5. Khả Năng Bảo Trì
- **Nguyên Tắc DRY**: Tránh lặp lại code trong tests
- **Helper Functions**: Tạo utilities test có thể tái sử dụng
- **Cấu Hình**: Sử dụng file cấu hình cho test settings

## Quy Trình Phát Triển

### Chạy Tests
```bash
# Chạy tất cả tests
npm test

# Chạy chỉ unit tests
npm run test:unit

# Chạy chỉ integration tests
npm run test:integration

# Chạy tests ở chế độ watch
npm test -- --watch

# Chạy file test cụ thể
npm test -- tests/unit/student.test.js

# Chạy tests với coverage
npm test -- --coverage
```

### Test-Driven Development (TDD)
1. **Viết Test**: Bắt đầu với test thất bại
2. **Viết Code**: Implement code tối thiểu để pass test
3. **Refactor**: Cải thiện code trong khi giữ tests pass
4. **Lặp Lại**: Tiếp tục chu kỳ cho tính năng mới

### Continuous Integration
- **Automated Testing**: Tất cả tests phải pass trước khi merge
- **Code Coverage**: Duy trì coverage test cao
- **Performance Testing**: Bao gồm performance benchmarks

## Xử Lý Sự Cố

### Các Vấn Đề Thường Gặp

#### 1. Vấn Đề Kết Nối Database
```javascript
// Đảm bảo thiết lập database phù hợp
beforeAll(async () => {
  try {
    await connect();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
});
```

#### 2. Dọn Dẹp Test Data
```javascript
// Đảm bảo dọn dẹp phù hợp
afterEach(async () => {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
});
```

#### 3. Vấn Đề Async Test
```javascript
// Sử dụng pattern async/await phù hợp
test('should handle async operations', async () => {
  const result = await someAsyncOperation();
  expect(result).toBeDefined();
});
```

#### 4. Vấn Đề Mock
```javascript
// Mock dependencies phù hợp
jest.mock('../../validators/student-validator.js', () => {
  const originalModule = jest.requireActual('../../validators/student-validator.js');
  
  return {
    ...originalModule,
    studentAddSchema: {
      parseAsync: jest.fn()
    }
  };
});
```

### Debug Tests
```javascript
// Thêm thông tin debug
test('should debug test issues', async () => {
  console.log('Test data:', testData);
  const result = await someOperation();
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

## Kết Luận

Hướng Dẫn Unit Testing này cung cấp bao phủ toàn diện về thực hành testing cho ứng dụng Arceus-Ex-Sat. Bằng cách tuân theo các hướng dẫn này, developers có thể đảm bảo:

- **Code Đáng Tin Cậy**: Testing toàn diện bắt lỗi sớm
- **Code Dễ Bảo Trì**: Tests cấu trúc tốt làm cho code dễ bảo trì hơn
- **Refactoring Tự Tin**: Tests cung cấp safety net cho thay đổi code
- **Đảm Bảo Chất Lượng**: Automated testing đảm bảo chất lượng nhất quán

Hãy nhớ cập nhật và cải thiện tests liên tục khi ứng dụng phát triển, và luôn ưu tiên chất lượng test hơn số lượng test.
