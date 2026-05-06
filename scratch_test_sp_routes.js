import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const SP_DIR = path.join(__dirname, 'Student portal backend', 'Student portal backend');

const sp = (r) => {
    try {
        const m = require(`${SP_DIR}/routes/${r}`);
        return m.default || m;
    } catch (err) {
        console.error(`Error loading SP route ${r}:`, err.message);
        return null;
    }
};

const adminRouter = sp('admin');
if (adminRouter) {
    console.log('Admin router loaded successfully');
    console.log('Routes:', adminRouter.stack.map(layer => layer.route ? layer.route.path : 'middleware'));
} else {
    console.log('Failed to load admin router');
}
