# Start tmux session
tmux new-session -d -s my_session

# Run docker-compose up -d in the first pane
tmux send-keys "docker compose up -d" C-m

sleep 1

# Run docker-compose logs -f flask in the new pane
tmux send-keys "docker compose logs -f flask" C-m

# Split the window horizontally (or vertically) for the second pane
tmux split-window -v

# Run docker-compose logs -f angular in the third pane
tmux send-keys "docker compose logs -f angular" C-m

tmux rename-window 'dockers'

# Attach to the tmux session
tmux attach -t my_session

