

## Update Houses Catalogue: Add Grade IV + 3 New Grade I Buildings

### What changes

1. **Expand the grade type** from `"I" | "II" | "III"` to `"I" | "II" | "III" | "IV"` in the `House` interface.

2. **Add 3 new Grade I houses** to the data array:
   - Jama Masjid — Mandvi, Vadodara
   - Central Library — Vadodara
   - Tambekar Wada — Vadodara

3. **Update grade mappings**:
   - `gradeColors`: Add Grade IV color (a muted/neutral tone)
   - `gradeLabels`: Add `IV: "Grade IV · Recent Origin"`
   - Grade filter chips: Add "Grade IV" option

4. **Update grade descriptions** based on the uploaded grading system image:
   - Grade I: Structures of exceptional historical cultural importance (monumental)
   - Grade II: Buildings with high architectural value, retaining traditional features
   - Grade III: Buildings modified over time, retaining basic spatial/architectural characteristics
   - Grade IV: Buildings of recent origin or transformed, responding to scale and typology

### Files modified
- `src/pages/HousesPage.tsx` — all changes in this single file

