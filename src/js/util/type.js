const objectToString = Object.prototype.toString;
const OBJECT_STRING = '[object Object]';

/**
 * 是否是普通对象
 * @param {any} obj
 * @return {Boolean}
 */
export function isPlainObject(obj) {
    return objectToString.call(obj) === OBJECT_STRING;
}

/**
 * 是否是数字
 * @param {any} value
 * @return {Boolean}
 */
export function isNumber(value) {
    return typeof value === 'number';
}

/**
 * 是否是日期
 * @param {any} value
 * @return {Boolean}
 */
export function isDate(value) {
    return objectToString.call(value) === '[object Date]';
}

/**
 * 是否是函数
 * @param {any} value
 * @return {Boolean}
 */
export function isFunction(value) {
    return typeof value === 'function';
}

/**
 * 是否是函数
 * @param {any} value
 * @return {Boolean}
 */
export function isObject(value) {
    let type = typeof value;
    return !!value && (type == 'object' || type == 'function');
}

/**
 * 是否是数组
 * @param {any} value
 * @return {Boolean}
 */
export function isArray(value) {
    return Array.isArray(value);
}

/**
 * 是否像对象
 * @param {any} value
 * @return {Boolean}
 */
export function isObjectLike(value) {
    return !!value && typeof value == 'object';
}

/**
 * 是否是字符串
 * @param {any} value
 * @return {Boolean}
 */
export function isString(value) {
    return typeof value == 'string' ||
        (!isArray(value) && isObjectLike(value) && objectToString.call(value) == '[object String]');
}

/**
 * 是否是空的
 * @param {any} value
 * @return {Boolean}
 */
export function isNull(value) {
    return value === undefined || value === null || value === '';
}
