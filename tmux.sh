#!/bin/sh
tmux new-session -d -n 'terminal1' 

tmux new-window -n 'terminal2'
tmux new-window -n 'terminal3'

tmux -2 attach-session -d
