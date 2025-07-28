import * as vscode from "vscode";

export function getPreviousPosition(
    doc: vscode.TextDocument,
    pos: vscode.Position): vscode.Position | null {
    if (pos.character > 0) {
        return pos.translate(0, -1);
    } else if (pos.line > 0) {
        const prevLine = pos.line - 1;
        const prevLineLength = doc.lineAt(prevLine).text.length;
        return new vscode.Position(prevLine, prevLineLength);
    }
    // At start of document
    return null;
}
