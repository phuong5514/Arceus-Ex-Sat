import express from "express";
import * as enrollmentController from "../controllers/enrollment-controller.js";

const router = express.Router();

router.get("/", enrollmentController.getStudents);
router.get("/student/:id", enrollmentController.getStudent);

export default router;
