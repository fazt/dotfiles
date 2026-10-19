# PSReadLine: autocompletado de rutas con menu y sugerencias del historial
# Solo en una consola interactiva (no en scripts ni en -Command sin terminal).

if ($Host.Name -eq 'ConsoleHost' -and -not [Console]::IsInputRedirected -and (Get-Module -ListAvailable -Name PSReadLine)) {
    Import-Module PSReadLine

    # Mientras escribes, muestra una lista con los comandos del historial que coinciden.
    # F2 alterna entre la lista (ListView) y el texto gris en linea (InlineView).
    Set-PSReadLineOption -PredictionSource HistoryAndPlugin
    Set-PSReadLineOption -PredictionViewStyle ListView

    # Tab abre un menu con las rutas/comandos posibles; Tab otra vez recorre las opciones.
    Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete

    # No repetir en el historial ni mostrar tooltips de parametros innecesarios.
    Set-PSReadLineOption -HistoryNoDuplicates
    Set-PSReadLineOption -HistorySearchCursorMovesToEnd
    Set-PSReadLineOption -CompletionQueryItems 100

    # Atajos estilo bash/readline
    Set-PSReadLineKeyHandler -Chord 'Ctrl+u' -Function BackwardDeleteLine
    Set-PSReadLineKeyHandler -Chord 'Ctrl+d' -Function DeleteCharOrExit
}
