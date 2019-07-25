import hql from './hql.js';
import sqlFormatter from '@js/component/sqlFormatter/sqlFormatter';

const sasDefinition = {
    keywords: [
        '%DO',
        '%UNTIL',
        '%TO',
        '%WHILE',
        '%END',
        '%GLOBAL',
        '%GOTO',
        '%IF',
        '%THEN',
        '%ELSE',
        '%LABEL',
        '%LET',
        '%LOCAL',
        '%MACRO',
        '%MEND',
    ],
};

export default {
    register(monaco) {
        // 继承和合并hql相关的keyword
        const langDefinition = hql.definition;
        langDefinition.keywords.concat(sasDefinition);
        monaco.languages.register({ id: 'sas' });
        monaco.languages.setLanguageConfiguration('sas', hql.config);
        monaco.languages.setMonarchTokensProvider('sas', langDefinition);

        // 处理格式化
        monaco.languages.registerDocumentFormattingEditProvider('sas', {
            provideDocumentFormattingEdits: function(model, options, token) {
                let range = model.getFullModelRange();
                let value = model.getValue();
                let newValue = sqlFormatter.format(value);
                return [
                    {
                        range: range,
                        text: newValue,
                    },
                ];
            },
        });
    },
};
