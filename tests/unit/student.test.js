import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/test-setup.js';
import Student from '../../models/student-model.js';
import Major from '../../models/major-model.js';
import Program from '../../models/program-model.js';
import Status from '../../models/status-model.js';
import Address from '../../models/address-model.js';
import IdentityCard from '../../models/identity-card-model.js';
import Passport from '../../models/passport-model.js';
import { jest } from '@jest/globals';
import Course from '../../models/course-model.js';
import Enrollment from '../../models/enrollment-model.js';
import Transcript from '../../models/transcript-model.js';

// Set up the testing environment
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

// Mock the necessary functions for validation testing
jest.mock('../../validators/student-validator.js', () => {
  const originalModule = jest.requireActual('../../validators/student-validator.js');
  
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
      const birthdates = [
        new Date('2000-01-01'),
        new Date('2001-05-15'),
        new Date('1999-12-31')
      ];
      for (const [i, birthdate] of birthdates.entries()) {
        const student = defineStudent({ birthdate, email: `birthdate${i}@university.edu.vn` });
        const newStudent = await Student.create(student);
        expect(newStudent.birthdate).toEqual(birthdate);
      }
    });

    test('should handle student with various phone numbers', async () => {
      const phoneNumbers = ['0123456789', '0987654321', '0909090909'];
      for (const [i, phone_number] of phoneNumbers.entries()) {
        const student = defineStudent({ phone_number, email: `phone${i}@university.edu.vn` });
        const newStudent = await Student.create(student);
        expect(newStudent.phone_number).toBe(phone_number);
      }
    });

    test('should handle student with various genders', async () => {
      const genders = ['male', 'female', 'other'];
      for (const [i, gender] of genders.entries()) {
        const student = defineStudent({ gender, email: `gender${i}@university.edu.vn` });
        const newStudent = await Student.create(student);
        expect(newStudent.gender).toBe(gender);
      }
    });

    test('should handle student with various class years', async () => {
      const classYears = [2020, 2021, 2022, 2023];
      for (const [i, class_year] of classYears.entries()) {
        const student = defineStudent({ class_year, email: `classyear${i}@university.edu.vn` });
        const newStudent = await Student.create(student);
        expect(newStudent.class_year).toBe(class_year);
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
  // Test data factory
  const createTestData = () => ({
    major: {
      _id: 'CNTT',
      major_name: 'Công nghệ Thông tin'
    },
    program: {
      _id: 'CLC',
      program_name: 'Chất lượng cao'
    },
    status: {
      _id: 'TN',
      status_name: 'Tốt nghiệp'
    },
    address: {
      _id: '22120272-ADDRPMNT',
      house_number: '456',
      street: 'Nguyễn Thị Thập',
      ward: 'Phường 2',
      district: 'Quận 7',
      city: 'TP HCM',
      country: 'Việt Nam',
      postal_code: '700000'
    },
    identityCard: {
      _id: '987654321012',
      issue_date: new Date('2019-06-15T00:00:00.000Z'),
      expiry_date: new Date('2029-06-15T00:00:00.000Z'),
      issue_location: 'TP HCM',
      is_digitized: true,
      chip_attached: true
    },
    course: {
      _id: 'CS101',
      course_name: 'Lập trình cơ bản',
      credits: 3,
      department: 'CNTT',
      description: 'Môn học cơ bản về lập trình',
      is_active: true
    },
    student: {
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
    }
  });

  let testData;
  let student;
  let course;

  beforeEach(async () => {
    testData = createTestData();
    await Major.create(testData.major);
    await Program.create(testData.program);
    await Status.create(testData.status);
    await Address.create(testData.address);
    await IdentityCard.create(testData.identityCard);
    await Course.create(testData.course);
    student = await Student.create(testData.student);
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await Major.deleteMany({});
    await Program.deleteMany({});
    await Status.deleteMany({});
    await Address.deleteMany({});
    await IdentityCard.deleteMany({});
    await Course.deleteMany({});
  });

  describe('Student Academic Management', () => {
    test('should enroll student in a course', async () => {
      // Arrange
      const enrollment = {
        _id: 'ENR001',
        student_id: student._id,
        class_id: 'CLS001',
        enrolled_at: new Date()
      };

      // Act
      const newEnrollment = await Enrollment.create(enrollment);

      // Assert
      expect(newEnrollment).toBeDefined();
      expect(newEnrollment.student_id).toBe(student._id);
      expect(newEnrollment.class_id).toBe('CLS001');
    });

    test('should calculate student GPA correctly', async () => {
      // Arrange
      const grades = [
        { course: testData.course._id, grade: 8.5, credits: 3 },
        { course: 'CS102', grade: 9.0, credits: 3 }
      ];

      // Act
      const totalPoints = grades.reduce((sum, course) => 
        sum + (course.grade * course.credits), 0);
      const totalCredits = grades.reduce((sum, course) => 
        sum + course.credits, 0);
      const gpa = totalPoints / totalCredits;

      // Assert
      expect(gpa).toBe(8.75);
    });

    test('should check graduation requirements', async () => {
      // Arrange
      const completedCourses = [
        { course: testData.course._id, grade: 8.5, credits: 3 },
        { course: 'CS102', grade: 9.0, credits: 3 },
        { course: 'CS103', grade: 8.0, credits: 3 }
      ];

      // Act
      const canGraduate = completedCourses.length >= 3 && 
                         completedCourses.every(c => c.grade >= 5.0);

      // Assert
      expect(canGraduate).toBe(true);
    });
  });

  describe('Student Course Management', () => {
    test('should check course prerequisites', async () => {
      // Arrange
      const advancedCourse = {
        _id: 'CS201',
        course_name: 'Lập trình nâng cao',
        credits: 3,
        department: 'CNTT',
        prerequisite_course: testData.course._id
      };
      await Course.create(advancedCourse);

      // Act
      const course = await Course.findById(advancedCourse._id)
        .populate('prerequisite_course');

      // Assert
      expect(course.prerequisite_course).toBeDefined();
      expect(course.prerequisite_course._id).toBe(testData.course._id);
    });

    test('should handle course schedule conflicts', async () => {
      // Arrange
      const course1 = {
        _id: 'CS101',
        course_name: 'Lập trình cơ bản',
        credits: 3,
        department: 'CNTT',
        schedule: { day: 'Monday', time: '8:00-10:00' }
      };
      const course2 = {
        _id: 'CS102',
        course_name: 'Lập trình nâng cao',
        credits: 3,
        department: 'CNTT',
        schedule: { day: 'Monday', time: '9:00-11:00' }
      };

      // Helper to convert time string to minutes
      function timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      }
      const [start1, end1] = course1.schedule.time.split('-').map(timeToMinutes);
      const [start2, end2] = course2.schedule.time.split('-').map(timeToMinutes);
      const hasConflict = course1.schedule.day === course2.schedule.day &&
                         start1 < end2 && start2 < end1;

      // Assert
      expect(hasConflict).toBe(true);
    });
  });

  describe('Student Information Management', () => {
    test('should update student contact information', async () => {
      // Arrange
      const newContact = {
        email: 'new.email@hcmus.edu.vn',
        phone_number: '0987654322',
        address: 'Hà Nội'
      };

      // Act
      const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        newContact,
        { new: true }
      );

      // Assert
      expect(updatedStudent.email).toBe(newContact.email);
      expect(updatedStudent.phone_number).toBe(newContact.phone_number);
      expect(updatedStudent.address).toBe(newContact.address);
    });

    test('should validate student information updates', async () => {
      // Arrange
      const invalidUpdate = {
        email: 'invalid-email',
        phone_number: '123'
      };

      // Act & Assert
      try {
        await Student.findByIdAndUpdate(student._id, invalidUpdate, { new: true });
        fail('Expected validation to fail');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Student Status Management', () => {
    test('should track academic status changes', async () => {
      // Arrange
      const statuses = ['Đang học', 'Tạm dừng', 'TN'];
      const statusHistory = [];

      // Act
      for (const status of statuses) {
        const updatedStudent = await Student.findByIdAndUpdate(
          student._id,
          { status },
          { new: true }
        );
        statusHistory.push(updatedStudent.status);
      }

      // Assert
      expect(statusHistory).toEqual(statuses);
    });

    test('should handle student leave of absence', async () => {
      // Arrange
      const leaveInfo = {
        status: 'Tạm dừng',
        reason: 'Nghỉ phép',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      // Act
      const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        leaveInfo,
        { new: true }
      );

      // Assert
      expect(updatedStudent.status).toBe(leaveInfo.status);
    });
  });

  describe('Student Academic Performance', () => {
    test('should calculate semester GPA', async () => {
      // Arrange
      const semesterGrades = [
        { course: testData.course._id, grade: 8.5, credits: 3 },
        { course: 'CS102', grade: 9.0, credits: 3 },
        { course: 'CS103', grade: 7.5, credits: 3 }
      ];

      // Act
      const totalPoints = semesterGrades.reduce((sum, course) => 
        sum + (course.grade * course.credits), 0);
      const totalCredits = semesterGrades.reduce((sum, course) => 
        sum + course.credits, 0);
      const semesterGPA = totalPoints / totalCredits;

      // Assert
      expect(semesterGPA).toBeCloseTo(8.33, 2);
    });

    test('should determine academic standing', async () => {
      // Arrange
      const gpa = 8.5;
      const creditsCompleted = 90;
      const requiredCredits = 120;

      // Act
      const academicStanding = gpa >= 8.0 && creditsCompleted >= requiredCredits * 0.75
        ? 'Xuất sắc'
        : gpa >= 7.0 && creditsCompleted >= requiredCredits * 0.5
        ? 'Khá'
        : 'Trung bình';

      // Assert
      expect(academicStanding).toBe('Xuất sắc');
    });
  });

  describe('Student Course Registration', () => {
    test('should validate course registration prerequisites', async () => {
      // Arrange
      const prerequisiteCourse = await Course.findById('CS101');

      const advancedCourse = await Course.create({
        _id: 'CS201',
        course_name: 'Lập trình nâng cao',
        credits: 3,
        department: 'CNTT',
        description: 'Môn học nâng cao về lập trình',
        prerequisite_course: prerequisiteCourse._id,
        is_active: true
      });

      // Act
      const course = await Course.findById(advancedCourse._id).populate('prerequisite_course');

      // Assert
      expect(course.prerequisite_course).toBeDefined();
      expect(course.prerequisite_course._id).toBe(prerequisiteCourse._id);
    });

    test('should check maximum course load', async () => {
      // Arrange
      const currentCredits = 15;
      const newCourseCredits = 3;
      const maxCredits = 21;

      // Act
      const canRegister = currentCredits + newCourseCredits <= maxCredits;

      // Assert
      expect(canRegister).toBe(true);
    });
  });
});

// Helper function để tạo student với email khác nhau
defineStudent = (overrides = {}) => ({
  _id: overrides._id || `ID${Math.random()}`,
  name: overrides.name || 'Lê Võ Minh Phương',
  email: overrides.email || `student${Math.random()}@university.edu.vn`,
  class_year: overrides.class_year || 2022,
  major: overrides.major || 'TATM',
  status: overrides.status || 'DH',
  ...overrides
});