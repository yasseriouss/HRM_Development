# Contributing Standards

Every contribution to HRM Unified must meet the highest engineering standards.

## Core Principles

1. **DRY (Don't Repeat Yourself):** Centralize logic; never duplicate.
2. **KISS (Keep It Simple, Stupid):** Clarity over cleverness.
3. **SOLID:** Follow all five principles in every module.
4. **YAGNI:** Build only what is required for the current task.

## Code Quality Requirements

- **Strict Typing:** All TypeScript code must be strictly typed. No `any`.
- **Single Responsibility:** No function should exceed 50 lines.
- **Testability:** Export pure functions where possible for easy unit testing.
- **Naming:** Use descriptive, semantic names (e.g., `calculateEmployeePerformance` over `calcPerf`).

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] No duplicated logic.
- [ ] ADR filed for major technical decisions in `/docs/decisions/`.
- [ ] Setup and documentation updated if necessary.
- [ ] Linting passes (`pnpm run lint`).
- [ ] Tests pass (`pnpm run test`).

## Review Criteria

Reviewers will check for:

1. **Clean Architecture:** Proper separation between UI, Logic, and Data.
2. **Performance:** No unnecessary re-renders or heavy computations in the main thread.
3. **Aesthetics:** Adherence to the "Warm Soft (Editorial)" visual system.
