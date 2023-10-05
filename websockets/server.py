from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

canvas_objects = []

users = {}
@socketio.on('disconnect')
def on_disconnect():
    users.pop(request.sid,'No user found')
    socketio.emit('current_users', users)
    print("User disconnected!\nThe users are: ", users)

@socketio.on('sign_in')
def user_sign_in(user_name, methods=['GET', 'POST']):
    users[request.sid] = user_name['name']
    socketio.emit('current_users', users)
    print("New user sign in!\nThe users are: ", users)

@socketio.on('message')
def messaging(message, methods=['GET', 'POST']):
    print('received message: ' + str(message['message']))
    message['from'] = request.sid
    socketio.emit('message', message, room=request.sid)
    socketio.emit('message', message, room=message['to'])

    for item in message['objects']:
        canvas_objects.push(item)

if __name__ == '__main__':
    socketio.run(app, debug=True)
