import _ from 'lodash';
import hql from './hql';

const sasProposals = [
    {
        label: '%DO',
        documentation: 'sas',
        insertText: 'DO',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%UNTIL',
        documentation: 'sas',
        insertText: 'UNTIL',
        detail: 'sas宏语言关键字',
    },
    {
        label: 'GOTO',
        documentation: 'sas',
        insertText: 'GOTO',
        detail: 'sas宏语言关键字',
    },
    {
        label: 'LABEL',
        documentation: 'sas',
        insertText: 'LABEL',
        detail: 'sas宏语言关键字',
    },
    {
        label: 'LET',
        documentation: 'sas',
        insertText: 'LET',
        detail: 'sas宏语言关键字',
    },
    {
        label: 'MEND',
        documentation: 'sas',
        insertText: 'MEND',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%TO',
        documentation: 'sas',
        insertText: 'TO',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%WHILE',
        documentation: 'sas',
        insertText: 'WHILE',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%END',
        documentation: 'sas',
        insertText: 'END',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%GLOBAL',
        documentation: 'sas',
        insertText: 'GLOBAL',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%GOTO',
        documentation: 'sas',
        insertText: 'GOTO',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%IF',
        documentation: 'sas',
        insertText: 'IF',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%THEN',
        documentation: 'sas',
        insertText: 'THEN',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%ELSE',
        documentation: 'sas',
        insertText: 'ELSE',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%LABEL',
        documentation: 'sas',
        insertText: 'LABEL',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%LET',
        documentation: 'sas',
        insertText: 'LET',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%LOCAL',
        documentation: 'sas',
        insertText: 'LOCAL',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%MACRO',
        documentation: 'sas',
        insertText: 'MACRO',
        detail: 'sas宏语言关键字',
    },
    {
        label: '%MEND',
        documentation: 'sas',
        insertText: 'MEND',
        detail: 'sas宏语言关键字',
    },
];

// 继承hql相关的keyword
const kewordInfoProposals = [...hql.keyword, ...sasProposals];

export default {
    register(monaco) {
        const sasProposals = _.map(kewordInfoProposals, (item) => ({
            label: item.label.toLowerCase(),
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: item.insertText.toLowerCase(),
            detail: item.detail,
            documentation: item.documentation,
        }));

        monaco.languages.registerCompletionItemProvider('sas', {
            triggerCharacters: '%abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._'.split(''),
            provideCompletionItems(model, position) {
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                });

                if (textUntilPosition.match(/([^"]*)?$/i)) {
                    return sasProposals;
                }

                return [];
            },
        });
    },
};
