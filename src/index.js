'use strict'

const http = require('http');
const ioServer = require('socket.io');
const EventEmitter = require('events');

const MSG_JOIN_ROOM = 'join_room';
const MSG_LEAVE_ROOM = 'leave_room';
const MSG_RECONNECT_ROOM = 'reconnect_room';

class Danmaku {
    constructor({sender: {uid, username, url}, text, timestamp, roomId}) {
        this.sender = {uid, username, url};
        this.text = text;
        this.timestamp = timestamp;
        this.roomId = roomId;
    }
}

class BaseDanmakuWebSocketSource extends EventEmitter {
    constructor({hostname = '127.0.0.1', port = 8001, basicAuth = null}) {
        super();
        this.hostname = hostname;
        this.port = port;
        this.basicAuth = basicAuth;
        this.server = http.createServer();
        this.io = ioServer(this.server);

        this.io.use((socket, next) => {
            if (this.basicAuth) {
                const authHeader = socket.handshake.headers['authorization'];
                if (this.basicAuth !== authHeader) {
                    onAuthError(socket);
                    return next(new Error('Authentication error.'));
                }
            }
            return next();
        });
        this.io.on('connection', (socket) => {
            this.onConnected(socket);
            const connectedRooms = [];
            socket.on(MSG_JOIN_ROOM, (roomId) => {
                this.onJoin(roomId);
                connectedRooms.push(roomId);
            });
            socket.on(MSG_LEAVE_ROOM, (roomId) => {
                this.onLeave(roomId);
                const index = connectedRooms.indexOf(roomId);
                if (index >= 0) {
                    connectedRooms.splice(index, 1);
                }
            });
            socket.on(MSG_RECONNECT_ROOM, (roomId) => {
                this.onReconnect(roomId);
            });
            socket.on('disconnect', (reason) => {
                this.onDisconnect(reason);
                for (let room of connectedRooms) {
                    this.onLeave(room);
                }
            });
        });
    }

    onConnected(socket) {
        this.emit('connected', socket);
    }

    onJoin(roomId) {
        this.emit('join', roomId);
    }

    onLeave(roomId) {
        this.emit('leave', roomId);
    }

    onReconnect(roomId) {
        this.emit('reconnect', roomId);
    }

    onDisconnect(reason) {
        this.emit('disconnect', reason);
    }

    onAuthError(socket) {
        this.emit('auth_error', socket);
    }

    sendDanmaku(danmaku) {
        this.io.sockets.emit('danmaku', JSON.stringify(danmaku));
    }

    listen() {
        this.server.listen(this.port, this.hostname, () => {
            this.emit('listen');
        });
    }
}

module.exports = { 
    Danmaku, BaseDanmakuWebSocketSource,
    MSG_JOIN_ROOM, MSG_LEAVE_ROOM, MSG_RECONNECT_ROOM 
};
