<template>
  <Modal
    v-model="modal.show"
    :width="modal.width"
  >
    <p slot="header">
      导入文件
    </p>
    <!-- content -->
    <div class="we-import-to-hive">
      <div class="we-import-to-hive-steps">
        <Steps
          :current="modal.step">
          <step
            title="步骤1：从文件导入数据"/>
          <step
            title="步骤2：导入至默认表"/>
        </Steps>

      </div>
      <div class="we-import-to-hive-form">
        <!-- first step-->
        <Form
          v-show="modal.step === 0"
          :model="firstStep"
          :label-width="80">
          <p class="step-form-title">来源</p>
          <FormItem
            label="类型"
          >
            <Select
              v-model="firstStep.type"
              placeholder="请选择类型"
              @on-change="emitTypeChange">
              <Option
                v-for="(item) in staticData.type"
                :label="item.label"
                :value="item.value"
                :key="item.value"/>
            </Select>
          </FormItem>
          <FormItem
            label="路径"
          >
            <directory-dialog
              :tree="tree"
              :load-data-fn="loadDataFn"
              :filter-node="filterNode"
              :path="firstStep.exportPath"
              :fs-type="firstStep.type"
              @set-node="setNode"/>
          </FormItem>
          <template v-if="firstStep.exportPath && (isTxtType || isXlsType)">
            <p
              class="step-form-title">格式化</p>
            <template v-if="!isXlsType">
              <FormItem
                label="分隔符"
              >
                <Select
                  v-model="firstStep.separator"
                  placeholder="请选择类型">
                  <Option
                    v-for="(item) in staticData.separator"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"/>
                </Select>
              </FormItem>
              <FormItem
                label="编码格式"
              >
                <Select
                  v-model="firstStep.chartset"
                  placeholder="请选择编码格式"
                >
                  <Option
                    v-for="(item) in staticData.chartset"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"/>
                </Select>
              </FormItem>
              <FormItem
                label="限定符"
              >
                <Select
                  v-model="firstStep.quote"
                  clearable
                  placeholder="无限定符">
                  <Option
                    v-for="(item, index) in staticData.quote"
                    :label="item.label"
                    :value="item.value"
                    :key="index"/>
                </Select>
              </FormItem>
            </template>
            <FormItem
              label="首行为表头">
              <Checkbox
                v-model="firstStep.isHasHeader"
              />
            </FormItem>
          </template>
        </Form>
        <!-- first step end-->
        <!-- second step-->
        <Form
          v-show="modal.step === 1"
          ref="secondForm"
          :model="secondStep"
          :label-width="80"
          :rules="ruleValidate"
          class="seconed-Form">
          <p class="step-form-title">名称</p>
          <FormItem
            label="数据库名"
            prop="dbName">
            <Select
              v-model="secondStep.dbName"
              placeholder="请输入库名"
              @on-change="handleHiveDbChange"
            >
              <Option
                v-for="(item) in dbList"
                :label="item.name"
                :value="item.name"
                :key="item.name"/>
            </Select>
          </FormItem>
          <FormItem
            label="数据表名"
            prop="tbName">
            <Input
              v-model="secondStep.tbName"
              :disabled="!secondStep.dbName"
              placeholder="请输入数据表名">
            </Input>
          </FormItem>
          <Row>
            <Col span="12">
            <FormItem
              v-if="isShowPartition"
              label="分区"
              prop="partitionValue"
            >
              <div>
                <span>{{ secondStep.partition }}</span>
                <span> = </span>
                <Input
                  ref="partition"
                  v-model="secondStep.partitionValue"
                  style="width: calc(100% - 30px);"></Input>
              </div>
            </FormItem>
            </Col>
            <Col span="6">
            <FormItem
              v-if="isShowOverwrite"
              label="复写">
              <Checkbox
                v-model="secondStep.isOverwrite"/>
            </FormItem>
            </Col>
            <Col span="6">
            <FormItem
              v-if="isNewPartition && !validator.isView"
              label="新增分区"
            >
              <Checkbox
                v-model="secondStep.isNewPartition"/>
            </FormItem>
            </Col>
            <Col
              v-if="isNewPartition && secondStep.isNewPartition"
              span="9">
            <FormItem
              label="分区"
              prop="partition"
            >
              <Input
                v-model="secondStep.partition"></Input>
            </FormItem>
            </Col>
            <Col
              v-if="isNewPartition && secondStep.isNewPartition"
              span="9">
            <FormItem
              :label-width="0"
              prop="partitionValue">
              <span> = </span>
              <Input
                v-model="secondStep.partitionValue"
                style="width: calc(100% - 30px);"></Input>
            </FormItem>
            </Col>
          </Row>
          <FormItem
            v-if="isXlsType"
            label="sheet表"
          >
            <Select
              v-model="secondStep.moreSheet"
              multiple="multiple"
              class="step-from-sheet">
              <Option
                v-for="(item, index) in secondStep.sheetList"
                :value="item"
                :key="index"
                :label="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <p class="step-form-title">字段</p>
          <div
            v-for="(item, index) in secondStep.fields"
            :key="index"
            class="step-form-fields">
            <FormItem
              label="名称"
              class="form-item-inline"
              :prop="'fields.' + index + '.fieldName'"
              :rules="[{
                required: true,
                message: '字段名称不能为空',
              }, {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '仅支持字母数字和下划线',
              }]"
              :label-width="item.type === 'date' ? 40 : 80">
              <Input
                v-model="item.fieldName"
                placeholder="请输入字段名"
              >
              </Input>
            </FormItem>
            <FormItem
              label="类型"
              class="form-item-inline"
              :label-width="item.type === 'date' ? 40 : 80">
              <Select
                v-model="item.type"
                placeholder="请输入字段类型"
                @on-change="handleFieldsTypeChange(item)">
                <Option
                  v-for="(field) in staticData.fieldsType"
                  :label="field.value"
                  :value="field.value"
                  :key="field.value"/>
              </Select>
            </FormItem>
            <FormItem
              v-if="item.type === 'date'"
              label="格式"
              class="form-item-inline"
              :label-width="item.type === 'date' ? 40 : 80"
            >
              <Select
                v-model="item.dateFormat"
                clearable
                placeholder="请选择日期格式"
              >
                <Option
                  v-for="(field, index) in staticData.dateType"
                  :label="field.label"
                  :value="field.value"
                  :key="index"/>
              </Select>
            </FormItem>
            <Poptip
              placement="top-end"
              width="220"
              transfer
              popper-class="popper-content">
              <Icon
                type="md-menu"
                class="step-form-extras"
                @click="handleCommentClick(item)"/>
              <Form
                ref="poptipForm"
                slot="content"
                :rules="poptipValidate"
                :label-width="60"
                :model="item">
                <FormItem
                  label="字段注释"
                  prop="comment">
                  <Input
                    v-model="item.comment"
                    placeholder="请输入字段注释"></Input>
                </FormItem>
                <FormItem
                  v-if="item.type === 'char' || item.type === 'varchar'"
                  prop="length"
                  label="长度">
                  <Input
                    v-model="item.length"
                    placeholder="长度">
                  </Input>
                </FormItem>
                <FormItem
                  v-if="item.type=='decimal'"
                  prop="precision"
                  label="精度">
                  <Input
                    v-model="item.precision"
                    placeholder="精度">
                  </Input>
                </FormItem>
                <FormItem
                  v-if="item.type=='decimal'"
                  prop="scale"
                  label="小数位数">
                  <Input
                    v-model="item.scale"
                    placeholder="小数位数"></Input>
                </FormItem>
              </Form>
            </Poptip>
          </div>
        </Form>
        <!-- second step end-->
      </div>
    </div>
    <!-- end content -->

    <template slot="footer">
      <Button
        v-if="modal.step === 0"
        :loading="modal.loading"
        @click="nextStep">下一步</Button>
      <Button
        v-if="modal.step === 1"
        :loading="modal.loading"
        @click="prevStep">上一步</Button>
      <Button
        v-if="modal.step === 1"
        :loading="modal.loading"
        type="primary"
        :disabled="validator.isView"
        @click="submit">提交</Button>
    </template>
  </Modal>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import directoryDialog from '@js/component/directoryDialog/index.vue';
export default{
    components: {
        directoryDialog,
    },
    props: {
        width: {
            type: Number,
            default: 0,
        },
        tree: {
            type: Array,
            default: () => [],
        },
        dbList: {
            type: Array,
            defalut: [],
        },
        fsType: {
            type: String,
            default: 'share',
        },
        loadDataFn: Function,
        filterNode: Function,
    },
    data() {
        let that = this;
        return {
            modal: {
                show: false,
                width: '600px',
                loading: false,
                step: 0,
            },
            validator: {
                isLeaf: true,
                isView: false,
            },
            firstStep: {
                exportPath: '',
                type: 'share',
                separator: ',',
                chartset: 'utf-8',
                quote: '',
                isHasHeader: false,
            },
            secondStep: {
                tbName: '',
                dbName: '',
                moreSheet: [],
                sheetList: [],
                partition: '',
                partitionValue: '',
                isOverwrite: false,
                moreSheet: [],
                fields: [],
                isNewPartition: false,
            },
            partitionManager: {
                duplicateName: false,
                partTable: false,
                multiLevel: false,
                duplicateValue: false,
                areas: [],
            },
            poptipValidate: {
                length: [{
                    pattern: /^[0-9]+$/,
                    message: '类型为char或者varchar的字段长度应为大于0的正整数',
                }],
                precision: [{
                    pattern: /^([1-9]\d*.?|0.)\d*$/,
                    message: '类型为decimal的字段精度输入有误',
                }],
                scale: [{
                    pattern: /^[0-9]+$/,
                    message: '类型为decimal的字段小数位数应为大于0的正整数',
                }],
                comment: [{
                    pattern: /^[\u4e00-\u9fa5\w]{1,100}$/,
                    message: '字段注释仅支持中文、大小写字母和下划线，长度不得超过100字符',
                }],
            },
            ruleValidate: {
                dbName: [{
                    required: true,
                    message: '数据库名不能为空',
                }],
                tbName: [
                    {
                        required: true,
                        message: '表名不能为空',
                    },
                    {
                        pattern: /^[a-zA-Z][a-zA-Z0-9_]{1,100}$/,
                        message: '表名仅支持以字母开头，名称包含大小写字母和下划线，长度为0~100',
                    },
                    {
                        validator(rule, value, callback) {
                            if (!value) {
                                return callback();
                            }
                            return that.handleTbInput(value, callback);
                        },
                    },
                ],
                partition: [
                    {
                        required: true,
                        message: '分区名不能为空',
                    },
                    {
                        pattern: /^[A-Za-z0-9-]+$/,
                        message: '分区名只支持数字、字母和-',
                    },
                ],
                partitionValue: [
                    {
                        required: true,
                        message: '分区值不能为空',
                    },
                    {
                        pattern: /^[A-Za-z0-9-]+$/,
                        message: '分区值只支持数字、字母和-',
                    },
                    {
                        validator(rule, value, callback) {
                            if (!value) {
                                return callback();
                            }
                            return that.validPartitionValue(value, callback);
                        },
                    },
                ],
            },
            staticData: {
                type: [
                    { label: '共享目录导入', value: 'share' },
                    { label: 'HDFS导入', value: 'hdfs' },
                ],
                separator: [
                    { label: '逗号(,)', value: ',' },
                    { label: '分号(;)', value: ';' },
                    { label: '制表符(\\t)', value: '\\t' },
                    { label: '空格', value: '%20' },
                ],
                chartset: [
                    { label: 'utf-8', value: 'utf-8' },
                    { label: 'GBK', value: 'GBK' },
                ],
                quote: [
                    { label: '双引号("")', value: '"' },
                    { label: '单引号(\'\')', value: '\'' },
                ],
                fieldsType: [
                    { value: 'string' },
                    { value: 'tinyint' },
                    { value: 'smallint' },
                    { value: 'int' },
                    { value: 'bigint' },
                    { value: 'boolean' },
                    { value: 'float' },
                    { value: 'double' },
                    { value: 'decimal' },
                    { value: 'timestamp' },
                    { value: 'date' },
                    { value: 'char' },
                    { value: 'varchar' },
                ],
                dateType: [
                    { label: 'yyyyMMdd', value: 'yyyyMMdd' },
                    { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
                    { label: 'yyyy.MM.dd', value: 'yyyy.MM.dd' },
                    { label: 'yyyy/MM/dd', value: 'yyyy/MM/dd' },
                ],
            },
        };
    },
    computed: {
        isTxtType() {
            let exportPath = this.firstStep.exportPath;
            if (!exportPath) return false;
            const reg = ['.txt', '.csv'];
            const tabSuffix = exportPath.substr(exportPath.lastIndexOf('.'), exportPath.length);
            const isTxtType = _.indexOf(reg, tabSuffix) !== -1;
            return isTxtType;
        },
        isXlsType() {
            let exportPath = this.firstStep.exportPath;
            if (!exportPath) return false;
            const reg = ['.xlsx', '.xls'];
            const tabSuffix = exportPath.substr(exportPath.lastIndexOf('.'), exportPath.length);
            const isXlsType = _.indexOf(reg, tabSuffix) !== -1;
            return isXlsType;
        },
        isShowPartition() {
            let { dbName, tbName } = this.secondStep;
            let { partTable, multiLevel } = this.partitionManager;
            let isShow = dbName && tbName && partTable && !multiLevel;
            this.initNewPartition(isShow);
            this.$nextTick(() => {
                if (this.$refs.partition) {
                    this.validateFieldSync('partitionValue');
                }
            });
            return isShow;
        },
        isShowOverwrite() {
            let { dbName, tbName } = this.secondStep;
            let { duplicateName, partTable, duplicateValue } = this.partitionManager;
            return dbName && tbName && ((duplicateName && !partTable) || (duplicateName && duplicateValue));
        },
        isNewPartition() {
            let { dbName, tbName } = this.secondStep;
            let isShow = !this.partitionManager.duplicateName && dbName && tbName;
            this.initNewPartition(isShow);
            return isShow;
        },
        activeDB() {
            let cur = [];
            if (this.dbList.length && this.secondStep.dbName) {
                cur = _.find(this.dbList, (item) => item.name === this.secondStep.dbName);
            }
            return cur;
        },
    },
    watch: {
        'secondStep.partitionValue': function(val) {
            const isValid = this.partitionManager.areas.indexOf(val) === -1;
            if (isValid) {
                this.debounceValidateField('tbName', this);
            }
        },
    },
    methods: {
        open(path) {
            if (this.modal.loading) {
                return this.$Message.warning('文件正在执行导入，请稍后再试！');
            }
            this.resetSecondStep();
            if (path) {
                this.resetFirstStep();
                this.firstStep.exportPath = path;
                this.firstStep.type = this.fsType;
                this.secondStep.tbName = path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
                this.modal.show = true;
                this.modal.step = 0;
                this.validator.isLeaf = true;
                return;
            }
            return this.$Message.warning('文件路径获取失败，请刷新后再试！');
        },

        close() {
            this.modal.show = false;
        },
        validPartitionValue(value, cb) {
            let item = this.partitionManager.areas.indexOf(value);
            if (item !== -1) {
                this.partitionManager.duplicateValue = true;
                return cb(new Error('分区值重复，请确认是否复写'));
            }
            this.partitionManager.duplicateValue = false;
            cb();
        },
        resetFirstStep() {
            this.firstStep = {
                exportPath: '',
                type: 'share',
                separator: ',',
                chartset: 'utf-8',
                quote: '',
                isHasHeader: false,
            };
        },
        resetSecondStep() {
            this.secondStep = {
                tbName: '',
                dbName: '',
                moreSheet: [],
                sheetList: [],
                partition: '',
                partitionValue: '',
                isOverwrite: false,
                moreSheet: [],
                fields: [],
                isNewPartition: false,
            };
        },
        initNewPartition(val) {
            let today = moment.unix(moment().unix()).format('YYYYMMDD');
            const isPart = this.partitionManager.partTable;
            const isNewPart = this.secondStep.isNewPartition;
            this.secondStep.partition = val && (isPart || isNewPart) ? 'ds' : '';
            this.secondStep.partitionValue = val && (isPart || isNewPart) ? today : '';
        },
        handleHiveDbChange(val) {
            const validateTbName = (dbList) => {
                const db = _.find(dbList, (item) => item.name === val);
                if (db && _.isEmpty(db.children)) {
                    this.$emit('get-tables', db, () => {
                        return this.validateFieldSync('tbName');
                    });
                }
                this.validateFieldSync('tbName');
            };
            if (val) {
                if (!this.dbList.length) {
                    this.$emit('get-hive', (dbList) => {
                        return validateTbName(dbList);
                    });
                }
                validateTbName(this.dbList);
            }
        },
        async handleTbInput(val, cb) {
            const activeTB = _.find(this.activeDB.children, (o) => o.value === val);
            if (!activeTB) {
                this.resetPartition();
                return cb();
            }
            this.validator.isView = activeTB.isView;
            if (this.validator.isView) {
                this.resetPartition();
                this.partitionManager.duplicateName = false;
                return cb(new Error(('提示：无法操作视图表，请选择其它表导入')));
            }
            this.partitionManager.duplicateName = true;
            try {
                let tableInfo = await this.judgePartition(activeTB);
                let { isPartition, isPartMore, partitions } = tableInfo;
                let errMsg = '提示：表名已存在当前数据库';
                this.partitionManager.partTable = isPartition;
                // 非分区
                if (!this.partitionManager.partTable) {
                    return cb(new Error(errMsg + '，请确认是否复写'));
                }
                // 多级分区
                if (isPartMore) {
                    this.partitionManager.multiLevel = true;
                    errMsg = '暂不支持多级分区，请选择其它表!';
                    return cb(new Error(errMsg));
                }
                // 一级分区
                const firstPartition = partitions[0] || { title: '' };
                this.secondStep.partition = firstPartition.title.slice(0, firstPartition.title.indexOf('='));
                this.partitionManager.areas = [];
                partitions.forEach((part, index) => {
                    let partitionTitle = part.title;
                    const area = partitionTitle.slice(partitionTitle.indexOf('=') + 1, partitionTitle.length);
                    this.partitionManager.areas.push(area);
                });
                if (!this.secondStep.partitionValue) {
                    return cb(new Error(errMsg + '，请确认分区'));
                }
            } catch (e) {
                return cb(new Error(('获取分区信息失败')));
            }
        },
        judgePartition(table) {
            return new Promise((resolve, reject) => {
                if (table.hasOwnProperty('isPartition')) {
                    resolve(table);
                } else {
                    this.$emit('get-partitions', table, (tableInfo) => {
                        resolve(tableInfo);
                    });
                }
            });
        },
        resetPartition() {
            Object.keys(this.partitionManager).forEach((key) => {
                this.partitionManager[key] = false;
            });
            this.partitionManager.areas = [];
        },
        nextStep() {
            if (!this.validator.isLeaf) return this.$Message.error('请正确选择导入文件路径');
            this.modal.loading = true;
            this.$emit('get-content', this.firstStep, this.isXlsType, (format) => {
                this.modal.loading = false;
                if (!format) return;
                if (!this.dbList.length) {
                    this.$emit('get-hive', (dbList) => {
                        this.secondStep.dbName = dbList[0].name;
                        this.handleHiveDbChange(this.secondStep.dbName);
                    });
                } else {
                    this.secondStep.dbName = this.dbList[0].name;
                    this.handleHiveDbChange(this.secondStep.dbName);
                }
                let { sheetName, columnName, columnType } = format;
                this.modal.step = 1;
                this.secondStep.sheetList = sheetName;
                this.secondStep.moreSheet = sheetName ? sheetName[0] : '';
                this.secondStep.fields = columnName.map((item, index) => {
                    return {
                        fieldName: item,
                        type: columnType[index],
                        comment: '',
                        commentShow: false,
                        dateFormat: '',
                    };
                });
            });
        },
        prevStep() {
            this.modal.step = 0;
        },
        async beforeSubmit() {
            let ruleMap = {};
            let validProps = ['dbName', 'tbName'];
            Object.keys(this.ruleValidate).forEach((key) => {
                let rules = this.ruleValidate[key];
                let msgList = [];
                rules.forEach((r) => {
                    if (r.message) msgList.push(r.message);
                });
                ruleMap[key] = msgList;
            });
            ruleMap.tbName.push('暂不支持多级分区，请选择其它表!');
            if (this.isShowPartition) {
                validProps.push('partitionValue');
            }
            if (this.secondStep.isNewPartition) {
                validProps.push('partition');
            }
            for (let prop of validProps) {
                let validateMsg = await this.validateFieldSync(prop);
                if (validateMsg && ruleMap[prop].indexOf(validateMsg) !== -1) {
                    return false;
                }
            }
            return true;
        },
        validateFieldSync(prop) {
            return new Promise((resolve) => {
                this.$refs.secondForm.validateField(prop, (msg) => {
                    resolve(msg);
                });
            });
        },
        fieldsValidate() {
            let poptipValidate = {
                length: {
                    pattern: /^[0-9]+$/,
                    message: '类型为char或者varchar的字段长度应为大于0的正整数',
                },
                precision: {
                    pattern: /^([1-9]\d*.?|0.)\d*$/,
                    message: '类型为decimal的字段精度输入有误',
                },
                scale: {
                    pattern: /^[0-9]+$/,
                    message: '类型为decimal的字段小数位数应为大于0的正整数',
                },
                comment: [{
                    pattern: /^[\u4e00-\u9fa5\w]{1,100}$/,
                    message: '字段注释仅支持中文、大小写字母和下划线，长度不得超过100字符',
                }],
            };
            let errMsg = '';
            this.secondStep.fields.forEach((field) => {
                let keys = Object.keys(poptipValidate);
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    let rule = poptipValidate[key];
                    let { pattern, message } = rule;
                    if (field[key] && pattern && !pattern.test(field[key])) {
                        errMsg = message;
                        return errMsg;
                    }
                }
            });
            return errMsg;
        },
        async submit() {
            let isValid = await this.beforeSubmit();
            let fieldErrMsg = this.fieldsValidate();
            if (fieldErrMsg) return this.$Message.error(fieldErrMsg);
            if (!isValid) return this.$Message.error('请确认数据库名称填写信息！');
            if (!this.isShowOverwrite) {
                this.secondStep.isOverwrite = false;
            }
            const columns = this.secondStep.fields.map((field) => {
                return {
                    name: field.fieldName.trim(),
                    comment: field.comment,
                    type: field.type,
                    length: field.length,
                    scale: field.scale,
                    precision: field.precision,
                    dateFormat: field.dateFormat,
                };
            });
            this.$emit('export', {
                firstStep: this.firstStep,
                secondStep: this.secondStep,
                isXls: this.isXlsType,
                columns,
                whetherRepeat: this.partitionManager,
            });
        },
        handleCommentClick(item) {
            item.commentShow = !item.commentShow;
        },
        setNode(node) {
            this.validator.isLeaf = node.isLeaf;
            this.firstStep.exportPath = node.path;
        },
        emitTypeChange() {
            this.$emit('on-type-change', this.firstStep.type);
        },
        handleFieldsTypeChange(item) {
            if (item.type === 'date' && !item.dateFormat) {
                item.dateFormat = 'yyyyMMdd';
            }
        },
        debounceValidateField: _.debounce((prop, that) => {
            that.$refs.secondForm.validateField(prop, (msg) => {});
        }, 300),
    },
};
</script>
<style lang="scss" src="./index.scss"></style>
