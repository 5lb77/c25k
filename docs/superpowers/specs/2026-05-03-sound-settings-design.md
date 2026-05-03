# Sound Settings — Design Spec

**Date:** 2026-05-03
**Status:** Approved

## Overview

Add a sound settings view to the C25K timer app. Users can control volume, choose between synthesized tone styles or speech cues, and preview the current sound before a workout. Settings persist via localStorage so they survive between sessions on the iPhone home screen.

---

## Navigation

A gear icon button (`⚙`) is added to the top-right corner of the picker card. Tapping it calls `showSettings()`, which hides the picker and shows a new `#settings` view. The settings view has a `← Back` button that returns to the picker.

Three views now exist: `#picker`, `#settings`, `#timer`. View switching follows the existing pattern of toggling `hidden` / `active` classes.

No explicit save button — settings auto-save to localStorage on every change.

---

## Settings View Layout

A card matching the picker card's visual style, containing two sections:

### Volume

- Labeled range slider, range 0–1, step 0.01
- Current value displayed as a percentage (e.g. "50%") next to the label
- **"Test Sound"** button below the slider — plays the interval-start sound at the current volume and style immediately

### Sound Style

Five options as a styled radio group (large tap targets):

| Value | Label |
|---|---|
| `sine` | Tone — Smooth |
| `square` | Tone — Digital |
| `triangle` | Tone — Soft |
| `speech-terse` | Voice — Terse |
| `speech-fulsome` | Voice — Fulsome |

Selecting any option auto-saves and the test button reflects the new selection immediately.

**Voice note:** Speech modes use the Web Speech API. The voice selector prefers "Samantha" (iOS default female English voice). If unavailable, falls back to the first available English voice.

---

## Speech Cues

| Event | Terse | Fulsome |
|---|---|---|
| Interval start — Run | "Run." | "Beginning run interval." |
| Interval start — Walk | "Walk." | "Walk interval. Recover." |
| Interval start — Warm Up | "Warm up." | "Begin your warm-up." |
| Interval start — Cool Down | "Cool down." | "Time to cool down." |
| Warning (3s before end) | "Ready." | "Interval ending in three seconds." |
| Completion | "Done." | "Workout complete. Outstanding effort." |

---

## Data & Architecture

**Settings object** (in-memory, mirrored to localStorage):
```js
let soundSettings = { style: 'sine', volume: 0.5 };
```

**localStorage key:** `c25k_sound`

**On load:** read and parse `localStorage.getItem('c25k_sound')`, merge into `soundSettings`. If missing or malformed, defaults stand (`style: 'sine'`, `volume: 0.5`).

**On any change:** `saveSoundSettings()` writes `JSON.stringify(soundSettings)` to localStorage.

**`playTone()`** call sites drop hardcoded volume arguments — all read `soundSettings.volume` instead.

**`speak(text)`** — new function:
- Cancels any in-flight utterance via `speechSynthesis.cancel()`
- Creates a `SpeechSynthesisUtterance`
- Sets `volume` from `soundSettings.volume`
- Calls `speechSynthesis.getVoices()` at speak-time (not on page load — iOS loads voices asynchronously and the list may be empty on first call); prefers a voice named "Samantha", falls back to first English voice, falls back to browser default
- Calls `speechSynthesis.speak()`

**Sound dispatch** — `playWarningBeep`, `playStartBeep`, `playCompletionSequence` each check `soundSettings.style`:
- `sine | square | triangle` → call `playTone()` with that waveform type
- `speech-terse | speech-fulsome` → call `speak()` with the mapped phrase

The existing `muted` flag is unchanged — it gates all sound output regardless of style.

---

## Constraints

- Single `.html` file — no new files
- No external dependencies
- localStorage used only for sound settings (the rest of the app remains stateless)
