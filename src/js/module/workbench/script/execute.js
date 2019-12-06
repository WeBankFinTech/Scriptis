import api from '@/js/service/api';
import router from '@/js/service/router';
import Vue from 'vue';
import { Message } from 'iview';

/**
 * 脚本运行
 * 先是调用脚本查询接口，保存返回的id。然后轮循调用 state 接口，判断是否执行完，如果没执行完则查询日志，如果调用完则查询结果
 * @param { Object } data
 */
function Execute(data) {
    this.executeTimout = null;
    this.statusTimeout = null;
    this.timeout = 1000 * 60 * 10;
    this.beginTime = Date.now();
    this.progress = 0;
    this.id = null;
    this.status = null;
    // 仅/api/filesystem/${id}/get接口使用
    this.taskID = null;
    this.postType = data.data.postType || 'socket';
    delete data.data.postType;
    this.data = data;
    this.executionCode = null;
    this.model = 'normal';
    this.fromLine = 1;
    this.runType = data.data.runType;
    this.event = new Vue();
    this.run = false;
    // 存储结果集的相关信息，用到里面的日志和结果路径
    this.resultsetInfo = null;
    // 存储结果集目录下的所有信息，可用于拿到单个结果集
    this.resultList = [];
    // 当前结果集的path
    this.currentResultPath = '';
    this.on('execute', () => {
        this.run = true;
        // 注释是留作发起请求时，长时间没返回第一个接口时
        // timeoutCheck(this);
    });
    this.on('execute:queryState', () => {
        this.queryStatus({ isKill: false });
        this.queryProgress();
    });
    this.on('stateEnd', () => {
        this.getResultPath();
    });
    this.on('getResultList', () => {
        this.getResultList();
    });
    this.on('getResult', () => {
        this.getFirstResult();
    });
    this.on('stop', (message) => {
        clearTimeout(this.executeTimout);
        clearTimeout(this.statusTimeout);
        this.run = false;
    });
    this.on('kill', () => {
        if (this.postType === 'http') {
            this.queryStatus({ isKill: true });
        }
    });
    // data是接口的返回数据
    // execute.data是前台发送至后台的请求数据
    this.on('data', ({ data, execute }) => {
        if (execute.postType !== 'socket') return;
        // 这里对websocket第一个接口execute直接会返回errorMsg的情况进行判断
        if (data.data.hasOwnProperty('errorMsg')) {
            execute.trigger('stop');
            execute.trigger('error');
            return;
        }
        const method = execute.data.method;
        if (!execute.taskID) {
            const socketTag = data.data && data.data.websocketTag;
            if (execute.data.websocketTag === socketTag && data.method === method) {
                // clearTimeout(execute.executeTimout);
                timeoutCheck(execute);
                api.fetch('/jobhistory/list', {
                    pageSize: 100,
                    status: 'Running,Inited,Scheduled',
                }, 'get').then((rst) => {
                    execute.trigger('updateResource', rst.tasks.length);
                });
                deconstructExecute(execute, data.data);
                this.trigger('steps', 'Inited');
            }
        } else {
            const id = data.data && data.data.taskID;
            let prefix = method.slice(0, method.lastIndexOf('/') + 1);
            if (execute.taskID !== id) {
                // 针对临时脚本多次右键点击的，过期数据不更新的情况
                if (data.data.status) {
                    return execute.trigger('updateExpireHistory', data.data);
                }
                return;
            };
            if (data.method === prefix + `${execute.id}/status`) {
                reawakening(execute);
                deconstructStatus(execute, data.data);
            } else if (data.method === prefix + `${execute.id}/progress`) {
                reawakening(execute);
                execute.trigger('progress', data.data);
            } else if (data.method === prefix + `${execute.id}/log`) {
                reawakening(execute);
                execute.trigger('log', data.data.log);
            } else if (data.method === prefix + `${execute.id}/waitingSize`) {
                const log = `**Waiting queue：前面还有${data.data.waitingSize}个job`;
                execute.trigger('log', log);
                execute.trigger('progress', { progress: 0, progressInfo: [], waitingSize: data.data.waitingSize });
                clearTimeout(execute.executeTimout);
                clearTimeout(execute.statusTimeout);
            } else {
                if (data.data.status) {
                    execute.trigger('updateExpireHistory', data.data);
                }
                clearTimeout(execute.executeTimout);
                clearTimeout(execute.statusTimeout);
            }
        }
    });
    this.on('downgrade', ({ data, execute }) => {
        execute.postType = 'http';
    });
    this.on('dataError', ({ data, execute }) => {
        execute.run = false;
        if (data.data.status === -1) {
            router.push('/login');
            Message.warning(data.message);
        } else {
            this.trigger('notice', {
                type: 'warning',
                msg: data.message,
                autoJoin: false,
            });
        }
    });
}

Execute.prototype.start = function() {
    setTimeout(() => {
        this.execute();
    }, 0);
};

Execute.prototype.restore = function({ execID, taskID }) {
    this.id = execID;
    this.taskID = taskID;
    this.run = true;
    this.postType = 'http';
    this.trigger('execute:queryState');
};
Execute.prototype.on = function(name, cb) {
    this.event.$on(name, cb);
};
Execute.prototype.off = function() {
    this.event.$off();
};
Execute.prototype.once = function(name, cb) {
    this.event.$once(name, cb);
};
Execute.prototype.trigger = function(name, data) {
    this.event.$emit(name, data);
};

Execute.prototype.execute = function() {
    this.trigger('execute');
    if (this.postType === 'http') {
        return this.httpExecute();
    }
    this.trigger('WebSocket:send', this.data);
};

Execute.prototype.httpExecute = function() {
    this.trigger('execute');
    const method = this.data.method.slice(this.data.method.indexOf('entrance'), this.data.method.length);
    api.fetch(method, this.data.data)
        .then((ret) => {
            deconstructExecute(this, ret);
            this.trigger('execute:queryState');
            this.trigger('steps', 'Inited');
        })
        .catch((error) => {
            this.trigger('stop');
            this.trigger('error', 'execute');
        });
};

Execute.prototype.queryStatus = function({ isKill }) {
    api.fetch(`/entrance/${this.id}/status`, 'get')
        .then((ret) => {
            if (isKill) {
                deconstructStatusIfKill(this.ret);
            } else {
                deconstructStatus(this, ret);
            }
        })
        .catch((error) => {
            this.run = false;
        });
};

Execute.prototype.queryProgress = function() {
    api.fetch(`/entrance/${this.id}/progress`, 'get')
        .then((rst) => {
            this.trigger('progress', { progress: rst.progress, progressInfo: rst.progressInfo });
        });
};

Execute.prototype.queryLog = function() {
    api.fetch(`/entrance/${this.id}/log`, {
        fromLine: this.fromLine,
        size: -1,
    }, 'get')
        .then((rst) => {
            this.fromLine = rst.fromLine;
            this.trigger('log', rst.log);
        });
};

Execute.prototype.getResultPath = function() {
    this.trigger('steps', 'ResultLoading');
    api.fetch(`/jobhistory/${this.taskID}/get`, 'get')
        .then((rst) => {
            this.resultsetInfo = rst.task;
            this.trigger('querySuccess', {
                type: '执行',
                task: rst.task,
            });
            this.trigger('getResultList');
            this.updateLastHistory(rst.task);
        })
        .catch((err) => {
            this.trigger('steps', 'FailedToGetResultPath');
            logError(err, this);
        });
};

Execute.prototype.getResultList = function() {
    if (this.resultsetInfo && this.resultsetInfo.resultLocation) {
        api.fetch(
            '/filesystem/getDirFileTrees', {
                path: `${this.resultsetInfo.resultLocation}`,
            },
            'get'
        )
            .then((rst) => {
                // 后台的结果集顺序是根据结果集名称按字符串排序的，展示时会出现结果集对应不上的问题，所以加上排序
                this.resultList = rst.dirFileTrees.children.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
                this.trigger('getResult');
            })
            .catch((err) => {
                this.trigger('steps', 'FailedToGetResultList');
                logError(err, this);
            });
    } else {
        this.trigger('notice', {
            type: 'error',
            msg: '获取结果集失败，请联系管理员！',
            autoJoin: true,
        });
    }
};

Execute.prototype.getFirstResult = function() {
    // 获取第一个结果集
    this.currentResultPath = this.resultList[0].path;
    // 需要提供日志路径，用于下载日志
    this.trigger('history', {
        execID: this.id,
        logPath: this.resultsetInfo.logPath,
        taskID: this.taskID,
        status: this.status,
    });
    const url = `/filesystem/openFile`;
    const pageSize = 5000;
    api.fetch(url, {
        path: this.currentResultPath,
        pageSize,
    }, 'get')
        .then((rst) => {
            this.trigger('result', rst);
            const log = `**result tips: 获取结果集成功`;
            this.trigger('log', log);
            this.trigger('steps', 'Completed');
        })
        .catch((err) => {
            this.trigger('steps', 'FailedToGetResultFirst');
            logError(err, this);
        });
};

// 获取错误原因，并更新历史
Execute.prototype.updateLastHistory = function(option, cb) {
    if (option) {
        return this.trigger('history', {
            taskID: option.taskID,
            execID: '',
            createDate: option.createdTime,
            runningTime: option.costTime,
            status: option.status,
            failedReason: '',
        });
    }
    api.fetch(`/jobhistory/${this.taskID}/get`, 'get')
        .then((res) => {
            const task = res.task;
            if (cb) {
                cb(task);
            }
            this.executionCode = task.executionCode;
            this.trigger('history', {
                taskID: task.taskID,
                execID: '',
                createDate: task.createdTime,
                runningTime: task.costTime,
                status: task.status,
                failedReason: task.errCode && task.errDesc ? task.errCode + task.errDesc : task.errCode || task.errDesc || '',
            });
            if (task.progress === 1) {
                this.trigger('costTime', task.costTime);
            }
        });
};

/**
 * kill的时候去轮询获取cancelled状态
 * @param {*} execute
 * @param {*} ret
 */
function deconstructStatusIfKill(execute, ret) {
    if (ret.status !== 'Cancelled') {
        setTimeout(() => {
            execute.queryStatus({ isKill: true });
        }, 5000);
    }
}

/**
 * inner helper
 * @param {*} execute
 * @param {*} ret
 */
function deconstructStatus(execute, ret) {
    clearTimeout(execute.executeTimout);
    if (
        ret.status === 'Inited' ||
        ret.status === 'Scheduled' ||
        ret.status === 'Running'
    ) {
        // 在状态发生改变的时候更新历史
        if (ret.status !== execute.status) {
            execute.updateLastHistory();
        }
        if (execute.postType !== 'socket') {
            if (
                Date.now() - execute.beginTime < execute.timeout &&
                execute.run
            ) {
                // 5秒发送一次请求
                setTimeout(() => {
                    execute.queryStatus({ isKill: false });
                    execute.queryProgress();
                    execute.queryLog();
                }, 5000);
            } else {
                execute.updateLastHistory();
                execute.trigger('error');
                execute.trigger('notice', {
                    type: 'error',
                    msg: '查询超时，请重新执行！',
                    autoJoin: true,
                });
            }
        }
    }
    execute.status = ret.status;
    execute.trigger('steps', ret.status);
    if (ret.status === 'Succeed') {
        if (execute.runType !== 'pipeline') {
            // stateEnd是需要获取结果集的，获取结果集的同时会更新历史
            execute.trigger('stateEnd');
            const log = `**result tips: 任务执行完成，正在获取结果集`;
            execute.trigger('log', log);
        } else {
            // 导入导出不需要请求结果集，但需要更新历史，否则会出现状态未翻转的问题。
            const log = `**result tips: 脚本未生成结果集！`;
            execute.trigger('log', log);
            execute.trigger('steps', 'notResult');
            execute.trigger('steps', 'Completed');
            execute.updateLastHistory('', (task) => {
                execute.trigger('querySuccess', {
                    type: '导入/导出',
                    task,
                });
            });
        }
        execute.trigger('stop');
    }
    if (ret.status === 'Failed') {
        const msg = '执行失败，请到日志中查看错误原因，或将历史中的关键信息反馈给管理员！';
        queryException(execute, 'error', msg);
    }
    if (ret.status === 'Cancelled') {
        const msg = '查询已被取消';
        queryException(execute, 'warning', msg);
    }
    if (ret.status === 'Timeout') {
        const msg = '查询超时，请到日志中查看错误原因，或将历史中的关键信息反馈给管理员';
        queryException(execute, 'error', msg);
    }
}

/**
 * inner helper
 * @param {*} execute
 * @param {*} ret
 */
function deconstructExecute(execute, ret) {
    if (ret.hasOwnProperty('errorMsg')) {
        execute.updateLastHistory();
        execute.trigger('stop');
        execute.trigger('error');
        execute.trigger('notice', {
            type: 'error',
            msg: ret.errorMsg.desc,
            autoJoin: false,
        });
    } else {
        execute.id = ret.execID;
        execute.taskID = ret.taskID;
        execute.trigger('history', {
            taskID: ret.taskID,
            execID: ret.execID,
            createDate: execute.beginTime,
            runningTime: 0,
            status: 'Inited',
            failedReason: '',
        });
        setModelAndGetCode(execute, execute.data.method).then((code) => {
            execute.trigger('sendStart', code);
        });
    }
}

/**
 * More than one minute does not return,then terminate the request.
 * @param {*} execute
 */
function timeoutCheck(execute) {
    const timeout = 1000 * 60;
    clearTimeout(execute.executeTimout);
    execute.executeTimout = setTimeout(() => {
        execute.trigger('stop');
        execute.trigger('error');
        execute.trigger('notice', {
            type: 'error',
            msg: '查询超时，请到日志中查看错误原因，或将历史中的关键信息反馈给管理员！',
            autoJoin: true,
        });
    }, timeout);
}

/**
 * 当websocket请求超过1分钟未返回时，发送一个status请求重新唤醒.
 * @param {*} execute
 */
function reawakening(execute) {
    const timeout = 1000 * 60;
    clearTimeout(execute.statusTimeout);
    execute.statusTimeout = setTimeout(() => {
        // http方式
        // api.fetch(`/entrance/${execute.id}/status`, 'get')
        //     .then((ret) => {
        //         execute.status = ret.status;
        //     });
        // websocket方式
        const data = {
            method: `/api/rest_j/v1/entrance/${execute.id}/status`,
        };
        execute.trigger('WebSocket:send', data);
    }, timeout);
}

/**
 *
 * @param {*} err
 * @param {*} that
 */
function logError(err, that) {
    const notResultLog = '**result tips: 脚本未生成结果集！';
    const errorLog = `**result tips: ${err},获取结果集失败，请联系管理员！`;
    const notResult = err.message === `Cannot read property 'children' of null`;
    const log = notResult ? notResultLog : errorLog;
    that.trigger('log', log);
    if (notResult) {
        that.trigger('steps', 'notResult');
        that.trigger('steps', 'Completed');
    }
}

/**
 * 查询异常时的操作
 * @param {*} execute 当前的对象
 * @param {*} type notice的类型
 * @param {*} msg notice的提示文本
 */
function queryException(execute, type, msg) {
    execute.updateLastHistory();
    execute.trigger('stop');
    execute.trigger('error');
    execute.trigger('notice', {
        type,
        msg,
        autoJoin: true,
    });
}

/**
 * webscoket为background模式时，在接收execute接口时调用get请求或者后台拼接的脚本内容；
 * @param {*} execute
 * @param {*} method
 * @return {*}
 */
function setModelAndGetCode(execute, method) {
    return new Promise((resolve, reject) => {
        const model = method.slice(method.lastIndexOf('/') + 1, method.length);
        if (model === 'backgroundservice') {
            execute.model = 'background';
            api.fetch(`/jobhistory/${execute.taskID}/get`, 'get').then((res) => {
                execute.executionCode = res.task.executionCode;
                resolve(execute.executionCode);
            }).catch((err) => {
                execute.executionCode = null;
            });
        } else if (model === 'execute') {
            execute.model = 'normal';
            resolve('');
        }
    });
}

export default Execute;
