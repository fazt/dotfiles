# lazygit

Theme `plomo`, matching `herdr/config.toml`'s `[theme.custom]`.

lazygit has no named themes — `gui.theme` takes a list of colors per element. Defaults are a
saturated green and blue that clash with herdr's graphite, so the same palette is reused here.
Hex instead of names (`green`, `cyan`) on purpose: names are resolved by the terminal and would
shift with the WezTerm theme.

`branchColorPatterns` colors branches by kind, which matters because agents leave a lot of them
and the FXCode ones are 40 characters of identifier before the readable part.

## Install

Windows (config dir is `%LOCALAPPDATA%\lazygit`, printed by `lazygit --print-config-dir`):

```powershell
Copy-Item config.yml "$env:LOCALAPPDATA\lazygit\config.yml" -Force
```

On Linux and macOS it goes to `~/.config/lazygit/config.yml`.

`lazygit --config` prints the full default config, which is the reliable reference for key names:
they have changed across versions. This was written against 0.66.1.
