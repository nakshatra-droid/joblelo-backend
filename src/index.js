import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import db from "./models/index.js";

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    if (process.env.NODE_ENV !== "test") {
      await db.sequelize.sync({ alter: true });
      console.log("Database synced successfully");
    } else {
      console.log("Running in test mode — skipping DB sync");
    }

    app.listen(PORT, () => {
      console.log(`Server running at ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
