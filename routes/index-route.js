import express from 'express';
import en from '../languages/en.js';
import vi from '../languages/vi.js';
import studentRoute from './student-route.js';
import categoryRoute from './category-route.js';
import classRoute from './class-route.js';
import enrollmentRoute from './enrollment-route.js';
import courseRoute from './course-route.js';

const router = express.Router();

// Language middleware
router.use('/:lang(vi|en)?', (req, res, next) => {
  const lang = req.params.lang || '';
  res.locals.lang = lang;
  res.locals.t = lang === 'en' ? en : vi;
  next();
});

// Redirect base `/` to `/vi/student`
router.get('/', (req, res) => {
  res.redirect('/vi/student');
});

// Redirect `/vi` or `/en` to `/vi/student` or `/en/student`
router.get('/:lang(vi|en)', (req, res) => {
  res.redirect(`/${req.params.lang}/student`);
});

// Mount route handlers under language prefix
router.use('/:lang(vi|en)?/student', studentRoute);
router.use('/:lang(vi|en)?/course', courseRoute);
router.use('/:lang(vi|en)?/class', classRoute);
router.use('/:lang(vi|en)?/category', categoryRoute);
router.use('/:lang(vi|en)?/enrollment', enrollmentRoute);

export default router;
