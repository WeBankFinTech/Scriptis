<template>
  <div class="we-side-bar">
    <we-navbar
      ref="navbar"
      placeholder="请输入数据库或表名搜索"
      :nav-list="navList"
      @on-refresh="reflesh"
      @text-change="setSearchText"/>
    <Spin
      v-if="!tableList.length"
      size="large"
      fix/>
    <we-hive-list
      :data="tableList"
      :filter-text="searchText"
      :loading="isPending"
      class="we-side-bar-content v-hivedb-list"
      @we-click="onClick"
      @we-contextmenu="onContextMenu"
      @we-dblclick="handledbclick"/>
    <we-menu
      ref="contextMenu"
      id="hive">
      <template v-if="currentType === 'db'">
        <we-menu-item @select="copyName">
          复制库名
        </we-menu-item>
        <we-menu-item @select="pasteName">
          复制库名并粘贴至脚本
        </we-menu-item>
        <we-menu-item class="ctx-divider"/>
        <we-menu-item @select="reflesh">
          刷新
        </we-menu-item>
      </template>
      <template v-if="currentType === 'tb'">
        <we-menu-item @select="queryTable">查询表</we-menu-item>
        <we-menu-item @select="openDeleteDialog">删除表</we-menu-item>
        <we-menu-item @select="describeTable">查看表结构</we-menu-item>
        <we-menu-item
          @select="openExportDialog">导出表</we-menu-item>
        <we-menu-item class="ctx-divider"/>
        <we-menu-item @select="copyName">复制表名</we-menu-item>
        <we-menu-item @select="pasteName">复制表名并粘贴至脚本</we-menu-item>
        <we-menu-item @select="copyAllColumns">复制表全字段</we-menu-item>
        <we-menu-item class="ctx-divider"/>
        <we-menu-item @select="reflesh">刷新</we-menu-item>
      </template>
      <template v-if="currentType === 'field'">
        <we-menu-item @select="pasteName">复制字段名并粘贴至脚本</we-menu-item>
      </template>
    </we-menu>
    <we-hive-table-Describe
      ref="tableDesc"
      :width="400"
      :table-describe="currentAcitved"
      @get-part="getPartitions"
      @get-size="getPartitionsSize"
      @set-title="setPartitionsTitle"/>
    <we-hive-table-export
      ref="exportDialog"
      :width="490"
      :table-detail="currentAcitved"
      :db-list="filterDbList"
      :tree="fileTree"
      :load-data-fn="loadDataFn"
      :filter-node="filterNode"
      @get-columns="asyncGetTableColumns"
      @get-tables="getTables"
      @get-tree="getFileTree"
      @get-partitions="getPartitions"
      @get-size="getPartitionsSize"
      @export="exportTable"/>
    <delete-dialog
      ref="deleteDialog"
      :loading="isDeleting"
      @delete="deleteTable"/>
  </div>
</template>
<script>
import _ from 'lodash';
import module from './index';
import storage from '@/js/helper/storage';
import api from '@/js/service/api';
import util from '@/js/util';
import weHiveList from '@js/component/hiveList';
import weHiveTableDescribe from '@js/component/hiveTableDescribe';
import WeHiveTableExport from '@js/component/hiveTableExport';
import deleteDialog from '@js/component/deleteDialog';
export default {
    name: 'WorkSidebar',
    components: {
        weHiveList,
        weHiveTableDescribe,
        WeHiveTableExport,
        deleteDialog,
    },
    mixins: [module.mixin],
    data() {
        return {
            navList: ['search', 'refresh'],
            searchText: '',
            currentType: '',
            tableList: [],
            filterDbList: [],
            currentAcitved: null,
            isPending: false,
            fileTree: [],
            isDeleting: false,
            loadDataFn: () => {},
            // 用于避免双击和单击的冲突
            dblClickTimer: null,
        };
    },
    mounted() {
        this.initData();
    },
    beforeDestroy() {
        storage.set('hiveTree', this.tableList);
    },
    methods: {
        initData() {
            return new Promise((resolve, reject) => {
                const hiveList = storage.get('hiveTree');
                if (!hiveList || _.isEmpty(hiveList)) {
                    api.fetch(`/datasource/dbs`, 'get').then((rst) => {
                        rst.dbs.forEach((db) => {
                            this.tableList.push({
                                name: db.dbName,
                                dataType: 'db',
                                isOpen: false,
                                isVisible: true,
                                children: [],
                                iconCls: 'fi-hivedb',
                            });
                        });
                        resolve(this.tableList);
                    });
                } else {
                    this.tableList = hiveList;
                    resolve(this.tableList);
                }
            });
        },
        onClick({ index, item }) {
            this.$refs.contextMenu.close();
            clearTimeout(this.dblClickTimer);
            this.dblClickTimer = setTimeout(() => {
                switch (item.dataType) {
                    case 'db':
                        this.toggleDB(item, index);
                        break;
                    case 'tb':
                        this.toggleTB(item, index);
                        break;
                    case 'field':
                        break;
                };
            }, 300);
        },
        async toggleDB(item, index) {
            this.currentAcitved = item;
            if (item.children.length) return item.isOpen = !item.isOpen;
            if (this.isPending) return this.$Message.warning('接口加载中，请稍候……');
            await this.getTables(item, true);
        },
        async toggleTB(item, index) {
            this.currentAcitved = item;
            if (item.children.length) return item.isOpen = !item.isOpen;
            if (this.isPending) return this.$Message.warning('接口加载中，请稍候……');
            await this.getTableColumns(item, true, true);
        },
        getTables(item, isOpen) {
            return new Promise((resolve, reject) => {
                this.isPending = true;
                const url = `/datasource/tables`;
                api.fetch(url, {
                    database: item.name,
                }, 'get').then((rst) => {
                    this.isPending = false;
                    item.isOpen = isOpen;
                    this.$set(item, 'children', rst.tables.map((table) => {
                        return {
                            dbName: item.name,
                            name: table.tableName,
                            value: table.tableName,
                            dataType: 'tb',
                            iconCls: 'fi-table',
                            isOpen: false,
                            isVisible: true,
                            isView: table.isView,
                            createdBy: table.createdBy,
                            createdAt: table.createdAt,
                            lastAccessAt: table.lastAccessAt,
                            children: [],
                        };
                    }));
                    storage.set('hiveTree', this.tableList, 'SESSION');
                    resolve(item);
                }).catch((err) => {
                    reject();
                    this.isPending = false;
                });
            });
        },
        asyncGetTableColumns({ item, isOpen, async }, cb) {
            this.getTableColumns(item, isOpen, async).then((item) => {
                cb(item);
            });
        },
        getTableColumns(item, isOpen, async) {
            return new Promise((resolve, reject) => {
                try {
                    const apiPrefix = module.data.API_PATH;
                    const url = `${apiPrefix}datasource/columns?database=${item.dbName}&table=${item.name}`;
                    const oReq = new XMLHttpRequest();
                    oReq.addEventListener('load', () => {
                        item.isOpen = isOpen;
                        const rst = JSON.parse(oReq.response);
                        const column = rst.data.columns;
                        const length = column.length;
                        let tmpFullColumnString = '';
                        this.$set(item, 'children', _.map(column, (o, index) => {
                            if (index === length - 1) {
                                tmpFullColumnString += o.columnName;
                            } else if (index < length - 1) {
                                tmpFullColumnString += `${o.columnName},`;
                            }
                            return {
                                name: o.columnName,
                                dataType: 'field',
                                iconCls: 'fi-field',
                                partitioned: o.partitioned,
                                type: o.columnType,
                                comment: o.columnComment,
                            };
                        }));
                        this.$set(item, 'fullColumn', tmpFullColumnString);
                        storage.set('hiveTree', this.tableList, 'SESSION');
                        resolve(item);
                    });
                    oReq.open('get', url, async);
                    oReq.send(null);
                } catch (e) {
                    reject(e);
                }
            });
        },
        onContextMenu({ ev, item }) {
            this.currentType = item.dataType;
            this.$refs.contextMenu.open(ev);
            this.currentAcitved = item;
        },
        handledbclick({ index, item }) {
            this.currentAcitved = item;
            clearTimeout(this.dblClickTimer);
            this.pasteName();
        },
        copyName() {
            let copyLable = '';
            switch (this.currentAcitved.dataType) {
                case 'tb':
                    copyLable = `${this.currentAcitved.dbName}.${this.currentAcitved.name}`;
                    break;
                default:
                    copyLable = this.currentAcitved.name;
                    break;
            };
            util.executeCopy(copyLable);
        },
        async reflesh() {
            if (this.isPending) return this.$Message.warning('接口请求中，请稍候……');
            if (this.currentAcitved) {
                this.currentAcitved.children = [];
                if (this.currentAcitved.dataType === 'tb') {
                    // 刷新时候清空下size和partitions，否则刷新后再打开表结构数据就会异常
                    this.$set(this.currentAcitved, 'size', null);
                    this.$set(this.currentAcitved, 'partitions', []);
                    await this.getTableColumns(this.currentAcitved, true, true);
                } else {
                    await this.getTables(this.currentAcitved, true);
                    this.$refs.navbar.searchText = '';
                    this.$refs.navbar.showStatus.search = false;
                    this.$refs.navbar.showStatus.nav = true;
                }
                storage.set('hiveTree', this.tableList, 'SESSION');
            }
        },
        pasteName() {
            const value = this.currentAcitved.dataType === 'tb' ? `${this.currentAcitved.dbName}.${this.currentAcitved.name}` : this.currentAcitved.name;
            this.dispatch('Workbench:pasteInEditor', value);
        },
        queryTable() {
            const tabName = `${this.currentAcitved.dbName}.${this.currentAcitved.name}`;
            const code = `select * from ${tabName} limit 100`;
            const filename = `${tabName}_select.hql`;
            const md5Path = util.md5(filename);
            this.dispatch('Workbench:add', {
                id: md5Path,
                filename,
                filepath: '',
                // saveAs表示临时脚本，需要关闭或保存时另存
                saveAs: true,
                code,
            }, (f) => {
                this.$nextTick(() => {
                    this.dispatch('Workbench:run', { id: md5Path });
                });
            });
        },
        describeTable() {
            this.$refs.tableDesc.open();
            const hasChildren = this.currentAcitved.children.length;
            const hasSize = this.currentAcitved.size;
            const hasPart = this.currentAcitved.partitions && this.currentAcitved.partitions.length;
            if (!hasChildren || !hasSize || !hasPart) {
                this.$refs.tableDesc.loading = true;
                const waitFor = [];
                if (!hasChildren) {
                    waitFor.push(this.getTableColumns(this.currentAcitved, false, true));
                }
                if (!hasSize) {
                    const params = {
                        database: this.currentAcitved.dbName,
                        table: this.currentAcitved.name,
                    };
                    waitFor.push(this.getTableSize(params).then((size) => {
                        this.$set(this.currentAcitved, 'size', size);
                    }));
                }
                if (!hasPart) {
                    waitFor.push(this.getPartitions());
                }
                if (waitFor.length) {
                    Promise.all(waitFor).then(() => {
                        this.$refs.tableDesc.loading = false;
                    }).catch((err) => {
                        this.$refs.tableDesc.loading = false;
                        this.$refs.tableDesc.close();
                    });
                } else {
                    this.$refs.tableDesc.loading = false;
                }
            }
        },
        getTableSize(params) {
            return new Promise((resolve, reject) => {
                api.fetch('/datasource/size', params, 'get').then((rst) => {
                    resolve(rst.sizeInfo.size);
                }).catch((err) => {
                    reject(err);
                });
            });
        },
        async copyAllColumns() {
            if (!this.currentAcitved.fullColumn) {
                await this.getTableColumns(this.currentAcitved, false, false);
            }
            util.executeCopy(this.currentAcitved.fullColumn);
        },
        openDeleteDialog() {
            const type = this.currentAcitved.isView ? '视图' : '表';
            this.$refs.deleteDialog.open({
                type,
                name: this.currentAcitved.name,
            });
        },
        deleteTable() {
            this.isDeleting = true;
            const tableName = `${this.currentAcitved.dbName}.${this.currentAcitved.name}`;
            const code = this.currentAcitved.isView ? `drop view ${tableName};` : `drop table ${tableName};`;
            const filename = `${tableName}_drop.hql`;
            const md5Path = util.md5(filename);
            this.dispatch('Workbench:add', {
                id: md5Path,
                filename,
                filepath: '',
                // saveAs表示临时脚本，需要关闭或保存时另存
                saveAs: true,
                code,
            }, (f) => {
                this.isDeleting = false;
                this.$refs.deleteDialog.close();
                this.$nextTick(() => {
                    this.dispatch('Workbench:run', {
                        id: md5Path,
                    }, (flag) => {
                        // 由于删除表成功之后，currentAcitved指向为当前已被删除的表，所以要改为刷新库
                        this.currentAcitved = _.find(this.tableList, (db) => db.name === this.currentAcitved.dbName);
                        this.reflesh();
                    });
                });
            });
        },
        openExportDialog() {
            this.filterDbList = this.tableList;
            this.$refs.exportDialog.open();
        },
        setSearchText(value) {
            if (this.isPending) return this.$Message.warning('接口请求中，请稍候……');
            this.searchText = value;
        },
        getPartitions(tableInfo, cb) {
            const Acitvedtable = tableInfo || this.currentAcitved;
            const url = `/datasource/partitions`;
            api.fetch(url, {
                database: Acitvedtable.dbName,
                table: Acitvedtable.name,
            }, 'get').then((rst) => {
                const isPartMore = rst.partitionInfo.partitions && !_.isEmpty(rst.partitionInfo.partitions[0].children);
                const partitions = this.formatPartions(rst.partitionInfo.partitions);
                this.$set(Acitvedtable, 'isPartition', rst.partitionInfo.isPartition);
                this.$set(Acitvedtable, 'isPartMore', isPartMore);
                this.$set(Acitvedtable, 'partitions', partitions);
                storage.set('hiveTree', this.tableList, 'SESSION');
                if (cb) {
                    cb({
                        isPartition: rst.partitionInfo.isPartition,
                        isPartMore,
                        partitions,
                    });
                }
            });
        },
        getPartitionsSize(params, cb) {
            // cloneDeep是因为值会发生改变。
            const originPart = _.cloneDeep(params.partition);
            const currentdb = _.find(this.tableList, (db) => db.name === params.database);
            this.currentAcitved = _.find(currentdb.children, (tb) => tb.name === params.table);
            if (params.partition) {
                this.$set(params, 'partition', this.getDeepPath(params.partition));
            }
            api.fetch('/datasource/size', params, 'get').then((rst) => {
                const size = rst.sizeInfo.size;
                if (!params.partition) {
                    this.currentAcitved.size = size;
                } else {
                    const findPart = _.find(this.currentAcitved.partitions, (item) => item.path === originPart.path);
                    findPart.size = size;
                }
                cb(rst.sizeInfo.size);
            });
        },
        setPartitionsTitle(node, size) {
            node.title += `(分区大小：${size})`;
        },
        // 分区名称在厚爱存储是以name1/name2/name3的方式
        // 返回前台是{path:name1, children:[{path:name1/name2}]}，所以通过这个函数拿到最底层的path
        getDeepPath(node) {
            if (_.isEmpty(node.children)) return node.path;
            for (let i = 0; i < node.children.length; i++) {
                return this.getDeepPath(node.children[i]);
            }
        },
        // 对partition进行格式化成tree组件需要的格式
        formatPartions(part) {
            return _.map(part, (o, index) => {
                return {
                    title: o.label,
                    expand: false,
                    children: this.formatPartions(o.children),
                    path: o.path,
                };
            });
        },
        'HiveSidebar:getDatabase'(option, cb) {
            this.initData().then((dbList) => {
                cb(dbList);
            });
        },
        'HiveSidebar:getTables'(option, cb) {
            this.getTables(option.item, false).then((item) => {
                cb(item.children);
            });
        },
        'HiveSidebar:getTablePartitions'(option, cb) {
            this.getPartitions(option.item, (item) => {
                cb(item);
            });
        },
        getFileTree(type) {
            const method = type === 'share' ? 'WorkSidebar:showTree' : 'HdfsSidebar:showTree';
            const treeType = type === 'share' ? 'scriptTree' : 'hdfsTree';
            const tmpTree = storage.get(treeType, 'SESSION');
            if (!tmpTree || _.isEmpty(tmpTree)) {
                this.fileTree = [];
                this.dispatch(method, {}, (f) => {
                    f.getRootPath((flag) => {
                        f.getTree((tree) => {
                            if (tree) {
                                this.fileTree.push(tree);
                            }
                            this.loadDataFn = f.loadDataFn;
                        });
                    });
                });
            } else {
                this.fileTree = _.cloneDeep(tmpTree);
                this.dispatch(method, {}, (f) => {
                    this.loadDataFn = f.loadDataFn;
                });
            }
        },
        // 过滤文件夹
        filterNode(node) {
            return !node.isLeaf;
        },
        exportTable(one, two, columns) {
            const part = one.partitions.split('=');
            const separator = one.separator === '%20' ? ' ' : one.separator;
            // 路径最后一个字符可能是/,会导致拼接错误
            const lastParam = two.path.lastIndexOf('/') + 1 === two.path.length ? two.path.length - 1 : two.path.length;
            const path = two.path.slice(7, lastParam);
            const dataInfo = {
                database: one.dbName,
                tableName: one.tbName,
                isPartition: this.isPartTable,
                partition: part[0],
                partitionValue: part[1],
                columns,
            };
            const destination = {
                path: `${path}/${two.fileName}.${one.exportType}`,
                pathType: two.type,
                hasHeader: one.isHasHeader,
                isCsv: one.exportType === 'csv',
                isOverwrite: one.isOverwrite !== '追加',
                fieldDelimiter: separator,
                sheetName: two.sheetName || one.tbName,
                encoding: one.exportType === 'csv' ? one.chartset : '',
            };
            if (destination.isCsv) {
                delete destination.sheetName;
            } else {
                delete destination.isOverwrite;
                delete destination.fieldDelimiter;
            }
            const tabName = `export__${this.currentAcitved.dbName}.${this.currentAcitved.name}`;
            const code = ``;
            const md5Path = util.md5(tabName);
            this.dispatch('Workbench:add', {
                id: md5Path,
                filename: tabName + '.scala',
                filepath: '',
                // saveAs表示临时脚本，需要关闭或保存时另存
                saveAs: true,
                code,
            }, (f) => {
                this.$refs.exportDialog.close();
                this.$nextTick(() => {
                    this.dispatch('Workbench:run', {
                        id: md5Path,
                        type: 'storage',
                        executionCode: {
                            dataInfo,
                            destination,
                        },
                        backgroundType: 'export',
                    }, () => {
                        this.$refs.exportDialog.loading = false;
                    });
                });
            });
        },
    },
};
</script>
<style src="@assets/styles/sidebar.scss" lang="scss">
</style>
