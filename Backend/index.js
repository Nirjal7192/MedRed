const express = require('express');
const cors = require('cors');
const { startScheduler, shutdownScheduler, loadExistingReminders } = require('./services/scheduler');
const authRouter = require('./routes/authRoutes');
const remindersRouter = require('./routes/reminderRoutes');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json());
// --- 1. Lifespan / Startup Logic ---
const initializeApp = async () => {
    console.log("🚀 Starting MedRed application...");
    
    // Equivalent to start_scheduler()
    startScheduler();
    
    // Equivalent to load_existing_reminders()
    const reminderCount = await loadExistingReminders();
    console.log(`✅ Application started with ${reminderCount} reminders scheduled`);
};

// --- 2. CORS Configuration ---
const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://medred.onrender.com"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// --- 3. Routes ---
app.use('/api/auth', authRouter);
app.use('/api/reminders', remindersRouter);
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the MedRed API! 🚀"
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        message: "MedRed API is running"
    });
});

// --- 4. Secret Docs Logic (Admin Key) ---
const verifyAdminKey = (req, res, next) => {
    const adminKey = req.query.admin_key || req.headers['x-admin-key'];
    if (adminKey !== "secret123") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

// In MERN, you'd usually serve Swagger via 'swagger-ui-express'
app.get('/secret-docs', verifyAdminKey, (req, res) => {
    res.send("<h1>Secret Docs</h1><p>Documentation UI would render here.</p>");
});

// --- 5. Exception Handlers (Middleware) ---

// Generic Error Handler (Catch-all)
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

// Graceful Shutdown (Equivalent to FastAPI shutdown)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down...');
    shutdownScheduler();
    server.close(() => {
        console.log('👋 Application shutdown complete');
        process.exit(0);
    });
});