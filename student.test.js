import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from './test-setup.js';
import Student from './models/student-model.js';
import Major from './models/major-model.js';
import Program from './models/program-model.js';
import Status from './models/status-model.js';
import Address from './models/address-model.js';
import IdentityCard from './models/identity-card-model.js';
import Passport from './models/passport-model.js';
import { jest } from '@jest/globals';

// Set up the testing environment
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

// Mock the necessary functions for validation testing
jest.mock('./validators/student-validator.js', () => {
  const originalModule = jest.requireActual('./validators/student-validator.js');
  
  return {
    ...originalModule,
    studentAddSchema: {
      parseAsync: jest.fn()
    },
    studentUpdateSchema: {
      parseAsync: jest.fn()
    }
  };
});

describe('Student Management System Tests', () => {
  // Common test data setup
  const setupTestData = async () => {
  const sampleMajor = { _id: 'TATM', major_name: 'Tiếng Anh Thương mại' };
  const sampleProgram = { _id: 'DT', program_name: 'Đại trà' };
  const sampleStatus = { _id: 'DH', status_name: 'Đang học' };
  
  const sampleAddress = {
    _id: '22120286-ADDRPMNT',
    house_number: '123',
    street: 'Nguyễn Văn Cừ',
    ward: 'Phường 1',
    district: 'Quận 5',
    city: 'TP HCM',
    country: 'Việt Nam',
    postal_code: '700000'
  };
  
  const sampleIdentityCard = {
    _id: '012345678910',
    issue_date: new Date('2020-05-26T00:00:00.000Z'),
    expiry_date: new Date('2030-05-26T00:00:00.000Z'),
    issue_location: 'TP HCM',
    is_digitized: true,
    chip_attached: true
  };
  
  const sampleStudent = {
    _id: '22120286',
    name: 'Lê Võ Minh Phương',
    birthdate: new Date('2004-11-08T00:00:00.000Z'),
    gender: 'Nam',
    class_year: 2022,
    program: 'DT',
    address: 'TP HCM',
    email: 'phuc21744@student.university.edu.vn',
    phone_number: '0325740149',
    status: 'DH',
    major: 'TATM',
    nationality: 'Việt Nam',
    permanent_address: '22120286-ADDRPMNT',
    identity_card: '012345678910'
  };

    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    
    return { sampleStudent, sampleMajor, sampleProgram, sampleStatus, sampleAddress, sampleIdentityCard };
  };

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

    test('should handle student with various phone numbers', async () => {
      const { sampleStudent } = await setupTestData();
      const testPhones = [
        '0123456789',
        '0987654321',
        '01234567890'
      ];

      for (const phone of testPhones) {
        const student = {
          ...sampleStudent,
          _id: `2212028${testPhones.indexOf(phone)}`,
          phone_number: phone
        };
        const newStudent = await Student.create(student);
        expect(newStudent.phone_number).toBe(phone);
      }
    });

    test('should handle student with various genders', async () => {
      const { sampleStudent } = await setupTestData();
      const testGenders = ['Nam', 'Nữ', 'Khác'];

      for (const gender of testGenders) {
        const student = {
          ...sampleStudent,
          _id: `2212028${testGenders.indexOf(gender)}`,
          gender
        };
        const newStudent = await Student.create(student);
        expect(newStudent.gender).toBe(gender);
      }
    });

    test('should handle student with various class years', async () => {
      const { sampleStudent } = await setupTestData();
      const testYears = [2020, 2021, 2022, 2023];

      for (const year of testYears) {
        const student = {
          ...sampleStudent,
          _id: `2212028${testYears.indexOf(year)}`,
          class_year: year
        };
        const newStudent = await Student.create(student);
        expect(newStudent.class_year).toBe(year);
      }
    });
  });

  describe('Search Functionality', () => {
    test('should find students by name with partial match', async () => {
      const { sampleStudent } = await setupTestData();
      await Student.create(sampleStudent);
      
      const students = await Student.find({ name: { $regex: 'Phương', $options: 'i' } });
      
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

    test('should find students by date range', async () => {
      const { sampleStudent } = await setupTestData();
      await Student.create(sampleStudent);
      
      const startDate = new Date('2004-01-01');
      const endDate = new Date('2004-12-31');
      
      const students = await Student.find({
        birthdate: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      expect(students).toHaveLength(1);
      expect(students[0]._id).toBe('22120286');
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in student name', async () => {
      const { sampleStudent } = await setupTestData();
      const specialNameStudent = {
        ...sampleStudent,
        _id: '22120287',
        name: 'Nguyễn Văn A-B-C (123)',
        email: 'special@hcmus.edu.vn'
      };
      
      const newStudent = await Student.create(specialNameStudent);
      expect(newStudent.name).toBe('Nguyễn Văn A-B-C (123)');
    });

    test('should handle maximum length fields', async () => {
      const { sampleStudent } = await setupTestData();
      const longNameStudent = {
        ...sampleStudent,
        _id: '22120288',
        name: 'A'.repeat(100),
        email: 'long@hcmus.edu.vn'
      };
      
      const newStudent = await Student.create(longNameStudent);
      expect(newStudent.name).toBe('A'.repeat(100));
    });

    test('should handle concurrent updates', async () => {
      const { sampleStudent } = await setupTestData();
      await Student.create(sampleStudent);
      
      const update1 = Student.findByIdAndUpdate(
        '22120286',
        { name: 'Update 1' },
        { new: true }
      );
      
      const update2 = Student.findByIdAndUpdate(
        '22120286',
        { name: 'Update 2' },
        { new: true }
      );
      
      const [result1, result2] = await Promise.all([update1, update2]);
      expect(result1.name !== result2.name).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    test('should import multiple students from JSON', async () => {
      const { sampleStudent } = await setupTestData();
      
      const sampleStudent2 = {
        ...sampleStudent,
        _id: '22120272',
        name: 'Nguyễn Văn A',
        email: 'a.nv@student.university.edu.vn'
      };
      
      const jsonData = [sampleStudent, sampleStudent2];
      
      const result = await Student.insertMany(jsonData);
      expect(result).toHaveLength(2);
      expect(result.map(s => s._id).sort()).toEqual(['22120286', '22120272'].sort());
    });

    test('should handle duplicate IDs in bulk import', async () => {
      const { sampleStudent } = await setupTestData();
      
      const duplicateStudent = {
        ...sampleStudent,
        email: 'duplicate@student.university.edu.vn'
      };
      
      const jsonData = [sampleStudent, duplicateStudent];
      
      try {
        await Student.insertMany(jsonData);
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error code
      }

      const students = await Student.find();
      expect(students).toHaveLength(1);
    });

    test('should handle bulk import with missing optional fields', async () => {
      const { sampleStudent } = await setupTestData();
      
      const minimalStudent = {
        _id: '22120272',
        name: 'Minimal Student',
        email: 'minimal@student.university.edu.vn',
        birthdate: new Date('2004-11-08'),
        gender: 'Nam',
        class_year: 2022,
        program: 'DT',
        address: 'TP HCM',
        phone_number: '0123456789',
        status: 'DH',
        major: 'TATM',
        nationality: 'Việt Nam',
        permanent_address: '22120286-ADDRPMNT',
        identity_card: '012345678910'
      };
      
      const jsonData = [sampleStudent, minimalStudent];
      
      const result = await Student.insertMany(jsonData);
      expect(result).toHaveLength(2);
      expect(result[1].temporary_address).toBeUndefined();
      expect(result[1].mailing_address).toBeUndefined();
      expect(result[1].passport).toBeUndefined();
    });
  });
});

describe('Student Management System Tests - Sample 2', () => {
  // Sample data for testing
  const sampleMajor2 = { _id: 'CNTT', major_name: 'Công nghệ Thông tin' };
  const sampleProgram2 = { _id: 'CLC', program_name: 'Chất lượng cao' };
  const sampleStatus2 = { _id: 'TN', status_name: 'Tốt nghiệp' };
  
  const sampleAddress2 = {
    _id: '22120272-ADDRPMNT',
    house_number: '456',
    street: 'Nguyễn Thị Thập',
    ward: 'Phường 2',
    district: 'Quận 7',
    city: 'TP HCM',
    country: 'Việt Nam',
    postal_code: '700000'
  };
  
  const sampleIdentityCard2 = {
    _id: '987654321012',
    issue_date: new Date('2019-06-15T00:00:00.000Z'),
    expiry_date: new Date('2029-06-15T00:00:00.000Z'),
    issue_location: 'TP HCM',
    is_digitized: true,
    chip_attached: true
  };
  
  const sampleStudent2 = {
    _id: '22120272',
    name: 'Đỗ Thị Ngọc Linh',
    birthdate: new Date('2003-05-20T00:00:00.000Z'),
    gender: 'Nữ',
    class_year: 2022,
    program: 'CLC',
    address: 'TP HCM',
    email: 'ddt.nling@student.university.edu.vn',
    phone_number: '0987654321',
    status: 'TN',
    major: 'CNTT',
    nationality: 'Việt Nam',
    permanent_address: '22120272-ADDRPMNT',
    identity_card: '987654321012'
  };

  // Test 11: Tìm sinh viên theo năm học
  test('should find students by class year', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    const student2023 = {
      ...sampleStudent2,
      _id: '22120273',
      name: 'Nguyễn Văn B',
      email: 'b.nv@hcmus.edu.vn',
      class_year: 2023
    };
    await Student.create(student2023);
    
    // Act
    const students = await Student.find({ class_year: 2022 });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 12: Tìm sinh viên theo giới tính
  test('should find students by gender', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    const maleStudent = {
      ...sampleStudent2,
      _id: '22120273',
      name: 'Nguyễn Văn C',
      email: 'c.nv@hcmus.edu.vn',
      gender: 'Nam'
    };
    await Student.create(maleStudent);
    
    // Act
    const students = await Student.find({ gender: 'Nữ' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 13: Tìm sinh viên theo quốc tịch
  test('should find students by nationality', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    const foreignStudent = {
      ...sampleStudent2,
      _id: '22120273',
      name: 'John Smith',
      email: 'john@hcmus.edu.vn',
      nationality: 'USA'
    };
    await Student.create(foreignStudent);
    
    // Act
    const students = await Student.find({ nationality: 'Việt Nam' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 14: Tìm sinh viên theo địa chỉ
  test('should find students by address', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    const studentInHanoi = {
      ...sampleStudent2,
      _id: '22120273',
      name: 'Nguyễn Văn D',
      email: 'd.nv@hcmus.edu.vn',
      address: 'Hà Nội'
    };
    await Student.create(studentInHanoi);
    
    // Act
    const students = await Student.find({ address: 'TP HCM' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 15: Tìm sinh viên theo số điện thoại
  test('should find students by phone number', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    // Act
    const students = await Student.find({ phone_number: '0987654321' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 16: Tìm sinh viên theo CMND
  test('should find students by identity card', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    // Act
    const students = await Student.find({ identity_card: '987654321012' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 17: Tìm sinh viên theo ngày sinh
  test('should find students by birthdate', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    // Act
    const students = await Student.find({ 
      birthdate: new Date('2003-05-20T00:00:00.000Z')
    });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 18: Tìm sinh viên theo chương trình đào tạo
  test('should find students by program', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    // Act
    const students = await Student.find({ program: 'CLC' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

  // Test 19: Tìm sinh viên theo tình trạng học tập
  test('should find students by status', async () => {
    // Arrange
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    // Act
    const students = await Student.find({ status: 'TN' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });

});