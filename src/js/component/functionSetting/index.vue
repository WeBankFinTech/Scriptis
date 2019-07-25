<template>
  <Modal
    v-model="show"
    class="fn-setting"
    width="540">
    <div slot="header">
      <span>{{ title }}</span>
    </div>
    <Form
      ref="setting"
      :model="setting"
      :rules="rules"
      :label-width="90"
      :style="{'height': modalHeight}"
      class="setting-content">
      <FormItem
        label="函数名称"
        prop="name">
        <Input v-model="setting.name"></Input>
      </FormItem>
      <FormItem
        label="函数类型"
        prop="fnType">
        <RadioGroup
          v-model="setting.fnType"
          @on-change="onTypeChange">
          <Radio
            v-if="isUdf"
            label="通用"/>
          <Radio
            v-if="isUdf"
            label="spark"/>
          <Radio
            v-if="!isUdf"
            label="自定义函数"/>
        </RadioGroup>
      </FormItem>
      <FormItem
        v-if="fnCategory.isCommon"
        label="Jar包"
        prop="jarPath">
        <directory-dialog
          :tree="tree"
          :load-data-fn="loadDataFn"
          :filter-node="filterNode"
          :path="fnPath"
          fs-type="share"
          @set-node="setNodePath"/>
      </FormItem>
      <FormItem
        v-if="fnCategory.isSpark"
        label="脚本路径"
        prop="sparkPath">
        <directory-dialog
          :tree="tree"
          :load-data-fn="loadDataFn"
          :filter-node="filterNode"
          :path="fnPath"
          fs-type="share"
          @set-node="setNodePath"/>
      </FormItem>
      <FormItem
        v-if="fnCategory.isCustom"
        label="脚本路径"
        prop="customPath">
        <directory-dialog
          :tree="tree"
          :load-data-fn="loadDataFn"
          :filter-node="filterNode"
          :path="fnPath"
          fs-type="share"
          @set-node="setNodePath"/>
      </FormItem>
      <FormItem
        v-if="fnType === 0 && fnCategory.isCommon"
        label="注册格式"
        prop="jarPara">
        <Input
          v-model="setting.jarPara"
          placeholder="注册函数"></Input>
      </FormItem>
      <FormItem
        v-else-if="fnType === 1 && fnCategory.isSpark"
        label="注册格式"
        prop="pyPara">
        <Input
          v-model="setting.pyPara"
          placeholder="注册函数"></Input>
      </FormItem>
      <FormItem
        v-else-if="fnType === 2 && fnCategory.isSpark"
        label="注册格式"
        required>
        <div class="format-div">
          <FormItem prop="scalaTypeL">
            <Input
              v-model="setting.scalaTypeL"
              placeholder="返回类型"
              class="format-input"
              @input="resetRF"></Input>
          </FormItem>
          <FormItem prop="scalaTypeR">
            <Input
              v-model="setting.scalaTypeR"
              placeholder="参数类型"
              class="format-input"
              @input="resetRF"></Input>
          </FormItem>
          <FormItem prop="scalapara">
            <Input
              v-model="setting.scalapara"
              placeholder="注册函数"></Input>
          </FormItem>
        </div>
      </FormItem>
      <FormItem
        v-if="fnType >= 0 && fnType < 3"
        label="预览">
        <span :title="registerFormat">
          <jar-preview
            v-if="fnType === 0 && fnCategory.isCommon"
            :name="setting.name"
            :jar-para="setting.jarPara"/>
          <py-preview
            v-else-if="fnType === 1 && fnCategory.isSpark"
            :name="setting.name"
            :py-para="setting.pyPara"/>
          <scala-preview
            v-else-if="fnType === 2 && fnCategory.isSpark"
            :name="setting.name"
            :type-l="setting.scalaTypeL"
            :type-r="setting.scalaTypeR"
            :para="setting.scalapara"/>
        </span>
      </FormItem>
      <FormItem
        label="使用格式"
        required>
        <div class="format-div">
          <FormItem class="format-item">
            <Input
              v-if="fnType===2"
              v-model="setting.scalaTypeL"
              placeholder="返回类型"
              disabled
              class="format-input"></Input>
            <Input
              v-else
              v-model="setting.useFormatParaL"
              placeholder="返回类型"
              class="format-input"></Input>
          </FormItem>
          <FormItem class="format-item">
            <Input
              v-if="fnType===2"
              v-model="setting.scalaTypeR"
              placeholder="输入类型"
              disabled></Input>
            <Input
              v-else
              v-model="setting.useFormatParaR"
              placeholder="输入类型"></Input>
          </FormItem>
        </div>
      </FormItem>
      <FormItem label="预览">
        <use-preview
          :name="setting.name"
          :para-l="fnType===2 ? setting.scalaTypeL : setting.useFormatParaL"
          :para-r="fnType===2 ? setting.scalaTypeR : setting.useFormatParaR"
          :title="useFormat"/>
      </FormItem>
      <FormItem label="函数描述">
        <Input
          v-model="setting.description"
          type="textarea"></Input>
      </FormItem>
    </Form>
    <template slot="footer">
      <Checkbox
        v-model="setting.defaultLoad"
        class="fn-default-load">默认加载</Checkbox>
      <Button
        :loading="loading"
        type="primary"
        class="fn-sure-btn"
        @click="submitForm('setting')">{{ btnLabel }}</Button>
    </template>
  </Modal>
</template>
<script>
import _ from 'lodash';
import jarPreview from './jarPreview.vue';
import usePreview from './usePreview.vue';
import pyPreview from './pyPreview.vue';
import scalaPreview from './scalaPreview.vue';
import directoryDialog from '@js/component/directoryDialog/index.vue';

export default {
    components: {
        jarPreview,
        pyPreview,
        scalaPreview,
        usePreview,
        directoryDialog,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        tree: {
            type: Array,
            default: () => [],
        },
        isUdf: {
            type: Boolean,
            defalut: true,
        },
        loadDataFn: Function,
        filterNode: Function,
    },

    data() {
        return {
            fnCategory: {
                isSpark: false,
                isCommon: true,
                isCustom: false,
            },
            TYPELIB: {
                jar: 0,
                spark: {
                    py: 1,
                    scala: 2,
                },
                custom: {
                    py: 3,
                    scala: 4,
                },
            },
            show: false,
            title: '新增函数',
            btnLabel: '立即创建',
            modalHeight: '',
            // 1是修改，0是新增
            model: 0,
            node: null,
            // 用于记录show的时候scala的注册格式和使用格式
            showScalaRF: '',
            showScalaUF: '',
            setting: {
                name: '',
                fnType: '通用',
                jarPath: '',
                sparkPath: '',
                customPath: '',
                useFormatParaL: '',
                useFormatParaR: '',
                jarPara: '',
                pyPara: '',
                scalaTypeL: '',
                scalaTypeR: '',
                scalapara: '',
                description: '',
                defaultLoad: true,
            },
            isShareLoading: false,
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    {
                        min: 1,
                        max: 100,
                        message: '长度在1到100个字符',
                        trigger: 'change',
                    },
                    {
                        type: 'string',
                        pattern: /^[a-zA-Z][a-zA-Z0-9_\u4e00-\u9fa5]*$/,
                        message:
                            '必须以字母开头，且只支持字母、数字、下划线和中文！',
                        trigger: 'change',
                    },
                ],
                fnType: [
                    {
                        required: true,
                        message: '请至少选择一种类型',
                        trigger: 'change',
                    },
                ],
                jarPath: [
                    {
                        required: true,
                        message: '请输入完整的路径',
                        trigger: 'change',
                    },
                    // 括号代表精准匹配
                    {
                        type: 'string',
                        pattern: /^[\w.\\/]*(jar)$/,
                        message:
                            '后缀名只支持jar，且jar包名仅支持英文，数字，下划线！',
                        trigger: 'change',
                    },
                ],
                sparkPath: [
                    {
                        required: true,
                        message: '请输入完整的路径',
                        trigger: 'change',
                    },
                    // 括号代表精准匹配
                    {
                        type: 'string',
                        pattern: /^[\w\u4e00-\u9fa5:.\\/]*(py|scala)$/,
                        message: '后缀名只支持py、scala！',
                        trigger: 'change',
                    },
                ],
                customPath: [
                    {
                        required: true,
                        message: '请输入完整的路径',
                        trigger: 'change',
                    },
                    // 括号代表精准匹配
                    {
                        type: 'string',
                        pattern: /^[\w\u4e00-\u9fa5:.\\/]*(py|scala)$/,
                        message: '后缀名只支持py、scala！',
                        trigger: 'change',
                    },
                ],
                jarPara: [
                    {
                        required: true,
                        message: '请输入注册函数',
                        trigger: 'blur',
                    },
                ],
                pyPara: [
                    {
                        required: true,
                        message: '请输入注册函数',
                        trigger: 'blur',
                    },
                ],
                scalaTypeL: [
                    {
                        type: 'string',
                        required: true,
                        message: '请输入返回类型',
                        trigger: 'blur',
                    },
                ],
                scalaTypeR: [
                    {
                        type: 'string',
                        required: true,
                        message: '请输入参数类型',
                        trigger: 'blur',
                    },
                ],
                scalapara: [
                    {
                        type: 'string',
                        required: true,
                        message: '请输入注册函数',
                        trigger: 'blur',
                    },
                ],
            },
        };
    },

    computed: {
        fnPath() {
            return this.setting[this.getTypes()];
        },

        fnType() {
            const tmp = this.fnPath;
            const suffix = tmp
                ? tmp.substring(tmp.lastIndexOf('.') + 1, tmp.length)
                : '';
            let prop = '';
            if (this.fnCategory.isCommon) {
                prop = 'jar';
            } else if (this.fnCategory.isSpark) {
                prop = `spark.${suffix}`;
            } else {
                prop = `custom.${suffix}`;
            }
            return _.get(this.TYPELIB, prop);
        },

        registerFormat() {
            if (this.fnType === 0) {
                return `create temporary function ${this.setting.name} as "${
                    this.setting.jarPara
                }"`;
            } else if (this.fnType === 1) {
                return `udf.register("${this.setting.name}",${
                    this.setting.pyPara.toLowerCase()
                })`;
            } else if (this.fnType === 2) {
                return `udf.register[${this.firstUpperCase(
                    this.setting.scalaTypeL
                )},${this.firstUpperCase(this.setting.scalaTypeR)}]("${
                    this.setting.name
                }",${this.setting.scalapara})`;
            }
            return null;
        },

        useFormat() {
            let type = this.setting.useFormatParaL || '';
            let input = this.setting.useFormatParaR || '';
            if (this.setting.useFormatParaL) {
                if (this.fnType === 1 || this.fnType === 3) {
                    type = this.setting.useFormatParaL.toLowerCase();
                } else if (this.fnType === 2) {
                    type = this.firstUpperCase(this.setting.scalaTypeL);
                    input = this.firstUpperCase(this.setting.scalaTypeR);
                } else if (this.fnType === 4) {
                    type = this.firstUpperCase(this.setting.useFormatParaL);
                    input = this.firstUpperCase(this.setting.useFormatParaR);
                }
            }
            return _.trim(`${type} ${this.setting.name}(${input})`);
        },
    },

    watch: {
        loading: function(val) {
            if (!val) {
                this.show = false;
            }
        },
        'setting.fnType'(val) {
            let map = {
                '通用': 'isCommon',
                'spark': 'isSpark',
                '自定义函数': 'isCustom',
            };
            let type = map[val];
            Object.keys(this.fnCategory).forEach((key) => this.fnCategory[key] = false);
            this.fnCategory[type] = true;
        },
    },

    mounted() {
        // 监听窗口变化，获取浏览器宽高
        window.addEventListener('resize', () => {
            this.resize(window.innerHeight);
        });
    },

    created() {
        // 创建的时候设置宽高
        this.resize(window.innerHeight);
    },

    methods: {
        open({ node }) {
            this.resetData();
            const titleMap = ['新增函数', '修改函数'];
            const btnLabelMap = ['立即创建', '修改'];
            this.show = true;
            this.node = node.data;
            if (this.node.isLeaf) {
                this.model = 1;
                this.init();
            } else {
                this.model = 0;
                this.setting.fnType = this.isUdf ? '通用' : '自定义函数';
            }
            this.btnLabel = btnLabelMap[this.model];
            this.title = titleMap[this.model];
        },

        init() {
            let { name, shared, description, path, udfType, registerFormat, useFormat } = this.node;
            let fnType = 'spark';
            if (udfType === 0) {
                fnType = '通用';
            } else if (udfType > 2) {
                fnType = '自定义函数';
            }
            if (registerFormat) {
                this.convertRegisterFormat();
            }
            if (useFormat) {
                this.convertUseFormat(name);
            }
            this.setting = Object.assign({}, this.setting, {
                name,
                shared,
                description,
                fnType,
            });
            this.$nextTick(() => {
                this.$set(this.setting, this.getTypes(), path);
            });
        },

        close() {
            this.show = false;
        },

        convertRegisterFormat() {
            const rf = this.node.registerFormat;
            const conver = (f, s, left, right) => {
                return _.trim(rf.substring(rf[left](f) + 1, rf[right](s)));
            };
            if (this.node.udfType === 0) {
                this.setting.jarPara = conver('"', '"', 'indexOf', 'lastIndexOf');
            } else if (this.node.udfType === 1) {
                this.setting.pyPara = conver(',', ')', 'indexOf', 'lastIndexOf');
            } else {
                const type = rf.slice(rf.indexOf('['), rf.indexOf(']'));
                // 如果存在多个逗号，就只用使用格式来截取，否则会出现多个类型填入input异常的问题
                if (type.indexOf(',') !== type.lastIndexOf(',')) {
                    this.setting.scalaTypeL = '';
                    this.setting.scalaTypeR = '';
                    this.showScalaRF = this.node.registerFormat;
                } else {
                    this.setting.scalaTypeL = conver('[', ',', 'indexOf', 'indexOf');
                    this.setting.scalaTypeR = conver(',', ']', 'indexOf', 'indexOf');
                }
                this.setting.scalapara = conver(',', ')', 'lastIndexOf', 'lastIndexOf');
            }
        },

        convertUseFormat(name) {
            const uf = this.node.useFormat;
            const index = uf.indexOf(name);
            if (index > 0) {
                const left = _.trim(uf.slice(0, index - 1));
                const right = _.trim(uf.slice(index + name.length + 1, uf.lastIndexOf(')')));
                let type = 'useFormatPara';
                if (this.showScalaRF) {
                    this.showScalaUF = this.node.useFormat;
                    type = 'scalaType';
                }
                this.$set(this.setting, `${type}L`, left);
                this.$set(this.setting, `${type}R`, right);
            }
        },

        handleShareChange(val) {
            if (!this.isShareLoading) {
                this.isShareLoading = true;
            }
        },

        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let { name, description, defaultLoad } = this.setting;
                    let postData = {
                        name,
                        description,
                        path: this.fnPath,
                        useFormat: this.useFormat,
                        registerFormat: this.registerFormat,
                        udfType: this.fnType,
                        isLeaf: true,
                    };
                    if (this.model) {
                        postData = Object.assign(postData, { shared: false });
                        this.$emit('update', postData);
                    } else {
                        postData = Object.assign(postData, { defaultLoad });
                        this.$emit('add', postData);
                    }
                }
                return false;
            });
        },

        firstUpperCase(str) {
            // 针对类型input框可能存在多个类型的转换，例如'string,string,int'
            return str.replace(/\w+,*/g, (word) => {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
        },

        resetRF() {
            this.showScalaRF = '';
            this.showScalaUF = '';
        },

        // 设置宽高
        resize(h) {
            this.modalHeight = h - 380 + 'px';
        },

        setNodePath(node) {
            const unPrefixPath = node.path.slice(7, node.path.length);
            this.$set(this.setting, this.getTypes(), unPrefixPath);
        },

        getTypes() {
            if (this.fnCategory.isCommon) {
                return 'jarPath';
            } else if (this.fnCategory.isSpark) {
                return 'sparkPath';
            }
            return 'customPath';
        },

        onTypeChange() {
            this.$emit('type-change', this.setting.fnType);
        },

        resetData() {
            this.setting = {
                name: '',
                fnType: '',
                jarPath: '',
                sparkPath: '',
                customPath: '',
                useFormatParaL: '',
                useFormatParaR: '',
                jarPara: '',
                pyPara: '',
                scalaTypeL: '',
                scalaTypeR: '',
                scalapara: '',
                description: '',
                defaultLoad: true,
            };
            this.showScalaRF = '';
            this.showScalaUF = '';
        },
    },
};
</script>
<style lang="scss" src="./index.scss">

</style>
