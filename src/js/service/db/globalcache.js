import _ from 'lodash';
import { Basic } from './index.js';
/**
 * @class Globalcache
 * @extends {Basic}
 */
class Globalcache extends Basic {
    /**
     *Creates an instance of Globalcache.
     * @param {*} table
     * @param {*} db
     * @memberof Globalcache
     */
    constructor(table, db) {
        super(table);
    }

    /**
     * @param {*} args
     * @return {*}
     */
    async setCache(args) {
        let cache = await this.getCache(args.key);
        let cacheToUpdate = args;
        if (!_.isNil(cache)) {
            cacheToUpdate = { _id: cache._id, ...cacheToUpdate };
        }
        return this.add(cacheToUpdate);
    }

    /**
     * @param {*} key
     * @return {*}
     */
    async getCache(key) {
        let caches = await this.get(key);
        return caches[0];
    }

    /**
     * @param {*} args
     * @return {*}
     */
    async removeCache(args) {
        let cache = await this.getCache(args.id);
        let tabList = [];
        if (!_.isNil(cache)) {
            tabList = cache.tabList;
            _.remove(tabList, (n) => n === args.tabId);
        }
        return this.update(args.id, { key: args.id, tabList: tabList });
    }

    /**
     * @param {*} args
     * @return {*}
     */
    async updateCache(args) {
        if (args.work) {
            let cache = await this.getCache(args.id);
            const id = args.work.id;
            let tabList = [];
            if (!_.isNil(cache)) {
                tabList = cache.tabList;
                if (cache.tabList.indexOf(id) === -1) {
                    tabList.push(id);
                }
            } else {
                tabList.push(id);
            }
            return this.update(args.id, { key: args.id, tabList: tabList });
        } else if (args.fnList) {
            return this.update(args.id, { key: args.id, fnList: args.fnList });
        } else if (args.variableList) {
            return this.update(args.id, { key: args.id, variableList: args.variableList });
        }
    }
}
const globalcache = new Globalcache('globalCache');

export default globalcache;
