import { partition, map } from 'lodash';
import globalcache from '@js/service/db/globalcache.js';
import storage from '@/js/helper/storage';

/**
 * 对拿到的数据格式化成completionList格式
 * @param {*} monaco 编辑器
 * @param {*} list 格式化列表
 * @param {*} lang 脚本类型
 * @param {*} type 类型（函数或者全局变量）
 * @return {*} 格式化后的列表
 */
function formatter(monaco, list, lang, type) {
    let formatList = [];
    if (!list) return formatList;
    if (type === 'function') {
        list.forEach((item) => {
            if (lang === 'python') {
                if (item.udfType === 1 || item.udfType === 3) {
                    formatList.push({
                        label: item.udfName + '()',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: item.udfName + '()',
                        detail: item.udfType > 2 ? '方法函数' : 'UDF函数',
                        documentation: item.description,
                    });
                }
            } else {
                formatList.push({
                    label: item.udfName + '()',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: item.udfName + '()',
                    detail: item.udfType > 2 ? '方法函数' : 'UDF函数',
                    documentation: item.description,
                });
            }
        });
    } else {
        formatList = list.map((item) => {
            return {
                label: item.key,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: item.key,
                detail: '用户自定义的全局变量',
                documentation: `{"${item.key}":"${item.value}"}`,
            };
        });
    }
    return formatList;
}

/**
 * 去indexDb中获取hive的列表和udf函数列表
 * @param {*} monaco
 * @param {*} lang
 */
async function getHiveList(monaco, lang) {
    const userInfo = storage.get('userInfo');
    let dbInfoProposals = [];
    let tableInfoProposals = [];
    let udfProposals = [];
    let variableProposals = [];
    if (userInfo) {
        const userName = userInfo.basic.userName;
        const globalCache = await globalcache.getCache(userName);
        if (globalCache) {
            [dbInfoProposals, tableInfoProposals] = partition(map(globalCache.hiveList, (item) => ({
                caption: item.caption,
                label: item.value,
                kind: monaco.languages.CompletionItemKind.Unit,
                insertText: item.value,
                detail: item.meta,
                documentation: item.documentation,
            })), ['detail', 'dbname']);

            udfProposals = formatter(monaco, globalCache.fnList, lang, 'function');
            variableProposals = formatter(monaco, globalCache.variableList, lang, 'variable');
        }
    }
    return {
        dbInfoProposals,
        tableInfoProposals,
        udfProposals,
        variableProposals,
    };
}

export default {
    getHiveList,
};
