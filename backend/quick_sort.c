

#include "students.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ── Swap two students in the array
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
  Student pivot = arr[high]; /* Pivot = last element       */
  int i = low - 1;           /* Index of smaller element   */

  for (int j = low; j < high; j++) {   //array traversing and comapring each element with pivot

    if (compareStudents(&arr[j], &pivot) < 0) {
      i++;
      swapStudents(&arr[i], &arr[j]);
    }
  }

  // Place pivot in its correct position */
  swapStudents(&arr[i + 1], &arr[high]);
  return i + 1;
}

// ── Recursive Quick Sort 
void quickSort(Student *arr, int low, int high) {
  if (low >= high)
    return; /* Base case: 0 or 1 element */

  // Partition and get pivot position 
  int pivotIdx = partition(arr, low, high);

  quickSort(arr, low, pivotIdx - 1);  /* Left part  */
  quickSort(arr, pivotIdx + 1, high); /* Right part */
}

// ── Entry Point 
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
