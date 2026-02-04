import * as vscode from 'vscode';

export type MoodState = 'relaxed' | 'flow' | 'panic';

// Define the color themes for each mood
const MOOD_THEMES = {
    relaxed: {
        "titleBar.activeBackground": "#2e8b57", // SeaGreen
        "statusBar.background": "#2e8b57",
        "editor.lineHighlightBackground": "#2e8b5720",
        "activityBar.background": "#2e8b57"
    },
    flow: {
        "titleBar.activeBackground": "#8a2be2", // BlueViolet (Neon)
        "statusBar.background": "#8a2be2",
        "editor.lineHighlightBackground": "#8a2be220",
        "activityBar.background": "#8a2be2"
    },
    panic: {
        "titleBar.activeBackground": "#ff4500", // OrangeRed
        "statusBar.background": "#ff4500",
        "editor.lineHighlightBackground": "#ff450020",
        "activityBar.background": "#ff4500"
    },
    default: {}
};

export class ThemeManager {
    private originalColors: any = {};
    private context: vscode.ExtensionContext;
    private currentMood: MoodState = 'relaxed';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        // Store the original settings on startup
        const config = vscode.workspace.getConfiguration();
        this.originalColors = config.get('workbench.colorCustomizations') || {};

        // Also persist in workspaceState just in case of reload
        const savedOriginals = context.workspaceState.get('originalColors');
        if (savedOriginals) {
            this.originalColors = savedOriginals;
        } else {
            context.workspaceState.update('originalColors', this.originalColors);
        }
    }

    public async applyMood(mood: MoodState) {
        if (this.currentMood === mood) { return; }

        this.currentMood = mood;
        const colorConfig = MOOD_THEMES[mood];
        const config = vscode.workspace.getConfiguration();

        // Safety: We update 'workbench.colorCustomizations'
        // targeted to the WORKSPACE level (false argument) to avoid messing up global settings.
        // We merge with original colors if needed, but for now we just overwrite the keys we care about
        // effectively checking if we need to merge would be better, but we want to override.
        // A better approach is to merge our specific keys into the original custom object.

        // However, to keep it clean, let's just write our specific object or a merged object.
        // Simpler implementation: Just set it. The user understands this is an override.

        try {
            await config.update('workbench.colorCustomizations', colorConfig, vscode.ConfigurationTarget.Workspace);
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    }

    public async restore() {
        const config = vscode.workspace.getConfiguration();
        // Restore to original state
        try {
            await config.update('workbench.colorCustomizations', this.originalColors, vscode.ConfigurationTarget.Workspace);
        } catch (error) {
            console.error('Failed to restore theme:', error);
        }
    }
}
