import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import loggerMiddleware from './middlewares/logger-middleware.js';
import "./models/index.js";
import indexRoute from './routes/index-route.js';

const app = express();
const port = 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(loggerMiddleware(path.join(__dirname, 'logs')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Static files served from root
app.use('/javascripts', express.static(path.resolve('public/javascript')));
app.use('/css', express.static(path.resolve('public/css')));
app.use('/images', express.static(path.resolve('public/images')));

app.use('/', indexRoute);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

await connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});