<template>
  <div
    class="workbench-history">
    <history-table
      ref="globalHistory"
      :columns="column"
      :data="list"
      :height="tableHeight"
      no-data-text="暂无数据"
      size="small"
      border
      stripe/>
    <div class="workbench-history-page">
      <Page
        :total="PageTotal"
        :page-size-opts="page.sizeOpts"
        :page-size="page.size"
        :current="page.current"
        show-sizer
        show-total
        size="small"
        @on-change="change"
        @on-page-size-change="changeSize"/>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import module from '../index';
import api from '@/js/service/api';
import util from '@/js/util';
import resizeMixin from './mixin.js';
import table from '@js/component/table';
const EXECUTE_COMPLETE_TYPE = ['Succeed', 'Failed', 'Cancelled', 'Timeout'];
export default {
    components: {
        historyTable: table.historyTable,
    },
    mixins: [module.mixin, resizeMixin],
    props: {
        history: {
            type: Array,
            required: true,
        },
        runType: String,
    },
    data() {
        return {
            column: [],
            page: {
                start: 0,
                end: 10,
                current: 1,
                size: 10,
                sizeOpts: [10, 20, 30, 50],
            },
            costTimeout: null,
        };
    },
    computed: {
        PageTotal() {
            return this.history.length;
        },
        firstRecord() {
            return this.history && this.history[0];
        },
        list() {
            return this.history.slice(this.page.start, this.page.end);
        },
    },
    watch: {
        // 时间发生改变的时候去使用超时器，每隔5秒更新历史的时间
        'firstRecord.runningTime'(val) {
            this.setInitCostTime();
        },
        // 完成状态时清除定时器，防止最终数据被修改
        'firstRecord.status'(val) {
            if (EXECUTE_COMPLETE_TYPE.indexOf(val) !== -1) {
                clearTimeout(this.costTimeout);
            }
        },
    },
    mounted() {
        this.initData();
    },
    beforeDestroy() {
        clearTimeout(this.costTimeout);
        this.costTimeout = null;
    },
    methods: {
        initData() {
            this.pageingData();
            this.setInitCostTime();
            this.column = [
                {
                    width: 50,
                    align: 'center',
                    renderType: 'index',
                }, {
                    title: '任务ID',
                    key: 'taskID',
                    align: 'center',
                    width: 80,
                }, {
                    title: '执行时间',
                    key: 'runningTime',
                    align: 'center',
                    width: 80,
                    renderType: 'convertTime',
                }, {
                    title: '启动时间',
                    key: 'createDate',
                    align: 'center',
                    width: 100,
                    renderType: 'formatTime',
                }, {
                    title: '状态',
                    key: 'status',
                    align: 'center',
                    width: 120,
                    renderType: 'tag',
                }, {
                    title: '代码',
                    key: 'data',
                    align: 'center',
                    // 溢出以...显示
                    ellipsis: true,
                    // renderType: 'tooltip',
                }, {
                    title: '关键信息',
                    key: 'failedReason',
                    align: 'center',
                    className: 'history-failed',
                    width: 220,
                    renderType: 'a',
                    renderParams: {
                        action: this.linkTo,
                    },
                }, {
                    title: '操作',
                    key: 'control',
                    fixed: 'right',
                    align: 'center',
                    width: 140,
                    className: 'history-control',
                    renderType: 'button',
                    renderParams: [{
                        label: '查看',
                        action: this.viewHistory,
                    }, {
                        label: '日志下载',
                        action: this.downloadLog,
                    }],
                },
            ];
        },

        setInitCostTime() {
            if (this.history.length) {
                if (this.history && EXECUTE_COMPLETE_TYPE.indexOf(this.history[0].status) === -1) {
                    clearTimeout(this.costTimeout);
                    this.costTimeout = setTimeout(() => {
                        this.$set(this.history[0], 'runningTime', new Date().getTime() - this.history[0].createDate);
                    }, 5000);
                }
            }
        },

        async viewHistory(params) {
            const supportModes = this.getSupportModes();
            const match = supportModes.find((s) => s.rule.test(params.row.fileName));
            const ext = match ? match.ext : '.hql';
            if (!params.row.logPath) {
                await api.fetch(`/jobhistory/${params.row.taskID}/get`, 'get').then((rst) => {
                    params.row.logPath = rst.task.logPath;
                });
            }
            const name = `history_item_${params.row.taskID}${ext}`;
            const md5Id = util.md5(name);
            this.dispatch('Workbench:add', {
                id: md5Id, // 唯一标识，就算文件名修改，它都能标识它是它
                taskID: params.row.taskID,
                filename: name,
                filepath: '',
                // saveAs表示临时脚本，需要关闭或保存时另存
                saveAs: true,
                code: params.row.data,
                type: 'historyScript',
            }, (f) => {
                if (f) {
                    this.$Message.success('打开成功');
                }
            });
        },

        async downloadLog(params) {
            const name = params.row.fileName + '__' + Date.now() + '.log';
            if (!params.row.logPath) {
                await api.fetch(`/jobhistory/${params.row.taskID}/get`, 'get').then((rst) => {
                    this.$set(params.row, 'logPath', rst.task.logPath);
                });
            }
            axios.post(module.data.API_PATH + 'filesystem/download', {
                path: params.row.logPath,
            }).then((rst) => {
                const link = document.createElement('a');
                const blob = new Blob([rst.data], { type: rst.headers['content-type'] });
                link.href = window.URL.createObjectURL(blob);
                link.download = name;
                let event = null;
                if (window.MouseEvent) {
                    event = new MouseEvent('click');
                } else {
                    event = document.createEvent('MouseEvents');
                }
                const flag = link.dispatchEvent(event);
                this.$nextTick(() => {
                    if (flag) {
                        this.$Message.success('下载成功，请到本地的download文件夹查看！');
                    }
                });
            }).catch((err) => {
                this.$Message.error(err.message);
            });
        },
        change(page) {
            this.page.current = page;
            this.pageingData();
        },
        changeSize(size) {
            this.page.size = size;
            this.page.current = 1;
            this.pageingData();
        },
        pageingData() {
            this.page.start = (this.page.current - 1) * this.page.size;
            this.page.end = this.page.start + this.page.size;
        },
        parsingLanguaue() {
            const supportTypes = this.getSupportModes();
            const match = supportTypes.find((s) => s.runType === this.runType);
            if (!match) {
                return '';
            }
            if (match.lang === 'hql') {
                return 'sql';
            }
            return match.lang;
        },
        linkTo(params) {
            const errCodeList = [11011, 11012, 11013, 11014, 11015, 11016, 11017];
            const errCode = parseInt(params.row.failedReason);
            if (errCodeList.indexOf(errCode) !== -1) {
                this.$router.push({
                    path: '/console/FAQ',
                    query: {
                        errCode,
                        isSkip: true,
                    },
                });
            }
        },
    },
};
</script>
<style lang="scss">
@import '~highlight.js/styles/railscasts.css'
</style>
