import * as vscode from "vscode";

export function getWordBeforePosition(
    editor: vscode.TextEditor,
    position: vscode.Position): vscode.Range | null {
    const lineText = editor.document.lineAt(position.line).text;
    const cursorIndex = position.character;

    let start = cursorIndex;

    // Scan backward from the cursor until a non-word character is found
    while (start > 0) {
        const char = lineText.charAt(start - 1);
        if (!/\w/.test(char)) {
            break;
        }
        start--;
    }

    const wordStart = new vscode.Position(position.line, start);
    if (wordStart.isEqual(position)) {
        return null;
    }

    return new vscode.Range(wordStart, position);
}
