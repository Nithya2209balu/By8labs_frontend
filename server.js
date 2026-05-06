import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// ── Module root paths ─────────────────────────────────────────
const HR_DIR = path.join(__dirname, 'HR');
const SP_DIR = path.join(__dirname, 'Student portal backend', 'Student portal backend');

// ── Load environment variables ────────────────────────────────
dotenv.config({ path: path.join(HR_DIR, '.env') });

const SP_ENV_PATH = path.join(SP_DIR, '.env');
if (fs.existsSync(SP_ENV_PATH)) {
    const parsed = dotenv.parse(fs.readFileSync(SP_ENV_PATH));
    for (const [k, v] of Object.entries(parsed)) {
        // We use MONGO_URI for SP and MONGODB_URI for HR
        if (process.env[k] === undefined) process.env[k] = v;
    }
}

// ── Database ──────────────────────────────────────────────────
import connectDB from './HR/config/db.js';

// Connect to HR DB (Default connection)
connectDB();

// Connect to Student Portal DB (Secondary connection if URI differs)
// Note: If both modules use the default mongoose connection, they might conflict 
// unless we use named connections. For now, we'll ensure both URIs are available.
const connectSP = async () => {
    const spUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (spUri && spUri !== process.env.MONGODB_URI) {
        try {
            await mongoose.createConnection(spUri).asPromise();
            console.log('✅  Student Portal DB Connection Ready (Secondary)');
        } catch (err) {
            console.error('❌  Student Portal DB Connection Error:', err.message);
        }
    }
};
connectSP();

// ── Cron jobs (Student Portal) ────────────────────────────────
try {
    const { initCronJobs } = require(`${SP_DIR}/config/cron`);
    initCronJobs();
    console.log('⏰  Cron jobs initialised');
} catch (_) { /* not present — skip */ }

// ── App ───────────────────────────────────────────────────────
const app = express();

// Request Logger
app.use((req, res, next) => {
    if (!req.path.startsWith('/assets/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// DB health-check
app.use((req, res, next) => {
    const ok = mongoose.connection.readyState === 1;
    if (!ok && req.path.startsWith('/api/') && !req.path.includes('/test') && req.path !== '/') {
        return res.status(503).json({ message: 'Database unavailable. Try again later.', status: 'disconnected' });
    }
    next();
});

app.use(cors());

// Stripe webhook needs raw body — bypass express.json() for that route only
app.use((req, res, next) => {
    if (req.originalUrl === '/api/stripe/webhook') return next();
    express.json({ limit: '50mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads from both modules
app.use('/uploads', express.static(path.join(HR_DIR,  'uploads')));
app.use('/uploads', express.static(path.join(SP_DIR, 'uploads')));

// ── Helpers ───────────────────────────────────────────────────
const hr = (r) => {
    try {
        const m = require(`${HR_DIR}/routes/${r}`);
        return m.default || m;
    } catch (err) {
        console.error(`❌  Failed to load HR route [${r}]:`, err.message);
        return (req, res) => res.status(500).json({ error: `Route ${r} failed to load` });
    }
};
const sp = (r) => {
    try {
        const m = require(`${SP_DIR}/routes/${r}`);
        return m.default || m;
    } catch (err) {
        console.error(`❌  Failed to load SP route [${r}]:`, err.message);
        return (req, res) => res.status(500).json({ error: `Route ${r} failed to load` });
    }
};

// ═════════════════════════════════════════════════════════════
//  HR MODULE ROUTES
// ═════════════════════════════════════════════════════════════
app.use('/api/auth',                 hr('auth'));
app.use('/api/employees',            hr('employees'));
app.use('/api/attendance',           hr('attendance'));
// app.use('/api/attendance',           hr('studentAttendance')); // Conflict!
app.use('/api/student-attendance',   hr('studentAttendance'));
app.use('/api/leaves',               hr('leaves'));
app.use('/api/payroll',              hr('payroll'));
app.use('/api/dashboard',            hr('dashboard'));
app.use('/api/access-requests',      hr('accessRequests'));
app.use('/api/announcements',        hr('announcements'));
app.use('/api/holidays',             hr('holidays'));
app.use('/api/feedback',             hr('feedback'));
app.use('/api/emails',               hr('emails'));
app.use('/api/email-config',         hr('emailConfig'));
app.use('/api',                      hr('testImap'));

// Recruitment
app.use('/api/recruitment/jobs',        hr('recruitment-jobs'));
app.use('/api/recruitment/candidates',  hr('recruitment-candidates'));
app.use('/api/recruitment/interviews',  hr('recruitment-interviews'));
app.use('/api/recruitment/offers',      hr('recruitment-offers'));

// Reports, Performance, Documents
app.use('/api/reports',              hr('reports'));
app.use('/api/performance',          hr('performance'));
app.use('/api/documents',            hr('documents'));

// HR Certificates
app.use('/api/experience-letters',   hr('experienceLetters'));
app.use('/api/offer-letters-hr',     hr('offerLettersHR'));

// Student management (HR-admin side)
app.use('/api/students',             hr('students'));
app.use('/api/student-courses',      hr('studentCourses'));
app.use('/api/student-fees',         hr('studentFees'));
app.use('/api/student-leaves',       hr('studentLeaves'));
app.use('/api/student-assignments',  hr('studentAssignments'));
app.use('/api/student-reports',      hr('studentReports'));
app.use('/api/student-admissions',   hr('studentAdmissions'));
app.use('/api/courses',              hr('courses'));
app.use('/api/payments',             hr('payments'));

// ═════════════════════════════════════════════════════════════
//  STUDENT PORTAL MODULE ROUTES
// ═════════════════════════════════════════════════════════════
app.use('/api/notifications',   sp('notifications'));
app.use('/api/enrollments',     sp('enrollments'));
app.use('/api/leaderboard',     sp('leaderboard'));
app.use('/api/admin',           sp('admin'));
app.use('/api/upload',          sp('upload'));
app.use('/api/leave',           sp('leave'));           // student leave (/api/leave vs /api/leaves)
app.use('/api/tasks',           sp('task'));
app.use('/api/users',           sp('users'));
app.use('/api/stripe',          sp('stripeRoutes'));
app.use('/api/certificates',    sp('certificateRoutes'));
app.use('/api/admissions',      sp('admissions'));
app.use('/api/sp/auth',         sp('auth'));            // student login/register
app.use('/api/sp/dashboard',    sp('dashboard'));       // student dashboard
app.use('/api/sp/attendance',   sp('attendance'));      // student attendance (SP version)

// ── Debug Routes ──────────────────────────────────────────────
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) { // routes registered directly on the app
            routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    const path = handler.route.path;
                    const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                    routes.push(`${methods} ${middleware.regexp.toString()} ${path}`);
                }
            });
        }
    });
    res.json({ count: routes.length, routes });
});

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ success: true, message: '🚀 BY8Labs Unified API', version: '2.1', modules: ['HR', 'Student Portal'] });
});

// ── Serve React frontend ──────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// Specific API 404 handler to avoid serving index.html for missing endpoints
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `API Route ${req.originalUrl} not found` });
});

app.get('*', (req, res) => {
    const idx = path.join(__dirname, 'public/index.html');
    res.sendFile(idx, (err) => {
        if (err) res.status(404).json({ success: false, message: `File not found` });
    });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀  BY8Labs Unified Server  →  port ${PORT}`);
    console.log(`    HR module      : ${HR_DIR}`);
    console.log(`    Student Portal : ${SP_DIR}`);
});

