# Spec: Full CV Pipeline Integration

## Objective

Make the "Tạo CV Cá Nhân" page call `POST /api/generate-cv/full` when a student submits a JD. The request must contain the student's real completed-course scores and personal projects. The page must display the pipeline's matched courses and use its generated CV, validation report, and ATS report.

## Commands

- Backend tests: `pytest ai-service/test_graph.py`
- Frontend build: `npm run build` (from `frontend/`)
- Frontend lint: `npm run lint` (from `frontend/`)

## Project Structure

- `frontend/src/services/aiService.ts`: typed full-pipeline client.
- `frontend/src/pages/student/CVBuilder.tsx`: creates the request and applies the response.
- `ai-service/app/graph.py`: preserves real grades when enriching matched courses with CLOs.
- `ai-service/test_graph.py`: regression coverage for supplied course grades.

## Code Style

Use typed payloads and explicit adapters at the UI/API boundary:

```ts
const result = await generateCVFullPipeline(payload);
setCvData(previous => ({ ...previous, grades: toGrades(result.competency_profile) }));
```

## Testing Strategy

Add a backend regression test proving a supplied course grade is preserved through the vector-search node. Verify the client compiles with the production TypeScript build and lint command.

## Boundaries

- Always: use actual scores supplied by the student score API; preserve the existing editor and PDF export.
- Ask first: database schema changes or new dependencies.
- Never: manufacture grades when a real score is unavailable or send secrets to the client.

## Success Criteria

- Submitting a JD invokes `/api/generate-cv/full`.
- The payload includes real student courses and projects.
- The UI applies pipeline courses, generated CV content, validation, and ATS status.
- Vector search does not overwrite supplied grades with the `8.5` default.
