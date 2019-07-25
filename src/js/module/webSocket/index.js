// a web app only has a socket
import Socket from '@js/service/socket';
const manager = {
    timer: null,
    socket: null,
    interval: 100,
    retryInterval: 1000,
    retryTimer: null,
    retryCounter: 3,
    errCode: 0,
    delayCounter: 0,
};
const module = {
    name: 'WebSocket',
    events: [],
    dispatchs: ['Workbench:socket'],
    methods: {
        init() {
            if (manager.socket) {
                if (manager.socket.readyState === 3) {
                    manager.retryCounter = 3;
                    return module.methods.reconnect();
                }
                return;
            }
            manager.socket = new Socket({
                url: `ws://${process.env.VUE_APP_HOST || window.location.host}${process.env.VUE_APP_MN_CONFIG_SOCKET}`,
            });
            manager.socket.on('inconnect', (e) => {
                module.methods.downgrade();
                console.warn('socket连接失败，后续请求将使用http');
            });
            manager.socket.on('close', (e) => {
                module.methods.clearTimer();
                manager.errCode = e.code;
                if (e.code != 1001 && e.code != 1005) {
                    manager.retryTimer = setTimeout(() => {
                        module.methods.reconnect(null, e.code);
                    }, manager.retryInterval);
                } else {
                    manager.retryCounter = 3;
                }
            });
            manager.socket.on('data', (data) => {
                module.dispatch('Workbench:socket', {
                    type: 'data',
                    data,
                });
            });
            manager.socket.on('dataError', (data) => {
                module.dispatch('Workbench:socket', {
                    type: 'dataError',
                    data,
                });
            });
        },
        close() {
            manager.socket && manager.socket.close(1000);
        },
        send(data) {
            // handle socket disconnect while
            if (!manager.socket) {
                module.methods.downgrade(data);
            // handle idle, socket will not connect immediately insteads while sending data
            } else if (manager.socket.readyState === 0) {
                module.methods.delaySend(data);
            } else if (manager.socket.readyState === 1) {
                manager.socket.send(data);
            } else if (manager.errCode === 1001) {
                module.methods.reconnect(data, 1001);
                module.methods.reSend(data);
            } else {
                console.warn(`socket readystate${manager.socket.readyState}：本次请求将使用http`);
                module.methods.downgrade(data);
            }
        },
        delaySend(data) {
            if (manager.delayCounter > 10) {
                manager.delayCounter = 0;
                console.warn(`socket readystate重试多次不为open：本次请求将使用http`);
                return module.methods.downgrade(data);
            }
            module.methods.reSend(data);
            manager.delayCounter++;
        },
        downgrade(data) {
            if (data) {
                module.methods.clearResendTimer();
            }
            module.methods.clearTimer();
            manager.retryCounter = 1;
            module.dispatch('Workbench:socket', {
                type: 'downgrade',
                data,
            });
            console.log('websocket downgrade tips');
        },
        reconnect(data = null, code) {
            module.methods.clearTimer();
            if (--manager.retryCounter > 0) {
                manager.socket.reconnect(data);
            } else {
                module.methods.downgrade(data);
                console.warn(`错误码${code}：本次请求将使用http`);
            }
        },
        reSend(data) {
            module.methods.clearResendTimer();
            manager.timer = setTimeout(() => {
                module.methods.send(data);
            }, manager.interval);
        },
        clearTimer() {
            clearTimeout(manager.retryTimer);
        },
        clearResendTimer() {
            clearTimeout(manager.timer);
        },
    },
}
;
export default module;
