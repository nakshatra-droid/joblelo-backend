import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize, DataTypes } from "sequelize";
import configObj from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = process.env.NODE_ENV || "development";
const cfg = configObj[env];
const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);
const db = { sequelize, Sequelize };
const files = fs
  .readdirSync(__dirname)
  .filter((f) => f !== "index.js" && f.endsWith(".js"));
for (const file of files) {
  const modelPath = path.join(__dirname, file);
  const { default: defineModel } = await import(modelPath);
  const model = defineModel(sequelize, DataTypes);
  const modelName = model.name.charAt(0).toUpperCase() + model.name.slice(1);
  db[modelName] = model;
}
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
