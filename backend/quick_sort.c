/*
 * quick_sort.c - Quick Sort for Student Records
 *
 * Usage:
 *   echo '[{"name":"Bob","roll":2,"marks":75}]' | quick_sort.exe
 *
 * Algorithm: Quick Sort  |  Time: O(n log n) avg, O(n²) worst
 *            Space: O(log n) stack frames
 *
 * How it works:
 *  1. Choose a pivot element (we use the last element).
 *  2. Partition the array: move all elements that should come
 *     BEFORE the pivot to its left, and all that should come
 *     AFTER to its right.
 *  3. Recursively sort the left and right partitions.
 *  4. No merging step needed — sorting happens in-place!
 *
 * Sorting criteria:  Marks DESC  →  Roll Number ASC (tie-break)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "students.h"

/* ── Swap two students in the array ─────────────────────────── */
void swapStudents(Student *a, Student *b) {
    Student temp = *a;
    *a = *b;
    *b = temp;
}

/*
 * ── Partition ────────────────────────────────────────────────
 * Uses last element as pivot.
 * Rearranges arr[low..high] so that:
 *   - Elements before pivot-index should come before pivot
 *   - Pivot is at its final sorted position
 *   - Elements after pivot-index should come after pivot
 * Returns the pivot's final index.
 */
int partition(Student *arr, int low, int high) {
    Student pivot = arr[high];   /* Pivot = last element       */
    int i = low - 1;            /* Index of smaller element   */

    for (int j = low; j < high; j++) {
        /*
         * If curr element should come BEFORE pivot:
         *   compareStudents returns < 0 means arr[j] is "better"
         *   (higher marks / lower roll), so it goes to the left
         */
        if (compareStudents(&arr[j], &pivot) < 0) {
            i++;
            swapStudents(&arr[i], &arr[j]);
        }
    }

    /* Place pivot in its correct position */
    swapStudents(&arr[i + 1], &arr[high]);
    return i + 1;
}

/* ── Recursive Quick Sort ───────────────────────────────────── */
void quickSort(Student *arr, int low, int high) {
    if (low >= high) return;        /* Base case: 0 or 1 element */

    /* Partition and get pivot position */
    int pivotIdx = partition(arr, low, high);

    quickSort(arr, low,          pivotIdx - 1);  /* Left part  */
    quickSort(arr, pivotIdx + 1, high);           /* Right part */
}

/* ── Entry Point ────────────────────────────────────────────── */
int main(void) {
    /* Read JSON from stdin */
    char *json = readStdin();

    /* Parse into Student array */
    Student students[MAX_STUDENTS];
    int n = parseStudents(json, students);
    free(json);

    if (n == 0) {
        printf("[]\n");
        return 0;
    }

    /* Sort using Quick Sort */
    quickSort(students, 0, n - 1);

    /* Output sorted JSON to stdout */
    printStudentsJSON(students, n);

    return 0;
}
