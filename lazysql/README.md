# lazysql

Theme `plomo`, matching `herdr/config.toml`'s `[theme.custom]` and `lazygit/config.yml`, plus a few
app settings. herdr opens it on the project's database with `prefix+Shift+S` (see `herdr/README.md`).

lazysql only ships named presets, so this starts from `default` (which keeps the terminal's black
background) and overrides every color in `[theme.Colors]` with the same graphite greys. The muted
state colors of herdr (`yellow`, `green`, `red`, `blue`, `peach`) go to SQL syntax and to changed,
inserted and deleted rows. lazysql reports unknown keys and colors when it starts, so a typo shows up.

## No connections here

**This repo is public and connection URLs carry passwords.** `config.toml` has no `[[database]]`
entries on purpose. Add connections on each machine from lazysql itself (`a` in the connection
picker): they are written to the local copy, which never comes back here. For per-project
connections, a `.lazysql.toml` next to `.git` replaces the global list for that repo; keep it out of
git (or in the private dotfiles).

That is also why it is **copied, not symlinked**: lazysql writes to `config.toml` when you add a
connection or pick a theme with `Ctrl+T`, and a symlink would write those into this repo.

## Install

Linux:

```bash
mkdir -p ~/.config/lazysql
[ -f ~/.config/lazysql/config.toml ] || cp config.toml ~/.config/lazysql/config.toml
```

Windows (`%APPDATA%\lazysql`):

```powershell
New-Item -ItemType Directory -Force "$env:APPDATA\lazysql" | Out-Null
if (-not (Test-Path "$env:APPDATA\lazysql\config.toml")) { Copy-Item config.toml "$env:APPDATA\lazysql\config.toml" }
```

Both skip the copy when a local config exists, so saved connections are not overwritten. To pick up
a newer theme from here on a machine that already has connections, copy the `[application]` and
`[theme]` sections by hand.

lazysql itself comes from mise (`github:jorgerojas26/lazysql` in the private dotfiles' `mise.toml`).
Telemetry is off in the herdr shortcut (`-no-telemetry`); elsewhere, set `LAZYSQL_NO_TELEMETRY=1` or
pick **Disable** in its first-run notice.
