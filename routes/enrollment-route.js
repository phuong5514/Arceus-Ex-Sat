import express from "express";
import * as enrollmentController from "../controllers/enrollment-controller.js";

const router = express.Router();

router.get("/", enrollmentController.getStudents);
router.get("/student/:id", enrollmentController.getStudent);
router.post("/register/:id", enrollmentController.registerClasses);
router.delete("/unregister/:id", enrollmentController.unregisterClasses);
router.get("/student/transcript/:id", enrollmentController.getTranscript);

export default router;
