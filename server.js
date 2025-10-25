// ✅ Cargar variables de entorno antes de cualquier otra importación
import 'dotenv/config';

import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;


app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor ElySport funcionando correctamente 🚀");
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 ElySport Backend running on port ${PORT}`);
});
