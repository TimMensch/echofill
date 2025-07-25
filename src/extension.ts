// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        "extension.prefixSearchAndSelect",
        () => {
            // Get the current editor and selection
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const selections = editor.selections;

            // Extract the prefix from the cursor position
            const position = editor.selection.start;
            const line = editor.document.lineAt(position);
            const wordRange = getWordBeforeCursor(editor, position);
            if (!wordRange) {
                return;
            }

            // Search backward for a word that starts with the prefix and select it
            const searchStartPosition = new vscode.Position(
                line.range.start.line,
                wordRange.end.character - 2,
            );
            const result =
                editor.document.getWordRangeAtPosition(searchStartPosition);

            if (result) {
                // Select the previous word that starts with the prefix
                const newSelections: vscode.Selection[] = [];
                for (const selection of selections) {
                    newSelections.push(
                        new vscode.Selection(
                            searchStartPosition,
                            selection.end,
                        ),
                    );
                }

                editor.selections = newSelections;
            } else {
                // No word found with the prefix, clear the selection
                editor.selections = [];
            }
        },
    );

    context.subscriptions.push(disposable);
}

function getWordBeforeCursor(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    const line = editor.document.lineAt(position);
    if (!line) {
        return;
    }

    const wordRange = line.range;
    const text = line.text;

    // Iterate through the characters in the line to find a delimiter
    for (let i = position.character - 1; i >= 0; --i) {
        const charAtPosition = text[i];
        if (charAtPosition === " " || charAtPosition === "\t") {
            return new vscode.Range(
                wordRange.start,
                new vscode.Position(line.range.start.line, i + 1),
            );
        }
    }
}
// This method is called when your extension is deactivated
export function deactivate() {}
