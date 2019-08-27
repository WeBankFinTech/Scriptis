<template>
  <div
    ref="view"
    class="we-result-view">
    <we-toolbar
      :current-path="result.path"
      :script="script"
      :row="hightLightRow"/>
    <Spin
      v-show="isLoading"
      size="large"
      fix/>
    <div
      v-if="result.type === '1'"
      :style="{'height': resultHeight}"
      class="text-result-div">
      <div v-if="result.bodyRows">
        <div
          v-for="(row, index) in result.bodyRows.split('\n')"
          :key="index">{{ row }}</div>
      </div>
      <span
        v-else
        class="empty-text">暂无数据</span>
    </div>
    <div
      v-else-if="result.type === '2'"
      :class="{'table-box': tableData.type === 'normal'}">
      <template v-if="tableData.type === 'normal'">
        <Table
          border
          highlight-row
          :width="tableData.width"
          :height="tableData.height"
          :columns="data.headRows"
          :data="data.bodyRows"
          @on-current-change="onRowClick"
          class="result-normal-table">
        </Table>
      </template>
      <template v-else>
        <we-table
          id="resultTable"
          :data="data"
          :width="tableData.width"
          :height="tableData.height"
          :size="tableData.size"
          :offset-x="offsetX"
          :offset-y="offsetY"
          :variable="getVarW"
          @on-scroll="saveOffset"
          @dbl-click="copyLabel"
          @on-click="onWeTableRowClick"/>
      </template>
    </div>
    <div v-else-if="result.type === '4'">
      <iframe
        id="iframeName"
        :style="{'height': resultHeight}"
        :srcdoc="htmlData"
        frameborder="0"
        width="100%"
        @change="iframeOnChange()"/>
    </div>
    <div
      v-else-if="result.type === '5'"
      :style="{'height': resultHeight}"
      class="html-result-div"
      v-html="result.bodyRows"/>
    <span
      v-else
      class="empty-text">暂无数据</span>
    <div class="we-page-container">
      <Select
        v-if="script.resultList && script.resultList.length>1"
        v-model="resultSet"
        class="set"
        size="small"
        placeholder="请选择结果集"
        @on-open-change="setLastSet"
        @on-change="changeSet">
        <Option
          v-for="(item, index) in script.resultList"
          :value="index"
          :key="item.path">结果集{{ index+1 }}</Option>
      </Select>
      <Page
        v-if="result.type === '2'"
        ref="page"
        :total="tableData.total"
        :page-size-opts="page.sizeOpts"
        :page-size="page.size"
        :current="page.current"
        class-name="page"
        size="small"
        show-total
        show-sizer
        @on-change="change"
        @on-page-size-change="changeSize"/>
    </div>
    <we-menu
      ref="contextMenu"
      id="file">
      <we-menu-item>
        <span>行转列</span>
      </we-menu-item>
    </we-menu>
  </div>
</template>
<script>
import _ from 'lodash';
import util from '@/js/util';
import Table from '@js/component/table';
import WeToolbar from './toolbar.vue';
import elementResizeEvent from '@js/helper/elementResizeEvent';
export default {
    components: {
        WeTable: Table.WeTable,
        WeToolbar,
    },
    props: {
        result: {
            type: [Object],
            default() {
                return {
                    headRows: [],
                    bodyRows: [],
                    type: 'EMPTY',
                    total: 0,
                    path: '',
                    cache: {

                    },
                };
            },
        },
        script: [Object],
        height: Number,
    },
    data() {
        let { x, y } = this.initOffset();
        const username = this.getUserName();
        return {
            data: {
                headRows: [],
                bodyRows: [],
            },
            tableData: {
                type: 'normal',
                width: 1000,
                height: 400,
                size: 100,
                total: 100,
                cache: {
                    offsetX: 0,
                    offsetY: 0,
                },
            },
            offsetX: x,
            offsetY: y,
            originRows: [],
            lastResultSet: 0,
            resultSet: 0,
            page: {
                current: 1,
                size: 20,
                sizeOpts: [20, 50, 80, 100],
            },
            wCache: [],
            // 用于避免双击和单击的冲突
            dblClickTimer: null,
            isLoading: false,
            // 当前高亮的行
            hightLightRow: null,
        };
    },
    computed: {
        // when mutating (rather than replacing) an Object or an Array, the old value will be the same as new value because they reference the same Object/Array. Vue doesn’t keep a copy of the pre-mutate value.
        scriptViewState: function() {
            let obj = {};
            let state = this.script.scriptViewState;
            Object.keys(state).forEach((key) => {
                obj[key] = state[key];
            });
            return obj;
        },

        resultHeight: function() {
            return this.height - 80 + 'px';
        },
    },
    watch: {
        'result': {
            handler(val) {
                this.updateData();
            },
            deep: true,
            immediate: true,
        },
        'scriptViewState': {
            handler: function(val, oldVal) {
                let result = this.script.result;
                if (oldVal.bottomPanelMin && !val.bottomPanelMin) {
                    this.resize();
                }
                // first open tag which has cache
                if (val.showPanel === 'result' && oldVal.showPanel !== 'result' && !result.cache.cahceTag) {
                    result.cache.cahceTag = true;
                    result.cache.offsetX = (result.cache.offsetX || 0) + Math.SQRT1_2;
                    result.cache.offsetY = (result.cache.offsetY || 0) + Math.SQRT1_2;
                    this.resize();
                }
            },
            deep: true,
        },
    },
    mounted() {
        this.updateData();
        this.initPage();
        elementResizeEvent.bind(this.$el, this.resize);
    },
    beforeDestroy: function() {
        if (this.script.result) {
            this.script.result.cache.offsetX = this.tableData.cache.offsetX;
            this.script.result.cache.offsetY = this.tableData.cache.offsetY;
        }
        elementResizeEvent.unbind(this.$el);
    },
    methods: {
        initOffset() {
            let cache = this.script.result.cache;
            let x = 0;
            let y = 0;
            if (cache && cache.offsetX) {
                x = cache.offsetX;
            }
            if (cache && cache.offsetY) {
                y = cache.offsetY;
            }
            return {
                x,
                y,
            };
        },
        initPage() {
            this.page = Object.assign(this.page, {
                current: this.result.current,
                size: this.result.size,
            });
        },
        updateData() {
            /**
             * result.type
             * TEXT_TYPE: '1'
             * TABLE_TYPE: '2'
             * IO_TYPE: '3'
             * PICTURE_TYPE: '4'
             * HTML_TYPE: '5'
             */
            if (this.result.type === '2') {
                this.tableData.type = this.result.headRows.length > 50 ? 'virtual' : 'normal';
                let headRows = this.result.headRows || [];
                this.data.headRows = [];
                this.originRows = _.cloneDeep(this.result.bodyRows) || [];
                this.tableData.total = this.result.total;
                if (this.tableData.type === 'normal') {
                    for (let item of headRows) {
                        const title = item.slice(item.indexOf(':') + 1, item.indexOf(','));
                        const LEN = 'dataType'.length;
                        const columnType = item.slice(item.indexOf(',') + LEN + 2, item.lastIndexOf(','));
                        this.data.headRows.push({
                            title,
                            key: item,
                            sortable: 'true',
                            sortMethod: function(a, b, type) {
                                return util.sort(a, b, type);
                            },
                            columnType,
                            renderHeader: (h, params) => {
                                return h('span', {
                                    attrs: {
                                        title: columnType,
                                    },
                                    on: {
                                        dblclick: (e) => {
                                            this.copyLabel({ content: params.column.title });
                                            return false;
                                        },
                                    },
                                },
                                params.column.title
                                );
                            },
                        });
                    }
                    this.originRows = this.originRows.map((row) => {
                        let newItem = {};
                        const NullList = [];
                        row.forEach((item, index) => {
                            Object.assign(newItem, {
                                [headRows[index]]: item,
                            });
                            if (item === 'NULL') {
                                NullList.push(headRows[index]);
                            }
                        });
                        // 对于NULL值加上高亮样式
                        if (NullList.length) {
                            newItem.cellClassName = {};
                            NullList.forEach((item) => {
                                newItem.cellClassName[item] = 'is-null';
                            });
                        }
                        return newItem;
                    });
                } else {
                    for (let i = 0; i < headRows.length; i++) {
                        const label = headRows[i].slice(headRows[i].indexOf(':') + 1, headRows[i].indexOf(','));
                        const LEN = 'dataType'.length;
                        const columnType = headRows[i].slice(headRows[i].indexOf(',') + LEN + 2, headRows[i].lastIndexOf(','));
                        this.data.headRows.push({
                            content: label,
                            sortable: true,
                            columnType,
                        });
                    }
                    // this.wCache = this.createCache(this.data.headRows);
                }
                this.data.originRows = this.originRows;
                this.pageingData();
            }
            // data change result layout change
            this.resize();
        },
        pageingData() {
            if (this.originRows.length) {
                let { current, size } = this.page;
                let maxLen = Math.min(this.tableData.total, current * size);
                let minLen = Math.max(0, (current - 1) * size);
                let newArr = _.cloneDeep(this.originRows).slice(minLen, maxLen);
                this.data.bodyRows = newArr;
            }
        },
        change(page) {
            this.hightLightRow = null;
            this.page.current = page;
            this.pageingData();
        },
        changeSize(size) {
            this.hightLightRow = null;
            this.page.size = size;
            this.page.current = 1;
            this.pageingData();
        },
        resize() {
            if (!this.$refs.page) return;
            let page = this.$refs.page.$el;
            let margin = (page.clientWidth || 0) / 2;
            page.style.marginLeft = -margin + 'px';

            let ele = this.$refs.view;
            let computedStyle = getComputedStyle(ele);
            let h = ele.clientHeight;
            let w = ele.clientWidth;
            h -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
            w -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
            if (this.tableData.type === 'normal') {
                this.tableData.width = this.data.headRows.length * 120 > w ? this.data.headRows.length * 120 : w;
            } else {
                this.tableData.width = w;
            }
            this.tableData.height = h - 60;
            return false;
        },
        saveOffset({ offsetX, offsetY }) {
            clearTimeout(this.dblClickTimer);
            this.dblClickTimer = setTimeout(() => {
                let cache = this.tableData.cache;
                cache.offsetX = offsetX;
                cache.offsetY = offsetY;
            }, 300);
        },
        setLastSet(isShow) {
            if (isShow) {
                this.lastResultSet = this.resultSet;
            }
        },
        changeSet(set) {
            this.isLoading = true;
            this.$emit('on-set-change', {
                currentSet: set,
                lastSet: this.lastResultSet,
                lastResult: this.getResult(),
            }, () => {
                this.isLoading = false;
            });
        },
        createCache(headRows) {
            let div = document.createElement('div');
            document.body.appendChild(div);
            div.style.paddingLeft = '20px';
            div.style.paddingRight = '54px';
            div.style.position = 'absolute';
            div.style.top = '-9999px';
            div.style.left = '-9999px';
            let cache = [];
            for (let i = 0; i < headRows.length; i++) {
                div.innerHTML = headRows[i].content;
                let width = div.offsetWidth;
                cache.push(Math.ceil(width));
            }
            document.body.removeChild(div);
            return cache;
        },
        getVarW(index) {
            return this.wCache[index];
        },
        copyLabel(head) {
            clearTimeout(this.dblClickTimer);
            util.executeCopy(head.content);
        },
        getResult() {
            const result = Object.assign(this.result, {
                cache: {
                    offsetX: this.tableData.cache.offsetX,
                    offsetY: this.tableData.cache.offsetY,
                },
                current: this.page.current,
                size: this.page.size,
            });
            return result;
        },
        iframeOnChange() {
            this.$nextTick(() => {
                document.all.iframeName.contentWindow.location.reload();
            });
        },
        onRowClick(currentRow, oldCurrentRow) {
            this.hightLightRow = currentRow;
        },
        onWeTableRowClick(index) {
            const row = this.data.bodyRows[index];
            this.hightLightRow = {};
            this.data.headRows.forEach((item, headIndex) => {
                const columnName = `columnName:${item.content},dataType:${item.columnType},`;
                this.hightLightRow[columnName] = row[headIndex];
            });
        },
    },
};
</script>
