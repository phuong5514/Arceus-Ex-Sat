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
import { preprocessStudent } from './controllers/student-controller.js';
import {z} from 'zod';
import dayjs from "dayjs";
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
  // Sample data for testing
  const sampleMajor = { _id: 'TATM', major_name: 'Tiếng Anh Thương mại' };
  const sampleProgram = { _id: 'DT', program_name: 'Đại trà' };
  const sampleStatus = { _id: 'DH', status_name: 'Đang học' };
  
  const sampleAddress = {
    _id: '22120271-ADDRPMNT',
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
    _id: '22120271',
    name: 'Dương Hoàng Hồng Phúc',
    birthdate: new Date('2004-11-08T00:00:00.000Z'),
    gender: 'Nam',
    class_year: 2022,
    program: 'DT',
    address: 'TP HCM',
    email: 'phuc21744@hcmus.edu.vn',
    phone_number: '0325740149',
    status: 'DH',
    major: 'TATM',
    nationality: 'Việt Nam',
    permanent_address: '22120271-ADDRPMNT',
    identity_card: '012345678910'
  };

  // Test 1: Adding a new student
  test('should successfully add a new student', async () => {
    // Arrange
    // Insert prerequisite data
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    
    // Act
    const newStudent = await Student.create(sampleStudent);
    
    // Assert
    expect(newStudent).toBeDefined();
    expect(newStudent._id).toBe('22120271');
    expect(newStudent.name).toBe('Dương Hoàng Hồng Phúc');
    expect(newStudent.email).toBe('phuc21744@hcmus.edu.vn');
  });

  // Test 2: Finding a student by ID
  test('should find a student by ID', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    // Act
    const foundStudent = await Student.findById('22120271');
    
    // Assert
    expect(foundStudent).toBeDefined();
    expect(foundStudent._id).toBe('22120271');
    expect(foundStudent.name).toBe('Dương Hoàng Hồng Phúc');
  });

  // Test 3: Finding students by name
  test('should find students by name', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    // Act
    const students = await Student.find({ name: { $regex: 'Phúc', $options: 'i' } });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0].name).toBe('Dương Hoàng Hồng Phúc');
  });

  // Test 4: Finding students by major
  test('should find students by major', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    // Act
    const students = await Student.find({ major: 'TATM' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0].major).toBe('TATM');
  });

  // Test 5: Finding students by major and name
  test('should find students by major and name', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    const anotherStudent = {
      ...sampleStudent, 
      _id: '22120272',
      name: 'Nguyễn Văn A',
      email: 'a.nv@hcmus.edu.vn',
      phone_number: '0987654321'
    };
    await Student.create(anotherStudent);
    
    // Act
    const students = await Student.find({ 
      major: 'TATM',
      name: { $regex: 'Phúc', $options: 'i' }
    });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0].name).toBe('Dương Hoàng Hồng Phúc');
  });

  // Test 6: Updating student information
  test('should update student information', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    const updatedInfo = { name: 'Dương Hoàng Phúc' };
    
    // Act
    const updatedStudent = await Student.findByIdAndUpdate(
      '22120271',
      updatedInfo,
      { new: true }
    );
    
    // Assert
    expect(updatedStudent).toBeDefined();
    expect(updatedStudent.name).toBe('Dương Hoàng Phúc');
  });

  // Test 7: Deleting a student
  test('should delete a student', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    // Act
    await Student.findByIdAndDelete('22120271');
    const deletedStudent = await Student.findById('22120271');
    
    // Assert
    expect(deletedStudent).toBeNull();
  });

  // Test 8: Adding a student with invalid data should fail
  const validator = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    birthdate: z.date(),
    class_year: z.number(),
    major: z.string(),
    program: z.string(),
    status: z.string(),
    permanent_address: z.object({
      house_number: z.string(),
      street: z.string(),
      ward: z.string(),
      district: z.string(),
      city: z.string(),
      country: z.string(),
      postal_code: z.string()
    }),
    temporary_address: z.object({
      house_number: z.string(),
      street: z.string(),
      ward: z.string(),
      district: z.string(),
      city: z.string(),
      country: z.string(),
      postal_code: z.string()
    }),
    mailing_address: z.object({
      house_number: z.string(),
      street: z.string(),
      ward: z.string(),
      district: z.string(),
      city: z.string(),
      country: z.string(),
      postal_code: z.string()
    })
  });
  
  test('should not add a student with invalid data', async () => {
    const invalidStudent = {
      _id: '22120271',
      name: 'John Doe',
      email: 'invalid-email',
      birthdate: '2005-01-25',
      class_year: 2022,
      major: 'TATM',
      program: 'DT',
      status: 'DH',
      permanent_address: {
        house_number: '123',
        street: 'Street 1',
        ward: 'Ward 1',
        district: 'District 1',
        city: 'City 1',
        country: 'Country 1',
        postal_code: '12345'
      },
      temporary_address: {
        house_number: '456',
        street: 'Street 2',
        ward: 'Ward 2',
        district: 'District 2',
        city: 'City 2',
        country: 'Country 2',
        postal_code: '67890'
      },
      mailing_address: {
        house_number: '789',
        street: 'Street 3',
        ward: 'Ward 3',
        district: 'District 3',
        city: 'City 3',
        country: 'Country 3',
        postal_code: '34567'
      }
    };
  
    await expect(preprocessStudent(invalidStudent, validator)).rejects.toThrowError('Invalid email at  email, Expected date, received string at  birthdate');
  });
  


  // Test 9: Adding a student with duplicate ID should fail
  test('should not add a student with duplicate ID', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    await Student.create(sampleStudent);
    
    const duplicateStudent = {
      _id: '22120271',
      name: 'John Doe',
      email: 'invalid-email',
      birthdate: '2005-01-25',
      class_year: 2022,
      major: 'TATM',
      program: 'DT',
      status: 'DH',
      permanent_address: {
        house_number: '123',
        street: 'Street 1',
        ward: 'Ward 1',
        district: 'District 1',
        city: 'City 1',
        country: 'Country 1',
        postal_code: '12345'
      },
      temporary_address: {
        house_number: '456',
        street: 'Street 2',
        ward: 'Ward 2',
        district: 'District 2',
        city: 'City 2',
        country: 'Country 2',
        postal_code: '67890'
      },
      mailing_address: {
        house_number: '789',
        street: 'Street 3',
        ward: 'Ward 3',
        district: 'District 3',
        city: 'City 3',
        country: 'Country 3',
        postal_code: '34567'
      }
    };
    
    // Mock the validation to pass but expect the DB operation to fail
    //studentAddSchema.parseAsync.mockResolvedValue(duplicateStudent);
    

    // Act & Assert
    // try {
    //   await Student.create(duplicateStudent);
    //   // If we get here, the test should fail
    //   expect(true).toBe(false);
    // } catch (error) {
    //   expect(error).toBeDefined();
    // }
    // Mock the validation to fail
  //jest.spyOn(studentAddSchema, 'parseAsync').mockRejectedValue(new Error('Duplicate ID'));

  // Act & Assert
  await expect(preprocessStudent(duplicateStudent,validator)).rejects.toThrowError('Duplicate ID');
  });



  // Test 10: Import multiple students from JSON
  test('should import multiple students from JSON', async () => {
    // Arrange
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    await Address.create(sampleAddress);
    await IdentityCard.create(sampleIdentityCard);
    
    const sampleStudent2 = {
      ...sampleStudent,
      _id: '22120272',
      email: 'student2@hcmus.edu.vn',
      phone_number: '0987654321'
    };
    
    const jsonData = [sampleStudent, sampleStudent2];
    
    // Act
    await Student.insertMany(jsonData);
    const students = await Student.find();
    
    // Assert
    expect(students).toHaveLength(2);
    expect(students.map(s => s._id).sort()).toEqual(['22120271', '22120272'].sort());
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
    email: 'ddt.nling@hcmus.edu.vn',
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

  // Test 20: Tìm sinh viên theo email
  test('should find students by email', async () => {
    // Arrang
    await Major.create(sampleMajor2);
    await Program.create(sampleProgram2);
    await Status.create(sampleStatus2);
    await Address.create(sampleAddress2);
    await IdentityCard.create(sampleIdentityCard2);
    await Student.create(sampleStudent2);
    
    // Act
    const students = await Student.find({ email: 'ddt.nling@hcmus.edu.vn' });
    
    // Assert
    expect(students).toHaveLength(1);
    expect(students[0]._id).toBe('22120272');
  });
});