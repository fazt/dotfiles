#!/bin/bash
# Shell aliases

# Claude
alias cc="claude"

# Git
alias g="git"
alias gs="git status"
alias ga="git add"
alias gaa="git add -A"
alias gp="git push"
alias gl="git pull"
alias gd="git diff"
alias glog="git log --oneline --graph"
alias gb="git branch"
alias gco="git checkout"
alias gsw="git switch"
cm() { git commit -m "$*"; }
cma() { git add -A && git commit -m "$*"; }

# Node/npm
alias nd="npm run dev"
alias nb="npm run build"
alias ns="npm start"
alias ni="npm install"
alias nt="npm test"

# General
alias c="clear"
alias ..="cd .."
alias ...="cd ../.."
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
