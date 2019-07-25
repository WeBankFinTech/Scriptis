/**
 *  事件bus
 */
class Eventbus {
    /**
     * 构造器
     */
    constructor() {
        this.storage = {};
    }

    /**
     * 
     * @param {*} arr 
     * @param {*} x 
     * @return {Object}
     */
    findIndex(arr, x) {
        return arr.findIndex((item) => item === x);
    };

    /**
     * 注册事件
     * @param {*} name 
     * @param {*} fn 
     * @return {undefined}
     */
    on(name, fn) {
        if (Object.prototype.toString.call(this.storage[name]) === '[object Array]') {
            this.storage[name].push(fn);
        } else {
            this.storage[name] = [fn];
        }
    }

    /**
    * 删除事件
    * @param {*} name 
    * @param {*} fn 
    * @return {undefined}
    */
    off(name, fn) {
        if (this.storage[name]) {
            let i = this.findIndex(this.storage[name], fn);
            if (i !== -1) this.storage[name].splice(i, 1);
        }
    }

    /**
     * 清空指定name的所有事件
     * @param {*} name 
     * @return {Object}
     */
    clear(name) {
        if (name) {
            this.storage[name] = [];
        } else {
            this.storage = {};
        }
        return this.storage;
    }

    /**
     * 触发事件
     * @param {*} name 
     * @param {*} payload  参数
     * @param {*} cb      回调函数 
     * @return {undefined}
     */
    emit(name, payload, cb) {
        if (this.storage[name]) {
            this.storage[name].forEach((f) => f(payload, cb));
        }
    }
}

let eventbus = new Eventbus();

export {
    eventbus as default,
    eventbus,
    Eventbus,
};
