const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { startScheduler, shutdownScheduler, loadExistingReminders } = require('./services/scheduler');
const authRouter = require('./routes/authRoutes');
const settings = require('./config.js');
const remindersRouter = require('./routes/reminderRoutes');
const verifyAdminKey = require('./middleware/adminAuth');

const PORT = process.env.PORT || 8000; // ✅ Declare PORT at the top

const app = express();

// --- 1. Global Middleware ---
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// --- 2. CORS ---
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://medred.onrender.com"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!allowedOrigins.includes(origin)) {
            return callback(new Error('CORS policy: Origin not allowed'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// --- 3. Documentation Routes ---
app.use('/secret-docs', verifyAdminKey, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', verifyAdminKey, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// --- 4. Application Routes ---
app.use('/api/auth', authRouter);
app.use('/api/reminders', remindersRouter);

app.get('/', (req, res) => res.json({ message: "Welcome to the MedRed API! 🚀" }));
app.get('/health', (req, res) => res.json({ status: "ok", message: "MedRed API is running" }));

// --- 5. Error Handler ---
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    console.error(err.stack);
    res.status(statusCode).json({
        error: statusCode === 500 ? "Something went wrong 😞" : err.message,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// --- 6. Single Startup Flow ✅ ---
const initializeApp = async () => {
    console.log("🚀 Starting MedRed application...");
    startScheduler();
    const reminderCount = await loadExistingReminders();
    console.log(`✅ Application started with ${reminderCount} reminders scheduled`);
};

console.log("URI:", settings.MONGODB_URI);
mongoose.connect(settings.MONGODB_URI)
    .then(async () => {
        console.log("📦 Connected to MongoDB");

        const server = app.listen(PORT, async () => {
            await initializeApp();
            console.log(`🟢 Server is running on port ${PORT}`);
        });

        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM received. Shutting down...');
            shutdownScheduler();
            server.close(() => {
                console.log('👋 Shutdown complete');
                process.exit(0);
            });
        });
    })
    .catch(err => {
        console.error("❌ Critical: MongoDB connection failed. Server not started.");
        console.error("Reason:", err.message);
        process.exit(1); // ✅ Exit cleanly so the process doesn't hang
    });