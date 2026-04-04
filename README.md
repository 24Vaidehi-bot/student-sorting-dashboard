# 📚 Student Sorting Dashboard

A full-stack **DSA Mini Project** demonstrating **Merge Sort** and **Quick Sort** algorithms on a live student dataset.

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS (Vanilla), JavaScript |
| Bridge/API | Node.js + Express |
| Sorting Core | **C** (compiled executables) |
| Storage | In-memory (no database) |

---

## 🗂 Project Structure

```
DAA mini project/
├── frontend/
│   ├── index.html        ← Dashboard UI
│   ├── style.css         ← Styling
│   └── app.js            ← Frontend logic
├── backend/
│   ├── students.h        ← Shared Student struct + JSON helpers
│   ├── merge_sort.c      ← Merge Sort implementation
│   ├── quick_sort.c      ← Quick Sort implementation
│   └── Makefile          ← Build script
├── node-bridge/
│   ├── server.js         ← Express API bridge
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Run

### Step 1 — Compile the C programs

> **Prerequisite:** GCC must be installed. On Windows, install [MinGW-w64](https://www.mingw-w64.org/) or [MSYS2](https://www.msys2.org/).

```powershell
# Open a terminal in the project root
cd backend
gcc merge_sort.c -o merge_sort.exe
gcc quick_sort.c -o quick_sort.exe
```

Or use the Makefile (if you have `make`):
```powershell
cd backend
make
```

### Step 2 — Install Node.js dependencies

```powershell
cd node-bridge
npm install
```

### Step 3 — Start the server

```powershell
cd node-bridge
node server.js
```

The server starts at **http://localhost:3000**

The browser will automatically serve the frontend from that URL.

### Step 4 — Open in Browser

Navigate to: **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/students` | Add a student `{ name, roll, marks }` |
| `GET`  | `/students` | Get all students |
| `DELETE` | `/students` | Clear all students |
| `GET`  | `/sort/merge` | Merge sort result |
| `GET`  | `/sort/quick` | Quick sort result |

---

## 🧠 Algorithms Explained

### Merge Sort — O(n log n) always

1. **Divide**: Split array into two halves recursively until each has 1 element
2. **Conquer**: Each single element is trivially sorted
3. **Merge**: Combine sorted halves by comparing elements one-by-one

**Properties**: Stable, requires O(n) extra space, guaranteed O(n log n)

### Quick Sort — O(n log n) average

1. **Choose pivot**: Pick the last element as pivot
2. **Partition**: Move elements smaller than pivot to left, larger to right
3. **Recurse**: Sort left and right partitions independently

**Properties**: In-place (O(log n) stack), not stable, O(n²) worst case (rare)

---

## 🎓 Sorting Criteria

- **Primary**: Marks — Descending (highest marks first)
- **Secondary** (tie-break): Roll Number — Ascending

---

## 📋 Requirements

- GCC (for compiling C files)
- Node.js v14+ and npm
