<template>
  <div
    ref="table"
    :style="style"
    class="we-table">
    <div class="we-table-outflow">
      <div
        class="we-table-header">
        <template-header
          @sort-click="handleSortClick"
          @dbl-click="handleDblClick"
          ref="headerCom"
          class="header-list"
          :cache="cache"
          :item-size-getter="itemSizeGetter"
          :estimated-item-size="30"
          :data="headRows">
        </template-header>
      </div>
      <div
        ref="tableBody"
        class="we-table-body">
        <template-list
          :cache="cache"
          :is-listen-scroll="true"
          @on-scroll="changeScrollLeft"
          :item-size-getter="itemSizeGetter"
          :estimated-item-size="30"
          :data="bodyRows"
          @on-click="onColumnClick">
        </template-list>
      </div>
    </div>
  </div>
</template>
<script>
import templateList from './list.vue';
import templateHeader from './header.vue';

const prefixCls = 'we-table';
export default {
    name: prefixCls,
    components: {
        templateList,
        templateHeader
    },
    props: {
        data: Object,
        width: Number,
        height: Number,
        variable: [Function],
        maxColumn: {
            type: Number,
            default: 50
        },
        offsetX: {
            type: Number,
            default: 0
        },
        offsetY: {
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            cache: {},
            sort: {
                sorting: false,
                column: null,
                type: 'normal',
                start: 0
            },
            bodyRows: [],
            headRows: [],
            originRows: [],
            onscroll () { },
            dTag: false,
        }
    },
    computed: {
        style() {
            const style = {
            }
            if (this.width) {
                style.width = this.width + 'px'
            }
            if (this.height) {
                style.height = this.height + 'px'
            }
            return style
        },
    },
    watch: {
        'data': {
            handler(val) {
                this.headRows = Object.freeze(val.headRows)
                this.originRows = Object.freeze(val.originRows)
                this.bodyRows = this.revert(val.bodyRows)
            },
            immediate: true,
            deep: true
        }

    },
    mounted() {
    },
    methods: {
        changeScrollLeft ({ v, h }) {
            this.$refs.headerCom.$refs.list.scrollLeft = h.scrollLeft
            this.$refs.headerCom.handleScroll(v, h)
        },
        itemSizeGetter (item, i) {
            let div = document.createElement('div')
            document.body.appendChild(div)
            div.style.paddingLeft = '20px'
            div.style.paddingRight = '54px'
            div.style.position = 'absolute'
            div.style.top = '-9999px'
            div.style.left = '-9999px'
            div.innerHTML = item.content
            let width = div.offsetWidth
            document.body.removeChild(div)
            this.cache[i] = width
            return width
        },
        revert (data) {
            let newData = []
            let firstRowLen = data[0] ? data[0].length : 0
            for (let i = 0; i < firstRowLen; i++) {
                newData[i] = []
                for (let j = 0; j < data.length; j++) {
                    newData[i][j] = data[j][i]
                }
            }
            return newData;
        },
        computeSortClass (currentHead, type) {
            return [
                `${prefixCls}-sort-caret`,
                type,
                {
                    [`${prefixCls}-sort`]: (this.sort.column === currentHead && this.sort.type === type)
                }
            ]
        },
        handleSortClick (args) {
            let { reverse, colIndex, cb } = args
            if (reverse === 0) {
                const rows = this.originRows.map((row) => {
                    return row.slice(0)
                })
                this.bodyRows = this.revert(rows)
            } else {
                const newArr = []
                const sortRow = this.originRows.map((row, index) => {
                    return {
                        origin: index,
                        value: row[colIndex]
                    }
                })
                sortRow.sort((a, b) => {
                    if (a.value.length === b.value.length) {
                        return a.value.localeCompare(b.value) * reverse
                    } else {
                        return (a.value.length - b.value.length) * reverse
                    }
                })
                sortRow.forEach((item, index) => {
                    newArr[index] = this.originRows[item.origin]
                })
                this.bodyRows = this.revert(newArr)
                cb && cb()
            }
        },
        handleDblClick (col) {
            this.$emit('dbl-click', col)
        },
        onColumnClick(index) {
            this.$emit('on-click', index)
        },
    },
};
</script>
<style lang="scss" src="./index.scss"></style>
<style>
.list-view {
width: 100%;
height: 100%;
overflow: auto;
position: relative;
color: #333;
}
</style>
