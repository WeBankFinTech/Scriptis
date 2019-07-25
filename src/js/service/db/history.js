import { Basic } from './index.js';
/**
 * @class History
 * @extends {Basic}
 */
class History extends Basic {
    /**
     *Creates an instance of History.
     * @param {*} table
     * @memberof History
     */
    constructor(table) {
        super(table);
    }
}
const history = new History('history');

export default history;
