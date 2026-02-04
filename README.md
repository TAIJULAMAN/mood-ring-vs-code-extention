# Mood Ring for VS Code

> **Your coding environment, attuned to your state of mind.**

Mood Ring is an experimental VS Code extension that attempts to detect your "coding mood" in real-time. By analyzing your typing speed (WPM), error rate, and backspace usage, it dynamically adjusts your workspace theme and provides audio feedback to match your flow.

## 🧠 How It Works

The extension monitors your typing patterns and categorizes your state into three moods:

### 1. 🧘 Relaxed (Default)
**Condition**: Normal typing speed, few errors, or idle.
-   **Theme**: Calming Sea Green accents.
-   **Status Bar**: `$(heart) Mood: RELAXED`
-   **Audio**: Silence (or soft ambient if configured).

### 2. 🚀 Flow (The Zone)
**Condition**: High typing speed (High WPM) with few interruptions.
-   **Trigger**: WPM > 60 (configurable).
-   **Theme**: Electric Neon / Blue Violet accents to maintain energy.
-   **Status Bar**: `$(rocket) Mood: FLOW`
-   **Audio**: Plays a low-volume, rhythmic "flow" track to keep you focused.

### 3. 🚨 Panic (Debug Mode)
**Condition**: Erratic typing, frequent backspaces, or high syntax error count.
-   **Trigger**: > 30% backspace ratio or > 3 syntax errors in a short burst.
-   **Theme**: High-contrast Orange/Red accents to alert you to step back.
-   **Status Bar**: `$(alert) Mood: PANIC`
-   **Audio**: Plays a slightly more tense or alerting track (if configured) to signal a break in flow.

---

## ⚙️ Configuration

Customize the sensitivity and behavior of Mood Ring in your VS Code settings (`Ctrl+,`):

| Setting | Default | Description |
| :--- | :--- | :--- |
| `moodRing.enabled` | `true` | Turn the entire extension on or off. |
| `moodRing.flowThreshold` | `60` | The Words Per Minute (WPM) required to enter **Flow** state. Lower this if you type slower to trigger flow more easily. |
| `moodRing.audioEnabled` | `true` | Toggle the ambient audio feedback. |

## 🔊 Adding Custom Audio

To enable audio feedback, you must provide your own mp3 files. The extension looks for them in the extension's `media` folder.

1.  Navigate to the extension installation folder.
2.  Open the `media` folder.
3.  Add two files:
    -   `flow.mp3` - A track for high-focus moments.
    -   `panic.mp3` - A track for high-stress/debugging moments.
4.  Reload the window.

## 🔧 Commands

Open the Command Palette (`Ctrl+Shift+P`) and type:

-   **Mood Ring: Reset Mood**: Manually forces the extension back to "Relaxed" state and resets the theme colors.

## ⚠️ Important Note on Themes

This extension works by writing to your **Workspace Settings** (`.vscode/settings.json`) under `workbench.colorCustomizations`.
-   It **will override** your current theme's colors for the Title Bar, Status Bar, and Activity Bar while active.
-   It restores your original workspace colors when deactivated or uninstalled (best effort).

## Q&A

**Q: Why isn't audio playing?**
A: Check if you have added `flow.mp3` and `panic.mp3` to the `media` folder. By default, the extension ships without audio files to keep the package light and avoid licensing issues.

**Q: The colors are stuck!**
A: Run the `Mood Ring: Reset Mood` command. If that doesn't work, open your `.vscode/settings.json` and manually delete the `workbench.colorCustomizations` block.

---
**Enjoy your flow!**
