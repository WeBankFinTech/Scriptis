
export default {
    props: {
        data: {
            type: Array,
            required: true,
        },
        estimatedItemSize: {
            type: Number,
            default: 30,
        },
        itemSizeGetter: {
            type: Function,
        },
    },

    data() {
        return {
            lastMeasuredIndex: -1,
            startIndex: 0,
            sizeAndOffsetCahce: {},
            visibleData: [],
            ops: {
                bar: {
                    background: 'rgb(24, 144, 255)',
                    keepShow: true,
                    minSize: 0.1,
                },
                rail: {
                    border: '1px solid #cecece',
                    size: '20px',
                },
                scrollButton: {
                    enable: true,
                    background: '#cecece',
                },
            },
        };
    },
    computed: {
        contentWidth() {
            const { data, lastMeasuredIndex, estimatedItemSize } = this;
            let itemCount = data.length;
            if (lastMeasuredIndex >= 0) {
                const lastMeasuredSizeAndOffset = this.getLastMeasuredSizeAndOffset();
                return lastMeasuredSizeAndOffset.offset + lastMeasuredSizeAndOffset.size + (itemCount - 1 - lastMeasuredIndex) * estimatedItemSize;
            } else {
                return itemCount * estimatedItemSize;
            }
        },
    },
    mounted() {
        this.updateVisibleData();
    },
    methods: {
        getItemSizeAndOffset(index) {
            const { lastMeasuredIndex, sizeAndOffsetCahce, data, itemSizeGetter } = this;
            if (lastMeasuredIndex >= index) {
                return sizeAndOffsetCahce[index];
            }
            let offset = 0;
            if (lastMeasuredIndex >= 0) {
                const lastMeasured = sizeAndOffsetCahce[lastMeasuredIndex];
                if (lastMeasured) {
                    offset = lastMeasured.offset + lastMeasured.size;
                }
            }
            for (let i = lastMeasuredIndex + 1; i <= index; i++) {
                const item = data[i];
                const size = itemSizeGetter.call(null, item, i);
                sizeAndOffsetCahce[i] = {
                    size,
                    offset,
                };
                offset += size;
            }
            if (index > lastMeasuredIndex) {
                this.lastMeasuredIndex = index;
            }
            return sizeAndOffsetCahce[index];
        },
    
        getLastMeasuredSizeAndOffset() {
            return this.lastMeasuredIndex >= 0 ? this.sizeAndOffsetCahce[this.lastMeasuredIndex] : { offset: 0, size: 0 };
        },
  
        findNearestItemIndex(scrollLeft) {
            const { data } = this;
            let total = 0;
            for (let i = 0, j = data.length; i < j; i++) {
                const size = this.getItemSizeAndOffset(i).size;
                total += size;
                if (total >= scrollLeft || i === (j - 1)) {
                    return i;
                }
            }

            return 0;
        },

        updateVisibleData(scrollLeft) {
            scrollLeft = scrollLeft || 0;
            const start = this.findNearestItemIndex(scrollLeft);
            const end = this.findNearestItemIndex(scrollLeft + this.$el.clientWidth);
            this.visibleData = this.data.slice(start, Math.min(end + 1, this.data.length));
            this.startIndex = start;
            this.$refs.content.style.webkitTransform = `translate3d(${this.getItemSizeAndOffset(start).offset}px, 0, 0)`;
        },

        handleScroll(v, h) {
            const { scrollLeft } = h;

            // const scrollLeft = this.$el.scrollLeft;
            this.updateVisibleData(scrollLeft);
        },
    },
}
;
