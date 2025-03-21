import express, { json } from 'express';
import path from 'path';
import indexRoute from './routes/indexRoute.js';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import "./models/index.js";
import fs from 'fs';

const app = express();
const port = 3000;
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}


// Middleware logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  // Lưu response.end gốc
  const originalEnd = res.end;

  // Override response.end để có thể log sau khi response hoàn thành
  res.end = function (chunk, encoding, callback) {
    const duration = Date.now() - startTime;
    const logEntry = `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`;

    // Ghi log request vào file access.log
    fs.appendFileSync(path.join(logsDir, 'access.log'), logEntry);

    // Ghi log chi tiết cho các thao tác CRUD
    if (req.url.startsWith('/students')) {
      const crudLog = `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`;
      if (res.statusCode >= 400) {
        fs.appendFileSync(path.join(logsDir, 'crud_error.log'), crudLog);
      } else {
        fs.appendFileSync(path.join(logsDir, 'crud_success.log'), crudLog);
      }
    }

    // Gọi response.end gốc
    originalEnd.call(this, chunk, encoding, callback);
  };

  next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/', indexRoute);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

await connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

import manageDropdownRoutes from "./routes/manageDropdownRoutes.js";
app.use("/manage-dropdowns", manageDropdownRoutes);