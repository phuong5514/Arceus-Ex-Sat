import express, { query } from 'express';
import dayjs from 'dayjs';
import { addStudent, deleteStudents, getAllStudents, updateStudent, searchStudents, showImportPage, importStudents } from '../controllers/studentController.js';
import fileUpload from 'express-fileupload';


const router = express.Router();
const PAGE_SIZE = 20;

// Cấu hình file upload
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

router.get("/", getAllStudents);

router.get("/search", searchStudents);

router.post("/students", addStudent);

router.put("/students/:student_id", updateStudent);

router.delete("/students", deleteStudents);

router.get('/import', showImportPage);

router.post('/import', importStudents);


export default router;
