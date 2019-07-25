export default {
    register(monaco) {
        monaco.languages.register({ id: 'log' });

        monaco.languages.setMonarchTokensProvider('log', {
            tokenizer: {
                root: [
                    [/(^[=a-zA-Z].*|\d\s.*)/, 'log-normal'],
                    [/\sERROR\s.*/, 'log-error'],
                    [/\sWARN\s.*/, 'log-warn'],
                    [/\sINFO\s.*/, 'log-info'],
                    [/^([0-9]{4}||[0-9]{2})-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})?/, 'log-date'],
                    [/^[0-9]{2}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})?/, 'log-date'],
                    [/(^\*\*Waiting queue:.*)/, 'log-info'],
                    [/(^\*\*result tips:.*)/, 'log-info'],
                ],
            },
        });
    },
};
