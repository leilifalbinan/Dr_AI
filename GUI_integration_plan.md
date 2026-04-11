
## Recommendation

Do **not** attempt a full rewrite to a pure backend-first system.

Do **not** leave the backend as a side utility either.

### Best path

Build a **hybrid final system** where:

* the **backend owns visit identity, manifest/status, artifact storage, and integrated report generation**,
* the **GUI keeps the current screens and workflow**, but is rewired to use backend visit/report data in the most important places.

That is the best balance of speed, robustness, and likelihood of finishing.

This recommendation is grounded in the fact that:

* `create_visit.py` already gives you real visit folders plus `manifest.json` with phases, expected subsystems, and status tracking, 
* `integrator.py` already produces `report.json`, subsystem availability, figures, and face serial trends, though audio/gait processing and cross-modal synthesis are still pending.  

---

# 3.5-week implementation plan

## Milestone 1: Make the backend a usable service

**Target: end of Week 1**

This is the most important milestone. Until this exists, the GUI cannot cleanly pivot.

### Backend tasks

Build a thin API layer around what you already have.

Implement endpoints for:

* `POST /visits`

  * creates a visit using the same logic as `create_visit.py`
  * returns `visit_id`, manifest, and visit folder path if useful

* `GET /visits/{visit_id}/manifest`

  * returns manifest/status/phases

* `PATCH /visits/{visit_id}/manifest` or narrower status endpoints

  * update subsystem status
  * update phase start/end times

* `POST /visits/{visit_id}/logs/audio`

  * accept `audio.jsonl` flush into the visit folder

* `POST /visits/{visit_id}/integrate`

  * runs `integrator.py` for the visit

* `GET /visits/{visit_id}/report`

  * returns `report.json`

* `GET /visits/{visit_id}/figures/{name}`

  * serves generated figures

### Why this is enough

This uses your current backend structure instead of inventing a new one. It turns the scripts into a service layer without forcing a new architecture. `create_visit.py` already defines the manifest contract, and `integrator.py` already defines the report contract.  

### GUI tasks

Very light in Week 1:

* add a new backend service client file
* do not refactor pages yet
* just prove the frontend can call:

  * create visit
  * fetch manifest
  * fetch report

---

## Milestone 2: Rewire `NewVisit` to create real backend visits

**Target: early Week 2**

This is the highest-value GUI change.

### Change `NewVisit.jsx`

Right now, `NewVisit.jsx` acts like the visit orchestrator and final assembler. It should instead become the **visit controller UI**.

### What to change

When the user begins a visit:

* call backend `POST /visits`
* get a real `visit_id`
* store that in component state
* initialize transcription/logger against that real `visit_id`

Then:

* flush audio JSONL to backend instead of treating download as the default final path
* poll or fetch manifest status during the visit
* show manifest-backed subsystem state in the UI

### Keep

Keep these parts:

* patient selection
* vitals entry
* physician notes
* camera panels
* start/stop recording buttons
* progress/status display

### Reduce or defer

Do **not** spend time fully removing all current frontend helper logic yet. For the deadline, it is okay if some UI-side helpers remain. The key is that the **backend now owns the visit and artifacts**.

### Why this matters

This change aligns the live workflow with the visit-folder pipeline and removes the biggest architectural mismatch.

---

## Milestone 3: Make `VisitDetails` render backend `report.json`

**Target: mid Week 2**

This is the second most important GUI change.

### Change `VisitDetails.jsx`

Today it renders from the locally assembled visit object. That was fine for the prototype, but now you have a real report builder.

Refactor it so it can render backend `report.json` fields:

* `availability`
* `sections.face_encounter_summary`
* `sections.audio_encounter_summary`
* `sections.gait_entry_summary`
* `serial_trends`
* `figures`
* `encounter_synthesis` 

### Practical approach

Do this in a low-risk way:

* Add a new backend-fetch path first
* Keep the current rendering sections where possible
* Adapt section inputs instead of rewriting the whole page visually

In other words, preserve the existing **card structure and UX**, but swap the data source.

### Goal

By the end of this milestone, a user should be able to:

1. create a visit,
2. flush audio,
3. trigger integration,
4. open `VisitDetails`,
5. see backend-generated report data.

That alone gets you very close to a complete integrated demo.

---

## Milestone 4: Finish audio integration in the integrator

**Target: Week 2 to early Week 3**

This is the most important backend logic gap.

### Current state

`integrator.py` has real face processing and face serial trends, but `process_audio()` is still just a placeholder that returns `"pending"` if `audio.jsonl` exists. 

### Required work

Implement actual `process_audio()` so `report.json` contains a meaningful `audio_encounter_summary`.

You do not need a perfect design here. You just need enough for a working system:

* load latest summary from `audio.jsonl`
* expose key audio-derived fields cleanly
* include any top-level metrics you want in the report
* optionally add one simple figure if easy

### Why this is essential

Without this, the backend report is visibly incomplete in one of the most important modalities.

---

## Milestone 5: Add manifest/status visibility to the GUI

**Target: Week 3**

This is where the integrated system starts to feel polished.

### `NewVisit.jsx`

Show manifest-derived status:

* face: pending / available / missing
* audio: pending / available / missing
* gait: pending / available / missing

Also show:

* phase timing/status if useful

This comes directly from the manifest structure you already have. 

### `Dashboard.jsx`

Add a small “integration pipeline” view:

* recent visits
* report ready / pending
* subsystem missing / partial

Do not overbuild this. Even a simple status badge list is enough.

### `VisitDetails.jsx`

Gracefully show:

* what is available
* what is still pending
* what is missing

This maps naturally onto `report.json.availability`. 

---

## Milestone 6: Adapt `PatientAnalysis` only as much as needed

**Target: late Week 3**

This is important, but not before the core visit/report path works.

### Low-risk goal

Do not fully rebuild `PatientAnalysis.jsx` around a sophisticated backend analytics API unless you have time.

Instead, do one of these:

### Option A: easiest

Keep current `PatientAnalysis` mostly intact for demo purposes, but add backend-fed face serial trend support where available.

This is attractive because `integrator.py` already computes face serial trends and can generate a `face_serial_trends.png` figure for the current visit.  

### Option B: better if time allows

Build a simple backend endpoint for patient visit/report history and have `PatientAnalysis` read from that instead of local visit blobs.

### My recommendation

For 3.5 weeks, **Option A first**. Full patient-history backend migration can wait if needed.

---

## Milestone 7: PDF export compatibility

**Target: final week**

Keep PDF export, but make sure it works from the data you are actually using in the final demo.

### Practical recommendation

Do **not** fully redesign `pdfGenerator.js`.

Instead, create a thin adapter if needed:

* map backend `report.json` + patient metadata
* into the shape expected by `pdfGenerator.js`

That way you preserve PDF export without rewriting the report generator under deadline pressure.

---

# What to explicitly deprioritize

These should not be first-wave tasks in the remaining time:

* replacing all auth/local user logic
* full CSS/theme cleanup
* route param cleanup
* perfect dashboard analytics
* full gait integration if gait subsystem is not ready
* removing every last piece of frontend analysis logic

Those are nice, but not what determines whether you finish with a complete integrated system.

---

# What “complete working system” should mean by the deadline

I would define success like this:

## Minimum successful final system

* GUI can create a backend visit
* backend creates `runs/visit_<id>/manifest.json`
* audio subsystem output is flushed into the visit folder
* integrator generates `report.json`
* `VisitDetails` renders backend report data
* status/availability are visible in the GUI
* face integration works if present
* audio integration works in the report
* PDF export still works
* patient registry and basic trend/history flow remain usable

If you achieve that, you will have a complete and coherent integrated system, even if:

* gait is still partial,
* cross-modal synthesis is still lightweight,
* some frontend helper logic remains.

That is okay.

---

# Exact task ownership I’d suggest

## Backend-focused tasks

* API wrapper around `create_visit.py`
* API for manifest/status/report retrieval
* audio ingestion endpoint
* integration trigger endpoint
* `process_audio()` implementation
* figure serving
* optional simple patient-history endpoint

## Frontend-focused tasks

* `NewVisit.jsx` → create real backend visit first
* `NewVisit.jsx` → flush audio to backend
* `NewVisit.jsx` → show manifest-backed status
* `VisitDetails.jsx` → render backend report
* `Dashboard.jsx` → show report/subsystem state
* `PatientAnalysis.jsx` → only partial backend alignment if time allows
* PDF adapter if needed

---

# Best sequencing for least risk

## Week 1

Backend service wrapper first.

Why:
Because all GUI rewiring depends on stable endpoints.

## Week 2

`NewVisit` + `VisitDetails`.

Why:
This gives you the core end-to-end demo path fastest.

## Week 3

Audio integration completion + status visibility + dashboard polish.

Why:
This makes the integrated system feel real.

## Final half-week

PatientAnalysis alignment, PDF compatibility, bug fixing, demo hardening.

Why:
Those are important, but should not block the primary visit/report flow.

---

# Final recommendation

If I were choosing the path for your team, I would commit to this:

> **Backend becomes authoritative for visits, artifacts, and final reports; frontend keeps the current workflow and visualization structure, with only targeted rewiring in `NewVisit`, `VisitDetails`, and status displays.**

That is the strongest path to a complete working system in 3.5 weeks.

If you want, I can next turn this into a **task board format** with columns like:

* Backend
* Frontend
* Nice-to-have
* Demo-critical
