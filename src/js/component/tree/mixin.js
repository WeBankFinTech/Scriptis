export default {
    props: {
        fsType: {
            type: String,
            default: 'script',
        },
        beforeRemoveNode: Function,
        expandNode: Function,
        isRootDefaultOpen: {
            type: Boolean,
            defalut: false,
        },
        highlightPath: {
            type: String,
            default: '',
        },
    },
    methods: {

    },
};
