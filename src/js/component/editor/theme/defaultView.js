export default {
    register(monaco) {
        monaco.editor.defineTheme('defaultview', {
            base: 'vs',
            inherit: true,
            rules: [{ background: '#FFFFFF' }],
            colors: {
                'editor.lineHighlightBackground': '#ffffff',
                'editorGutter.background': '#f7f7f7',
            },
        });
    },
};
