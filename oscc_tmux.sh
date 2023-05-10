#!/bin/sh

# check if session exists
tmux has-session -t oscc_session
if [ $? != 0 ]
then
	# create the session
	tmux -2 new-session -s oscc_session -n Window -d
	# create the other windows
	tmux new-window -n Angular
	tmux new-window -n Flask
	# start the vim sessions
	# tmux send-keys -t oscc_session:1 'cd Angular/src/app; vim .' #C-m
	tmux send-keys -t oscc_session:1 'code .' C-m

	tmux send-keys -t oscc_session:2 'cd Angular; ng serve --poll=3000 --port 4200' C-m
	# split the third pane and start the angular and flask service
	tmux send-keys -t oscc_session:3 'cd Server; source env/bin/activate.fish; python3 server.py' C-m

	# tmux split-window -h -t oscc_session:3
	#tmux send-keys -t oscc_session:3.0 'cd Server; source env/bin/activate.fish; FLASK_APP=server.py FLASK_ENV=development flask run --port 5003' C-m
	#tmux send-keys -t oscc_session:3.1 'cd Angular; ng serve --poll=3000 --port 4200' C-m
	# end if statement and attach session if it existed
fi

tmux attach -t oscc_session
