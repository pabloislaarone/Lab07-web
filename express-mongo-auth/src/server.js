import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import viewRoutes from './routes/views.routes.js';
import seedRoles from './utils/seedRoles.js';
import seedUsers from './utils/seedUsers.js';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Motor de plantillas EJS y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Habilitar CORS para todos
app.use(cors());

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/', viewRoutes);

// Validar estado del servidor
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Rutas inexistentes
app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Recurso no encontrado' });
    res.status(404).render('404', { title: 'No encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error(err);
    // Errores de validación de mongoose, ids mal formados y emails duplicados
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(e => e.message).join('. ');
        return res.status(400).json({ message });
    }
    if (err.name === 'CastError') return res.status(400).json({ message: 'Dato inválido' });
    if (err.code === 11000) return res.status(400).json({ message: 'El email ya se encuentra en uso' });

    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true })
    .then( async () => {
        console.log('Mongo connected');
        await seedRoles();
        await seedUsers();
        app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con Mongo:', err);
        process.exit(1);
    });
