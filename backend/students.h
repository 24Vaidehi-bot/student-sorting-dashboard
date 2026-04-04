/*
 * students.h - Shared header for Student Sorting Dashboard
 *
 * Defines the Student struct and helper functions for:
 *  - Parsing a JSON array of students from stdin
 *  - Printing a sorted student array as JSON to stdout
 *
 * JSON Format expected / produced:
 * [
 *   {"name":"Alice","roll":1,"marks":88},
 *   ...
 * ]
 */

#ifndef STUDENTS_H
#define STUDENTS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STUDENTS 500
#define MAX_NAME_LEN 128

/* ── Student record ─────────────────────────────────────── */
typedef struct {
    char name[MAX_NAME_LEN];
    int  roll;
    int  marks;
} Student;

/* ── Comparison: primary = marks DESC, secondary = roll ASC ─ */
/*   Returns negative if a should come BEFORE b               */
int compareStudents(const Student *a, const Student *b) {
    if (b->marks != a->marks)
        return b->marks - a->marks;   /* higher marks first */
    return a->roll - b->roll;         /* lower roll number first */
}

/* ── Read all stdin into a single buffer ───────────────────── */
char *readStdin(void) {
    size_t cap  = 4096;
    size_t len  = 0;
    char  *buf  = (char *)malloc(cap);
    if (!buf) { fprintf(stderr, "malloc failed\n"); exit(1); }

    int ch;
    while ((ch = getchar()) != EOF) {
        if (len + 1 >= cap) {
            cap *= 2;
            buf = (char *)realloc(buf, cap);
            if (!buf) { fprintf(stderr, "realloc failed\n"); exit(1); }
        }
        buf[len++] = (char)ch;
    }
    buf[len] = '\0';
    return buf;
}

/* ── Minimal JSON string field extractor ───────────────────── */
/*   Finds key:"value" and copies value into out (NULL-term.)  */
static int getJsonString(const char *json, const char *key, char *out, int outSize) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\"", key);
    const char *p = strstr(json, search);
    if (!p) return 0;
    p += strlen(search);
    while (*p == ' ' || *p == ':' || *p == ' ') p++;
    if (*p == '"') p++;
    int i = 0;
    while (*p && *p != '"' && i < outSize - 1)
        out[i++] = *p++;
    out[i] = '\0';
    return 1;
}

/* ── Minimal JSON int field extractor ──────────────────────── */
static int getJsonInt(const char *json, const char *key, int *out) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\"", key);
    const char *p = strstr(json, search);
    if (!p) return 0;
    p += strlen(search);
    while (*p == ' ' || *p == ':' || *p == ' ') p++;
    *out = atoi(p);
    return 1;
}

/* ── Parse a JSON array string into a Student array ────────── */
int parseStudents(const char *json, Student *arr) {
    int count = 0;
    const char *p = json;

    while ((p = strchr(p, '{')) != NULL && count < MAX_STUDENTS) {
        /* Find matching closing brace */
        const char *end = strchr(p, '}');
        if (!end) break;

        /* Copy this object substring */
        int len = (int)(end - p + 1);
        char obj[512];
        if (len >= (int)sizeof(obj)) { p = end + 1; continue; }
        strncpy(obj, p, len);
        obj[len] = '\0';

        /* Extract fields */
        char nameBuf[MAX_NAME_LEN] = "";
        int  roll = 0, marks = 0;
        getJsonString(obj, "name",  nameBuf, MAX_NAME_LEN);
        getJsonInt   (obj, "roll",  &roll);
        getJsonInt   (obj, "marks", &marks);

        strncpy(arr[count].name, nameBuf, MAX_NAME_LEN - 1);
        arr[count].roll  = roll;
        arr[count].marks = marks;
        count++;

        p = end + 1;
    }
    return count;
}

/* ── Print Student array as JSON array to stdout ────────────── */
void printStudentsJSON(const Student *arr, int n) {
    printf("[\n");
    for (int i = 0; i < n; i++) {
        /* Escape double-quotes in name just in case */
        printf("  {\"name\":\"%s\",\"roll\":%d,\"marks\":%d}",
               arr[i].name, arr[i].roll, arr[i].marks);
        if (i < n - 1) printf(",");
        printf("\n");
    }
    printf("]\n");
}

#endif /* STUDENTS_H */
