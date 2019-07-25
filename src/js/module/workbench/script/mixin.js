import _ from 'lodash';
import elementResizeEvent from '@js/helper/elementResizeEvent';
export default{
    data() {
        return {
            tableHeight: 100,
        };
    },
    mounted() {
        this.initEvents();
    },
    beforeDestroy: function() {
        elementResizeEvent.unbind(this.$el);
    },
    methods: {
        initEvents() {
            let throttle = _.throttle(() => {
                this.resize();
            });
            elementResizeEvent.bind(this.$el, throttle);
        },
        resize() {
            this.tableHeight = this.$el.clientHeight - 40;
        },
    },
}
;
