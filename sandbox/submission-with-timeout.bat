@echo off
setlocal
REM ============================================================
REM  run-submission.bat  (จำลอง worker: เลือก engine ตามประเภทโจทย์)
REM
REM  ใช้:  run-submission.bat <engine> <student_file> <problem_file>
REM    engine = http   -> ตรวจ Express API 
REM    engine = query  -> ตรวจ database query
REM ============================================================

set ENGINE=%1
set STUDENT=%2
set TESTFILE=%3
set TIMEOUT_SEC=10

REM เลือกไฟล์ harness และ path ของไฟล์นักศึกษาและโจทย์ตาม engine
if /i "%ENGINE%"=="http" (
  set HARNESS=harness/run-tests.js
  set DEST=/app/student/app.js
  set STUDENT_IN=student/app.js
  set PROBLEM_IN=tests/problem1.json
  set PROBLEM_DEST=/app/tests/problem1.json
) else if /i "%ENGINE%"=="query" (
  set HARNESS=harness/run-query.js
  set DEST=/app/student/query.js
  set STUDENT_IN=student/query.js
  set PROBLEM_IN=tests/query-problem.json
  set PROBLEM_DEST=/app/tests/query-problem.json
) else (
  echo ERROR: engine must be "http" or "query"
  echo   example: run-submission.bat query student\query-correct.js tests\query-problem.json
  exit /b 1
)

echo === run [%ENGINE%] engine (timeout %TIMEOUT_SEC%s) ===

docker run --rm ^
  --memory=256m --memory-swap=256m ^
  --cpus=0.5 ^
  --pids-limit=64 ^
  --network=none ^
  --read-only --tmpfs /tmp ^
  --security-opt no-new-privileges ^
  -v "%cd%\%STUDENT%:%DEST%:ro" ^
  -v "%cd%\%TESTFILE%:%PROBLEM_DEST%:ro" ^
  sslab-runner ^
  timeout -s KILL %TIMEOUT_SEC% node %HARNESS% %STUDENT_IN% %PROBLEM_IN%

set EXITCODE=%ERRORLEVEL%
echo.
if "%EXITCODE%"=="137" (
  echo === TIME LIMIT EXCEEDED : killed after %TIMEOUT_SEC%s ===
) else (
  echo === finished ^(exit code %EXITCODE%^) ===
)