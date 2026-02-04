import * as vscode from 'vscode';
import * as path from 'path';

export class AudioProvider {
    private _panel: vscode.WebviewPanel | undefined;
    private readonly _extensionUri: vscode.Uri;
    private _currentTrack: string | null = null;

    constructor(context: vscode.ExtensionContext) {
        this._extensionUri = context.extensionUri;
    }

    public play(trackName: string) {
        if (!this._panel) {
            this._createWebview();
        }

        if (this._currentTrack === trackName) {
            return;
        }
        this._currentTrack = trackName;


        this._panel?.webview.postMessage({ command: 'play', track: trackName });
    }

    private async _checkFiles() {
        try {
            const fs = require('fs');
            const flowPath = path.join(this._extensionUri.fsPath, 'media', 'flow.mp3');
            const panicPath = path.join(this._extensionUri.fsPath, 'media', 'panic.mp3');
            if (!fs.existsSync(flowPath) || !fs.existsSync(panicPath)) {
                console.warn('Mood Ring: Audio files missing in media folder.');
            }
        } catch (e) {
            console.error('Mood Ring: Error checking files', e);
        }
    }

    public stop() {
        this._currentTrack = null;
        this._panel?.webview.postMessage({ command: 'stop' });
    }

    private _createWebview() {
        this._panel = vscode.window.createWebviewPanel(
            'moodRingAudio',
            'Mood Ring Audio',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri],
                retainContextWhenHidden: true,
                enableFindWidget: false,
                enableCommandUris: false,
            }
        );

        // Hide the panel as much as possible - usually the user will just close it or it runs in background?
        // Actually, 'Beside' opens it. We want it hidden.
        // There is no true "hidden" webview in VS Code API 1.85 without UI.
        // The standard trick is to accept it must be open, but maybe we don't force focus?
        // Or we warn the user "Audio requires this panel to be open".
        // Let's use `preserveFocus: true` and maybe `ViewColumn.Active` but actually 
        // to be "Hidden" usually implies it's just in the background tabs.
        // We will stick to the plan: create it, but maybe the user can't see it if they don't look.

        // Actually, we can't hide it. But we can make it minimal.

        this._panel.webview.html = this._getHtmlContent();

        this._panel.onDidDispose(() => {
            this._panel = undefined;
        });
    }

    private _getHtmlContent() {
        // We need URIs for the media files
        const flowUri = this._panel?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'flow.mp3'));
        const panicUri = this._panel?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'panic.mp3'));

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Mood Ring Audio</title>
        </head>
        <body>
            <audio id="flow" loop>
                <source src="${flowUri}" type="audio/mpeg">
            </audio>
            <audio id="panic" loop>
                <source src="${panicUri}" type="audio/mpeg">
            </audio>
            <script>
                const flow = document.getElementById('flow');
                const panic = document.getElementById('panic');
                
                window.addEventListener('message', event => {
                    const message = event.data; // The json data that the extension sent
                    const track = message.track;
                    
                    // Stop all
                    if (flow) {
                        flow.pause();
                        flow.currentTime = 0;
                    }
                    if (panic) {
                        panic.pause();
                        panic.currentTime = 0;
                    }
                    
                    if (message.command === 'play') {
                        if (track === 'flow' && flow) {
                            flow.volume = 0.2; // faint
                            flow.play().catch(e => console.log('Audio play failed', e));
                        } else if (track === 'panic' && panic) {
                            panic.volume = 0.5;
                            panic.play().catch(e => console.log('Audio play failed', e));
                        }
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
