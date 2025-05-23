import express from "express";
import * as courseController from "../controllers/course-controller.js";

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.post('/', courseController.addCourse);
router.get('/add', courseController.getCourseAdd);
router.get('/edit/:id', courseController.getCourseDetailEdit);
router.get('/:id', courseController.getCourseDetail);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

export default router;