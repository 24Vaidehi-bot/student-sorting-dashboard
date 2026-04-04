/*
 * merge_sort.c - Merge Sort for Student Records
 *
 * Usage:
 *   echo '[{"name":"Alice","roll":1,"marks":88}]' | merge_sort.exe
 *
 * Algorithm: Merge Sort  |  Time: O(n log n)  |  Space: O(n)
 *
 * How it works:
 *  1. Divide the array into two halves recursively until each
 *     half has only 1 element (already sorted trivially).
 *  2. Merge the two sorted halves back together by comparing
 *     elements one at a time and placing the smaller one first.
 *  3. Repeat until the entire array is merged into sorted order.
 *
 * Sorting criteria:  Marks DESC  →  Roll Number ASC (tie-break)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "students.h"

/* ── Merge two sorted sub-arrays into a temporary buffer ──── */
/* Left half : arr[left..mid]                                  */
/* Right half: arr[mid+1..right]                               */
void merge(Student *arr, int left, int mid, int right) {
    int leftLen  = mid - left + 1;
    int rightLen = right - mid;

    /* Allocate temporary arrays */
    Student *L = (Student *)malloc(leftLen  * sizeof(Student));
    Student *R = (Student *)malloc(rightLen * sizeof(Student));
    if (!L || !R) { fprintf(stderr, "malloc failed\n"); exit(1); }

    /* Copy data into temp arrays */
    for (int i = 0; i < leftLen;  i++) L[i] = arr[left + i];
    for (int j = 0; j < rightLen; j++) R[j] = arr[mid  + 1 + j];

    /* Merge — pick the "better" student (higher marks first) */
    int i = 0, j = 0, k = left;
    while (i < leftLen && j < rightLen) {
        if (compareStudents(&L[i], &R[j]) <= 0)
            arr[k++] = L[i++];   /* L[i] should come first */
        else
            arr[k++] = R[j++];
    }

    /* Copy any remaining elements from left or right half */
    while (i < leftLen)  arr[k++] = L[i++];
    while (j < rightLen) arr[k++] = R[j++];

    free(L);
    free(R);
}

/* ── Recursive Merge Sort ───────────────────────────────────── */
void mergeSort(Student *arr, int left, int right) {
    if (left >= right) return;          /* Base case: 1 element */

    int mid = left + (right - left) / 2;  /* Avoid overflow */

    mergeSort(arr, left,    mid);       /* Sort left half   */
    mergeSort(arr, mid + 1, right);     /* Sort right half  */
    merge    (arr, left, mid, right);   /* Merge both halves */
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

    /* Sort using Merge Sort */
    mergeSort(students, 0, n - 1);

    /* Output sorted JSON to stdout */
    printStudentsJSON(students, n);

    return 0;
}
