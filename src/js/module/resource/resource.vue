<template>
  <div
    class="resource">
    <Button
      class="resource-refresh"
      type="primary"
      size="small"
      @click="getExplorerInfo()">刷新</Button>
    <Tabs
      v-model="currentTab"
      :animated="false"
      @on-click="getExplorerInfo">
      <TabPane
        label="用户会话"
        name="first">
        <Table
          :columns="engineColumns"
          :data="engineData"
          :height="tableHeight"
          border
          stripe/>
      </TabPane>
      <TabPane
        label="用户资源"
        name="second">
        <Table
          :columns="userColumns"
          :data="userData"
          :height="tableHeight"
          border
          stripe/>
      </TabPane>
      <TabPane
        label="服务器资源"
        name="third">
        <Table
          :columns="serverColumns"
          :data="serverData"
          :height="tableHeight"
          border
          stripe/>
      </TabPane>
    </Tabs>
    <div
      :style="{'height': height + 'px'}"
      class="resource-loading"
      v-show="loading">
      <Icon
        type="ios-loading"
        size="30"
        class="resource-loading-icon"/>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import expandRow from './table-expand.vue';
import api from '@/js/service/api';
import Module from './index';
export default {
    name: 'Resource',
    components: {
    },
    mixins: [Module.mixin],
    props: {
        height: Number,
    },
    data() {
        return {
            loading: false,
            // 默认页
            currentTab: 'first',
            // 点击查看时的状态
            isClickBefore: true,
            serverColumns: [{
                title: '模块名称',
                key: 'moduleName',
                width: 180,
                align: 'center',
            }, {
                title: '总资源',
                align: 'center',
                children: [
                    {
                        title: 'CPU',
                        key: 'totalCpu',
                        align: 'center',
                        sortable: true,
                    }, {
                        title: '内存',
                        key: 'totalMemory',
                        align: 'center',
                        sortable: true,
                    },
                ],
            }, {
                title: '已用资源',
                align: 'center',
                children: [
                    {
                        title: 'CPU',
                        key: 'usedCpu',
                        align: 'center',
                        sortable: true,
                    }, {
                        title: '内存',
                        key: 'usedMemory',
                        align: 'center',
                        sortable: true,
                    },
                ],
            }],
            userColumns: [{
                title: '模块名称',
                key: 'moduleName',
                align: 'center',
            }, {
                title: '已使用资源',
                align: 'center',
                children: [
                    {
                        title: 'CPU',
                        key: 'usedCpu',
                        align: 'center',
                        sortable: true,
                    }, {
                        title: '内存',
                        key: 'usedMemory',
                        align: 'center',
                        sortable: true,
                    },
                ],
            }, {
                title: '初始化中资源',
                align: 'center',
                children: [
                    {
                        title: 'CPU',
                        key: 'lockedCpu',
                        align: 'center',
                        sortable: true,
                    }, {
                        title: '内存',
                        key: 'lockedMemory',
                        align: 'center',
                        sortable: true,
                    },
                ],
            }],
            engineColumns: [{
                type: 'expand',
                width: 50,
                render: (h, params) => {
                    return h(expandRow, {
                        props: {
                            row: params.row,
                            formatCpu: this.formatCpu,
                        },
                    });
                },
            }, {
                title: '引擎实例',
                key: 'engineInstance',
                align: 'center',
                sortable: true,
            }, {
                title: '应用名称',
                key: 'applicationName',
                align: 'center',
            },
            {
                title: '开始时间',
                key: 'usedTime',
                align: 'center',
                width: 100,
                render: (h, scope) => {
                    return h('span', {}, moment(scope.row.usedTime).format('YYYY-MM-DD HH:mm:ss'));
                },
            },
            {
                title: '状态',
                key: 'engineStatus',
                align: 'center',
                render: (h, scope) => {
                    return h('span', {}, scope.row.engineStatus);
                },
            }, {
                title: '已用资源',
                align: 'center',
                children: [
                    {
                        title: 'CPU',
                        key: 'usedResource.driver.cpu',
                        align: 'center',
                        sortable: true,
                        render: (h, scope) => {
                            return h('span', {}, this.formatCpu(this.formatEngines(scope.row.usedResource).cpu));
                        },
                    }, {
                        title: '内存',
                        key: 'usedResource.driver.memory',
                        align: 'center',
                        sortable: true,
                        render: (h, scope) => {
                            return h('span', {}, this.formatEngines(scope.row.usedResource).memory);
                        },
                    },
                ],
            }, {
                title: '用户名',
                key: 'statusInfo.engineInfo.user',
                align: 'center',
                render: (h, scope) => {
                    return h('span', {}, scope.row.statusInfo.engineInfo.user);
                },
            }],
            engineData: [],
            userData: [],
            serverData: [],
        };
    },
    computed: {
        tableHeight() {
            return this.height - 50;
        },
    },

    mounted() {
        this.currentTab = 'first';
        this.getExplorerInfo();
    },

    beforeDestroy() {
        this.engineData = [];
        this.serverData = [];
        this.userData = [];
    },

    methods: {
        // 获取资源管理器数据
        getExplorerInfo() {
            if (this.loading) return this.$Message.warning('接口请求中，请稍后！');
            this.loading = true;
            if (this.currentTab === 'first') {
                this.getEngines();
            } else if (this.currentTab === 'second') {
                this.getUserResource();
            } else if (this.currentTab === 'third') {
                this.getModuleResources();
            }
        },

        getEngines() {
            api.fetch('/resourcemanager/engines').then((rst) => {
                this.loading = false;
                this.engineData = rst.engines;
            }).catch((err) => {
                this.loading = false;
            });
        },

        getUserResource() {
            this.userData = [];
            api.fetch('/resourcemanager/userresources').then((rst) => {
                this.loading = false;
                const keys = _.keys(rst);
                keys.forEach((item, index) => {
                    const lockedResource = JSON.parse(rst[item].lockedResource);
                    const usedResource = JSON.parse(rst[item].usedResource);
                    if (item === 'sparkEngineManager') {
                        this.userData.push({
                            moduleName: item,
                            usedCpu: this.formatCpu(usedResource.driver.cpu),
                            usedMemory: usedResource.driver.memory,
                            lockedCpu: this.formatCpu(lockedResource.driver.cpu),
                            lockedMemory: lockedResource.driver.memory,
                        });
                    } else {
                        this.userData.push({
                            moduleName: item,
                            usedCpu: this.formatCpu(usedResource.cpu),
                            usedMemory: usedResource.memory,
                            lockedCpu: this.formatCpu(lockedResource.cpu),
                            lockedMemory: lockedResource.memory,
                        });
                    }
                });
            }).catch((err) => {
                this.loading = false;
            });
        },

        // 调取接口获取数据
        getModuleResources() {
            this.serverData = [];
            api.fetch('/resourcemanager/moduleresources').then((rst) => {
                this.loading = false;
                const keys = _.keys(rst);
                keys.forEach((item, index) => {
                    const totalResource = JSON.parse(rst[item].totalResource);
                    const usedResource = JSON.parse(rst[item].usedResource);
                    if (item === 'sparkEngineManager') {
                        this.serverData.push({
                            moduleName: item,
                            usedCpu: this.formatCpu(usedResource.driver.cpu),
                            usedMemory: usedResource.driver.memory,
                            totalCpu: this.formatCpu(totalResource.driver.cpu),
                            totalMemory: totalResource.driver.memory,
                        });
                    } else {
                        this.serverData.push({
                            moduleName: item,
                            usedCpu: this.formatCpu(usedResource.cpu),
                            usedMemory: usedResource.memory,
                            totalCpu: this.formatCpu(totalResource.cpu),
                            totalMemory: totalResource.memory,
                        });
                    }
                });
            }).catch((err) => {
                this.loading = false;
            });
        },

        formatCpu(str) {
            if (str === -1) {
                return '无限制';
            }
            return str + ' 核';
        },

        // 点击应用地址实现跳转
        skipTo(url) {
            location.href = `${url}`;
        },

        killSessionJob(index, row) {
        },

        killQueryJob(index, row, data) {
        },

        // 如果是特殊通道会话，颜色高亮显示，html结构中调用function不能带括号
        isSpecialSession(row, index) {
            return (row.description && row.description.specialSession && row.description.specialSession !== '<distribution>') ? 'blueText' : null;
        },

        formatEngines(resource) {
            const formated = JSON.parse(resource);
            if (formated.driver) {
                return formated.driver;
            }
            return formated;
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
