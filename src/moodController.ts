import * as vscode from 'vscode';
import { ThemeManager, MoodState } from './themeManager';
import { AudioProvider } from './audioProvider';

export class MoodController {
    private keystrokes = 0;
    private backspaces = 0;
    private interval: NodeJS.Timeout | undefined;

    private themeManager: ThemeManager;
    private audioProvider: AudioProvider;
    private config: vscode.WorkspaceConfiguration;


    // Hysteresis buffers
    private pendingMood: MoodState | null = null;
    private pendingMoodCount = 0;
    private currentMood: MoodState = 'relaxed';
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext, themeManager: ThemeManager, audioProvider: AudioProvider) {
        this.themeManager = themeManager;
        this.audioProvider = audioProvider;
        this.config = vscode.workspace.getConfiguration('moodRing');

        // Status Bar
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'moodRing.reset';
        context.subscriptions.push(this.statusBarItem);
        this.updateStatusBar('relaxed');
        this.statusBarItem.show();

        // Text listener
        vscode.workspace.onDidChangeTextDocument(this.onDocumentChange, this, context.subscriptions);

        // Configuration listener
        vscode.workspace.onDidChangeConfiguration(() => {
            this.config = vscode.workspace.getConfiguration('moodRing');
        });

        // Start heartbeat
        this.startHeartbeat();
    }

    private onDocumentChange(event: vscode.TextDocumentChangeEvent) {
        if (event.contentChanges.length === 0) {
            return;
        }
        const change = event.contentChanges[0];

        if (change.text === '') {
            this.backspaces++;
        } else {
            this.keystrokes++;
        }
    }

    private startHeartbeat() {
        this.interval = setInterval(() => {
            this.analyze();
            // Reset counters every cycle
            this.keystrokes = 0;
            this.backspaces = 0;
        }, 2000); // 2 seconds
    }

    private analyze() {
        if (!this.config.get('enabled', true)) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        let mood: MoodState = 'relaxed';

        if (editor) {
            const diags = vscode.languages.getDiagnostics(editor.document.uri);
            const errorCount = diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;

            // keystrokes in 2s. 
            // WPM = (keystrokes / 5) * 30;
            const wpm = (this.keystrokes / 5) * 30;
            const panicRatio = this.keystrokes > 0 ? this.backspaces / (this.keystrokes + this.backspaces) : 0;
            const flowThreshold = this.config.get('flowThreshold', 60);

            if (errorCount >= 3 || (this.backspaces > 2 && panicRatio > 0.3)) {
                mood = 'panic';
            } else if (wpm > flowThreshold) {
                mood = 'flow';
            } else {
                mood = 'relaxed';
            }
        }

        this.updateLikelyMood(mood);
    }

    private updateLikelyMood(mood: MoodState) {
        // Hysteresis: Require confirmation of mood change
        if (mood === this.currentMood) {
            this.pendingMood = null;
            this.pendingMoodCount = 0;
            return;
        }

        if (this.pendingMood === mood) {
            this.pendingMoodCount++;
        } else {
            this.pendingMood = mood;
            this.pendingMoodCount = 1;
        }

        // If we have 2 consecutive readings (4 seconds) of new mood, switch
        if (this.pendingMoodCount >= 2) {
            this.currentMood = mood;
            this.themeManager.applyMood(mood);

            if (this.config.get('audioEnabled', true)) {
                if (mood === 'relaxed') {
                    this.audioProvider.stop();
                } else {
                    this.audioProvider.play(mood);
                }
            } else {
                this.audioProvider.stop();
            }

            // Optional status update
            this.updateStatusBar(mood);
        }
    }

    private updateStatusBar(mood: MoodState) {
        let text = `Mood: ${mood.toUpperCase()}`;
        let icon = '';

        switch (mood) {
            case 'flow': icon = '$(rocket)'; break;
            case 'panic': icon = '$(alert)'; break;
            case 'relaxed': icon = '$(heart)'; break;
        }

        this.statusBarItem.text = `${icon} ${text}`;
        this.statusBarItem.tooltip = `Current State: ${mood}`;
    }

    public reset() {
        this.analyze();
        this.updateLikelyMood('relaxed');
        // Force reset
        this.currentMood = 'relaxed';
        this.themeManager.applyMood('relaxed');
        this.audioProvider.stop();
        this.updateStatusBar('relaxed');
    }

    public dispose() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
