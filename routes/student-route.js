import express, { query } from 'express';
import * as studentController from '../controllers/student-controller.js';
import fileUpload from 'express-fileupload';
import { validateAddStudent, validateUpdateStudent } from '../middlewares/validator-middleware.js';

const router = express.Router();

// Limit uploaded file size to 50MiB
router.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 50 * 1024 * 1024 
    },
    abortOnLimit: true,
    responseOnLimit: 'File size is too large',
    safeFileNames: true,
    preserveExtension: true
}));

router.get('/', studentController.getAllStudents);

router.post('/', validateAddStudent, studentController.addStudent);

router.put('/:student_id', studentController.updateStudent);

router.delete('/', studentController.deleteStudents);

router.get('/search', studentController.searchStudents);

router.get('/import', studentController.showImportPage);

router.post('/import', studentController.importStudents);

router.get('/export-download', studentController.exportAllStudents);

export default router;
