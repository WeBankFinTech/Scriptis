/**
 * 全局状态管理
 */
import Vue from 'vue';
import util from '../util';
// import storage from './storage';
// import util from '../util';

/**
 * 状态管理容器
 */
class Fesx {
    /**
     * 构造器
     * @param {*} name 
     * @param {Object} data 
     */
    constructor(name, data) {
        Object.defineProperty(this, 'name', {
            value: name,
            enumerable: false,
        });
        Object.defineProperty(this, 'pre', {
            value: 'FesFesx_' + this.name + '_',
            enumerable: false,
        });
        if (util.isPlainObject(data)) {
            for (let p in data) {
                if (Object.prototype.hasOwnProperty.call(data, p)) {
                    Vue.set(this, p, data[p]);
                }
            }
        }
        // let keys = Object.keys(sessionStorage)
        // let len = keys.length
        // for (let i = 0; i < len; i++) {
        //     let key = keys[i];
        //     if (key.indexOf(this.pre) === 0) {
        //         Vue.set(this, key.slice(this.pre.length), storage.get(key));
        //     }
        // }
    }
    /**
     * 根据prop拿到对应的状态
     * @param {*} prop 
     * @return {*}
     */
    get(prop) {
        // if (!this[prop]) {
        //     this.set(prop, storage.get(this.pre + prop))
        // }
        return this[prop];
    }
    /**
     * 根据prop拿到对应的状态
     * @param {*} prop 
     * @param {*} value 
     * @return {*}
     */
    set(prop, value) {
        Vue.set(this, prop, value);
        // if (!util.isFunction(value)) {
        //     storage.set(this.pre + prop, value);
        // }
        return this;
    }
    /**
     * 清空当前容器
     */
    clear() {
        for (let p in this) {
            if (Object.prototype.hasOwnProperty.call(this, p)) {
                Vue.set(this, p, undefined);
            }
        }
        // let keys = Object.keys(sessionStorage)
        // let len = keys.length
        // for (let i = 0; i < len; i++) {
        //     let key = keys[i];
        //     if (key.indexOf(this.pre) === 0) {
        //         storage.remove(key);
        //     }
        // }
    }
}

export default Fesx;
