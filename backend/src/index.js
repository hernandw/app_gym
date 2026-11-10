import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import routineRoutes from './routes/routineRoutes.js';

dotenv.config();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL // URL de GitHub Pages (ej: https://usuario.github.io)
].filter(Boolean);

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/routines', routineRoutes);

// Endpoint de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});