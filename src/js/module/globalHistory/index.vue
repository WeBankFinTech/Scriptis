<template>
  <div class="global-history">
    <Form
      ref="searchBar"
      :model="searchBar"
      :rules="ruleInline"
      inline>
      <FormItem
        prop="id"
        label="JobID">
        <Input
          v-model="searchBar.id"
          placeholder="请输入ID搜索"></Input>
      </FormItem>
      <Divider
        type="vertical"
        class="divider"/>
      <FormItem
        prop="date"
        label="起始时间">
        <DatePicker
          :options="shortcutOpt"
          v-model="searchBar.shortcut"
          type="daterange"
          placement="bottom-start"
          placeholder="请选择起始日期"
          style="width: 200px"/>
      </FormItem>
      <Divider
        type="vertical"
        class="divider"/>
      <FormItem
        prop="engine"
        label="引擎">
        <Select
          v-model="searchBar.engine">
          <Option
            v-for="(item) in engineTypes"
            :label="item.label"
            :value="item.value"
            :key="item.value"/>
        </Select>
      </FormItem>
      <Divider
        type="vertical"
        class="divider"/>
      <FormItem
        prop="status"
        label="状态">
        <Select
          v-model="searchBar.status">
          <Option
            v-for="(item) in statusType"
            :label="item.label"
            :value="item.value"
            :key="item.value"/>
        </Select>
      </FormItem>
      <Divider
        type="vertical"
        class="divider"/>
      <FormItem>
        <Button
          type="primary"
          @click="search"
          style="margin-right: 10px;">搜索</Button>
        <Button
          type="warning"
          @click="reset">重置</Button>
      </FormItem>
    </Form>
    <div
      class="global-history-table"
      :style="{'height': moduleHeight + 'px'}">
      <Icon
        v-show="isLoading"
        type="ios-loading"
        size="30"
        class="global-history-loading"/>
      <we-table
        v-show="!isLoading"
        ref="globalHistory"
        :columns="column"
        :data="list"
        :height="moduleHeight"
        no-data-text="暂无数据"
        size="small"
        border
        stripe/>
    </div>
    <div class="global-history-page">
      <Page
        :total="pageSetting.total"
        :page-size="pageSetting.pageSize"
        :current="pageSetting.current"
        size="small"
        show-total
        show-elevator
        @on-change="changePage"/>
    </div>
  </div>
</template>
<script>
import Table from './table.vue';
import Module from './index';
import api from '@/js/service/api';
import util from '@/js/util';
export default {
    name: 'GlobalHistory',
    components: {
        weTable: Table,
    },
    mixins: [Module.mixin],
    props: {
        height: Number,
    },
    data() {
        return {
            list: [],
            column: [{
                title: '任务ID',
                key: 'taskID',
                align: 'center',
                width: 80,
            }, {
                title: '脚本名称',
                key: 'fileName',
                align: 'center',
                width: 150,
            }, {
                title: '查询语句',
                key: 'executionCode',
                align: 'center',
                width: 500,
                // 溢出以...显示
                ellipsis: true,
                renderType: 'tooltip',
            }, {
                title: '状态',
                key: 'status',
                align: 'center',
                width: 120,
                renderType: 'tag',
            }, {
                title: '已耗时',
                key: 'costTime',
                align: 'center',
                width: 100,
                renderType: 'convertTime',
            }, {
                title: '执行引擎',
                key: 'executeApplicationName',
                align: 'center',
                width: 100,
            }, {
                title: '创建者',
                key: 'requestApplicationName',
                align: 'center',
                width: 100,
            }, {
                title: '进度',
                key: 'progress',
                align: 'center',
                width: 200,
                renderType: 'progress',
            }, {
                title: '创建时间',
                key: 'createdTime',
                align: 'center',
                width: 100,
                renderType: 'formatTime',
            }, {
                title: '最后更新时间',
                key: 'updatedTime',
                align: 'center',
                width: 100,
                renderType: 'formatTime',
            }, {
                title: '操作',
                key: 'control',
                fixed: 'right',
                align: 'center',
                width: 80,
                className: 'history-control',
                renderType: 'button',
                renderParams: [{
                    label: '查看',
                    action: this.viewHistory,
                }],
            }],
            isLoading: false,
            pageSetting: {
                total: 0,
                pageSize: 50,
                current: 1,
            },
            searchBar: {
                id: '',
                engine: 'all',
                status: 'all',
                shortcut: '',
            },
            shortcutOpt: {
                shortcuts: [
                    {
                        text: '最近一周',
                        value() {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            return [start, end];
                        },
                    },
                    {
                        text: '最近一个月',
                        value() {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            return [start, end];
                        },
                    },
                    {
                        text: '最近三个月',
                        value() {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            return [start, end];
                        },
                    },
                ],
            },
            statusType: [{
                label: '全部',
                value: 'all',
            }, {
                label: '排队中',
                value: 'Inited',
            }, {
                label: '运行',
                value: 'Running',
            }, {
                label: '成功',
                value: 'Succeed',
            }, {
                label: '取消',
                value: 'Cancelled',
            }, {
                label: '失败',
                value: 'Failed',
            }, {
                label: '资源申请中',
                value: 'Scheduled',
            }, {
                label: '超时',
                value: 'Timeout',
            }],
            engineTypes: [{
                label: '全部',
                value: 'all',
            }, {
                label: 'spark',
                value: 'spark',
            }, {
                label: 'hive',
                value: 'hive',
            }, {
                label: 'importAndExport',
                value: 'pipeline',
            }, {
                label: 'python',
                value: 'python',
            }],
            ruleInline: {

            },
        };
    },
    computed: {
        moduleHeight() {
            return this.height - 80;
        },
    },
    mounted() {
        this.init();
    },
    activated() {
        this.init();
    },
    methods: {
        init() {
            this.search();
        },
        convertTimes(runningTime) {
            const time = Math.floor(runningTime / 1000);
            if (time < 0) {
                return '0秒';
            } else if (time < 60) {
                return `${time}秒`;
            } else if (time < 3600) {
                return `${(time / 60).toPrecision(2)}分钟`;
            } else if (time < 86400) {
                return `${(time / 3600).toPrecision(2)}小时`;
            }
            return `${(time / 86400).toPrecision(2)}天`;
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
            this.$router.push({ path: '/',
                query: {
                    id: md5Id,
                    taskID: params.row.taskID,
                    filename: name,
                    filepath: '',
                    saveAs: true,
                    type: 'historyScript',
                    code: params.row.executionCode,
                } });
        },
        getParams(page) {
            const startDate = this.searchBar.shortcut[0];
            const endDate = this.searchBar.shortcut[1];
            const params = {
                taskID: this.searchBar.id,
                executeApplicationName: this.searchBar.engine,
                status: this.searchBar.status,
                startDate: startDate && startDate.getTime(),
                endDate: endDate && endDate.getTime(),
                pageNow: page || this.pageSetting.current,
                pageSize: this.pageSetting.pageSize,
            };
            if (this.searchBar.id) {
                delete params.executeApplicationName;
                delete params.status;
                delete params.startDate;
                delete params.endDate;
            } else {
                let { engine, status, shortcut } = this.searchBar;
                if (engine === 'all') {
                    delete params.executeApplicationName;
                }
                if (status === 'all') {
                    delete params.status;
                }
                if (!shortcut[0]) {
                    delete params.startDate;
                }
                if (!shortcut[1]) {
                    delete params.endDate;
                }
                delete params.taskID;
            }
            return params;
        },
        changePage(page) {
            this.isLoading = true;
            const params = this.getParams(page);
            api.fetch('/publicservice/list', params, 'get').then((rst) => {
                this.isLoading = false;
                this.list = rst.tasks;
                this.pageSetting.current = page;
                this.pageSetting.total = rst.totalPage;
            }).catch((err) => {
                this.isLoading = false;
                this.list = [];
            });
        },
        search() {
            this.isLoading = true;
            const params = this.getParams();
            api.fetch('/publicservice/list', params, 'get').then((rst) => {
                this.pageSetting.total = rst.totalPage;
                this.isLoading = false;
                this.list = rst.tasks;
            }).catch((err) => {
                this.list = [];
                this.isLoading = false;
            });
        },
        reset() {
            this.searchBar = {
                id: '',
                engine: 'all',
                status: 'all',
                shortcut: '',
            };
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
