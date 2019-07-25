/**
 * 会覆盖
 *
 * @return {Object}
 */
export function merge(...arg) {
    let base = arg[0];
    if (!base) return;
    [].forEach.call(arg, function(item, index) {
        if (index > 0) {
            for (let attrname in item) {
                if (Object.prototype.hasOwnProperty.call(item, attrname)) {
                    base[attrname] = item[attrname];
                }
            }
        }
    });
    return base;
}

/**
 * 不会覆盖
 *
 * @return {Object}
 */
export function extend(...arg) {
    let base = arg[0];
    if (!base) return;
    [].forEach.call(arg, function(item, index) {
        if (index > 0) {
            for (let attrname in item) {
                if (Object.prototype.hasOwnProperty.call(item, attrname)) {
                    if (base[attrname] !== undefined) {
                        base[attrname] = item[attrname];
                    }
                }
            }
        }
    });
    return base;
}
