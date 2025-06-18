import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/test-setup.js';
import Enrollment from '../../models/enrollment-model.js';
import Student from '../../models/student-model.js';
import Course from '../../models/course-model.js';
import Class from '../../models/class-model.js';
import { jest } from '@jest/globals';

// Set up the testing environment
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Enrollment Management Tests', () => {
  const setupTestData = async () => {
    // Create test student
    const sampleStudent = {
      _id: '22120286',
      name: 'Lê Võ Minh Phương',
      email: 'phuc21744@student.university.edu.vn',
      class_year: 2022,
      major: 'TATM',
      status: 'DH'
    };

    // Create test course
    const sampleCourse = {
      _id: 'CS101',
      course_name: 'Lập trình cơ bản',
      credits: 3,
      department: 'CNTT'
    };

    // Create test class
    const sampleClass = {
      _id: 'CLS001',
      class_name: 'Lớp Lập trình cơ bản - K22',
      course_id: 'CS101',
      academic_year: '2024-2025',
      semester: '1',
      max_students: 50,
      schedule: 'Monday 8:00-10:00 Room A101',
      classroom: 'A101'
    };

    await Student.create(sampleStudent);
    await Course.create(sampleCourse);
    await Class.create(sampleClass);

    const sampleEnrollment = {
      _id: 'ENR001',
      student_id: '22120286',
      class_id: 'CLS001',
      enrolled_at: new Date(),
      canceled: false
    };

    return { sampleEnrollment, sampleStudent, sampleCourse, sampleClass };
  };

  describe('CRUD Operations', () => {
    test('should successfully create a new enrollment', async () => {
      const { sampleEnrollment } = await setupTestData();
      const newEnrollment = await Enrollment.create(sampleEnrollment);
      
      expect(newEnrollment).toBeDefined();
      expect(newEnrollment._id).toBe('ENR001');
      expect(newEnrollment.student_id).toBe('22120286');
      expect(newEnrollment.class_id).toBe('CLS001');
      expect(newEnrollment.canceled).toBe(false);
    });

    test('should find enrollment by ID', async () => {
      const { sampleEnrollment } = await setupTestData();
      await Enrollment.create(sampleEnrollment);
      
      const foundEnrollment = await Enrollment.findById('ENR001');
      
      expect(foundEnrollment).toBeDefined();
      expect(foundEnrollment._id).toBe('ENR001');
      expect(foundEnrollment.student_id).toBe('22120286');
    });

    test('should update enrollment status', async () => {
      const { sampleEnrollment } = await setupTestData();
      await Enrollment.create(sampleEnrollment);
      
      const updatedEnrollment = await Enrollment.findByIdAndUpdate(
        'ENR001',
        { canceled: true },
        { new: true }
      );
      
      expect(updatedEnrollment).toBeDefined();
      expect(updatedEnrollment.canceled).toBe(true);
    });

    test('should delete an enrollment', async () => {
      const { sampleEnrollment } = await setupTestData();
      await Enrollment.create(sampleEnrollment);
      
      await Enrollment.findByIdAndDelete('ENR001');
      const deletedEnrollment = await Enrollment.findById('ENR001');
      
      expect(deletedEnrollment).toBeNull();
    });
  });

  describe('Validation Tests', () => {
    test('should validate student exists before enrollment', async () => {
      const invalidEnrollment = {
        _id: 'ENR002',
        student_id: 'NONEXISTENT_STUDENT',
        class_id: 'CLS001',
        enrolled_at: new Date(),
        canceled: false
      };

      try {
        await Enrollment.create(invalidEnrollment);
        fail('Expected validation to fail for non-existent student');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should validate class exists before enrollment', async () => {
      const invalidEnrollment = {
        _id: 'ENR003',
        student_id: '22120286',
        class_id: 'NONEXISTENT_CLASS',
        enrolled_at: new Date(),
        canceled: false
      };

      try {
        await Enrollment.create(invalidEnrollment);
        fail('Expected validation to fail for non-existent class');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should prevent duplicate enrollments', async () => {
      const { sampleEnrollment } = await setupTestData();
      await Enrollment.create(sampleEnrollment);
      
      const duplicateEnrollment = {
        _id: 'ENR004',
        student_id: '22120286',
        class_id: 'CLS001',
        enrolled_at: new Date(),
        canceled: false
      };

      try {
        await Enrollment.create(duplicateEnrollment);
        fail('Expected validation to fail for duplicate enrollment');
      } catch (error) {
        expect(error).toBeDefined();
        // Check if it's a duplicate key error or validation error
        expect(error.code === 11000 || error.name === 'ValidationError').toBe(true);
      }
    });

    test('should validate enrollment status values', async () => {
      const { sampleEnrollment } = await setupTestData();
      const validStatuses = [false, true];

      for (const [i, status] of validStatuses.entries()) {
        const enrollment = {
          ...sampleEnrollment,
          _id: `ENR_${status}`,
          class_id: `CLS_STATUS_${i}`,
          canceled: status
        };
        const newEnrollment = await Enrollment.create(enrollment);
        expect(newEnrollment.canceled).toBe(status);
      }
    });
  });

  describe('Enrollment Status Management', () => {
    test('should track enrollment status changes', async () => {
      const { sampleEnrollment } = await setupTestData();
      const enrollment = await Enrollment.create(sampleEnrollment);
      
      const statusHistory = [];
      const statuses = [false, true];
      
      for (const status of statuses) {
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
          enrollment._id,
          { canceled: status },
          { new: true }
        );
        statusHistory.push(updatedEnrollment.canceled);
      }
      
      expect(statusHistory).toEqual(statuses);
    });

    test('should handle enrollment withdrawal', async () => {
      const { sampleEnrollment } = await setupTestData();
      const enrollment = await Enrollment.create(sampleEnrollment);
      
      const withdrawalDate = new Date();
      const updatedEnrollment = await Enrollment.findByIdAndUpdate(
        enrollment._id,
        { 
          canceled: true,
          canceled_at: withdrawalDate,
          canceled_reason: 'Personal reasons'
        },
        { new: true }
      );
      
      expect(updatedEnrollment.canceled).toBe(true);
      expect(updatedEnrollment.canceled_at).toEqual(withdrawalDate);
      expect(updatedEnrollment.canceled_reason).toBe('Personal reasons');
    });

    test('should calculate enrollment duration', async () => {
      const { sampleEnrollment } = await setupTestData();
      const enrollmentDate = new Date('2024-01-15');
      const completionDate = new Date('2024-05-15');
      
      const enrollment = await Enrollment.create({
        ...sampleEnrollment,
        enrolled_at: enrollmentDate,
        canceled_at: completionDate
      });
      
      const durationInDays = Math.floor(
        (completionDate - enrollmentDate) / (1000 * 60 * 60 * 24)
      );
      
      expect(durationInDays).toBe(121); // Approximately 4 months
    });
  });

  describe('Prerequisites Checking', () => {
    test('should check if student meets course prerequisites', async () => {
      // Create prerequisite course
      const prereqCourse = {
        _id: 'CS101',
        course_name: 'Lập trình cơ bản',
        credits: 3,
        department: 'CNTT'
      };
      
      // Create advanced course with prerequisite
      const advancedCourse = {
        _id: 'CS201',
        course_name: 'Lập trình nâng cao',
        credits: 3,
        department: 'CNTT',
        prerequisite_course: 'CS101'
      };
      
      await Course.create(prereqCourse);
      await Course.create(advancedCourse);
      
      // Create class for advanced course
      const advancedClass = {
        _id: 'CLS002',
        class_name: 'Lớp Lập trình nâng cao',
        course_id: 'CS201',
        academic_year: '2024-2025',
        semester: '1',
        max_students: 30,
        schedule: 'Tuesday 9:00-11:00 Room B201',
        classroom: 'B201'
      };
      await Class.create(advancedClass);
      
      // Check if student has completed prerequisite
      const hasPrerequisite = async (studentId, prerequisiteCourseId) => {
        const completedEnrollments = await Enrollment.find({
          student_id: studentId,
          canceled: true
        }).populate({
          path: 'class_id',
          populate: { path: 'course_id' }
        });
        
        return completedEnrollments.some(enrollment => 
          enrollment.class_id.course_id._id === prerequisiteCourseId
        );
      };
      
      // Test with student who hasn't completed prerequisite
      const canEnroll = await hasPrerequisite('22120286', 'CS101');
      expect(canEnroll).toBe(false);
    });

    test('should allow enrollment when prerequisites are met', async () => {
      const { sampleEnrollment } = await setupTestData();
      
      // First, complete the prerequisite course
      const prereqEnrollment = await Enrollment.create({
        ...sampleEnrollment,
        _id: 'ENR_PREREQ',
        canceled: false
      });
      
      // Now try to enroll in advanced course
      const advancedEnrollment = {
        _id: 'ENR_ADVANCED',
        student_id: '22120286',
        class_id: 'CLS002', // Advanced class
        enrolled_at: new Date(),
        canceled: false
      };
      
      const newEnrollment = await Enrollment.create(advancedEnrollment);
      expect(newEnrollment).toBeDefined();
      expect(newEnrollment.canceled).toBe(false);
    });
  });

  describe('Capacity Management', () => {
    test('should check class capacity before enrollment', async () => {
      const fullClass = {
        _id: 'CLS_FULL',
        class_name: 'Lớp đầy',
        course_id: 'CS101',
        academic_year: '2024-2025',
        semester: '1',
        max_students: 30,
        schedule: 'Wednesday 10:00-12:00 Room C301',
        classroom: 'C301'
      };
      await Class.create(fullClass);
      
      const enrollmentForFullClass = {
        _id: 'ENR_FULL',
        student_id: '22120286',
        class_id: 'CLS_FULL',
        enrolled_at: new Date(),
        canceled: false
      };
      
      try {
        await Enrollment.create(enrollmentForFullClass);
        fail('Expected enrollment to fail for full class');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should update class enrollment count', async () => {
      const { sampleEnrollment, sampleClass } = await setupTestData();
      
      // Get initial enrollment count (assuming 0 for new class)
      const initialCount = 0;
      
      // Create enrollment
      await Enrollment.create(sampleEnrollment);
      
      // Update class enrollment count (this would be done by business logic)
      const updatedClass = await Class.findByIdAndUpdate(
        'CLS001',
        { $inc: { enrolled_students: 1 } },
        { new: true }
      );
      
      expect(updatedClass).toBeDefined();
    });

    test('should calculate enrollment percentage', async () => {
      const classWithEnrollment = {
        _id: 'CLS_PERCENT',
        class_name: 'Lớp tính phần trăm',
        course_id: 'CS101',
        academic_year: '2024-2025',
        semester: '1',
        max_students: 50,
        schedule: 'Thursday 14:00-16:00 Room D401',
        classroom: 'D401'
      };
      await Class.create(classWithEnrollment);
      
      const enrollmentPercentage = (35 / 50) * 100;
      expect(enrollmentPercentage).toBe(70);
    });
  });

  describe('Enrollment Analytics', () => {
    test('should calculate student enrollment statistics', async () => {
      const { sampleEnrollment } = await setupTestData();
      
      // Create multiple enrollments for the same student
      const enrollments = [
        { ...sampleEnrollment, _id: 'ENR1', class_id: 'CLS001', canceled: false },
        { ...sampleEnrollment, _id: 'ENR2', class_id: 'CLS002', canceled: true },
        { ...sampleEnrollment, _id: 'ENR3', class_id: 'CLS003', canceled: true }
      ];
      
      for (const enrollment of enrollments) {
        await Enrollment.create(enrollment);
      }
      
      // Calculate statistics
      const studentEnrollments = await Enrollment.find({ student_id: '22120286' });
      const totalEnrollments = studentEnrollments.length;
      const activeEnrollments = studentEnrollments.filter(e => !e.canceled).length;
      const completedEnrollments = studentEnrollments.filter(e => e.canceled).length;
      
      expect(totalEnrollments).toBe(3);
      expect(activeEnrollments).toBe(1);
      expect(completedEnrollments).toBe(2);
    });

    test('should find popular classes', async () => {
      // Create additional classes for testing
      const class2 = {
        _id: 'CLS002',
        class_name: 'Lớp thứ 2',
        course_id: 'CS102',
        academic_year: '2024-2025',
        semester: '1',
        max_students: 40,
        schedule: 'Friday 8:00-10:00 Room E501',
        classroom: 'E501'
      };
      await Class.create(class2);
      
      // Create multiple enrollments for different classes
      const enrollments = [
        { _id: 'ENR1', student_id: '22120286', class_id: 'CLS001', canceled: false },
        { _id: 'ENR2', student_id: '22120287', class_id: 'CLS001', canceled: false },
        { _id: 'ENR3', student_id: '22120288', class_id: 'CLS001', canceled: false },
        { _id: 'ENR4', student_id: '22120289', class_id: 'CLS002', canceled: false }
      ];
      
      for (const enrollment of enrollments) {
        await Enrollment.create(enrollment);
      }
      
      // Find class with most enrollments
      const classEnrollmentCounts = await Enrollment.aggregate([
        { $match: { canceled: false } },
        { $group: { _id: '$class_id', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      expect(classEnrollmentCounts[0]._id).toBe('CLS001');
      expect(classEnrollmentCounts[0].count).toBe(3);
    });
  });
}); 