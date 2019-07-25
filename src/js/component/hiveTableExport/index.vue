<template>
  <Modal
    v-model="show"
    :width="width">
    <p slot="header">
      <span>导出表</span>
    </p>
    <div class="we-table-export">
      <template>
        <Steps
          :current="stepActive"
          size="small"
          class="we-table-export-step">
          <step
            title="步骤1：设置导出参数"/>
          <step
            title="步骤2：设置导出路径"/>
        </Steps>
      </template>
      <div>
        <Spin
          v-if="isLoading || isPartLoading"
          size="large"
          fix/>
        <Form
          v-show="stepActive === 0"
          ref="stepOneForm"
          :model="stepOne"
          :rules="stepOnerules"
          :label-width="80"
          class="we-table-export-form" >
          <FormItem
            label="数据库名"
            prop="dbName">
            <Select
              v-model="stepOne.dbName"
              placeholder="请输入库名"
              class="item-width"
              @on-change="handleHiveDbChange">
              <Option
                v-for="(item, index) in dbList"
                :label="item.name"
                :value="item.name"
                :key="index"/>
            </Select>
          </FormItem>
          <FormItem
            label="数据表名"
            prop="tbName">
            <Select
              v-model="stepOne.tbName"
              filterable
              clearable
              class="item-width"
              @on-change="handleTbInput">
              <!--{{}}前后不能换行，会出现很多的换行符-->
              <Option
                v-for="(item, index) in activeDB.children"
                :value="item.value"
                :key="item.name+index">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem
            v-if="activeTB && !activeTB.isView"
            label="字段信息"
            prop="column">
            <Select
              key="column"
              v-model="stepOne.column"
              :disabled="isUnExport"
              multiple
              class="item-width"
              transfer>
              <Option
                v-for="(item, index) in activeTB.children"
                :value="item.name"
                :key="item.name + index"
                :label="item.name">
                {{ item.name }}
              </Option>
            </Select>
          </FormItem>
          <FormItem
            v-if="activeTB && activeTB.isPartition && stepOne.tbName"
            label="分区信息"
            prop="partitions">
            <Select
              key="part"
              v-model="stepOne.partitions"
              :disabled="isUnExport"
              class="item-width">
              <Option
                v-for="(item, index) in activeTB.partitions"
                :value="item.title"
                :key="index.title"
                :label="item.title">
                {{ item.title }}
              </Option>
            </Select>
          </FormItem>
          <FormItem
            label="导出格式"
            prop="exportType">
            <Select
              key="type"
              v-model="stepOne.exportType"
              :disabled="isUnExport"
              class="item-width"
              @on-open-change="handleExportTypeOpen">
              <Option
                v-for="(item) in libs.exportTypes"
                :label="item.label"
                :value="item.value"
                :key="item.value"
                :disabled="stepOne.isLargerThenOneGb && item.value==='xlsx'"/>
            </Select>
          </FormItem>
          <FormItem
            v-if="stepOne.exportType === 'csv'"
            label="分隔符"
            prop="separator">
            <Select
              v-model="stepOne.separator"
              class="item-width">
              <Option
                v-for="(item) in libs.separator"
                :label="item.label"
                :value="item.value"
                :key="item.value"/>
            </Select>
          </FormItem>
          <FormItem
            label="编码格式"
            v-if="stepOne.exportType === 'csv'"
            prop="chartset">
            <Select
              v-model="stepOne.chartset"
              placeholder="请选择编码格式">
              <Option
                v-for="(item) in libs.chartset"
                :label="item.label"
                :value="item.value"
                :key="item.value"/>
            </Select>
          </FormItem>
          <FormItem>
            <Checkbox
              v-model="stepOne.isHasHeader"
              :disabled="isUnExport">首行为表头</Checkbox>
          </FormItem>
        </Form>
        <Form
          v-show="stepActive === 1"
          ref="stepTwoForm"
          :model="stepTwo"
          :rules="stepTworules"
          :label-width="80"
          class="we-table-export-form">
          <FormItem
            label="类型"
            prop="type">
            <Select
              v-model="stepTwo.type"
              placeholder="请选择类型"
              style="width: 378px;"
              @on-change="handleTypeChange">
              <Option
                v-for="(item) in libs.types"
                :label="item.label"
                :value="item.value"
                :key="item.value"/>
            </Select>
          </FormItem>
          <FormItem
            label="导出至"
            prop="path">
            <directory-dialog
              :tree="tree"
              :load-data-fn="loadDataFn"
              :filter-node="filterNode"
              :path="stepTwo.path"
              :fs-type="stepTwo.type"
              @set-node="setNode"/>
          </FormItem>
          <FormItem
            label="文件名"
            prop="fileName">
            <Input
              v-model="stepTwo.fileName"
              placeholder="请填入导出文件名称"
              style="width: 350px;">
            </Input>
            <span>.{{ stepOne.exportType }}</span>
          </FormItem>
          <FormItem
            v-if="stepOne.exportType === 'csv'"
            label="复写模式">
            <RadioGroup v-model="stepOne.isOverwrite">
              <Radio label="追加"/>
              <Radio label="复写"/>
            </RadioGroup>
          </FormItem>
          <FormItem
            v-if="stepOne.exportType !== 'csv'"
            label="sheet表名">
            <Input
              v-model="stepTwo.sheetName"
              placeholder="请填入sheet表名"
              class="item-width">
            </Input>
          </FormItem>
        </Form>
      </div>
    </div>
    <template slot="footer">
      <Button
        v-if="stepActive === 0"
        :disabled="(activeTB && activeTB.isPartMore) || stepOne.isLargerThenFiveGb"
        @click="submitForm('stepOneForm')">下一步</Button>
      <Button
        v-if="stepActive === 1"
        :loading="isLoading"
        @click="prev">上一步</Button>
      <Button
        v-if="stepActive === 1"
        :loading="isLoading"
        type="primary"
        @click="submitForm('stepTwoForm')">提交</Button>
    </template>
  </Modal>
</template>
<script>
import _ from 'lodash';
import storage from '@/js/helper/storage';
import directoryDialog from '@js/component/directoryDialog/index.vue';
export default {
    name: 'ExportTable',
    components: {
        directoryDialog,
    },
    props: {
        width: Number,
        tableDetail: {
            type: Object,
            default: () => {},
        },
        dbList: {
            type: Array,
            default: () => [],
        },
        tree: {
            type: Array,
            default: () => [],
        },
        loadDataFn: Function,
        filterNode: Function,
    },
    data() {
        const validateName = (rule, value, callback) => {
            if (this.activeTB.isView) {
                callback(new Error('无法操作视图表，请选择其它表导出！'));
            } else if (this.activeTB.isPartMore) {
                callback(new Error('暂不支持多分区表导出，请选择其它表导出！'));
            } else {
                callback();
            }
        };
        return {
            show: false,
            stepActive: 0,
            isLoading: false,
            isPartLoading: false,
            stepOne: {
                dbName: '',
                tbName: '',
                // 将表格数据过滤成label和value格式
                filterTbList: [],
                // 分隔符
                separator: ',',
                // 分区
                partitions: '',
                // 字段
                column: [],
                // 导出格式（xls或者csv）
                exportType: '',
                // 是否使用表头
                isHasHeader: false,
                // 是否追加
                isOverwrite: '追加',
                // 编码格式
                chartset: 'utf-8',
                // 判断大小是否超出限制
                isLargerThenOneGb: false,
                isLargerThenFiveGb: false,
            },
            stepTwo: {
                type: 'share',
                path: null,
                // 导出的文件名称
                fileName: '',
                // 导出的sheet表名称
                sheetName: '',
            },
            libs: {
                types: [
                    { label: '共享目录', value: 'share' },
                    { label: 'HDFS', value: 'hdfs' },
                ],
                separator: [
                    { label: '逗号(,)', value: ',' },
                    { label: '分号(;)', value: ';' },
                    { label: '制表符(\\t)', value: '\\t' },
                    { label: '空格', value: '%20' },
                ],
                exportTypes: [
                    { label: 'xlsx', value: 'xlsx' },
                    { label: 'csv', value: 'csv' },
                ],
                chartset: [
                    { label: 'utf-8', value: 'utf-8' },
                    { label: 'GBK', value: 'GBK' },
                ],
            },
            stepOnerules: {
                dbName: [
                    { required: true, message: '请选择数据库！', trigger: 'change' },
                ],
                tbName: [
                    { required: true, message: '请选择表！', trigger: 'change' },
                    { validator: validateName, trigger: 'change' },
                ],
                separator: [
                    { required: true, message: '请选择分隔符！', trigger: 'change' },
                ],
                partitions: [
                    { required: true, message: '请选择一个分区表导出！', trigger: 'change' },
                ],
                column: [
                    { required: true, message: '请至少选择一个字段！', trigger: 'change', type: 'array' },
                ],
                exportType: [
                    { required: true, message: '请选择导出格式！', trigger: 'change' },
                ],
                chartset: [
                    { required: true, message: '请选择编码格式！', trigger: 'change' },
                ],
            },
            stepTworules: {
                type: [
                    { required: true, message: '请选择导出路径的类型！', trigger: 'change' },
                ],
                path: [
                    { required: true, message: '请选择导出路径！', trigger: 'change' },
                ],
                fileName: [
                    { required: true, message: '请填入导出的文件名称！', trigger: 'change' },
                    { min: 1, max: 100, message: '长度在3~100个字符！', trigger: 'change' },
                    { type: 'string', pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]*$/, message: '文件名只支持中文、字母、数字和下划线！', trigger: 'change' },
                ],
            },
        };
    },
    computed: {
        // 记录当前选中的db
        activeDB() {
            if (this.dbList && this.stepOne.dbName) {
                const cur = _.find(this.dbList, (item) => item.name === this.stepOne.dbName);
                return cur;
            }
            return {
                children: [],
            };
        },
        // 记录当前选中的表
        activeTB() {
            if (this.activeDB && this.stepOne.tbName) {
                return _.find(this.activeDB.children, (item) => item.name === this.stepOne.tbName);
            }
            return null;
        },
        isUnExport() {
            if (this.activeTB) {
                return !(this.stepOne.dbName && this.stepOne.tbName) || this.activeTB.isPartMore || this.activeTB.isView;
            }
            return null;
        },
    },
    methods: {
        async open(para) {
            if (this.isLoading) {
                this.$Message.warning('此表导出中，请稍后再试或者选择其他表！');
            } else {
                this.stepActive = 0;
                this.reset();
                let { dbName, name } = this.tableDetail;
                Object.assign(this.stepOne, {
                    exportType: '',
                    dbName,
                    tbName: name,
                });
                this.$nextTick(() => {
                    this.getPartitionInfo();
                });
            }
            this.show = true;
        },

        close() {
            this.show = false;
        },
        reset() {
            if (!this.isLoading) {
                this.stepOne = {
                    dbName: '',
                    dbOpt: [],
                    tbName: '',
                    path: null,
                    separator: ',',
                    chartset: 'utf-8',
                    partitions: '',
                    column: [],
                    exportType: '',
                    isHasHeader: false,
                    isOverwrite: '追加',
                    isLargerThenOneGb: false,
                    isLargerThenFiveGb: false,
                };
                this.stepTwo = {
                    type: 'share',
                    path: null,
                    fileName: '',
                    sheetName: '',
                };
                this.stepActive = 0;
                this.$refs.stepOneForm.resetFields();
                this.$refs.stepTwoForm.resetFields();
            }
        },
        handleHiveDbChange(val) {
            if (val) {
                this.stepOne.tbName = '';
                if (!this.activeDB.children.length) {
                    this.$emit('get-tables', this.activeDB);
                }
            }
        },

        handleTbInput(val) {
            if (!val) return;
            this.stepOne.exportType = '';
            if (_.isEmpty(this.activeTB.children)) {
                this.getPartitionInfo();
            } else {
                this.parseTableColumn();
            }
        },

        handleTypeChange() {
            // 切换目录树
            this.getRootpath();
            this.$emit('get-tree', this.stepTwo.type);
        },

        prev() {
            this.stepActive = 0;
        },

        submitForm(type) {
            this.$refs[type].validate((valid) => {
                if (!valid) return false;
                if (type === 'stepOneForm') {
                    this.stepActive = 1;
                    if (!this.stepTwo.path) {
                        this.getRootpath();
                    }
                    if (!this.stepTwo.fileName) {
                        this.stepTwo.fileName = this.stepOne.tbName;
                    }
                    return this.$emit('get-tree', this.stepTwo.type);
                }
                this.exportTable();
            });
        },

        handleExportTypeOpen(isOpen) {
            if (!isOpen) return;
            let partition = null;
            // 如果是分区表，必须让用户选择分区表
            if (this.activeTB.isPartition) {
                if (!this.stepOne.partitions) {
                    this.$Message.warning('请选择分区！');
                    this.$refs.stepOneForm.validateField('partitions');
                    return;
                }
                partition = _.find(this.activeTB.partitions, (o) => {
                    return o.title = this.stepOne.partitions;
                });
            }
            this.parseSize(partition).then((size) => {
                const largerThenOneGb = this.determinesSizeOverflow(size, 1);
                const largerThenFiveGb = this.determinesSizeOverflow(size, 5);
                this.$set(this.stepOne, 'isLargerThenOneGb', largerThenOneGb);
                this.$set(this.stepOne, 'isLargerThenFiveGb', largerThenFiveGb);
                if (largerThenFiveGb) {
                    return this.$Message.warning('表大小超过5GB，请使用其它方式导出或选择其它表！');
                }
            });
        },

        // 获取表或者分区大小，partition存储的是分区
        parseSize(partition) {
            return new Promise((resolve, reject) => {
                if (this.activeTB.isView) return resolve(0);
                if (!partition && this.activeTB.size) return resolve(this.activeTB.size);
                if (partition && partition.size) return resolve(partition.size);
                const params = {
                    database: this.stepOne.dbName,
                    table: this.stepOne.tbName,
                    partition,
                };
                this.$emit('get-size', params, (size) => {
                    resolve(size);
                });
            });
        },

        // 根据条件判断是否超出大小
        determinesSizeOverflow(size, threshold) {
            if (size === 0) return false;
            const sizeNum = parseInt(size, 10);
            const determinesMb = sizeNum >= (threshold * 1000) && size.match('MB');
            const determinesGb = sizeNum >= threshold && size.match('GB');
            const determinesTb = size.match('TB');
            if (determinesMb || determinesGb || determinesTb) {
                return true;
            }
            return false;
        },

        exportTable() {
            const columnList = this.stepOne.column;
            const columns = columnList.length === this.activeTB.children.length ? '*' : columnList.toString();
            this.$emit('export', this.stepOne, this.stepTwo, columns);
        },
        setNode(node) {
            this.stepTwo.path = node.path;
        },
        parseTableColumn() {
            this.stepOne.column = [];
            const setColumns = () => {
                this.$nextTick(() => {
                    this.stepOne.column = _.map(this.activeTB.children, (o) => o.name);
                });
            };
            if (!_.isEmpty(this.activeTB.children)) {
                setColumns();
            } else {
                this.isLoading = true;
                this.$emit('get-columns', {
                    item: this.activeTB,
                    isOpen: false,
                    async: true,
                }, (tb) => {
                    setColumns();
                    this.isLoading = false;
                });
            }
        },
        getPartitionInfo() {
            if (!this.activeTB) return;
            // 判断是否为分区表和多级分区
            const determinesPartition = (isPart, isMultPart) => {
                this.isPartLoading = false;
                this.$refs.stepOneForm.validateField('tbName');
                if (!isMultPart) {
                    this.parseTableColumn();
                }
            };
            let { isPartition, isPartMore } = this.activeTB;
            this.isPartLoading = true;
            if (this.activeTB.hasOwnProperty('isPartition')) {
                determinesPartition(isPartition, isPartMore);
            } else {
                this.$emit('get-partitions', this.activeTB, ({ isPartition, isPartMore }) => {
                    determinesPartition(isPartition, isPartMore);
                });
            }
        },
        getRootpath() {
            const type = this.stepTwo.type === 'share' ? 'shareRootPath' : 'hdfsRootPath';
            const path = storage.get(type, 'SESSION');
            this.stepTwo.path = path || '';
        },
    },
};
</script>
<style lang="scss" src="./index.scss">
</style>
