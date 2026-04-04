/**
 * server.js - Node.js / Express Bridge Server
 *
 * Acts as a middleware between the HTML frontend and the C sorting executables.
 *
 * Endpoints:
 *   POST   /students       → Add a student to the in-memory list
 *   GET    /students       → Retrieve all students
 *   DELETE /students       → Clear all students
 *   GET    /sort/merge     → Merge sort via C executable
 *   GET    /sort/quick     → Quick sort via C executable
 *
 * The C executables (merge_sort.exe / quick_sort.exe) must be compiled
 * and placed inside ../backend/ before starting this server.
 */

const express  = require('express');
const cors     = require('cors');
const { spawn } = require('child_process');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = 3000;

/* ── Middleware ──────────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* Serve the frontend statically */
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* ── In-memory student store ─────────────────────────────────── */
let students = [];   /* Array of { name, roll, marks } objects   */

/* ── Path to compiled C executables ─────────────────────────── */
const BACKEND_DIR  = path.join(__dirname, '..', 'backend');
const MERGE_EXE    = path.join(BACKEND_DIR, 'merge_sort.exe');
const QUICK_EXE    = path.join(BACKEND_DIR, 'quick_sort.exe');

/* ── Helper: run a C executable with JSON via stdin ─────────── */
function runSorter(exePath, inputJSON) {
    return new Promise((resolve, reject) => {
        /* Check executable exists */
        if (!fs.existsSync(exePath)) {
            return reject(new Error(
                `Executable not found: ${exePath}\n` +
                'Please compile the C files first (see README).'
            ));
        }

        const proc   = spawn(exePath);
        let   output = '';
        let   errOut = '';

        proc.stdout.on('data', chunk => { output += chunk.toString(); });
        proc.stderr.on('data', chunk => { errOut += chunk.toString(); });

        proc.on('close', code => {
            if (code !== 0) {
                return reject(new Error(`Sorter exited with code ${code}: ${errOut}`));
            }
            try {
                const sorted = JSON.parse(output);
                resolve(sorted);
            } catch (e) {
                reject(new Error(`Failed to parse sorter output: ${output}`));
            }
        });

        proc.on('error', err => reject(err));

        /* Write student JSON to stdin of the C program */
        proc.stdin.write(inputJSON);
        proc.stdin.end();
    });
}

/* ═══════════════════════════════════════════════════════════════
   API  ROUTES
   ═══════════════════════════════════════════════════════════════ */

/**
 * POST /students
 * Body: { "name": "Alice", "roll": 1, "marks": 88 }
 * Adds a student to the list. Validates required fields.
 */
app.post('/students', (req, res) => {
    const { name, roll, marks } = req.body;

    /* Basic validation */
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required.' });
    }
    if (roll === undefined || isNaN(Number(roll))) {
        return res.status(400).json({ error: 'Roll number must be a valid number.' });
    }
    if (marks === undefined || isNaN(Number(marks)) ||
        Number(marks) < 0  || Number(marks) > 100) {
        return res.status(400).json({ error: 'Marks must be between 0 and 100.' });
    }

    const student = {
        name:  name.trim(),
        roll:  Number(roll),
        marks: Number(marks)
    };

    students.push(student);

    console.log(`[ADD] ${student.name} | Roll: ${student.roll} | Marks: ${student.marks}`);
    res.status(201).json({ message: 'Student added successfully.', student });
});

/**
 * GET /students
 * Returns all students in insertion order.
 */
app.get('/students', (req, res) => {
    res.json(students);
});

/**
 * DELETE /students
 * Clears all students from memory.
 */
app.delete('/students', (req, res) => {
    students = [];
    console.log('[CLEAR] All students removed.');
    res.json({ message: 'All students cleared.' });
});

/**
 * GET /sort/merge
 * Passes current student list to merge_sort.exe and returns sorted result.
 */
app.get('/sort/merge', async (req, res) => {
    if (students.length === 0) {
        return res.json([]);
    }
    try {
        const sorted = await runSorter(MERGE_EXE, JSON.stringify(students));
        console.log(`[MERGE SORT] Sorted ${sorted.length} students.`);
        res.json(sorted);
    } catch (err) {
        console.error('[MERGE SORT ERROR]', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /sort/quick
 * Passes current student list to quick_sort.exe and returns sorted result.
 */
app.get('/sort/quick', async (req, res) => {
    if (students.length === 0) {
        return res.json([]);
    }
    try {
        const sorted = await runSorter(QUICK_EXE, JSON.stringify(students));
        console.log(`[QUICK SORT] Sorted ${sorted.length} students.`);
        res.json(sorted);
    } catch (err) {
        console.error('[QUICK SORT ERROR]', err.message);
        res.status(500).json({ error: err.message });
    }
});

/* ── Start listening ─────────────────────────────────────────── */
app.listen(PORT, () => {
    console.log('');
    console.log('  ┌─────────────────────────────────────────┐');
    console.log('  │   Student Sorting Dashboard - Server    │');
    console.log('  │   http://localhost:' + PORT + '                  │');
    console.log('  └─────────────────────────────────────────┘');
    console.log('');
    console.log('  C executables expected at:');
    console.log('  ', MERGE_EXE);
    console.log('  ', QUICK_EXE);
    console.log('');
});
