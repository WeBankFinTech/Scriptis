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
        <InputNumber
          v-model="searchBar.id"
          placeholder="请输入ID搜索"
          style="width:100px;"
          :min="1"
          :readonly="isLogModuleShow"></InputNumber>
      </FormItem>
      <Divider
        type="vertical"
        class="divider"/>
      <FormItem
        prop="proxyUser"
        label="用户名"
        v-if="isAdminModel">
        <Input
          :maxlength="50"
          v-model="searchBar.proxyUser"
          placeholder="请输入用户名搜索"
          style="width:120px;"
          :readonly="isLogModuleShow" />
      </FormItem>
      <Divider
        type="vertical"
        class="divider"
        v-if="!isLogModuleShow"/>
      <FormItem
        prop="shortcut"
        label="起始时间"
        v-if="!isLogModuleShow">
        <DatePicker
          :options="shortcutOpt"
          v-model="searchBar.shortcut"
          type="daterange"
          placement="bottom-start"
          placeholder="请选择起始日期"
          style="width: 200px"
          :editable="false"/>
      </FormItem>
      <Divider
        type="vertical"
        class="divider"
        v-if="!isLogModuleShow"/>
      <FormItem
        prop="engine"
        label="引擎"
        v-if="!isLogModuleShow">
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
        class="divider"
        v-if="!isLogModuleShow"/>
      <FormItem
        prop="status"
        label="状态"
        v-if="!isLogModuleShow">
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
          style="margin-right: 10px;"
          v-if="!isLogModuleShow">搜索</Button>
        <Button
          type="warning"
          @click="reset"
          style="margin-right: 10px;"
          v-if="!isLogModuleShow">重置</Button>
        <Button
          type="primary"
          @click="back"
          style="margin-right: 10px;"
          v-if="isLogModuleShow && isAdminModel">返回</Button>
        <Button
          type="primary"
          @click="switchAdmin"
          v-if="!isLogModuleShow && isLogAdmin">{{ isAdminModel ? '切换普通视图' : '切换管理员视图' }}</Button>
      </FormItem>
    </Form>
    <log
      v-if="isLogModuleShow"
      :logs="logs"
      :from-line="fromLine"/>
    <div v-else>
      <div
        class="global-history-table"
        :style="{'height': moduleHeight + 'px'}">
        <Icon
          v-show="isLoading"
          type="ios-loading"
          size="30"
          class="global-history-loading"/>
        <history-table
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
  </div>
</template>
<script>
import table from '@js/component/table';
import log from './log.vue';
import Module from './index';
import api from '@/js/service/api';
import util from '@/js/util';
export default {
    name: 'GlobalHistory',
    components: {
        historyTable: table.historyTable,
        log,
    },
    mixins: [Module.mixin],
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
                // renderType: 'tooltip',
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
                title: '用户',
                key: 'umUser',
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
                id: null,
                lastId: null,
                proxyUser: '',
                lastProxyUser: '',
                engine: 'all',
                status: 'all',
                shortcut: '',
            },
            inputType: 'number',
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
            isLogAdmin: false,
            isAdminModel: false,
            isLogModuleShow: false,
            logs: {
                all: '',
                error: '',
                warning: '',
                info: '',
            },
            fromLine: 1,
            moduleHeight: 0,
        };
    },
    mounted() {
        this.isLogAdmin = this.getLogManager();
        this.init();
        this.moduleHeight = this.$route.query.height - 90;
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
            if (this.isAdminModel) {
                this.isLogModuleShow = true;
                this.getLogs(params.row.taskID);
            } else {
                this.isLogModuleShow = false;
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
            }
        },
        getLogs(jobId) {
            api.fetch(`/jobhistory/${jobId}/get`, 'get').then((res) => {
                this.searchBar.lastId = Number(this.searchBar.id);
                this.searchBar.id = jobId;
                this.searchBar.lastProxyUser = this.searchBar.proxyUser;
                this.searchBar.proxyUser = res.task.umUser;
                const path = res.task.logPath;
                if (!res.task.logPath) {
                    const errCode = res.task.errCode ? '\n错误码：' + res.task.errCode : '';
                    const errDesc = res.task.errDesc ? '\n错误描述：' + res.task.errDesc : '';
                    const info = '未获取到日志！' + errCode + errDesc;
                    this.logs = { all: info, error: '', warning: '', info: '' };
                    this.fromLine = 1;
                    return;
                }
                api.fetch('/filesystem/openLog', {
                    path,
                    proxyUser: res.task.umUser,
                }, 'get').then((rst) => {
                    this.isLoading = false;
                    if (rst) {
                        const log = { all: '', error: '', warning: '', info: '' };
                        const convertLogs = util.convertLog(rst.log);
                        Object.keys(convertLogs).forEach((key) => {
                            if (convertLogs[key]) {
                                log[key] += convertLogs[key] + '\n';
                            }
                        });
                        this.logs = log;
                        this.fromLine = log['all'].split('\n').length;
                    }
                }).catch(() => {
                    this.isLoading = false;
                });
            }).catch(() => {
                this.isLoading = false;
            });
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
                proxyUser: this.searchBar.proxyUser,
            };
            if (!this.isAdminModel) {
                delete params.proxyUser;
            }
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
            api.fetch('/jobhistory/list', params, 'get').then((rst) => {
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
            api.fetch('/jobhistory/list', params, 'get').then((rst) => {
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
                id: null,
                proxyUser: '',
                engine: 'all',
                status: 'all',
                shortcut: '',
            };
        },
        switchAdmin() {
            if (!this.isLoading) {
                if (this.isAdminModel) {
                    this.isLogModuleShow = false;
                    this.searchBar.id = null;
                    this.searchBar.proxyUser = '';
                }
                this.isAdminModel = !this.isAdminModel;
                this.search();
            }
        },
        back() {
            this.isLogModuleShow = false;
            this.searchBar.id = Number(this.searchBar.lastId);
            this.searchBar.proxyUser = this.searchBar.lastProxyUser;
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
