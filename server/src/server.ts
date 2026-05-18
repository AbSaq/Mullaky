import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import buildingRoutes from "./routes/building.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.SERVER_PORT || 1221;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/auth", authRoutes);
app.use("/buildings", buildingRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
