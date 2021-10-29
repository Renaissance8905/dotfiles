[[ -s ~/.bashrc ]] && source ~/.bashrc


# Git (most common ones)
alias ga='git add -A'
alias gam='git commit --amend'
alias gb='git branch -v'
alias gc='git commit'
alias gcn='git commit --no-verify'
alias gco='git checkout'
alias gd='git diff'
alias gl='git l'
alias gr1='git reset --soft HEAD~1'
alias gr2='git reset --soft HEAD~2'
alias gr='git rebase'
alias gs='git status'

alias cdr='cd ~/repos && ls'

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
