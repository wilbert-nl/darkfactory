---
id: "035"
title: "Production Dockerfiles for backend and frontend"
phase: "P7"
task_id: "P7-T6"
priority: "high"
estimated_hours: 3
status: "done"
created_at: "2026-04-23"
attempts: 1
last_attempt: "2026-04-23"
failure_notes: null
---

## Description
Multi-stage backend/Dockerfile (NestJS, non-root user). frontend/Dockerfile.prod (Quasar + nginx). frontend/nginx.conf with SPA fallback, gzip, security headers, 1-year asset cache.
