import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../helpers/test-setup.js';
import Student from '../../models/student-model.js';
import Course from '../../models/course-model.js';
import Enrollment from '../../models/enrollment-model.js';
import Transcript from '../../models/transcript-model.js';
import { jest } from '@jest/globals';

// Set up the testing environment
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Academic Management Tests', () => {
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

    // Create test courses
    const sampleCourses = [
      {
        _id: 'CS101',
        course_name: 'Lập trình cơ bản',
        credits: 3,
        department: 'CNTT'
      },
      {
        _id: 'CS102',
        course_name: 'Cấu trúc dữ liệu',
        credits: 3,
        department: 'CNTT'
      },
      {
        _id: 'CS103',
        course_name: 'Cơ sở dữ liệu',
        credits: 4,
        department: 'CNTT'
      },
      {
        _id: 'MATH101',
        course_name: 'Toán rời rạc',
        credits: 2,
        department: 'TOAN'
      }
    ];

    await Student.create(sampleStudent);
    for (const course of sampleCourses) {
      await Course.create(course);
    }

    return { sampleStudent, sampleCourses };
  };

  describe('GPA Calculation', () => {
    test('should calculate semester GPA correctly', async () => {
      const { sampleStudent, sampleCourses } = await setupTestData();
      
      // Create transcript entries with grades
      const transcriptEntries = [
        { course_id: 'CS101', grade: 8.5, credits: 3 },
        { course_id: 'CS102', grade: 9.0, credits: 3 },
        { course_id: 'CS103', grade: 7.5, credits: 4 },
        { course_id: 'MATH101', grade: 8.0, credits: 2 }
      ];

      // Calculate GPA
      const totalPoints = transcriptEntries.reduce((sum, entry) => 
        sum + (entry.grade * entry.credits), 0);
      const totalCredits = transcriptEntries.reduce((sum, entry) => 
        sum + entry.credits, 0);
      const semesterGPA = totalPoints / totalCredits;

      expect(semesterGPA).toBeCloseTo(8.21, 2);
    });

    test('should calculate cumulative GPA', async () => {
      const { sampleStudent, sampleCourses } = await setupTestData();
      
      // Previous semester grades
      const previousGrades = [
        { course_id: 'CS101', grade: 8.0, credits: 3 },
        { course_id: 'MATH101', grade: 7.5, credits: 2 }
      ];

      // Current semester grades
      const currentGrades = [
        { course_id: 'CS102', grade: 9.0, credits: 3 },
        { course_id: 'CS103', grade: 8.5, credits: 4 }
      ];

      const allGrades = [...previousGrades, ...currentGrades];
      
      const totalPoints = allGrades.reduce((sum, entry) => 
        sum + (entry.grade * entry.credits), 0);
      const totalCredits = allGrades.reduce((sum, entry) => 
        sum + entry.credits, 0);
      const cumulativeGPA = totalPoints / totalCredits;

      expect(cumulativeGPA).toBeCloseTo(8.33, 2);
    });

    test('should handle failed courses in GPA calculation', async () => {
      const { sampleStudent, sampleCourses } = await setupTestData();
      
      const gradesWithFailures = [
        { course_id: 'CS101', grade: 8.5, credits: 3 },
        { course_id: 'CS102', grade: 4.0, credits: 3 }, // Failed
        { course_id: 'CS103', grade: 9.0, credits: 4 }
      ];

      const totalPoints = gradesWithFailures.reduce((sum, entry) => 
        sum + (entry.grade * entry.credits), 0);
      const totalCredits = gradesWithFailures.reduce((sum, entry) => 
        sum + entry.credits, 0);
      const gpa = totalPoints / totalCredits;

      expect(gpa).toBeCloseTo(7.35, 2);
    });

    test('should calculate GPA with retaken courses', async () => {
      const { sampleStudent, sampleCourses } = await setupTestData();
      
      // Original attempt (failed)
      const originalGrade = { course_id: 'CS101', grade: 4.0, credits: 3 };
      
      // Retake attempt (passed)
      const retakeGrade = { course_id: 'CS101', grade: 8.5, credits: 3 };
      
      // Use the higher grade for GPA calculation
      const effectiveGrade = Math.max(originalGrade.grade, retakeGrade.grade);
      const gpa = effectiveGrade; // Simplified for single course

      expect(gpa).toBe(8.5);
    });
  });

  describe('Academic Standing', () => {
    test('should determine academic standing based on GPA', async () => {
      const determineAcademicStanding = (gpa, creditsCompleted, requiredCredits) => {
        if (gpa >= 8.0 && creditsCompleted >= requiredCredits * 0.75) {
          return 'Xuất sắc';
        } else if (gpa >= 7.0 && creditsCompleted >= requiredCredits * 0.5) {
          return 'Khá';
        } else if (gpa >= 5.0) {
          return 'Trung bình';
        } else {
          return 'Yếu';
        }
      };

      const testCases = [
        { gpa: 8.5, credits: 90, required: 120, expected: 'Xuất sắc' },
        { gpa: 7.5, credits: 60, required: 120, expected: 'Khá' },
        { gpa: 6.0, credits: 30, required: 120, expected: 'Trung bình' },
        { gpa: 4.5, credits: 20, required: 120, expected: 'Yếu' }
      ];

      testCases.forEach(({ gpa, credits, required, expected }) => {
        const standing = determineAcademicStanding(gpa, credits, required);
        expect(standing).toBe(expected);
      });
    });

    test('should identify students on academic probation', async () => {
      const { sampleStudent } = await setupTestData();
      
      const probationCriteria = (gpa, failedCourses) => {
        return gpa < 5.0 || failedCourses >= 3;
      };

      const testCases = [
        { gpa: 4.5, failedCourses: 2, expected: true },
        { gpa: 5.5, failedCourses: 3, expected: true },
        { gpa: 6.0, failedCourses: 1, expected: false }
      ];

      testCases.forEach(({ gpa, failedCourses, expected }) => {
        const onProbation = probationCriteria(gpa, failedCourses);
        expect(onProbation).toBe(expected);
      });
    });

    test('should calculate academic progress percentage', async () => {
      const { sampleStudent } = await setupTestData();
      
      const calculateProgress = (creditsCompleted, totalRequiredCredits) => {
        return (creditsCompleted / totalRequiredCredits) * 100;
      };

      const testCases = [
        { completed: 30, required: 120, expected: 25 },
        { completed: 60, required: 120, expected: 50 },
        { completed: 90, required: 120, expected: 75 },
        { completed: 120, required: 120, expected: 100 }
      ];

      testCases.forEach(({ completed, required, expected }) => {
        const progress = calculateProgress(completed, required);
        expect(progress).toBe(expected);
      });
    });
  });

  describe('Graduation Requirements', () => {
    test('should check graduation eligibility', async () => {
      const { sampleStudent } = await setupTestData();
      
      const checkGraduationEligibility = (student) => {
        const requirements = {
          totalCredits: 120,
          gpa: 5.0,
          majorCredits: 60,
          generalCredits: 30,
          completedCourses: 40
        };

        const eligibility = {
          totalCreditsMet: student.creditsCompleted >= requirements.totalCredits,
          gpaMet: student.gpa >= requirements.gpa,
          majorCreditsMet: student.majorCredits >= requirements.majorCredits,
          generalCreditsMet: student.generalCredits >= requirements.generalCredits,
          coursesMet: student.completedCourses >= requirements.completedCourses
        };

        return {
          eligible: Object.values(eligibility).every(met => met),
          requirements: eligibility
        };
      };

      const eligibleStudent = {
        creditsCompleted: 125,
        gpa: 7.5,
        majorCredits: 65,
        generalCredits: 35,
        completedCourses: 42
      };

      const ineligibleStudent = {
        creditsCompleted: 110,
        gpa: 4.5,
        majorCredits: 55,
        generalCredits: 25,
        completedCourses: 35
      };

      const eligibleResult = checkGraduationEligibility(eligibleStudent);
      const ineligibleResult = checkGraduationEligibility(ineligibleStudent);

      expect(eligibleResult.eligible).toBe(true);
      expect(ineligibleResult.eligible).toBe(false);
    });

    test('should validate major requirements', async () => {
      const { sampleStudent } = await setupTestData();
      
      const majorRequirements = {
        'TATM': {
          requiredCourses: ['CS101', 'CS102', 'CS103'],
          electiveCredits: 15,
          totalMajorCredits: 60
        }
      };

      const validateMajorRequirements = (student, major) => {
        const requirements = majorRequirements[major];
        if (!requirements) return false;

        const completedRequired = requirements.requiredCourses.every(course => 
          student.completedCourses.includes(course)
        );
        const electiveCreditsMet = student.electiveCredits >= requirements.electiveCredits;
        const totalCreditsMet = student.majorCredits >= requirements.totalMajorCredits;

        return completedRequired && electiveCreditsMet && totalCreditsMet;
      };

      const validStudent = {
        major: 'TATM',
        completedCourses: ['CS101', 'CS102', 'CS103'],
        electiveCredits: 18,
        majorCredits: 65
      };

      const invalidStudent = {
        major: 'TATM',
        completedCourses: ['CS101', 'CS102'], // Missing CS103
        electiveCredits: 10, // Below requirement
        majorCredits: 55 // Below requirement
      };

      expect(validateMajorRequirements(validStudent, 'TATM')).toBe(true);
      expect(validateMajorRequirements(invalidStudent, 'TATM')).toBe(false);
    });

    test('should calculate remaining requirements', async () => {
      const { sampleStudent } = await setupTestData();
      
      const calculateRemainingRequirements = (student) => {
        const totalRequired = 120;
        const remainingCredits = totalRequired - student.creditsCompleted;
        const remainingCourses = Math.ceil(remainingCredits / 3); // Average 3 credits per course

        return {
          remainingCredits,
          remainingCourses,
          canGraduate: remainingCredits <= 0
        };
      };

      const student1 = { creditsCompleted: 100 };
      const student2 = { creditsCompleted: 120 };
      const student3 = { creditsCompleted: 125 };

      const result1 = calculateRemainingRequirements(student1);
      const result2 = calculateRemainingRequirements(student2);
      const result3 = calculateRemainingRequirements(student3);

      expect(result1.remainingCredits).toBe(20);
      expect(result1.canGraduate).toBe(false);
      expect(result2.remainingCredits).toBe(0);
      expect(result2.canGraduate).toBe(true);
      expect(result3.remainingCredits).toBe(-5);
      expect(result3.canGraduate).toBe(true);
    });
  });

  describe('Transcript Generation', () => {
    test('should generate complete transcript', async () => {
      const { sampleStudent, sampleCourses } = await setupTestData();
      
      const generateTranscript = (student, grades) => {
        const transcript = {
          student: {
            id: student._id,
            name: student.name,
            major: student.major,
            class_year: student.class_year
          },
          semesters: [],
          summary: {
            totalCredits: 0,
            totalPoints: 0,
            gpa: 0
          }
        };

        // Group grades by semester
        const semesterGrades = grades.reduce((acc, grade) => {
          const semester = grade.semester || 'Fall 2024';
          if (!acc[semester]) acc[semester] = [];
          acc[semester].push(grade);
          return acc;
        }, {});

        // Calculate semester GPAs
        Object.entries(semesterGrades).forEach(([semester, grades]) => {
          const semesterPoints = grades.reduce((sum, grade) => 
            sum + (grade.grade * grade.credits), 0);
          const semesterCredits = grades.reduce((sum, grade) => 
            sum + grade.credits, 0);
          const semesterGPA = semesterPoints / semesterCredits;

          transcript.semesters.push({
            semester,
            courses: grades,
            credits: semesterCredits,
            gpa: semesterGPA
          });

          transcript.summary.totalCredits += semesterCredits;
          transcript.summary.totalPoints += semesterPoints;
        });

        transcript.summary.gpa = transcript.summary.totalPoints / transcript.summary.totalCredits;
        return transcript;
      };

      const grades = [
        { course_id: 'CS101', grade: 8.5, credits: 3, semester: 'Fall 2024' },
        { course_id: 'CS102', grade: 9.0, credits: 3, semester: 'Fall 2024' },
        { course_id: 'CS103', grade: 7.5, credits: 4, semester: 'Spring 2025' },
        { course_id: 'MATH101', grade: 8.0, credits: 2, semester: 'Spring 2025' }
      ];

      const transcript = generateTranscript(sampleStudent, grades);

      expect(transcript.student.id).toBe('22120286');
      expect(transcript.semesters).toHaveLength(2);
      expect(transcript.summary.totalCredits).toBe(12);
      expect(transcript.summary.gpa).toBeCloseTo(8.21, 2);
    });

    test('should calculate semester honors', async () => {
      const { sampleStudent } = await setupTestData();
      
      const calculateSemesterHonors = (semesterGPA, credits) => {
        if (semesterGPA >= 8.5 && credits >= 12) {
          return 'Dean\'s List';
        } else if (semesterGPA >= 7.5 && credits >= 12) {
          return 'Honor Roll';
        } else {
          return 'None';
        }
      };

      const testCases = [
        { gpa: 8.8, credits: 15, expected: 'Dean\'s List' },
        { gpa: 8.0, credits: 12, expected: 'Honor Roll' },
        { gpa: 7.0, credits: 15, expected: 'None' },
        { gpa: 8.5, credits: 9, expected: 'None' } // Not enough credits
      ];

      testCases.forEach(({ gpa, credits, expected }) => {
        const honors = calculateSemesterHonors(gpa, credits);
        expect(honors).toBe(expected);
      });
    });
  });

  describe('Academic Performance Tracking', () => {
    test('should track academic improvement', async () => {
      const { sampleStudent } = await setupTestData();
      
      const trackAcademicProgress = (semesterGPAs) => {
        const trends = [];
        for (let i = 1; i < semesterGPAs.length; i++) {
          const change = semesterGPAs[i] - semesterGPAs[i - 1];
          trends.push({
            semester: i + 1,
            previousGPA: semesterGPAs[i - 1],
            currentGPA: semesterGPAs[i],
            change: change,
            trend: change > 0 ? 'Improving' : change < 0 ? 'Declining' : 'Stable'
          });
        }
        return trends;
      };

      const semesterGPAs = [7.0, 7.5, 8.0, 7.8, 8.5];
      const trends = trackAcademicProgress(semesterGPAs);

      expect(trends).toHaveLength(4);
      expect(trends[0].trend).toBe('Improving');
      expect(trends[1].trend).toBe('Improving');
      expect(trends[2].trend).toBe('Declining');
      expect(trends[3].trend).toBe('Improving');
    });

    test('should identify at-risk students', async () => {
      const { sampleStudent } = await setupTestData();
      
      const identifyAtRiskStudents = (students) => {
        return students.filter(student => {
          const riskFactors = [];
          
          if (student.gpa < 5.0) riskFactors.push('Low GPA');
          if (student.failedCourses >= 2) riskFactors.push('Multiple Failures');
          if (student.attendanceRate < 0.8) riskFactors.push('Poor Attendance');
          if (student.creditsCompleted < student.expectedCredits * 0.75) {
            riskFactors.push('Slow Progress');
          }
          
          return riskFactors.length >= 2; // At risk if 2+ factors
        });
      };

      const students = [
        { gpa: 4.5, failedCourses: 1, attendanceRate: 0.9, creditsCompleted: 80, expectedCredits: 100 },
        { gpa: 6.0, failedCourses: 2, attendanceRate: 0.7, creditsCompleted: 60, expectedCredits: 100 },
        { gpa: 7.5, failedCourses: 0, attendanceRate: 0.95, creditsCompleted: 90, expectedCredits: 100 }
      ];

      const atRiskStudents = identifyAtRiskStudents(students);
      expect(atRiskStudents).toHaveLength(1);
      expect(atRiskStudents[0].gpa).toBe(6.0);
    });

    test('should calculate academic efficiency', async () => {
      const { sampleStudent } = await setupTestData();
      
      const calculateAcademicEfficiency = (student) => {
        const attemptedCredits = student.attemptedCredits;
        const earnedCredits = student.earnedCredits;
        const efficiency = (earnedCredits / attemptedCredits) * 100;
        
        return {
          efficiency: efficiency,
          wastedCredits: attemptedCredits - earnedCredits,
          rating: efficiency >= 90 ? 'Excellent' : 
                 efficiency >= 80 ? 'Good' : 
                 efficiency >= 70 ? 'Fair' : 'Poor'
        };
      };

      const testCases = [
        { attempted: 100, earned: 95, expectedRating: 'Excellent' },
        { attempted: 100, earned: 85, expectedRating: 'Good' },
        { attempted: 100, earned: 75, expectedRating: 'Fair' },
        { attempted: 100, earned: 65, expectedRating: 'Poor' }
      ];

      testCases.forEach(({ attempted, earned, expectedRating }) => {
        const efficiency = calculateAcademicEfficiency({ attemptedCredits: attempted, earnedCredits: earned });
        expect(efficiency.rating).toBe(expectedRating);
      });
    });
  });
}); 