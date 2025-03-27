import express from "express";
import * as categoryController from "../controllers/category-controller.js";

const router = express.Router();

router.get("/", categoryController.getDropdowns);
router.post("/major", categoryController.addMajor);
router.post("/status", categoryController.addStatus);
router.post("/program", categoryController.addProgram);
router.delete("/major/:id", categoryController.deleteMajor);
router.delete("/status/:id", categoryController.deleteStatus);
router.delete("/program/:id", categoryController.deleteProgram);
router.patch("/major/:id", categoryController.renameMajor);
router.patch("/status/:id", categoryController.renameStatus);
router.patch("/program/:id", categoryController.renameProgram);

export default router;
