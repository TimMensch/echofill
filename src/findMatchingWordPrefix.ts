import * as vscode from "vscode";

export function findMatchingWordPrefix(
    editor: vscode.TextEditor,
    startingPosition: vscode.Position,
    prefix: string) {
    let line = startingPosition.line;
    let character = startingPosition.character;
    while (line >= 0) {
        let text = editor.document.lineAt(line).text;
        if (character > 0) {
            text = text.substring(0, character);
            character = -1;
        }
        const lastIndex = text.lastIndexOf(prefix, character);
        if (lastIndex !== -1) {
            return new vscode.Range(
                new vscode.Position(line, lastIndex),
                new vscode.Position(line, lastIndex).translate(
                    0,
                    prefix.length
                )
            );
        } else {
            line--;
        }
    }
    return null;
}
