import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/test-setup.js';
import Student from '../../models/student-model.js';
import Major from '../../models/major-model.js';
import Program from '../../models/program-model.js';
import Status from '../../models/status-model.js';
import { jest } from '@jest/globals';

// Set up the testing environment
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Student Controller Integration Tests', () => {
  const setupTestData = async () => {
    const sampleMajor = { _id: 'TATM', major_name: 'Tiếng Anh Thương mại' };
    const sampleProgram = { _id: 'DT', program_name: 'Đại trà' };
    const sampleStatus = { _id: 'DH', status_name: 'Đang học' };
    
    await Major.create(sampleMajor);
    await Program.create(sampleProgram);
    await Status.create(sampleStatus);
    
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
      nationality: 'Việt Nam'
    };

    return { sampleStudent, sampleMajor, sampleProgram, sampleStatus };
  };

  describe('Student CRUD Operations', () => {
    test('should create and retrieve student through controller flow', async () => {
      const { sampleStudent } = await setupTestData();
      
      // Simulate controller create operation
      const newStudent = await Student.create(sampleStudent);
      expect(newStudent).toBeDefined();
      expect(newStudent._id).toBe('22120286');
      
      // Simulate controller retrieve operation
      const foundStudent = await Student.findById('22120286')
        .populate('major')
        .populate('program')
        .populate('status');
      
      expect(foundStudent).toBeDefined();
      expect(foundStudent.major.major_name).toBe('Tiếng Anh Thương mại');
      expect(foundStudent.program.program_name).toBe('Đại trà');
      expect(foundStudent.status.status_name).toBe('Đang học');
    });

    test('should update student information through controller flow', async () => {
      const { sampleStudent } = await setupTestData();
      await Student.create(sampleStudent);
      
      // Simulate controller update operation
      const updatedInfo = { 
        name: 'Lê Võ Phương',
        email: 'phuong.le@student.university.edu.vn'
      };
      
      const updatedStudent = await Student.findByIdAndUpdate(
        '22120286',
        updatedInfo,
        { new: true }
      );
      
      expect(updatedStudent).toBeDefined();
      expect(updatedStudent.name).toBe('Lê Võ Phương');
      expect(updatedStudent.email).toBe('phuong.le@student.university.edu.vn');
    });

    test('should delete student through controller flow', async () => {
      const { sampleStudent } = await setupTestData();
      await Student.create(sampleStudent);
      
      // Simulate controller delete operation
      await Student.findByIdAndDelete('22120286');
      const deletedStudent = await Student.findById('22120286');
      
      expect(deletedStudent).toBeNull();
    });
  });

  describe('Student Search and Filter Operations', () => {
    test('should search students by multiple criteria', async () => {
      const { sampleStudent } = await setupTestData();
      await Student.create(sampleStudent);
      
      // Simulate controller search operation
      const searchCriteria = {
        major: 'TATM',
        class_year: 2022,
        status: 'DH'
      };
      
      const students = await Student.find(searchCriteria)
        .populate('major')
        .populate('program')
        .populate('status');
      
      expect(students).toHaveLength(1);
      expect(students[0]._id).toBe('22120286');
      expect(students[0].major.major_name).toBe('Tiếng Anh Thương mại');
    });

    test('should paginate student results', async () => {
      const { sampleStudent } = await setupTestData();
      
      // Create multiple students for pagination test
      const students = [];
      for (let i = 1; i <= 5; i++) {
        const student = {
          ...sampleStudent,
          _id: `2212028${i}`,
          email: `student${i}@student.university.edu.vn`
        };
        students.push(await Student.create(student));
      }
      
      // Simulate controller pagination operation
      const page = 1;
      const limit = 3;
      const skip = (page - 1) * limit;
      
      const paginatedStudents = await Student.find({})
        .skip(skip)
        .limit(limit)
        .populate('major')
        .populate('program')
        .populate('status');
      
      expect(paginatedStudents).toHaveLength(3);
      expect(paginatedStudents[0]._id).toBe('22120281');
      expect(paginatedStudents[1]._id).toBe('22120282');
      expect(paginatedStudents[2]._id).toBe('22120283');
    });
  });

  describe('Student Validation Integration', () => {
    test('should handle duplicate student ID creation', async () => {
      const { sampleStudent } = await setupTestData();
      
      // Create first student
      await Student.create(sampleStudent);
      
      // Try to create duplicate student
      const duplicateStudent = {
        ...sampleStudent,
        email: 'duplicate@student.university.edu.vn'
      };
      
      try {
        await Student.create(duplicateStudent);
        fail('Expected duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    test('should handle duplicate email creation', async () => {
      const { sampleStudent } = await setupTestData();
      
      // Create first student with the email
      await Student.create(sampleStudent);
      
      // Try to create student with duplicate email
      const duplicateEmailStudent = {
        _id: '22120287',
        name: 'Nguyễn Văn B',
        email: 'phuc21744@student.university.edu.vn', // Same email as existing student
        class_year: 2022,
        major: 'TATM',
        status: 'DH'
      };

      try {
        await Student.create(duplicateEmailStudent);
        fail('Expected duplicate key error');
      } catch (error) {
        expect(error).toBeDefined();
        // Check if it's a duplicate key error or validation error
        expect(error.code === 11000 || error.name === 'ValidationError').toBe(true);
      }
    });
  });
}); 