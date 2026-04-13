#!/bin/bash
set -e;
cd /home/luukie/servers/oscc/social_media/;

# Use the full path of uv for crontab
/home/linuxbrew/.linuxbrew/bin/uv run main.py;

