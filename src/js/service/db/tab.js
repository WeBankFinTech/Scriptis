import { Basic } from './index.js';
/**
 * @class Tab
 * @extends {Basic}
 */
class Tab extends Basic {
    /**
     *Creates an instance of Tab.
     * @param {*} table
     * @memberof Tab
     */
    constructor(table) {
        super(table);
    }
}
const tab = new Tab('tab');

export default tab;
