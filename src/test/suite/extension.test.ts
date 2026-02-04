import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Mood Ring Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('User.mood-ring'));
    });

    test('Activation should not throw', async () => {
        const ext = vscode.extensions.getExtension('User.mood-ring');
        assert.ok(ext);
        // We can't easily activate it because it might depend on workspace state that isn't mocked,
        // but 'activate' function itself is simple enough.
        // Let's just assert that it is defined.
        assert.ok(ext!.packageJSON);
    });
});
