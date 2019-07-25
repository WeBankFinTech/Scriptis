<template>
  <Modal
    v-if="tableDescribe"
    v-model="show"
    :width="width">
    <p slot="header">
      <span class="we-table-describe-title">{{ tableDescribe.name }}</span>
    </p>
    <div class="we-table-describe">
      <Spin
        v-if="loading"
        size="large"
        fix/>
      <Tabs
        v-model="activeTabs"
        @on-click="handleClick">
        <TabPane
          :label="columnLabel"
          name="first">
          <Input
            v-model="searchText"
            placeholder="搜索字段名称...">
          <Icon
            slot="prefix"
            type="ios-search"/>
          </Input>
          <Table
            ref="columnTables"
            :data="searchColList"
            :columns="tableColumns"
            class="we-table-describe-column"
            size="small"/>
        </TabPane>
        <TabPane
          label="表详情"
          name="second">
          <Table
            ref="columnTables"
            :data="details"
            :columns="detailsColumns"
            :show-header="false"
            size="small"/>
        </TabPane>
        <TabPane
          :label="partitionsLabel"
          name="third">
          <span
            v-show="tableDescribe.isPartition"
            class="we-table-describe-label">* 请点击根分区查看分区大小</span>
          <Tree
            ref="partTree"
            :data="tableDescribe.partitions"
            empty-text="暂无表分区数据"
            class="we-table-describe-tree"
            @on-select-change="getCurrentNode"/>
        </TabPane>
      </Tabs>
    </div>
    <div slot="footer"/>
  </Modal>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';

export default {
    props: {
        width: Number,
        tableDescribe: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            show: false,
            loading: false,
            activeTabs: 'first',
            searchText: '',
            searchColList: [],
            details: [],
            isPartSizePedding: false,
            columnLabel: '表字段',
            tableColumns: [
                {
                    type: 'index',
                    width: 50,
                    align: 'center',
                },
                {
                    title: '字段名',
                    key: 'name',
                    align: 'center',
                },
                {
                    title: '字段类型',
                    width: 120,
                    key: 'type',
                    align: 'center',
                },
            ],
            detailsColumns: [
                {
                    title: 'name',
                    key: 'name',
                    width: 110,
                },
                {
                    title: 'value',
                    key: 'value',
                },
            ],
        };
    },

    computed: {
        partitionsLabel() {
            if (!_.isEmpty(this.tableDescribe.partitions)) {
                const len = this.tableDescribe.partitions.length;
                return `表分区(${len})`;
            }
            return '表分区';
        },
    },

    watch: {
        searchText() {
            const reg = /^[\w]*$/;
            if (this.searchText && reg.test(this.searchText)) {
                this.searchColList = [];
                const regexp = new RegExp(`.*${this.searchText}.*`);
                const tmpList = this.tableDescribe.children;
                _.forEach(tmpList, (o) => {
                    if (regexp.test(o.name)) {
                        this.searchColList.push(o);
                    }
                });
            } else {
                this.searchColList = this.tableDescribe.children;
            }
        },

        show(val) {
            if (!val) {
                this.activeTabs = 'first';
                this.searchText = '';
                this.searchColList = [];
                this.details = [];
            }
        },

        loading(val) {
            if (!val && this.show) {
                this.init();
            }
        },
    },

    methods: {
        async open() {
            this.show = true;
            if (this.tableDescribe.children) {
                this.init();
            }
        },

        close() {
            this.show = false;
        },

        init() {
            this.searchColList = _.cloneDeep(this.tableDescribe.children);
            this.columnLabel = `表字段(${this.tableDescribe.children.length})`;
        },

        handleClick(tab, event) {
            if (tab === 'second') {
                if (_.isEmpty(this.details)) {
                    this.details = [
                        {
                            name: '数据库名',
                            value: this.tableDescribe.dbName,
                        },
                        {
                            name: '数据表名',
                            value: this.tableDescribe.name,
                        },
                        {
                            name: '创建用户',
                            value: this.tableDescribe.createdBy,
                        },
                        {
                            name: '创建时间',
                            value:
                                this.tableDescribe.createdAt == '0'
                                    ? 0
                                    : moment
                                        .unix(this.tableDescribe.createdAt)
                                        .format('YYYY-MM-DD HH:mm:ss'),
                        },
                        {
                            name: '最后访问时间',
                            value:
                                this.tableDescribe.lastAccessAt == '0'
                                    ? 0
                                    : moment
                                        .unix(this.tableDescribe.lastAccessAt)
                                        .format('YYYY-MM-DD HH:mm:ss'),
                        },
                        {
                            name: '表大小',
                            value: this.tableDescribe.size,
                        },
                    ];
                }
            }
        },

        getCurrentNode(node) {
            const partNode = node[0];
            const params = {
                database: this.tableDescribe.dbName,
                table: this.tableDescribe.name,
                partition: partNode,
            };
            const isFirstLevel = !_.isEmpty(partNode) && partNode.path.indexOf('/') === -1;
            const isHasSize = !_.isEmpty(partNode) && partNode.title.indexOf('大小') === -1;
            if (partNode && isFirstLevel && isHasSize) {
                this.$emit('get-size', params, (size) => {
                    this.$emit('set-title', partNode, size);
                });
            }
        },
    },
};
</script>
<style lang="scss" src="./index.scss">
</style>
