# Sound Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sound settings view to the C25K timer app with volume control, tone/speech style selection, and a test button — all persisted via localStorage.

**Architecture:** A third view (`#settings`) is added alongside `#picker` and `#timer`, accessible via a gear icon on the picker card. Settings are stored in a `soundSettings` object (in-memory) mirrored to `localStorage` key `c25k_sound`. Sound functions read from `soundSettings` at call time instead of using hardcoded values.

**Tech Stack:** Vanilla JS, Web Audio API (existing), Web Speech API (new), localStorage, single `index.html` file.

---

## File Map

| File | Change |
|---|---|
| `index.html` | All changes — HTML, CSS, JS are all inline |

---

### Task 1: Settings data layer

**Files:**
- Modify: `index.html` — add `soundSettings` object and load/save functions to the `<script>` block

- [ ] **Step 1: Add the settings object and load/save functions**

In `index.html`, find this line near the top of the `<script>` block (around line 485):

```js
let muted           = false;
```

Add the following immediately **before** that line:

```js
let soundSettings = { style: 'sine', volume: 0.5 };

function loadSoundSettings() {
  try {
    const stored = localStorage.getItem('c25k_sound');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.volume === 'number') soundSettings.volume = parsed.volume;
      if (typeof parsed.style === 'string') soundSettings.style = parsed.style;
    }
  } catch (e) {}
}

function saveSoundSettings() {
  try {
    localStorage.setItem('c25k_sound', JSON.stringify(soundSettings));
  } catch (e) {}
}
```

- [ ] **Step 2: Call loadSoundSettings on page init**

Find this line at the very bottom of the `<script>` block:

```js
populatePicker();
```

Replace it with:

```js
populatePicker();
loadSoundSettings();
```

- [ ] **Step 3: Verify in browser**

Open `index.html` in a browser. Open DevTools → Console. Run:

```js
console.log(soundSettings);
// Expected: { style: 'sine', volume: 0.5 }

saveSoundSettings();
console.log(localStorage.getItem('c25k_sound'));
// Expected: {"style":"sine","volume":0.5}

soundSettings.volume = 0.8;
saveSoundSettings();
localStorage.setItem('c25k_sound', JSON.stringify({style:'square', volume:0.8}));
location.reload();
// After reload, run:
console.log(soundSettings);
// Expected: { style: 'square', volume: 0.8 }
```

Clean up after testing: `localStorage.removeItem('c25k_sound')` then reload.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add sound settings data layer with localStorage persistence"
```

---

### Task 2: Settings view HTML + navigation

**Files:**
- Modify: `index.html` — add `#settings` div, gear button on picker card, navigation functions

- [ ] **Step 1: Add the settings view HTML**

In `index.html`, find this comment just before the timer view:

```html
  <!-- Timer view -->
```

Add the following block immediately **before** that comment:

```html
  <!-- Settings view -->
  <div id="settings" class="hidden">
    <div class="picker-card settings-card">
      <div class="settings-topbar">
        <button class="back-btn" onclick="showPicker()">← Back</button>
        <span class="settings-title">Sound Settings</span>
      </div>

      <div class="settings-section">
        <div class="settings-row">
          <label for="volume-slider">Volume <span id="volume-display">50%</span></label>
        </div>
        <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5"
               oninput="onVolumeChange(this.value)">
        <button id="test-sound-btn" class="btn-secondary" onclick="testSound()">Test Sound</button>
      </div>

      <div class="settings-section">
        <label class="section-label">Sound Style</label>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="sound-style" value="sine" onchange="onStyleChange(this.value)"> Tone — Smooth
          </label>
          <label class="radio-option">
            <input type="radio" name="sound-style" value="square" onchange="onStyleChange(this.value)"> Tone — Digital
          </label>
          <label class="radio-option">
            <input type="radio" name="sound-style" value="triangle" onchange="onStyleChange(this.value)"> Tone — Soft
          </label>
          <label class="radio-option">
            <input type="radio" name="sound-style" value="speech-terse" onchange="onStyleChange(this.value)"> Voice — Terse
          </label>
          <label class="radio-option">
            <input type="radio" name="sound-style" value="speech-fulsome" onchange="onStyleChange(this.value)"> Voice — Fulsome
          </label>
        </div>
      </div>
    </div>
  </div>

```

- [ ] **Step 2: Add gear button to picker card**

Find the opening of the picker card in the HTML:

```html
    <div class="picker-card">
      <h1>C25K Timer</h1>
```

Replace with:

```html
    <div class="picker-card">
      <div class="picker-topbar">
        <button class="gear-btn" onclick="showSettings()" title="Sound Settings">⚙</button>
      </div>
      <h1>C25K Timer</h1>
```

- [ ] **Step 3: Add showSettings() and update showPicker()**

Find the existing `showPicker()` function in the `<script>` block:

```js
function showPicker() {
  document.getElementById('picker').classList.remove('hidden');
  document.getElementById('timer').classList.remove('active');
}
```

Replace it with:

```js
function showPicker() {
  document.getElementById('picker').classList.remove('hidden');
  document.getElementById('settings').classList.add('hidden');
  document.getElementById('timer').classList.remove('active');
}

function showSettings() {
  initSettingsView();
  document.getElementById('picker').classList.add('hidden');
  document.getElementById('settings').classList.remove('hidden');
}
```

(`initSettingsView` will be added in Task 4 — the button is wired now so navigation works once that function exists.)

- [ ] **Step 4: Add a temporary stub so the page doesn't throw on gear click**

At the bottom of the `<script>` block, just before `populatePicker()`, add:

```js
function initSettingsView() { /* stub — implemented in Task 4 */ }
function testSound() { /* stub — implemented in Task 6 */ }
```

- [ ] **Step 5: Verify in browser**

Open `index.html`. Tap/click the ⚙ icon — the settings view should appear with the card structure (unstyled is fine). Tap `← Back` — should return to the picker. No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add settings view HTML and navigation"
```

---

### Task 3: Settings view CSS

**Files:**
- Modify: `index.html` — add styles for gear button, settings card, range slider, radio group

- [ ] **Step 1: Add settings CSS**

In `index.html`, find this comment near the end of the `<style>` block:

```css
    /* === Utility === */
    .hidden { display: none !important; }
```

Add the following immediately **before** that rule:

```css
    /* === Settings view === */
    #settings {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 2rem 0;
    }

    .settings-card { gap: 1.5rem; }

    .settings-topbar {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .settings-title {
      font-size: 1rem;
      font-weight: 600;
    }

    .settings-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .settings-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .settings-row label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
    }

    #volume-display { color: #f0f0f0; }

    input[type="range"] {
      width: 100%;
      accent-color: #e85d04;
      cursor: pointer;
      height: 1.5rem;
    }

    .section-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #2a2a2a;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      color: #f0f0f0;
    }

    .radio-option input[type="radio"] {
      accent-color: #e85d04;
      width: 1.1rem;
      height: 1.1rem;
      flex-shrink: 0;
      cursor: pointer;
    }

    .picker-topbar {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }

    .gear-btn {
      background: none;
      border: none;
      color: #888;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      line-height: 1;
    }

    .gear-btn:hover { color: #f0f0f0; }

```

- [ ] **Step 2: Verify in browser**

Open `index.html`. The picker card should show a small ⚙ icon top-right. Tapping it should show a styled settings card with a volume slider and five radio options with orange accents. The card should look consistent with the picker card.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add sound settings CSS"
```

---

### Task 4: Settings form JS

**Files:**
- Modify: `index.html` — replace `initSettingsView` stub; add `onVolumeChange`, `onStyleChange`

- [ ] **Step 1: Replace the initSettingsView stub**

Find and remove this stub added in Task 2:

```js
function initSettingsView() { /* stub — implemented in Task 4 */ }
```

Replace it with the full implementation:

```js
function initSettingsView() {
  const slider = document.getElementById('volume-slider');
  slider.value = soundSettings.volume;
  document.getElementById('volume-display').textContent =
    Math.round(soundSettings.volume * 100) + '%';
  document.querySelectorAll('input[name="sound-style"]').forEach(r => {
    r.checked = r.value === soundSettings.style;
  });
}

function onVolumeChange(value) {
  soundSettings.volume = parseFloat(value);
  document.getElementById('volume-display').textContent =
    Math.round(soundSettings.volume * 100) + '%';
  saveSoundSettings();
}

function onStyleChange(value) {
  soundSettings.style = value;
  saveSoundSettings();
}
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. Open settings (⚙). Drag the volume slider — the percentage label should update live. Select each radio option. Close settings (← Back), reopen — the controls should reflect the last selections. Reload the page — settings should be restored from localStorage.

Open DevTools → Application → Local Storage. Confirm `c25k_sound` updates on every change.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: wire up settings form controls with auto-save"
```

---

### Task 5: speak() function and speech cues map

**Files:**
- Modify: `index.html` — add `SPEECH_CUES` constant and `speak()` function to the `<script>` block

- [ ] **Step 1: Add the speech cues map**

Find this block near the top of the `<script>` block:

```js
const ACCENT_CLASSES  = { warmup: 'accent-warmup', run: 'accent-run', walk: 'accent-walk', cooldown: 'accent-cooldown' };
```

Add the following immediately **before** that line:

```js
const SPEECH_CUES = {
  terse: {
    run:      'Run.',
    walk:     'Walk.',
    warmup:   'Warm up.',
    cooldown: 'Cool down.',
    warning:  'Ready.',
    complete: 'Done.',
  },
  fulsome: {
    run:      'Beginning run interval.',
    walk:     'Walk interval. Recover.',
    warmup:   'Begin your warm-up.',
    cooldown: 'Time to cool down.',
    warning:  'Interval ending in three seconds.',
    complete: 'Workout complete. Outstanding effort.',
  },
};
```

- [ ] **Step 2: Add the speak() function**

Find the `getAudioCtx()` function:

```js
function getAudioCtx() {
```

Add the following immediately **before** it:

```js
function speak(text) {
  if (muted) return;
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.volume = soundSettings.volume;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.name === 'Samantha')
    || voices.find(v => v.lang.startsWith('en'))
    || null;
  if (voice) utter.voice = voice;
  speechSynthesis.speak(utter);
}

```

- [ ] **Step 3: Verify in browser**

Open DevTools → Console. Run:

```js
speak('Beginning run interval.');
// Expected: browser speaks the phrase (check that audio plays)

muted = true;
speak('This should be silent.');
// Expected: no audio
muted = false;
```

On iOS Safari (or iOS simulator), also verify the voice sounds female (Samantha).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add speak() function with Web Speech API and female voice preference"
```

---

### Task 6: Refactor sound dispatch and wire Test Sound button

**Files:**
- Modify: `index.html` — update `playWarningBeep`, `playStartBeep`, `playCompletionSequence`; update call site in `tick()`; replace `testSound` stub

- [ ] **Step 1: Replace playWarningBeep**

Find the existing function:

```js
// Short double-beep warning — fires when remaining <= 3
function playWarningBeep() {
  playTone(880, 0.12, 0.3);
  setTimeout(() => playTone(880, 0.12, 0.3), 180);
}
```

Replace it with:

```js
function playWarningBeep() {
  if (muted) return;
  const style = soundSettings.style;
  if (style === 'speech-terse' || style === 'speech-fulsome') {
    speak(SPEECH_CUES[style === 'speech-terse' ? 'terse' : 'fulsome'].warning);
  } else {
    playTone(880, 0.12, soundSettings.volume, style);
    setTimeout(() => playTone(880, 0.12, soundSettings.volume, style), 180);
  }
}
```

- [ ] **Step 2: Replace playStartBeep**

Find the existing function:

```js
// Single clean tone — fires at the start of a new interval
function playStartBeep() {
  playTone(660, 0.35, 0.5);
}
```

Replace it with:

```js
function playStartBeep(type) {
  if (muted) return;
  const style = soundSettings.style;
  if (style === 'speech-terse' || style === 'speech-fulsome') {
    speak(SPEECH_CUES[style === 'speech-terse' ? 'terse' : 'fulsome'][type] || '');
  } else {
    playTone(660, 0.35, soundSettings.volume, style);
  }
}
```

- [ ] **Step 3: Replace playCompletionSequence**

Find the existing function:

```js
// Three ascending tones — workout complete
function playCompletionSequence() {
  playTone(523, 0.25, 0.5); // C5
  setTimeout(() => playTone(659, 0.25, 0.5), 300); // E5
  setTimeout(() => playTone(784, 0.4,  0.5), 600); // G5
}
```

Replace it with:

```js
function playCompletionSequence() {
  if (muted) return;
  const style = soundSettings.style;
  if (style === 'speech-terse' || style === 'speech-fulsome') {
    speak(SPEECH_CUES[style === 'speech-terse' ? 'terse' : 'fulsome'].complete);
  } else {
    playTone(523, 0.25, soundSettings.volume, style);
    setTimeout(() => playTone(659, 0.25, soundSettings.volume, style), 300);
    setTimeout(() => playTone(784, 0.4,  soundSettings.volume, style), 600);
  }
}
```

- [ ] **Step 4: Update the playStartBeep call site in tick()**

Find this line in the `tick()` function:

```js
    warnedThisInterval    = false;
    playStartBeep();
```

Replace with:

```js
    warnedThisInterval    = false;
    playStartBeep(session[intervalIdx].type);
```

- [ ] **Step 5: Replace the testSound stub**

Find the stub added in Task 2:

```js
function testSound() { /* stub — implemented in Task 6 */ }
```

Replace it with:

```js
function testSound() {
  playStartBeep('run');
}
```

- [ ] **Step 6: Verify in browser — tone modes**

Open `index.html`. Open settings (⚙). Set style to **Tone — Smooth**. Click **Test Sound** — should play a 660 Hz sine tone at the configured volume. Adjust volume slider and test again — loudness should change. Repeat with **Tone — Digital** (buzzier) and **Tone — Soft** (flutier).

- [ ] **Step 7: Verify in browser — speech modes**

Set style to **Voice — Terse**. Click **Test Sound** — should speak "Run." Set to **Voice — Fulsome** — should speak "Beginning run interval." Adjust volume and test again — speech volume should change.

Start a workout (e.g. Week 1 Day 1 with Voice — Terse). Verify:
- Interval transitions say "Walk." / "Run." etc.
- Warning at 3s before end says "Ready."
- Completion says "Done."

Verify mute button (🔇) silences speech modes as well as tone modes.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: refactor sound dispatch to respect style/volume settings; wire test button"
```
