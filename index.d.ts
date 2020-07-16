declare module '@danmaqua/danmaku-src-common' {
    import SocketIO from 'socket.io';

    namespace Danmaku {
        interface ConstructorOptions {
            sender: SenderInfo;
            text: string;
            timestamp: number;
            roomId: string|number;
        }

        interface SenderInfo {
            uid: string|number;
            username: string;
            url?: string;
        }
    }

    class Danmaku {
        constructor(options: Danmaku.ConstructorOptions);

        sender: Danmaku.SenderInfo;
        text: string;
        timestamp: number;
        roomId: string|number;
    }

    namespace BaseDanmakuWebSocketSource {
        interface ConstructorOptions {
            hostname: string;
            port: number;
            basicAuth?: string;
        }

        type EventMap = {
            connected: [SocketIO.Socket],
            join: [string|number],
            leave: [string|number],
            reconnect: [string|number],
            disconnect: [string],
            auth_error: [SocketIO.Socket],
            listen: []
        }
    }

    class BaseDanmakuWebSocketSource {
        constructor(options: BaseDanmakuWebSocketSource.ConstructorOptions);
        on<E extends keyof BaseDanmakuWebSocketSource.EventMap>(
            eventName: E,
            listener: (...data: EventMap[E]) => void
        ): any;
        onConnected(socket: SocketIO.Socket): any;
        onJoin(roomId: string|number): any;
        onLeave(roomId: string|number): any;
        onReconnect(roomId: string|number): any;
        onDisconnect(reason: string): any;
        onAuthError(socket: SocketIO.Socket): any;
        sendDanmaku(danmaku: Danmaku): any;
        listen(): any;
    }

    const MSG_JOIN_ROOM: string;
    const MSG_LEAVE_ROOM: string;
    const MSG_RECONNECT_ROOM: string;
}