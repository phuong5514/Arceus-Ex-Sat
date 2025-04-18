import express from "express";
import * as classController from "../controllers/class-controller.js";

const router = express.Router();

router.get('/', classController.getAllClasses);
router.get('/add', classController.getClassDetailAdd);
router.get('/:id', classController.getClassDetail);
router.get('/edit/:id', classController.getClassDetailEdit);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);
router.post('/', classController.createClass);

export default router;