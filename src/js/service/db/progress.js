import { Basic } from './index.js';
/**
 * @class progress
 * @extends {Basic}
 */
class Progress extends Basic {
    /**
     *Creates an instance of progress.
     * @param {*} table
     * @memberof progress
     */
    constructor(table) {
        super(table);
    }
}
const progress = new Progress('progress');

export default progress;
