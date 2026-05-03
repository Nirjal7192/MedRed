const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

// Import services and routers
const { startScheduler, shutdownScheduler, loadExistingReminders } = require('./services/scheduler');
const authRouter = require('./routes/authRoutes');
const remindersRouter = require('./routes/reminderRoutes');
const verifyAdminKey = require('./middleware/adminAuth'); // Import from middleware[cite: 1]

const app = express();
// --- 1. Global Middleware ---
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://medred.onrender.com"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// --- 2. Documentation Routes (Secret) ---
// swaggerUi.setup handles the rendering, so you don't need a separate app.get for this
app.use('/secret-docs', verifyAdminKey, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/openapi.json', verifyAdminKey, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// --- 3. Application Routes ---
app.use('/api/auth', authRouter);
app.use('/api/reminders', remindersRouter);

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the MedRed API! 🚀" });
});

app.get('/health', (req, res) => {
    res.json({ status: "ok", message: "MedRed API is running" });
});

// --- 4. Lifespan / Startup Logic ---
const initializeApp = async () => {
    console.log("🚀 Starting MedRed application...");
    startScheduler();
    const reminderCount = await loadExistingReminders();
    console.log(`✅ Application started with ${reminderCount} reminders scheduled`);
};

// --- 5. Exception Handlers ---
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    console.error(err.stack);
    res.status(statusCode).json({
        error: statusCode === 500 ? "Something went wrong 😞" : err.message,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// --- 6. Server Listen & Shutdown ---
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, async () => {
    await initializeApp();
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down...');
    shutdownScheduler();
    server.close(() => {
        console.log('👋 Application shutdown complete');
        process.exit(0);
    });
});