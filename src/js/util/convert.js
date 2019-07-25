/**
 * 转换日志
 *
 * @return {Object}
 */
export function convertLog(logs) {
    let logMap = {
        all: '',
        error: '',
        warning: '',
        info: '',
    };
    let newMap = {};
    if (typeof logs === 'string') {
        newMap = {
            all: logs,
        };
    } else if (Array.isArray(logs)) {
        let keysArr = ['error', 'warning', 'info', 'all'];
        logs.forEach((log, index) => {
            newMap[keysArr[index]] = log;
        });
    } else if (_.isPlainObject(logs)) {
        newMap = logs;
    }

    return Object.assign(logMap, newMap);
}

/**
 * 转换时间戳差值
 * @param {*} runningTime
 * @return {*}
 */
export function convertTimestamp(runningTime) {
    // const time = Math.floor(runningTime / 1000);
    const time = (runningTime / 1000).toFixed(1);
    if (time <= 0) {
        return '0秒';
    } else if (time < 60) {
        return `${time}秒`;
    } else if (time < 3600) {
        return `${(time / 60).toPrecision(2)}分钟`;
    } else if (time < 86400) {
        return `${(time / 3600).toPrecision(2)}小时`;
    }
    return `${(time / 86400).toPrecision(2)}天`;
}

/**
 * 排序
 * @param {*} a 第一个参数
 * @param {*} b 第两个参数
 * @param {*} type 类型，可能是desc和asc
 */
export function sort(a, b, type) {
    const sortString = (a, b, type) => {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                const aAcsii = a.charCodeAt(i);
                const bAcsii = b.charCodeAt(i);
                const returnS = type === 'desc' ? bAcsii - aAcsii : aAcsii - bAcsii;
                return returnS;
            }
        }
    };
    const fa = parseInt(a, 10);
    const fb = parseInt(b, 10);
    if (!isNaN(fa) && !isNaN(fb)) {
        if (fa.toString().length === a.toString().length && fb.toString().length === b.toString().length) {
            return type === 'desc' ? b - a : a - b;
        } else if (!isNaN(Number(a)) && !isNaN(Number(b))) {
            return type === 'desc' ? b - a : a - b;
        } else {
            return sortString(a, b, type);
        }
    } else {
        return sortString(a, b, type);
    }
}
