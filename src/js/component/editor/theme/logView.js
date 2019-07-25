export default {
    register(monaco) {
        monaco.editor.defineTheme('logview', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'log-info', foreground: '4b71ca' },
                { token: 'log-error', foreground: 'ff0000', fontStyle: 'bold' },
                { token: 'log-warn', foreground: 'FFA500' },
                { token: 'log-date', foreground: '008800' },
                { token: 'log-normal', foreground: '808080' },
            ],
            colors: {
                'editor.lineHighlightBackground': '#ffffff',
                'editorGutter.background': '#f7f7f7',
            },
        });
    },
};
