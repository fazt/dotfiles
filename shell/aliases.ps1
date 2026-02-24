# PowerShell aliases

# Claude
function cc { claude --dangerously-skip-permissions $args }
function cx { codex --dangerously-bypass-approvals-and-sandbox $args }

# Git
function gs { git status }
function ga { git add $args }
function gaa { git add -A }
function gp { git push }
function gl { git pull }
function gd { git diff $args }
function glog { git log --oneline --graph $args }
function gb { git branch $args }
function gco { git checkout $args }
function gsw { git switch $args }
function cm { git commit -m "$($args -join ' ')" }
function cma { git add -A; git commit -m "$($args -join ' ')" }

# Node/npm
function nd { npm run dev }
function nb { npm run build }
function ns { npm start }
function ni { npm install }
function nt { npm test }

# General
function ll { Get-ChildItem -Force }
function la { Get-ChildItem -Force -Name }
function c { Clear-Host }
