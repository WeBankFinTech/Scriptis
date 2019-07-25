import { Basic } from './index.js';
/**
 * @class Log
 * @extends {Basic}
 */
class Log extends Basic {
    /**
     *Creates an instance of Log.
     * @param {*} table
     * @memberof Log
     */
    constructor(table) {
        super(table);
    }
}
const log = new Log('log');

export default log;
