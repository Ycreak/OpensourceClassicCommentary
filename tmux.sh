#!/bin/sh
tmux new-session -d '-n OSCC'
tmux send-keys 'cd Angular; ng serve --poll=3000 --port 4200' C-m

tmux splitw -h
tmux send-keys 'cd NoSQL_server; FLASK_APP=server.py FLASK_ENV=development flask run --port 5003' C-m

tmux -2 attach-session -d
