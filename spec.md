# APAC VKOM 2026

## Current State
Full enrollment app with backend storing courses (c00–c16, s101–s605 short talks across Booths 1–6) and registration logic. Admin dashboard with CSV/Excel download, course ID legend, and Internet Identity auth.

## Requested Changes (Diff)

### Add
- New Booth 1 session s107: Business AI Data Flow, 4:30 PM - 5:00 PM
- New Booth 2 session s207: Business AI - Assistant, 4:30 PM - 5:00 PM

### Modify
- Replace ALL short talk sessions (s101–s605, Booths 1–6) with only Booth 1 and Booth 2 sessions as follows:

**Booth 1 (7 sessions, March 7, 2026, 50 seats each):**
- s101: Business AI Data Flow, 1:00 PM–1:30 PM (13:00–13:30)
- s102: ETM (Solution), 1:30 PM–2:00 PM (13:30–14:00)
- s103: Business AI Data Flow, 2:00 PM–2:30 PM (14:00–14:30)
- s104: ViZi Self Service / Policies (AI), 3:00 PM–3:30 PM (15:00–15:30)
- s105: Business AI Data Flow, 3:30 PM–4:00 PM (15:30–16:00)
- s106: ETM (Solution), 4:00 PM–4:30 PM (16:00–16:30)
- s107: Business AI Data Flow, 4:30 PM–5:00 PM (16:30–17:00)

**Booth 2 (7 sessions, March 7, 2026, 50 seats each):**
- s201: Business AI - Assistant, 1:00 PM–1:30 PM (13:00–13:30)
- s202: Portals, 1:30 PM–2:00 PM (13:30–14:00)
- s203: Business AI - Assistant, 2:00 PM–2:30 PM (14:00–14:30)
- s204: Business AI - Assistant, 3:00 PM–3:30 PM (15:00–15:30)
- s205: Portals, 3:30 PM–4:00 PM (15:30–16:00)
- s206: ViZi Self Service / Policies (AI), 4:00 PM–4:30 PM (16:00–16:30)
- s207: Business AI - Assistant, 4:30 PM–5:00 PM (16:30–17:00)

### Remove
- All Booth 3, Booth 4, Booth 5, Booth 6 short talk sessions (s301–s605)

## Implementation Plan
1. Regenerate backend Motoko with updated initializeCourses() containing only Booth 1 (s101–s107) and Booth 2 (s201–s207) short talks, removing Booths 3–6
2. Update courseUtils.ts room sort order to only include Booth 1 and Booth 2
3. Admin Course ID Legend will auto-reflect the new session list after re-initialization
