import md5 from 'md5';
import * as domUtil from './dom';
import * as objectUtil from './object';
import * as typeUtil from './type';
import * as convertUtil from './convert';
import _ from 'lodash';

let util = {
    _,
    executeCopy(textValue) {
        const input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = textValue;
        input.select();
        document.execCommand('Copy');
        input.remove();
    },
    md5,
};
objectUtil.merge(util, domUtil, objectUtil, typeUtil, convertUtil);

export default util;
