alias lln="ls -lhtr  --time-style long-iso | tac | cat -n | tac | sed -s 's/^\s*\([0-9]*\)\s*\(.*\)/[\1]  \2 [\1]/'g && pwd"
function lf() {
    if [ "x${1}" == "x" ]
    then
        n=1 
    else
        n="${1}"
    fi  
    ls -rt1 | tail -n ${n} | head -n 1
}
alias config='/usr/bin/git --git-dir=/Users/cjspradling/.cfg/ --work-tree=/Users/cjspradling'
