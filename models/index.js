// This script load all models before they are used
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {};

fs.readdirSync(__dirname)
  .filter(file => file !== "index.js") // Ignore this file
  .forEach(file => {
    import(`file://${path.join(__dirname, file)}`).then((model) => {
      models[model.default.modelName] = model.default;
    });
  });

export default models;
