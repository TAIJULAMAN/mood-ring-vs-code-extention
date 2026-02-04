import * as vscode from 'vscode';
import { ThemeManager } from './themeManager';
import { AudioProvider } from './audioProvider';
import { MoodController } from './moodController';

let moodController: MoodController;
let themeManager: ThemeManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Mood Ring is active!');

    themeManager = new ThemeManager(context);
    const audioProvider = new AudioProvider(context);
    moodController = new MoodController(context, themeManager, audioProvider);

    context.subscriptions.push(moodController);
    context.subscriptions.push({ dispose: () => themeManager.restore() });

    context.subscriptions.push(vscode.commands.registerCommand('moodRing.reset', () => {
        moodController.reset();
    }));
}

export function deactivate(context: vscode.ExtensionContext) {
    if (themeManager) {
        return themeManager.restore();
    }
}
