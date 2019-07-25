<template>
  <div
    class="workbench-history">
    <Table
      ref="historyData"
      :columns="column"
      :data="history.slice(page.start, page.end)"
      :height="tableHeight"
      class="workbench-history-table"
      size="small"
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
import moment from 'moment';
import hljs from 'highlight.js';
import module from '../index';
import api from '@/js/service/api';
import util from '@/js/util';
import resizeMixin from './mixin.js';
const EXECUTE_COMPLETE_TYPE = ['Succeed', 'Failed', 'Cancelled', 'Timeout'];
export default {
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
    },
    watch: {
        // 时间发生改变的时候去使用超时器，每隔5秒更新历史的时间
        'firstRecord.runningTime'(val) {
            this.setInitCostTime();
        },
        // 完成状态时清除定时器，防止最终数据被修改
        'firstRecord.status'(val) {
            if (EXECUTE_COMPLETE_TYPE.indexOf(val) !== -1) {
                clearInterval(this.costTimeout);
            }
        },
    },
    mounted() {
        this.initData();
    },
    methods: {
        initData() {
            this.pageingData();
            this.setInitCostTime();
            this.column = [
                {
                    type: 'index',
                    width: 50,
                    align: 'center',
                    fixed: 'left',
                }, {
                    title: '任务ID',
                    key: 'taskID',
                    align: 'center',
                    width: 80,
                }, {
                    title: '执行时间',
                    key: 'runningTime',
                    align: 'center',
                    width: 100,
                    render: (h, scope) => {
                        return h('span', {}, util.convertTimestamp(scope.row.runningTime));
                    },
                }, {
                    title: '启动时间',
                    key: 'createDate',
                    align: 'center',
                    width: 100,
                    render: (h, scope) => {
                        return h('span', {}, moment.unix(scope.row.createDate / 1000).format('YYYY-MM-DD HH:mm:ss'));
                    },
                }, {
                    title: '状态',
                    key: 'status',
                    align: 'center',
                    width: 120,
                    render: (h, scope) => {
                        let type = '';
                        let label = '';
                        switch (scope.row.status) {
                            case 'Succeed':
                                type = 'green';
                                label = '成功';
                                break;
                            case 'Running':
                                type = 'cyan';
                                label = '运行';
                                break;
                            case 'Timeout':
                                type = 'gray';
                                label = '超时';
                                break;
                            case 'Inited':
                                type = 'default';
                                label = '排队中';
                                break;
                            case 'Scheduled':
                                type = 'purple';
                                label = '资源申请中';
                                break;
                            case 'Failed':
                                type = 'red';
                                label = '失败';
                                break;
                            default:
                                type = 'orange';
                                label = '取消';
                                break;
                        }
                        return h('Tag', {
                            props: {
                                color: type,
                            },
                        }, label);
                    },
                }, {
                    title: '代码',
                    key: 'data',
                    width: 260,
                    // 溢出以...显示
                    ellipsis: true,
                    render: (h, scope) => {
                        return h('Tooltip', {
                            props: {
                                placement: 'bottom-start',
                                maxWidth: '600',
                                transfer: true,
                                theme: 'light',
                            },
                        }, [
                            // 这个是表格上面的span
                            h('span', {
                                domProps: {
                                    innerHTML: this.parsingLanguaue() ? hljs.highlight(this.parsingLanguaue(), scope.row.data).value : scope.row.data,
                                },
                            }),
                            // 这个是tooltip上面的span
                            h('div', {
                                slot: 'content',
                                style: {
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-all',
                                    maxHeight: '500px',
                                    overflowY: 'auto',
                                },
                                // 代替v-html
                                domProps: {
                                    innerHTML: this.parsingLanguaue() ? hljs.highlight(this.parsingLanguaue(), scope.row.data).value : scope.row.data,
                                },
                            }),
                        ]);
                    },
                }, {
                    title: '关键信息',
                    key: 'failedReason',
                    className: 'history-failed',
                    minWidth: 200,
                }, {
                    title: '操作',
                    key: 'control',
                    fixed: 'right',
                    align: 'center',
                    width: 120,
                    className: 'history-control',
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small',
                                },
                                on: {
                                    click: (ev) => {
                                        this.viewHistory(params);
                                    },
                                },
                            }, '查看'),
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small',
                                },
                                on: {
                                    click: (ev) => {
                                        this.downloadLog(params);
                                    },
                                },
                            }, '日志下载'),
                        ]);
                    },
                },
            ];
        },

        setInitCostTime() {
            if (this.history.length) {
                if (this.history && EXECUTE_COMPLETE_TYPE.indexOf(this.history[0].status) === -1) {
                    clearInterval(this.costTimeout);
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
                await api.fetch(`/publicservice/${params.row.taskID}/get`, 'get').then((rst) => {
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
                await api.fetch(`/publicservice/${params.row.taskID}/get`, 'get').then((rst) => {
                    this.$set(params.row, 'logPath', rst.task.logPath);
                });
            }
            axios.post(module.data.API_PATH + 'publicservice/download', {
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
    },
};
</script>
<style lang="scss">
@import '~highlight.js/styles/railscasts.css'
</style>
