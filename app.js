import express from 'express';
import path from 'path';
import indexRoute from './routes/index-route.js';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import "./models/index.js";
import loggerMiddleware from './middlewares/logger-middleware.js';
import categoryRoute from './routes/category-route.js';
import courseRoute from './routes/course-route.js';
import enrollmentRoute from './routes/enrollment-route.js';

const app = express();
const port = 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(loggerMiddleware(path.join(__dirname, 'logs')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/', indexRoute);
app.use('/category', categoryRoute);
app.use('/course', courseRoute);
app.use('/enrollment', enrollmentRoute);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

await connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});