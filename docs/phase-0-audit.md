# Grounded — Phase 0 Audit Report

**Date:** 2026-05-13  
**Scope:** `bibleData.js` size, full localStorage/sessionStorage key inventory, duplicate storage helpers, cross-file key conflicts. No code changes made.

---

## 1. `bibleData.js` — Size and Load Impact

| Metric | Value |
|---|---|
| File size | **10.7 KB** |
| Lines | 124 |

`bibleData.js` is **not** the full Bible text. It contains a small offline sample for KJV (Genesis 1 and a handful of other chapters) plus the data structure. The full Bible is loaded at runtime from `bible-api.com`.

**Conclusion from the modularization plan:** The plan said "If under 2 MB, no action needed." At 10.7 KB, no lazy-load split is required. Phase 8 (bibleData split) is cancelled. The pre-load parse cost is negligible.

**Parse impact:** The main parse cost is `index.html` itself at **1,052.9 KB (1.03 MB, 19,102 lines)**. That is the file to watch, not `bibleData.js`.

---

## 2. Storage Usage by File

### localStorage

| File | Calls | Notes |
|---|---|---|
| `index.html` | **176** | One large inline `<script>` block; all calls are bare `localStorage.*` with no helper abstraction |
| `onboarding.js` | 30 | Mix of direct strings and legacy key duplication |
| `grounded-native-notifications.js` | 15 | Uses local constants (LS_*) for key names |
| `app-themes.js` | 7 | Uses module-level constants for key names |
| `weekly-themes.js` | 4 | Uses one local constant; one key defined twice (see conflicts section) |
| `study-app.js` | 5 | Uses named constants + the only `readJson`/`writeJson` helpers in the codebase |
| **Total** | **237** | |

### sessionStorage

| File | Calls | Notes |
|---|---|---|
| `index.html` | 28 | Spread across multiple feature blocks; no helpers |
| `study-app.js` | 15 | Handoff keys (pending verse, pending chapter, handoff flag) |
| `app-themes.js` | 1 | Onboarding replay session flag |
| `onboarding.js` | 1 | Clears the replay session flag |
| **Total** | **45** | |

---

## 3. Full localStorage Key Inventory

### 3a. Core App State

| Key | Owner | Type | R/W | Notes |
|---|---|---|---|---|
| `onboardingCompleted` | `app-themes.js`, `onboarding.js`, `grounded-native-notifications.js` | `"true"` or `"false"` string | R+W | Authoritative completion gate. **Never** the bare boolean. |
| `grounded_onboarding_state` | `app-themes.js` | JSON object | R+W | Shape: `{ version, step, selectedTheme, userIntent, onboardingGoals[], dailyTime, preferredTime, userName, onboardingCompleted }` |
| `activeTab` | `index.html` | string | R+W | `"feed"`, `"word"`, `"reflect"`, `"prayer"`, `"reset"`, `"study"` |
| `grounded_theme` | `index.html`, `app-themes.js` | string | R+W | `"soft"` or `"neutral"`. Written by two files independently. |

### 3b. User Identity (Dual-Key Legacy Pair — see §5)

| Key | Owner | Type | R/W | Notes |
|---|---|---|---|---|
| `grounded_user_name` | `onboarding.js`, `index.html` | string | R+W | **Canonical key.** Also in `SETTINGS_KEYS.name`. |
| `userName` | `onboarding.js`, `index.html` | string | R+W | **Legacy alias.** Written alongside `grounded_user_name` everywhere. Read with `\|\|` fallback. |
| `grounded_why` | `onboarding.js`, `index.html` | JSON string[] | R+W | User's stated goals from onboarding. |

### 3c. Bible Settings (Dual-Key Legacy Pair — see §5)

| Key | Owner | Type | R/W | Notes |
|---|---|---|---|---|
| `grounded_bible_version` | `index.html` | string | R+W | **Canonical key.** Also in `SETTINGS_KEYS.version`. |
| `bibleVersion` | `index.html` | string | R+W | **Legacy alias.** Written alongside canonical on every save. |
| `grounded_show_ref` | `index.html` | `"true"/"false"` string | R+W | Via `SETTINGS_KEYS.showRef`. |
| `grounded_mood_adjust` | `index.html` | `"true"/"false"` string | R+W | Via `SETTINGS_KEYS.moodAdj`. |
| `grounded_focus` | `index.html` | JSON array | R+W | Via `SETTINGS_KEYS.focus`. |
| `grounded_rhythm` | `index.html` | string | R+W | Via `SETTINGS_KEYS.rhythm`. Removed (not just set to empty) when blank. |

### 3d. Reminder Settings (Dual-Key Legacy Pair — see §5)

| Key | Owner | Type | R/W | Notes |
|---|---|---|---|---|
| `grounded_reminder_type` | `index.html` | string | R+W | **Canonical key.** Via `REMINDER_KEYS.reminderType`. |
| `reminderType` | `index.html` | string | R+W | **Legacy alias.** Written alongside canonical. Comment in code: *"mirror; canonical user key is reminderType"* — note the comment identifies the legacy key as "canonical", which is backwards. |
| `grounded_reminder_morning_on` | `index.html` | `"true"/"false"` | R+W | Via `REMINDER_KEYS.morningOn`. |
| `grounded_reminder_morning_time` | `index.html` | `"HH:MM"` | R+W | Via `REMINDER_KEYS.morningTime`. |
| `grounded_reminder_evening_on` | `index.html` | `"true"/"false"` | R+W | Via `REMINDER_KEYS.eveningOn`. |
| `grounded_reminder_evening_time` | `index.html` | `"HH:MM"` | R+W | Via `REMINDER_KEYS.eveningTime`. |
| `grounded_daily_reminder_on` | `index.html`, `grounded-native-notifications.js` | `"true"/"false"` | R+W | **Cross-file conflict** — same key name, separate constant declarations. See §5. |
| `grounded_reminder_time` | `index.html`, `grounded-native-notifications.js` | `"HH:MM"` | R+W | **Cross-file conflict** — same key name, separate constant declarations. See §5. |

### 3e. Feeling / Mood / Daily Check-in

| Key | Owner | Type | R/W | Notes |
|---|---|---|---|---|
| `grounded_feeling` | `index.html` | string | R+W | Current mood/feeling key. |
| `grounded_feeling_date` | `index.html` | date string | R+W | Date the feeling was set. |
| `grounded_feeling_onboarding_preset` | `index.html` | `"1"` flag | R+W | Set during onboarding; cleared on first real check-in. |
| `grounded_current_verse` | `index.html` | JSON object | R+W | The verse paired with the current feeling. Removed in at least 4 separate places. |
| `selectedMood` | `index.html`, `onboarding.js` | string | R+W | **Legacy alias** for `grounded_feeling`. |
| `grounded_last_moment_feeling` | `index.html` | string | W only (visible) | Written after moment completion; no visible reader found. |

### 3f. Engagement / Streak Tracking

| Key | Constant | Owner | Type | R/W |
|---|---|---|---|---|
| `lastCheckInDate` | `CHECKIN_KEY` | `index.html` | date string | R+W |
| `groundedDaysCount` | `GROUNDED_COUNT_KEY` | `index.html` | integer string | R+W |
| `lastActiveDate` | `GROUNDED_LAST_KEY` | `index.html` | date string | R+W |
| `lastProgressPopupDate` | `LAST_PROGRESS_POPUP_KEY` | `index.html` | date string | R+W |
| `welcomeShownDate` | `WELCOME_SHOWN_KEY` | `index.html` | date string | R+W |
| `totalCheckIns` | *(literal)* | `index.html` | integer string | R+W |
| `grounded_moment_completed_day` | `MOMENT_COMPLETED_DAY_KEY` | `index.html` | date string | R+W |
| `grounded_moments_completed` | `GROUNDED_MOMENTS_COMPLETED_KEY` | `index.html` | integer string | R+W |

### 3g. Content / Saved Items

| Key | Constant | Owner | Type | R/W | Notes |
|---|---|---|---|---|---|
| `grounded_saved` | *(literal)* | `index.html` | JSON array | R+W | Saved verse IDs. |
| `grounded_favorite_verses` | *(literal)* | `index.html` | JSON array | R+W | |
| `grounded_saved_prayers` | `PRAYER_SAVED_KEY` | `index.html` | JSON array (max 50) | R+W | |
| `grounded_saved_declarations` | *(literal)* | `index.html` | JSON array | R+W | |
| `grounded_scripture_plus_saved` | `SPX_SAVED_KEY` | `index.html` | JSON array (max 80) | R+W | Scripture+ tab saves. |
| `grounded_journal_entries` | *(literal)* | `index.html` | JSON array | R+W | **Written in 5 separate places** in index.html. Also read by the Reflect tab. |
| `grounded_study_entries` | *(literal)* | `index.html` | JSON array | R+W | |
| `grounded_study_journal` | `JOURNAL_KEY` | `study-app.js` | JSON array (max 200) | R+W | Separate journal from `grounded_journal_entries`. Two journal systems exist. |

### 3h. Study Tab

| Key | Constant | Owner | Type | R/W | Notes |
|---|---|---|---|---|---|
| `grounded_study_plan_progress_v1` | `PLANS_KEY` | `study-app.js` | JSON object | R+W | |
| `grounded_book_overview_cache_v1` | `OVERVIEW_CACHE` | `study-app.js` | JSON object (max 80 entries) | R+W | |
| `lastStudyContext` | *(literal)* | `index.html` (W), `study-app.js` (R) | JSON object | R+W | Cross-file: written in `index.html`, read in `study-app.js`. |
| `grounded_last_study_chapter` | *(literal)* | `index.html` (W), `study-app.js` (W) | JSON object | W+W | **Written in two places; no visible reader.** Likely superseded by `lastStudyContext`. |
| `grounded_sermon_notes` | *(literal)* | `study-app.js` | JSON array | **R only** | **No writer found anywhere in the codebase.** Dead read. |

### 3i. Bible Reader

| Key | Constant | Owner | Type | R/W |
|---|---|---|---|---|
| `grounded_bible_resume` | `BF_RESUME_KEY` | `index.html` | JSON object `{book, chapter, ts}` | R+W |
| `grounded_verse_highlights` | `GROUNDED_VERSE_HIGHLIGHTS_KEY` | `index.html` | JSON Set→Array | R+W |
| `selectedBook` | *(literal)* | `index.html` | JSON object | R+W |
| `grounded_scripture` | *(literal)* | `index.html` | JSON array | R+W |

### 3j. Weekly Themes and Moments

| Key | Constant | Owner | Type | R/W | Notes |
|---|---|---|---|---|---|
| `grounded_theme_override` | `GROUNDED_THEME_OVERRIDE_KEY` | `index.html`, `weekly-themes.js` | string | R+W | **Constant defined twice** in two separate files with the same value. See §5. |
| `grounded_theme_intro_shown` | `GROUNDED_THEME_INTRO_SHOWN_KEY` | `index.html` | JSON object | R+W | |
| `grounded_weekly_arc_moments_v1` | `GROUNDED_WEEKLY_ARC_MOMENTS_KEY` | `index.html` | JSON object | R+W | |
| `grounded_theme_explained` | *(literal)* | `index.html` | `"true"` flag | R+W | |
| `grounded_theme_choice_note` | *(literal)* | `index.html` | `"1"` flag | R+W | Removed in 3 places. |
| `grounded_weekly_theme_notify_title` | `LS_THEME_TITLE` | `index.html` (W), `grounded-native-notifications.js` (R) | string | R+W | Cross-file: different constant names, same key string. |

### 3k. Onboarding — Legacy Keys

These keys are set during onboarding completion but have no visible read calls in app code after the initial flow. They appear to be compatibility writes from a prior data model.

| Key | Set by | Notes |
|---|---|---|
| `selectedTheme` | `onboarding.js` line 534 | No reader found. |
| `userIntent` | `onboarding.js` line 535 | No reader found. |
| `onboardingGoals` | `onboarding.js` lines 286, 447, 536 | Read once in `onboarding.js` line 161 during resume; otherwise no reader. |
| `dailyTime` | `onboarding.js` lines 448, 537 | No reader found after completion. |
| `preferredTime` | `onboarding.js` lines 289, 449, 538 | No reader found after completion. |
| `grounded_onboarding_skipped` | `onboarding.js` | Read back within `onboarding.js` for skip detection. |

### 3l. Navigation / UI State

| Key | Owner | Type | R/W |
|---|---|---|---|
| `grounded_nav_show_journal` | `index.html` | `"1"/"0"` flag | R+W |
| `grounded_meditation_mode` | `index.html` | string | R+W |
| `grounded_lastIdx` | `index.html` | JSON number | R+W |
| `lastResetType` | `index.html` | JSON object `{type, at}` | R+W |
| `scriptureTipData` | `STIP_KEY` in `index.html` | JSON object | R+W |

### 3m. Notification Subsystem

| Key | Constant | Owner | Type | R/W | Notes |
|---|---|---|---|---|---|
| `grounded_notifications` | `LS_NOTIF` | `grounded-native-notifications.js` | string | R+W | `"granted"`, `"denied"`, `"later"` |
| `grounded_daily_reminder_on` | `LS_DAILY_ON` | `grounded-native-notifications.js`, `index.html` | `"true"/"false"` | R+W | Same key, different constant names. |
| `grounded_reminder_time` | `LS_TIME` | `grounded-native-notifications.js`, `index.html` | `"HH:MM"` | R+W | Same key, different constant names. |

### 3n. Dynamic Keys (Runtime-Generated)

These keys cannot be listed as static strings. The number of actual entries grows with use.

| Pattern | Owner | Notes |
|---|---|---|
| `grounded_memory_shown_{slug}` | `index.html` | One key per memory slug. Checked before showing a memory. |
| `grounded_memory_{slug}_{dk}` | `index.html` | One key per slug+date. Stores the memory response. |
| `grounded_reminder_{slot}_lastShown` | `index.html` | `slot` is `morning` or `evening`. |
| `grounded_theme_week_complete_{YYYY-WW}` | `index.html` (via `groundedJan1WeekCompleteStorageKey()`) | One key per ISO week. |

---

## 4. Full sessionStorage Key Inventory

| Key | Constant | Owner | Type | Purpose |
|---|---|---|---|---|
| `grounded_study_pending_verse` | *(literal)* | `index.html` (W×5), `study-app.js` (R+clear) | JSON object | Cross-tab handoff: verse selected in Scripture, consumed by Study tab on mount |
| `grounded_study_pending_chapter` | *(literal)* | `index.html` (W), `study-app.js` (R+clear) | JSON object | Cross-tab handoff: chapter selected in Scripture |
| `grounded_study_handoff` | *(literal)* | `index.html` (W×4), `study-app.js` (W+R+clear) | `"scripture"` string | Handoff origin flag consumed alongside pending verse/chapter |
| `grounded_reflect_override` | *(literal)* | `index.html` (W×6, R×1, clear×2) | JSON object | Pushes a specific verse/reflection into the Reflect tab |
| `grounded_reflect_prompt_sid` | `KEY` (local const, line 14698) | `index.html` | string | Session ID for reflect prompt deduplication |
| `grounded_prayer_verse_context` | `VERSE_PRAYER_SESSION_KEY` | `index.html` | JSON object | Passes verse context into the prayer flow |
| `grounded_moment_flow` | `MOMENT_FLOW_KEY` | `index.html` | JSON object `{text, ref, source, ts}` | Passes content through the guided moment flow |
| `grounded_replay_onboarding` | `REPLAY_ONBOARDING_SESSION` in `app-themes.js` | `app-themes.js` (W), `onboarding.js` (clear) | `"1"` flag | Marks a dev-triggered onboarding replay session |

**sessionStorage risk note:** `grounded_study_pending_verse`, `grounded_study_pending_chapter`, and `grounded_study_handoff` are the cross-tab handoff keys identified in the risk report. They are written in index.html (5 distinct write sites) and consumed in `study-app.js`. If the iOS WebView is suspended between write and read, the handoff is silently lost and the Study tab opens to its landing state with no error.

---

## 5. Conflicts and Anomalies

### 5a. Dual-Key Legacy Pairs (3 confirmed)

These keys are written under two names simultaneously on every save. Every read checks the canonical name first, then falls back to the legacy name.

| Canonical Key | Legacy Key | Files Writing Both |
|---|---|---|
| `grounded_user_name` | `userName` | `onboarding.js`, `index.html` |
| `grounded_bible_version` | `bibleVersion` | `index.html` |
| `grounded_reminder_type` | `reminderType` | `index.html` (note: a comment in the code incorrectly labels `reminderType` as the canonical key) |

### 5b. Cross-File Key Name Conflicts (2 confirmed)

Same key string used by two different files, each declaring its own local constant. A future rename of one constant would silently break the other file's reads.

| Key String | File A | Constant in A | File B | Constant in B |
|---|---|---|---|---|
| `grounded_daily_reminder_on` | `index.html` | *(bare string)* | `grounded-native-notifications.js` | `LS_DAILY_ON` |
| `grounded_reminder_time` | `index.html` | *(bare string)* | `grounded-native-notifications.js` | `LS_TIME` |
| `grounded_weekly_theme_notify_title` | `index.html` | *(bare string, written)* | `grounded-native-notifications.js` | `LS_THEME_TITLE` |
| `grounded_theme_override` | `index.html` | `GROUNDED_THEME_OVERRIDE_KEY` | `weekly-themes.js` | `GROUNDED_THEME_OVERRIDE_KEY` (same name, separate declaration) |

### 5c. Duplicate Write, No Reader (2 confirmed)

| Key | Written by | Reader |
|---|---|---|
| `grounded_last_study_chapter` | `index.html` line 11945, `study-app.js` line 1257 | **None found.** Likely superseded by `lastStudyContext`. |
| `grounded_sermon_notes` | **None found.** | `study-app.js` line 828 — reads a key that is never written by the app. |

### 5d. Cross-File Read/Write (1 confirmed)

`lastStudyContext` is **written** in `index.html` (line 11949) and **read** in `study-app.js` (line 501). No shared constant. The key string must match exactly between the two files or the handoff silently returns null.

### 5e. Key Written in 5+ Separate Places

`grounded_journal_entries` is written at lines 15743, 15747, 18163 (then removed), 18281, 18424 in `index.html`. Each write reconstructs the array from scratch. There is no single write path, meaning concurrent or rapid interactions could produce a last-write-wins race.

A second journal, `grounded_study_journal`, exists in `study-app.js` and is entirely separate. A user's "journal" in the Study tab and "journal" in the Reflect/Today tab are stored in different keys and never merged.

### 5f. Two Parallel Journal Systems

| Key | Owner | Written by | Read by |
|---|---|---|---|
| `grounded_journal_entries` | `index.html` | Reflect tab (5 write sites) | Reflect tab, Today tab |
| `grounded_study_journal` | `study-app.js` | Study tab | Study tab only |

These are presented to the user as part of the same "journal" concept but are stored in independent keys and never combined.

---

## 6. Duplicate Storage Helpers

The `readJson`/`writeJson` pattern appears in two forms across the codebase.

### Named helpers (study-app.js only)

```js
// study-app.js lines 47–62
function readJson(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return fallback;
    var o = JSON.parse(raw);
    return o == null ? fallback : o;
  } catch (e) { return fallback; }
}

function writeJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}
```

Used in `study-app.js` for: `JOURNAL_KEY`, `PLANS_KEY`, `OVERVIEW_CACHE`.

### Inlined equivalents (index.html, 20+ instances)

The same pattern is inline-repeated throughout `index.html` without a helper:

```js
// Typical pattern — appears ~20+ times in index.html
const raw = JSON.parse(localStorage.getItem('some_key') || '[]');
// or
JSON.parse(localStorage.getItem('some_key') || 'null')
// or
try { stored = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) {}
```

### Inlined in app-themes.js (no helper)

`app-themes.js` reads and writes `localStorage` directly with inline `try/catch` blocks. No shared helper is used.

### Inlined in onboarding.js (no helper)

`onboarding.js` uses all bare `localStorage.setItem`/`getItem` calls with no helper abstraction.

**Summary:** `readJson`/`writeJson` from `study-app.js` is the only named helper in the entire codebase. The equivalent logic is duplicated inline at least 20 additional times in `index.html` alone, and further inlined in `app-themes.js` and `onboarding.js`.

---

## 7. Complete Key Count

| Category | localStorage keys | sessionStorage keys |
|---|---|---|
| Core state | 4 | 0 |
| User identity | 3 | 0 |
| Bible settings | 6 | 0 |
| Reminder settings | 8 | 0 |
| Feeling/mood | 5 | 0 |
| Engagement/streak | 7 | 0 |
| Content/saved | 9 | 0 |
| Study tab | 5 | 2 (+1 handoff flag) |
| Bible reader | 4 | 0 |
| Weekly themes | 6 | 0 |
| Onboarding legacy | 6 | 1 |
| Navigation/UI | 5 | 4 |
| Notifications | 3 | 0 |
| Dynamic (patterns) | 4 patterns | 0 |
| **Total (static keys)** | **~71 unique static keys** | **8 unique static keys** |

---

## 8. Phase 0 Findings for Phase 1 (store.js)

The following issues are confirmed and must be handled by `store.js`:

1. **Three dual-key legacy pairs** must be resolved via `legacyGet`/`legacySet` shims. Straightforward.

2. **Four cross-file key conflicts** must be resolved by giving each key exactly one canonical constant in `store.js`. The separate declarations in `grounded-native-notifications.js` and `weekly-themes.js` must be retired to read from the store.

3. **`grounded_last_study_chapter`** has no reader — mark as write-only until confirmed dead, then stop writing it.

4. **`grounded_sermon_notes`** has no writer in this codebase — document it as an external integration key (potentially populated by a future sermon notes feature). `store.js` should provide a typed read method but write nothing.

5. **Two parallel journal keys** (`grounded_journal_entries` vs `grounded_study_journal`) should be documented as intentionally separate in `store.js`. Do not merge them without a migration strategy.

6. **`grounded_journal_entries` has 5 write sites** — `store.js` should provide a single `setJournalEntries(arr)` method and all 5 sites should call it. This is the highest-risk write pattern in the app.

7. **The `reminderType` vs `grounded_reminder_type` comment** in the source incorrectly labels the legacy key as canonical. The `store.js` definition should document the correct canonical key clearly.

8. **`bibleData.js` split: not needed.** File is 10.7 KB. No Phase 8 required.

---

## 9. Phase 0 Definition of Done — Verification

- [x] `bibleData.js` size measured: **10.7 KB. No split needed.**
- [x] All localStorage keys inventoried across all source files
- [x] All sessionStorage keys inventoried
- [x] Dual-key legacy pairs identified: **3 pairs**
- [x] Cross-file key conflicts identified: **4 conflicts**
- [x] Duplicate storage helpers identified: **1 named helper (`readJson`/`writeJson`) + 20+ inline equivalents**
- [x] No application code modified
