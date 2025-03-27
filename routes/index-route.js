import express, { query } from 'express';
import * as studentController from '../controllers/student-controller.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

router.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    abortOnLimit: true,
    responseOnLimit: "File size is too large",
    safeFileNames: true,
    preserveExtension: true
}));

router.get("/", studentController.getAllStudents);

router.get("/search", studentController.searchStudents);

router.post("/students", studentController.addStudent);

router.put("/students/:student_id", studentController.updateStudent);

router.delete("/students", studentController.deleteStudents);

router.get('/import', studentController.showImportPage);

router.post('/import', studentController.importStudents);

router.get('/export-download', studentController.exportAllStudents);

export default router;
