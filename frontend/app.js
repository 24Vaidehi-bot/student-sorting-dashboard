/**
 * app.js  —  Student Sorting Dashboard
 *
 * Sections:
 *  A. Constants & DOM refs
 *  B. Utilities (grade, toast, status, slider sync)
 *  C. Table rendering
 *  D. Step recorders — JS implementations of Merge Sort & Quick Sort
 *     that capture every comparison / swap / pivot / merge as a "step"
 *  E. Animator — plays steps back as a colour-animated bar chart
 *  F. API calls (uses C backend via Node bridge)
 *  G. Event wiring & init
 */

/* ══════════════════════════════════════════════════════════════
   A. CONSTANTS & DOM REFS
   ══════════════════════════════════════════════════════════════ */

const API = 'http://localhost:3000';

const DEMO_STUDENTS = [
  { name: 'Alice Sharma',  roll: 101, marks: 92 },
  { name: 'Bob Mehta',     roll: 102, marks: 78 },
  { name: 'Carol Singh',   roll: 103, marks: 85 },
  { name: 'David Patel',   roll: 104, marks: 55 },
  { name: 'Eva Nair',      roll: 105, marks: 97 },
  { name: 'Frank Joshi',   roll: 106, marks: 63 },
];

/* DOM */
const form         = document.getElementById('addStudentForm');
const nameInput    = document.getElementById('studentName');
const rollInput    = document.getElementById('rollNumber');
const marksInput   = document.getElementById('marks');
const marksSlider  = document.getElementById('marksSlider');
const marksDisplay = document.getElementById('marksDisplay');
const formError    = document.getElementById('formError');
const addBtn       = document.getElementById('addStudentBtn');
const loadDemoBtn  = document.getElementById('loadDemoBtn');
const clearAllBtn  = document.getElementById('clearAllBtn');
const mergeSortBtn = document.getElementById('mergeSortBtn');
const quickSortBtn = document.getElementById('quickSortBtn');
const tableBody    = document.getElementById('studentTableBody');
const studentCount = document.getElementById('studentCount');
const statusBar    = document.getElementById('statusBar');
const statusText   = document.getElementById('statusText');
const toast        = document.getElementById('toast');

/* Visualizer DOM */
const vizPanel       = document.getElementById('vizPanel');
const vizTitle       = document.getElementById('vizTitle');
const vizBars        = document.getElementById('vizBars');
const vizSortInfo    = document.getElementById('vizSortInfo');
const vizDescription = document.getElementById('vizDescription');
const vizPlayPause   = document.getElementById('vizPlayPause');
const vizRestart     = document.getElementById('vizRestart');
const vizStepBack    = document.getElementById('vizStepBack');
const vizStepFwd     = document.getElementById('vizStepFwd');
const vizSpeed       = document.getElementById('vizSpeed');
const vizStepNum     = document.getElementById('vizStepNum');
const vizStepTotal   = document.getElementById('vizStepTotal');
const vizProgressFill= document.getElementById('vizProgressFill');
const closeVizBtn    = document.getElementById('closeVizBtn');
const legendLeft     = document.getElementById('legendLeft');
const legendRight    = document.getElementById('legendRight');
const legendSwap     = document.getElementById('legendSwap');
const legendPivot    = document.getElementById('legendPivot');

/* ══════════════════════════════════════════════════════════════
   B. UTILITIES
   ══════════════════════════════════════════════════════════════ */

function getGrade(marks) {
  if (marks >= 90) return { label: 'A+', cls: 'grade-a-plus' };
  if (marks >= 80) return { label: 'A',  cls: 'grade-a'     };
  if (marks >= 70) return { label: 'B',  cls: 'grade-b'     };
  if (marks >= 60) return { label: 'C',  cls: 'grade-c'     };
  if (marks >= 50) return { label: 'D',  cls: 'grade-d'     };
  return              { label: 'F',  cls: 'grade-f'     };
}

function marksColor(marks) {
  if (marks >= 90) return '#3fb950';
  if (marks >= 75) return '#2dd4bf';
  if (marks >= 60) return '#a78bfa';
  if (marks >= 50) return '#f0c040';
  return '#f85149';
}

let toastTimer = null;
function showToast(msg, type = 'info') {
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function setStatus(text, state = 'idle') {
  statusBar.className = `status-bar status-${state}`;
  statusText.textContent = text;
}

function updateSortButtons(count) {
  mergeSortBtn.disabled = count === 0;
  quickSortBtn.disabled = count === 0;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Slider ↔ input sync */
marksSlider.addEventListener('input', () => {
  marksInput.value = marksSlider.value;
  marksDisplay.textContent = marksSlider.value;
});
marksInput.addEventListener('input', () => {
  const v = parseInt(marksInput.value, 10);
  if (!isNaN(v) && v >= 0 && v <= 100) {
    marksSlider.value = v;
    marksDisplay.textContent = v;
  }
});
marksDisplay.textContent = marksSlider.value;
marksInput.value = marksSlider.value;

/* ══════════════════════════════════════════════════════════════
   C. TABLE RENDERING
   ══════════════════════════════════════════════════════════════ */

function renderTable(students, isSorted = false, algo = null) {
  tableBody.innerHTML = '';

  if (students.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row"><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">🎓</div>
          <p>No students yet. Add one using the form!</p>
        </div>
      </td></tr>`;
    studentCount.textContent = '0 students';
    updateSortButtons(0);
    setStatus('Add students to get started.');
    return;
  }

  const sortedCls = algo === 'quick' ? 'sorted-row sorted-by-quick' : 'sorted-row';

  students.forEach((s, i) => {
    const grade = getGrade(s.marks);
    const rank  = i + 1;
    let rankClass = '';
    if (isSorted) {
      if (rank === 1) rankClass = 'rank-1';
      else if (rank === 2) rankClass = 'rank-2';
      else if (rank === 3) rankClass = 'rank-3';
    }
    const rowClass  = isSorted ? `${sortedCls} ${rankClass}`.trim() : rankClass;
    const rankLabel = isSorted && rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank;
    const barColor  = marksColor(s.marks);

    const tr = document.createElement('tr');
    tr.className = rowClass;
    tr.style.animationDelay = `${i * 0.04}s`;
    tr.innerHTML = `
      <td>${rankLabel}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${s.roll}</td>
      <td>
        <div class="marks-cell">
          <div class="marks-bar-wrap">
            <div class="marks-bar-fill" style="width:${s.marks}%;background:${barColor}"></div>
          </div>
          <span class="marks-val">${s.marks}</span>
        </div>
      </td>
      <td><span class="grade-badge ${grade.cls}">${grade.label}</span></td>`;
    tableBody.appendChild(tr);
  });

  studentCount.textContent = `${students.length} student${students.length !== 1 ? 's' : ''}`;
  updateSortButtons(students.length);
}

/* ══════════════════════════════════════════════════════════════
   D. STEP RECORDERS
   Each recorder returns an array of "step" objects.
   A step describes the complete array state + which indices are
   highlighted and why — so the animator can colour them.

   Step shape:
   {
     array:       Student[],   // snapshot of the full array
     phase:       string,      // 'divide'|'compare'|'merge'|'merged'
                               // 'pivot'|'swap'|'place-pivot'|'done'
     comparing:   number[],    // indices being compared (yellow)
     swapping:    number[],    // indices being swapped (red)
     pivotIdx:    number,      // pivot index (orange)  — QS only
     leftSub:     [l,r],       // left sub-array range  — MS only
     rightSub:    [l,r],       // right sub-array range — MS only
     rangeActive: [l,r],       // current partition range — QS only
     finalSorted: Set<number>, // indices in their final position
     description: string,      // human-readable explanation
   }
   ══════════════════════════════════════════════════════════════ */

/* ── Comparison helper (same logic as C code) ─────────────── */
/* Returns true if a should come BEFORE b (higher marks first) */
function shouldComeFirst(a, b) {
  if (a.marks !== b.marks) return a.marks > b.marks;
  return a.roll < b.roll;
}

/* ────────────────────────────────────────────────────────────
   D-1. MERGE SORT step recorder
   ──────────────────────────────────────────────────────────── */
function recordMergeSort(original) {
  const steps   = [];
  const arr     = original.map(s => ({ ...s }));     // working copy
  const sorted  = new Set();                           // final positions

  function snap(phase, opts = {}) {
    steps.push({
      array:       arr.map(s => ({ ...s })),
      phase,
      comparing:   opts.comparing   ?? [],
      swapping:    opts.swapping    ?? [],
      pivotIdx:    -1,
      leftSub:     opts.leftSub     ?? null,
      rightSub:    opts.rightSub    ?? null,
      rangeActive: null,
      finalSorted: new Set(sorted),
      description: opts.desc ?? '',
    });
  }

  function merge(left, mid, right) {
    const L = arr.slice(left,  mid + 1).map(s => ({ ...s }));
    const R = arr.slice(mid + 1, right + 1).map(s => ({ ...s }));
    let i = 0, j = 0, k = left;

    /* Show the two halves about to be merged */
    snap('divide', {
      leftSub:  [left, mid],
      rightSub: [mid + 1, right],
      desc: `Merging left[${left}–${mid}] with right[${mid+1}–${right}]`,
    });

    while (i < L.length && j < R.length) {
      const li = left + i;      // original index of L[i]
      const ri = mid + 1 + j;  // original index of R[j]

      /* Compare step */
      snap('compare', {
        comparing: [li, ri],
        leftSub:  [left, mid],
        rightSub: [mid + 1, right],
        desc: `Compare ${L[i].name}(${L[i].marks}) vs ${R[j].name}(${R[j].marks}) — pick ${shouldComeFirst(L[i], R[j]) ? L[i].name : R[j].name}`,
      });

      if (shouldComeFirst(L[i], R[j])) {
        arr[k] = { ...L[i] }; i++;
      } else {
        arr[k] = { ...R[j] }; j++;
      }
      k++;
    }
    while (i < L.length)  { arr[k++] = { ...L[i++] }; }
    while (j < R.length)  { arr[k++] = { ...R[j++] }; }

    /* Mark entire merged range as sorted */
    for (let x = left; x <= right; x++) sorted.add(x);

    snap('merged', {
      leftSub:  [left, right],
      rightSub: null,
      desc: `✔ Merged [${left}–${right}] → subarray now sorted`,
    });
  }

  function mergeSort(left, right) {
    if (left >= right) {
      sorted.add(left);
      return;
    }
    const mid = Math.floor((left + right) / 2);

    snap('divide', {
      leftSub:  [left, mid],
      rightSub: [mid + 1, right],
      desc: `Divide [${left}–${right}] → left half [${left}–${mid}] | right half [${mid+1}–${right}]`,
    });

    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, arr.length - 1);

  /* Final "done" frame */
  for (let i = 0; i < arr.length; i++) sorted.add(i);
  snap('done', { desc: '✅ Merge Sort complete! Array fully sorted.' });

  return steps;
}

/* ────────────────────────────────────────────────────────────
   D-2. QUICK SORT step recorder
   ──────────────────────────────────────────────────────────── */
function recordQuickSort(original) {
  const steps  = [];
  const arr    = original.map(s => ({ ...s }));
  const sorted = new Set();

  function snap(phase, opts = {}) {
    steps.push({
      array:       arr.map(s => ({ ...s })),
      phase,
      comparing:   opts.comparing   ?? [],
      swapping:    opts.swapping    ?? [],
      pivotIdx:    opts.pivotIdx    ?? -1,
      leftSub:     null,
      rightSub:    null,
      rangeActive: opts.range       ?? null,
      finalSorted: new Set(sorted),
      description: opts.desc ?? '',
    });
  }

  function partition(low, high) {
    const piv = high;   /* Pivot is always the last element */

    snap('pivot', {
      pivotIdx: piv,
      range: [low, high],
      desc: `Pivot = ${arr[piv].name}(${arr[piv].marks}) at index [${piv}]. Partitioning [${low}–${high}]`,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      /* Compare arr[j] with pivot */
      snap('compare', {
        pivotIdx: piv,
        comparing: [j, piv],
        range: [low, high],
        desc: `Compare ${arr[j].name}(${arr[j].marks}) with pivot ${arr[piv].name}(${arr[piv].marks})`,
      });

      if (shouldComeFirst(arr[j], arr[piv])) {
        i++;
        /* Swap arr[i] ↔ arr[j] */
        [arr[i], arr[j]] = [arr[j], arr[i]];
        snap('swap', {
          pivotIdx: piv,
          swapping: [i, j],
          range: [low, high],
          desc: `Swap ${arr[i].name}(${arr[i].marks}) ↔ ${arr[j].name}(${arr[j].marks}) — move higher value left`,
        });
      }
    }

    /* Place pivot in correct position */
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const finalPos = i + 1;
    sorted.add(finalPos);

    snap('place-pivot', {
      pivotIdx: finalPos,
      swapping: [finalPos, high],
      range: [low, high],
      desc: `✔ Pivot ${arr[finalPos].name}(${arr[finalPos].marks}) placed at final position [${finalPos}]`,
    });

    return finalPos;
  }

  function quickSort(low, high) {
    if (low >= high) {
      if (low === high) sorted.add(low);
      return;
    }
    const p = partition(low, high);
    quickSort(low, p - 1);
    quickSort(p + 1, high);
  }

  quickSort(0, arr.length - 1);

  for (let i = 0; i < arr.length; i++) sorted.add(i);
  snap('done', { desc: '✅ Quick Sort complete! All pivots in their final positions.' });

  return steps;
}

/* ══════════════════════════════════════════════════════════════
   E. ANIMATOR
   Plays back a steps array as a live bar chart.
   ══════════════════════════════════════════════════════════════ */

let animState = {
  steps:       [],
  current:     0,
  algo:        null,   /* 'merge' | 'quick' */
  playing:     false,
  timerId:     null,
};

/* ── Compute bar colour class for a given index & step ──────── */
function barClass(idx, step, algo) {
  const { phase, comparing, swapping, pivotIdx,
          leftSub, rightSub, rangeActive, finalSorted } = step;

  /* Sorted (final position) — highest priority */
  if (finalSorted.has(idx)) return 'bar-state-sorted';

  if (algo === 'merge') {
    /* Currently comparing */
    if (comparing.includes(idx)) return 'bar-state-compare';
    /* Just finished merging — show the merged range in merging colour */
    if (phase === 'merged' && leftSub && idx >= leftSub[0] && idx <= leftSub[1])
      return 'bar-state-merging';
    /* Left sub-array */
    if (leftSub && idx >= leftSub[0] && idx <= leftSub[1])
      return 'bar-state-left';
    /* Right sub-array */
    if (rightSub && idx >= rightSub[0] && idx <= rightSub[1])
      return 'bar-state-right';
  }

  if (algo === 'quick') {
    /* Pivot placed in final position */
    if (phase === 'place-pivot' && idx === pivotIdx) return 'bar-state-pivot-placed';
    /* Currently being swapped */
    if (swapping.includes(idx)) return 'bar-state-swap';
    /* Currently being compared */
    if (comparing.includes(idx)) return 'bar-state-compare';
    /* Pivot bar */
    if (idx === pivotIdx) return 'bar-state-pivot';
    /* Within current partition range */
    if (rangeActive && idx >= rangeActive[0] && idx <= rangeActive[1])
      return 'bar-state-range';
  }

  return 'bar-state-default';
}

/* ── Render a single step to the bar chart ──────────────────── */
function renderStep(stepIdx) {
  const step  = animState.steps[stepIdx];
  const data  = step.array;
  const algo  = animState.algo;
  const MAX_H = 160;

  /* First call: build bar DOM elements */
  if (vizBars.children.length !== data.length) {
    vizBars.innerHTML = '';
    data.forEach((s, i) => {
      const div      = document.createElement('div');
      div.className  = 'viz-bar';
      div.id         = `vbar-${i}`;
      const fill     = document.createElement('div');
      fill.className = 'viz-bar-fill';
      const val      = document.createElement('div');
      val.className  = 'viz-bar-val';
      const label    = document.createElement('div');
      label.className= 'viz-bar-label';
      div.append(val, fill, label);
      vizBars.appendChild(div);
    });
  }

  /* Update each bar */
  data.forEach((s, i) => {
    const bar   = document.getElementById(`vbar-${i}`);
    if (!bar) return;
    const fill  = bar.querySelector('.viz-bar-fill');
    const val   = bar.querySelector('.viz-bar-val');
    const label = bar.querySelector('.viz-bar-label');

    const h   = Math.max(6, Math.round((s.marks / 100) * MAX_H));
    fill.style.height = `${h}px`;

    /* Apply colour class */
    const cls = barClass(i, step, algo);
    fill.className = `viz-bar-fill ${cls}`;

    val.textContent   = s.marks;
    label.textContent = s.name.split(' ')[0];    /* first name only */

    /* Tint the value label when highlighted */
    val.style.color =
      cls === 'bar-state-compare'     ? '#ffd700' :
      cls === 'bar-state-swap'        ? '#f85149' :
      cls === 'bar-state-pivot'       ? '#ffa657' :
      cls === 'bar-state-pivot-placed'? '#ffa657' :
      cls === 'bar-state-sorted'      ? '#3fb950' :
      cls === 'bar-state-merging'     ? '#58a6ff' :
      cls === 'bar-state-left'        ? '#2dd4bf' :
      cls === 'bar-state-right'       ? '#58a6ff' :
      '';
  });

  /* Update description */
  vizDescription.textContent = step.description;

  /* Update counters */
  const displayStep = stepIdx + 1;
  vizStepNum.textContent   = displayStep;
  vizStepTotal.textContent = animState.steps.length;

  /* Progress bar */
  const pct = Math.round((displayStep / animState.steps.length) * 100);
  vizProgressFill.style.width = `${pct}%`;
}

/* ── Advance one step ───────────────────────────────────────── */
function stepForward() {
  if (animState.current < animState.steps.length - 1) {
    animState.current++;
    renderStep(animState.current);
  } else {
    stopAnimation();
  }
}

function stepBackward() {
  if (animState.current > 0) {
    animState.current--;
    renderStep(animState.current);
  }
}

/* ── Play / Pause ───────────────────────────────────────────── */
function startAnimation() {
  if (animState.current >= animState.steps.length - 1) {
    animState.current = 0; /* restart if at end */
  }
  animState.playing = true;
  vizPlayPause.textContent = '⏸ Pause';
  vizPlayPause.classList.add('playing');

  const interval = parseInt(vizSpeed.value, 10);
  animState.timerId = setInterval(() => {
    if (animState.current >= animState.steps.length - 1) {
      stopAnimation();
      return;
    }
    stepForward();
  }, interval);
}

function stopAnimation() {
  animState.playing = false;
  clearInterval(animState.timerId);
  vizPlayPause.textContent = '▶ Play';
  vizPlayPause.classList.remove('playing');
}

function togglePlayPause() {
  if (animState.playing) stopAnimation();
  else startAnimation();
}

function restartAnimation() {
  stopAnimation();
  animState.current = 0;
  renderStep(0);
}

/* ── Kick off the visualizer for a given algo ───────────────── */
function launchVisualizer(sortedStudents, algo) {
  stopAnimation();

  animState.algo    = algo;
  animState.current = 0;

  /* Build steps from the *original unsorted* data  */
  /* We re-fetch from the API to get insertion order */
  fetch(`${API}/students`).then(r => r.json()).then(unsorted => {
    animState.steps = algo === 'merge'
      ? recordMergeSort(unsorted)
      : recordQuickSort(unsorted);

    /* Configure UI */
    const isQuick = algo === 'quick';
    vizTitle.textContent = isQuick
      ? '⚡ Quick Sort — Step-by-Step'
      : '⚙ Merge Sort — Step-by-Step';

    vizSortInfo.textContent = isQuick
      ? 'Quick Sort · O(n log n) avg · In-place · Pivot highlighted orange · Swaps in red'
      : 'Merge Sort · O(n log n) always · Left subarray teal · Right subarray blue · Comparing in yellow';

    /* Legend labels differ per algo */
    if (isQuick) {
      legendLeft.textContent  = 'Partition range';
      legendRight.textContent = '—';
      legendSwap.textContent  = 'Swapping';
      legendPivot.textContent = 'Pivot element';
    } else {
      legendLeft.textContent  = 'Left sub-array';
      legendRight.textContent = 'Right sub-array';
      legendSwap.textContent  = 'Just merged';
      legendPivot.textContent = '—';
    }

    /* Progress bar colour */
    vizProgressFill.className = isQuick
      ? 'viz-progress-fill algo-quick'
      : 'viz-progress-fill';

    /* Play button colour */
    vizPlayPause.classList.toggle('algo-quick', isQuick);
    vizPlayPause.textContent = '▶ Play';
    vizPlayPause.classList.remove('playing');

    /* Build bar DOM & show step 0 */
    vizBars.innerHTML = '';
    renderStep(0);

    vizPanel.hidden = false;
    vizPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }).catch(() => {
    showToast('Could not fetch student data for visualizer.', 'error');
  });
}

/* ── Control button wiring ──────────────────────────────────── */
vizPlayPause.addEventListener('click', togglePlayPause);
vizRestart.addEventListener('click', restartAnimation);
vizStepFwd.addEventListener('click', () => { stopAnimation(); stepForward(); });
vizStepBack.addEventListener('click', () => { stopAnimation(); stepBackward(); });
closeVizBtn.addEventListener('click', () => { stopAnimation(); vizPanel.hidden = true; });

/* Changing speed mid-playback: restart timer at new speed */
vizSpeed.addEventListener('change', () => {
  if (animState.playing) { stopAnimation(); startAnimation(); }
});

/* ══════════════════════════════════════════════════════════════
   F. API CALLS (C Backend via Node Bridge)
   ══════════════════════════════════════════════════════════════ */

async function loadStudents() {
  try {
    const res  = await fetch(`${API}/students`);
    const data = await res.json();
    renderTable(data, false, null);
    if (data.length > 0)
      setStatus(`${data.length} student${data.length !== 1 ? 's' : ''} loaded. Ready to sort.`);
  } catch {
    setStatus('⚠ Cannot connect to server. Is Node.js running?', 'error');
  }
}

async function addStudent(name, roll, marks) {
  const res  = await fetch(`${API}/students`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, roll, marks }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add student.');
  return data;
}

async function sortStudents(algo) {
  const btn   = algo === 'merge' ? mergeSortBtn : quickSortBtn;
  const label = algo === 'merge' ? '⚙ Merge Sort' : '⚡ Quick Sort';

  btn.innerHTML = `<span class="spinner"></span> Sorting…`;
  btn.disabled  = true;
  setStatus(`Running ${label} via C backend…`, 'loading');

  try {
    const res    = await fetch(`${API}/sort/${algo}`);
    const sorted = await res.json();
    if (!res.ok) throw new Error(sorted.error || 'Sort failed.');

    /* Render sorted table */
    renderTable(sorted, true, algo);

    const state = algo === 'merge' ? 'merge' : 'quick';
    setStatus(`✔ C ${label} complete — launching step-by-step visualizer…`, state);
    showToast(`${label} applied! Watch the animation below ↓`, 'success');

    /* Launch the JS step-by-step visualizer */
    launchVisualizer(sorted, algo);

  } catch (err) {
    setStatus(`✖ ${label} error: ${err.message}`, 'error');
    showToast(err.message, 'error');
    await loadStudents();
  } finally {
    btn.innerHTML = algo === 'merge' ? '⚙ Merge Sort' : '⚡ Quick Sort';
    btn.disabled  = false;
  }
}

async function clearAll() {
  if (!confirm('Clear all students? This cannot be undone.')) return;
  try {
    await fetch(`${API}/students`, { method: 'DELETE' });
    stopAnimation();
    vizPanel.hidden = true;
    renderTable([], false, null);
    setStatus('All students cleared.', 'idle');
    showToast('All students removed.', 'info');
  } catch {
    showToast('Failed to clear students.', 'error');
  }
}

/* ══════════════════════════════════════════════════════════════
   G. FORM HANDLING & EVENT WIRING
   ══════════════════════════════════════════════════════════════ */

function showFormError(msg) { formError.textContent = msg; formError.hidden = false; }
function hideFormError()    { formError.hidden = true; }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideFormError();

  const name  = nameInput.value.trim();
  const roll  = parseInt(rollInput.value, 10);
  const marks = parseInt(marksInput.value, 10);

  if (!name)                             { showFormError('Please enter the student name.'); return; }
  if (isNaN(roll) || roll < 1 || roll > 9999) { showFormError('Roll number must be 1–9999.'); return; }
  if (isNaN(marks) || marks < 0 || marks > 100) { showFormError('Marks must be 0–100.'); return; }

  addBtn.disabled  = true;
  addBtn.innerHTML = `<span class="spinner"></span> Adding…`;
  try {
    await addStudent(name, roll, marks);
    showToast(`${name} added!`, 'success');
    form.reset();
    marksSlider.value = 75; marksInput.value = 75; marksDisplay.textContent = 75;
    await loadStudents();
  } catch (err) {
    showFormError(err.message);
  } finally {
    addBtn.disabled  = false;
    addBtn.innerHTML = `<span class="btn-icon">+</span> Add Student`;
  }
});

loadDemoBtn.addEventListener('click', async () => {
  loadDemoBtn.disabled    = true;
  loadDemoBtn.textContent = 'Loading…';
  try {
    for (const s of DEMO_STUDENTS) await addStudent(s.name, s.roll, s.marks);
    await loadStudents();
    showToast('6 demo students loaded!', 'success');
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    loadDemoBtn.disabled    = false;
    loadDemoBtn.textContent = 'Load 6 Demo Students';
  }
});

mergeSortBtn.addEventListener('click', () => sortStudents('merge'));
quickSortBtn.addEventListener('click', () => sortStudents('quick'));
clearAllBtn.addEventListener('click',  clearAll);

/* ── Init ───────────────────────────────────────────────────── */
loadStudents();
