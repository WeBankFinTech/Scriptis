/**
 * 全局状态管理
 */
import Vue from 'vue';
import storage from '../storage';
import _ from 'lodash';

/**
 *
 * 全局状态管理
 * @class Fesx
 */
class Fesx {
    /**
     *Creates an instance of Fesx.
     * @param {*} name
     * @memberof Fesx
     */
    constructor(name) {
        Object.defineProperty(this, 'name', {
            value: name,
            enumerable: false,
        });
        Object.defineProperty(this, 'pre', {
            value: 'FesFesx_' + this.name + '_',
            enumerable: false,
        });
        let keys = Object.keys(sessionStorage);
        let len = keys.length;
        for (let i = 0; i < len; i++) {
            let key = keys[i];
            if (key.indexOf(this.pre) === 0) {
                Vue.set(this, key.slice(this.pre.length), storage.get(key));
            }
        }
    }
    /**
     *
     * @param {*} prop
     * @return {*} value
     * @memberof Fesx
     */
    get(prop) {
        if (!this[prop]) {
            this.set(prop, storage.get(this.pre + prop));
        }
        return this[prop];
    }
    /**
     *
     * @param {*} prop
     * @param {*} value
     * @return {*} this
     * @memberof Fesx
     */
    set(prop, value) {
        Vue.set(this, prop, value);
        if (!_.isFunction(value)) {
            storage.set(this.pre + prop, value);
        }
        return this;
    }
    /**
     *
     * @memberof Fesx
     */
    clear() {
        let keys = Object.keys(sessionStorage);
        let len = keys.length;
        for (let i = 0; i < len; i++) {
            let key = keys[i];
            if (key.indexOf(this.pre) === 0) {
                storage.remove(key);
                Vue.set(this, key.slice(this.pre.length), undefined);
            }
        }
    }
}

export default Fesx
;
