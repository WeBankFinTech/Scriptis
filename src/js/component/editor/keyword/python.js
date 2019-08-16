import { map, isEmpty } from 'lodash';
import util from '../util';
import storage from '@/js/helper/storage';

const pyKeywordInfoProposals = [
    {
        label: 'False',
        documentation: 'Keywords',
        insertText: 'False',
        detail: 'Keywords',
    },
    {
        label: 'class',
        documentation: 'Keywords',
        insertText: 'class',
        detail: 'Keywords',
    },
    {
        label: 'finally',
        documentation: 'Keywords',
        insertText: 'finally',
        detail: 'Keywords',
    },
    {
        label: 'is',
        documentation: 'Keywords',
        insertText: 'is',
        detail: 'Keywords',
    },
    {
        label: 'return',
        documentation: 'Keywords',
        insertText: 'return',
        detail: 'Keywords',
    },
    {
        label: 'None',
        documentation: 'Keywords',
        insertText: 'None',
        detail: 'Keywords',
    },
    {
        label: 'continue',
        documentation: 'Keywords',
        insertText: 'continue',
        detail: 'Keywords',
    },
    {
        label: 'for',
        documentation: 'Keywords',
        insertText: 'for',
        detail: 'Keywords',
    },
    {
        label: 'lambda',
        documentation: 'Keywords',
        insertText: 'lambda',
        detail: 'Keywords',
    },
    {
        label: 'try',
        documentation: 'Keywords',
        insertText: 'try',
        detail: 'Keywords',
    },
    {
        label: 'True',
        documentation: 'Keywords',
        insertText: 'True',
        detail: 'Keywords',
    },
    {
        label: 'def',
        documentation: 'Keywords',
        insertText: 'def',
        detail: 'Keywords',
    },
    {
        label: 'from',
        documentation: 'Keywords',
        insertText: 'from',
        detail: 'Keywords',
    },
    {
        label: 'nonlocal',
        documentation: 'Keywords',
        insertText: 'nonlocal',
        detail: 'Keywords',
    },
    {
        label: 'while',
        documentation: 'Keywords',
        insertText: 'while',
        detail: 'Keywords',
    },
    {
        label: 'and',
        documentation: 'Keywords',
        insertText: 'and',
        detail: 'Keywords',
    },
    {
        label: 'del',
        documentation: 'Keywords',
        insertText: 'del',
        detail: 'Keywords',
    },
    {
        label: 'global',
        documentation: 'Keywords',
        insertText: 'global',
        detail: 'Keywords',
    },
    {
        label: 'not',
        documentation: 'Keywords',
        insertText: 'not',
        detail: 'Keywords',
    },
    {
        label: 'with',
        documentation: 'Keywords',
        insertText: 'with',
        detail: 'Keywords',
    },
    {
        label: 'as',
        documentation: 'Keywords',
        insertText: 'as',
        detail: 'Keywords',
    },
    {
        label: 'elif',
        documentation: 'Keywords',
        insertText: 'elif',
        detail: 'Keywords',
    },
    {
        label: 'if',
        documentation: 'Keywords',
        insertText: 'if',
        detail: 'Keywords',
    },
    {
        label: 'or',
        documentation: 'Keywords',
        insertText: 'or',
        detail: 'Keywords',
    },
    {
        label: 'yield',
        documentation: 'Keywords',
        insertText: 'yield',
        detail: 'Keywords',
    },
    {
        label: 'assert',
        documentation: 'Keywords',
        insertText: 'assert',
        detail: 'Keywords',
    },
    {
        label: 'else',
        documentation: 'Keywords',
        insertText: 'else',
        detail: 'Keywords',
    },
    {
        label: 'import',
        documentation: 'Keywords',
        insertText: 'import',
        detail: 'Keywords',
    },
    {
        label: 'pass',
        documentation: 'Keywords',
        insertText: 'pass',
        detail: 'Keywords',
    },
    {
        label: 'break',
        documentation: 'Keywords',
        insertText: 'break',
        detail: 'Keywords',
    },
    {
        label: 'except',
        documentation: 'Keywords',
        insertText: 'except',
        detail: 'Keywords',
    },
    {
        label: 'in',
        documentation: 'Keywords',
        insertText: 'in',
        detail: 'Keywords',
    },
    {
        label: 'raise',
        documentation: 'Keywords',
        insertText: 'raise',
        detail: 'Keywords',
    },
    {
        label: 'print',
        documentation: 'Keywords',
        insertText: 'print',
        detail: 'Keywords',
    },
    {
        label: 'exec',
        documentation: 'Keywords',
        insertText: 'exec',
        detail: 'Keywords',
    },
];

let functionProposals = [];

export default {
    async register(monaco) {
        const lang = 'python';

        const pyProposals = map(pyKeywordInfoProposals, (item) => ({
            label: item.label.toLowerCase(),
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: item.insertText.toLowerCase(),
            detail: item.detail,
            documentation: item.documentation,
        }));

        util.getHiveList(monaco, lang).then((list) => {
            functionProposals = list.udfProposals;
        });

        monaco.languages.registerCompletionItemProvider('python', {
            triggerCharacters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._'.split(''),
            async provideCompletionItems(model, position) {
                if (isEmpty(functionProposals)) {
                    util.getHiveList(monaco, lang).then((list) => {
                        functionProposals = list.udfProposals;
                    });
                }

                const textUntilPosition = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });
                const keywordMatch = textUntilPosition.match(/([^"]*)?$/i);
                const functionMatch = textUntilPosition.match(/\s+/i);
                if (functionMatch) {
                    const isFunctionChange = storage.get('isFunctionChange_python');
                    // 如果函数发生load状态变化，则重新从indexdb中获取fnlist
                    if (isFunctionChange) {
                        storage.set('isFunctionChange_python', false);
                        await util.getHiveList(monaco, lang).then((list) => {
                            return list.udfProposals;
                        });
                    }
                    return functionProposals;
                } else if (keywordMatch) {
                    return pyProposals;
                }
                return [];
            },
        });
    },
};
