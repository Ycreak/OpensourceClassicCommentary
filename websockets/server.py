from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Dictionary to hold all rooms and its users
room_dictionary: dict = { }

@socketio.on('communicate_change')
def communicate_change(data: dict):
    fabric_object: dict = data['fabric_object']
    change: str = data['event']
    room = data['room']

    print(data)

    socketio.emit('communicate_change', data, to=room)


@socketio.on('json')
def handle_json(data: dict):
    print('bouncing json')
    json = data['json']
    room = data['room']
    socketio.emit('json', json, to=room)

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    print(f"User {username} has joined room {room}")

    # Add the room to the room dictonary and add its users to bounce back
    if room not in room_dictionary:
        room_dictionary[room] = []
    room_dictionary[room].append(username)
    
    join_room(room)
    socketio.emit('user_change', {'users': room_dictionary[room]}, to=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    print(f"User {username} has left room {room}")

    # Remove user from room he is in
    try:
        room_dictionary[room].remove(username)
    except:
        print('User already left.')

    leave_room(room)
    socketio.emit('user_change', {'users': room_dictionary[room]}, to=room)

if __name__ == '__main__':
    socketio.run(app, debug=True)
