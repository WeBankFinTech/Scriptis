import { Basic } from './index.js';
/**
 * @class Result
 * @extends {Basic}
 */
class Result extends Basic {
    /**
     *Creates an instance of Result.
     * @param {*} table
     * @memberof Result
     */
    constructor(table) {
        super(table);
    }
}
const result = new Result('result');

export default result;
