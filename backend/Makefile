# Makefile — Student Sorting Dashboard C Backend
# Run:  make        → compile both sorters
#       make clean  → remove compiled executables

CC      = gcc
CFLAGS  = -Wall -Wextra -O2 -std=c99

# Output executables (Windows uses .exe, Linux/Mac uses no extension)
ifeq ($(OS),Windows_NT)
  MERGE_OUT = merge_sort.exe
  QUICK_OUT = quick_sort.exe
else
  MERGE_OUT = merge_sort
  QUICK_OUT = quick_sort
endif

.PHONY: all clean test

all: $(MERGE_OUT) $(QUICK_OUT)
	@echo ""
	@echo "  Build complete!"
	@echo "  $(MERGE_OUT) and $(QUICK_OUT) are ready."
	@echo ""

$(MERGE_OUT): merge_sort.c students.h
	$(CC) $(CFLAGS) merge_sort.c -o $(MERGE_OUT)
	@echo "  [OK] Compiled merge_sort.c → $(MERGE_OUT)"

$(QUICK_OUT): quick_sort.c students.h
	$(CC) $(CFLAGS) quick_sort.c -o $(QUICK_OUT)
	@echo "  [OK] Compiled quick_sort.c → $(QUICK_OUT)"

clean:
	del /f merge_sort.exe quick_sort.exe 2>nul || rm -f merge_sort quick_sort
	@echo "  Cleaned."

# Quick test — pipe sample JSON and print output
test: all
	echo [{"name":"Bob","roll":2,"marks":78},{"name":"Alice","roll":1,"marks":92}] | $(MERGE_OUT)
	echo [{"name":"Bob","roll":2,"marks":78},{"name":"Alice","roll":1,"marks":92}] | $(QUICK_OUT)
