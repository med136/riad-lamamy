# GitHub Actions VPS Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the application to the production VPS automatically after a verified merge to `main`.

**Architecture:** GitHub Actions runs the reservation tests, TypeScript, and the production build before opening an SSH connection to the VPS. The VPS remains responsible for the actual release through its existing `deploy.sh`; the workflow then verifies the public health endpoint. Database migrations remain outside this workflow.

**Tech Stack:** GitHub Actions, Node.js 24, npm, OpenSSH, Bash, Next.js.

**Spec:** Approved inline by the project owner on 2026-10-26.

## Global Constraints

- Deploy only commits pushed to `main`.
- Never store SSH credentials or server paths in the repository.
- Never apply Supabase migrations from this workflow.
- Permit only one production deployment at a time.
- Fail when tests, build, SSH deployment, or the production health check fails.

## Review Focus

- Missing secrets must stop deployment before opening SSH.
- The SSH host key must be pinned rather than learned during deployment.
- A path containing spaces must reach the remote script as one argument.
- Concurrent pushes must not execute two production releases simultaneously.
- A successful remote script followed by an unhealthy public endpoint must still fail the workflow.

---

### Task 1: Production deployment workflow

**Files:**

- Create: `.github/workflows/deploy-production.yml`
- Create: `docs/vps-github-actions-deployment.md`

**Interfaces:**

- Consumes: GitHub Secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY`, `VPS_SSH_KNOWN_HOSTS`, `VPS_APP_PATH`, and optional `VPS_PORT`.
- Produces: verified invocation of `<VPS_APP_PATH>/deploy.sh` and a public health check.

- [ ] Create the workflow with verification and deployment jobs.
- [ ] Validate the YAML structure and inspect the generated diff.
- [ ] Run reservation tests, TypeScript, and the production build locally.
- [ ] Document VPS key creation, GitHub secrets, host-key pinning, and first-run verification.
- [ ] Commit, push, open a pull request, and merge after verification.
