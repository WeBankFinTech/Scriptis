<template>
  <div
    ref="table"
    :style="style"
    class="we-table">
    <div class="we-table-outflow">
      <div class="we-table-header">
        <!-- 头部在纵向滚动时不能移动所以单独做头部-->
        <ul ref="tableHeader">
          <li
            v-for="(head, headIndex) in headRows"
            :key="headIndex"
            :style="computedWStyle(headIndex)"
            @click.stop="handleSortClick($event, headIndex)"
            @dblclick.prevent.stop="handleDblClick(head)">
            <span class="we-table-header-content">{{ head.content }}</span>
            <span
              v-if="head.sortable"
              class="caret-wrapper">
              <i
                :class="computeSortClass(head, 'ascending')"
                @click.stop="handleSortClick($event, headIndex, 'ascending')"/>
              <i
                :class="computeSortClass(head, 'descending')"
                @click.stop="handleSortClick($event, headIndex, 'descending')"/>
            </span>
          </li>
        </ul>
      </div>
      <div
        ref="tableBody"
        class="we-table-body">
        <virtual-list
          :height="bodyH"
          :width="width"
          :size="computedSize"
          :remain="remain"
          :bench="50"
          :offset="offsetX"
          :offset-y="offsetY"
          :onscroll="onscroll"
          :variable="variable"
          scrolldirection="horizontal">
          <we-column
            v-for="(cols, index) of bodyRows"
            :cols="cols"
            :key="index"
            :style="computedWStyle(index)"/>
        </virtual-list>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import weColumn from './column.vue'
import virtualList from './virtualList.js'

const prefixCls = 'we-table'
export default {
    name: prefixCls,
    components: {
        weColumn,
        virtualList
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
        size: {
            type: Number,
            default: 100
        }
    },
    data () {
        return {
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
            dblClickTimer: null
        }
    },
    computed: {
        style () {
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
        thStyle () {
            const style = {
            }
            if (this.computedSize) {
                style.width = this.computedSize + 'px'
            }
            return style
        },
        remain () {
            return Math.floor(this.width / this.computedSize)
        },
        computedSize () {
            let firstRow = this.data.bodyRows[0]
            if (!firstRow) {
                return 1
            }
            let colLen = firstRow.length
            let w = this.width / colLen
            let isCover = w > this.size
            let size = isCover ? w : this.size
            if (Math.ceil(this.bodyH / 42) < colLen && isCover) {
                size = (this.width - 18) / colLen
            }
            return size
        },
        bodyH () {
            let ref = this.$refs.tableHeader || {}
            let thH = ref.clientHeight || 34
            return this.height - thH
        }
    },
    watch: {
        'data': {
            handler (val) {
                this.headRows = _.cloneDeep(val.headRows)
                this.originRows = _.cloneDeep(val.originRows)
                this.bodyRows = this.revert(val.bodyRows)
            },
            immediate: true,
            deep: true
        }

    },
    mounted () {
        this.init()
        const { tableHeader } = this.$refs
        this.onscroll = (e, { offset }) => {
            this.$emit('on-scroll', {
                offsetX: e.srcElement.scrollLeft,
                offsetY: e.srcElement.scrollTop
            })
            tableHeader.style.transform = `translateX(-${offset}px)`
            return false
        }
    },
    methods: {
        init () {
            const { tableHeader } = this.$refs
            tableHeader.style.transform = `translateX(-${this.offset}px)`
        },
        computedWStyle (index) {
            let w = 1
            if (this.variable && (this.variable instanceof Function)) {
                w = this.variable(index)
                if (this.computedSize > w) {
                    w = this.computedSize
                }
            } else {
                w = this.computedSize
            }
            return {
                width: w + 'px'
            }
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
            return newData
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
        // sorting 中不允许再点击
        // nextTick更新视图
        // deepFreeze
        // 如果是已经当前的排序不需要再重排, 1.记录当前排序列，当前的排序方向 2.如果是normal，如果下一次点击还是normal状态就不需要管了
        // lastScrollLeft不用频繁读取dom节点left
        handleSortClick (event, headIndex, sortOrder) {
            clearTimeout(this.dblClickTimer)
            this.dblClickTimer = setTimeout(() => {
                const head = this.headRows[headIndex]
                const sortType = sortOrder || 'normal'
                if (this.sort.sorting && !head.sortable) return
                if ((sortType === 'normal' && this.sort.type === 'normal') ||
        (this.sort.column === head && this.sort.type === sortType)) return
                this.sort.sorting = true
                this.sort.type = sortType
                this.sort.column = head
                let reverse = 0
                if (sortType !== 'normal') {
                    reverse = sortType === 'descending' ? -1 : 1
                }
                this.$nextTick(() => {
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
                                value: row[headIndex]
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
                    }
                    this.sort.sorting = false
                })
            }, 300)
        },
        handleDblClick (head) {
            clearTimeout(this.dblClickTimer)
            this.$emit('dbl-click', head)
        }
    }
}
</script>
<style lang="scss" src="./index.scss"></style>
