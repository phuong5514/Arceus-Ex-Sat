import express, { json } from 'express';
import path from 'path';
import indexRoute from './routes/indexRoute.js';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import "./models/index.js";

const app = express();
const port = 3000;
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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