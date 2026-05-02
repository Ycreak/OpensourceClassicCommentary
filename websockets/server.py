from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "vnkdjnfjknfl1232#"
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)


@socketio.on("json")
def handle_json(json):
    print("bouncing json", json)
    socketio.send(json, json=True)


@socketio.on("join")
def on_join(data):
    username = data["username"]
    room = data["room"]
    print(f"User {username} has joined room {room}")
    join_room(room)
    socketio.send(f"{username} has entered room {room}.", to=room)


@socketio.on("leave")
def on_leave(data):
    username = data["username"]
    room = data["room"]
    print(f"User {username} has left room {room}")
    leave_room(room)
    socketio.send(username + " has left the room.", to=room)


if __name__ == "__main__":
    socketio.run(app, debug=True)
