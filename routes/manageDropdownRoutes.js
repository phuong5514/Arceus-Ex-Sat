import express from "express";
import { getDropdowns, addMajor, addStatus, addProgram, deleteMajor, deleteStatus, deleteProgram } from "../controllers/manageDropdownsController.js";

const router = express.Router();

router.get("/", getDropdowns);
router.post("/major", addMajor);
router.post("/status", addStatus);
router.post("/program", addProgram);
router.delete("/major/:id", deleteMajor);
router.delete("/status/:id", deleteStatus);
router.delete("/program/:id", deleteProgram);

export default router;
