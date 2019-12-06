<template>
  <div class="editor">
    <div class="workbench-body-navbar">
      <div
        class="workbench-body-navbar-item"
        @click="undo">
        <Icon type="ios-undo" />
        <span class="navbar-item-name">撤销</span>
      </div>
      <div
        class="workbench-body-navbar-item"
        @click="redo">
        <Icon type="ios-redo" />
        <span class="navbar-item-name">恢复</span>
      </div>
      <div
        v-if="scriptType!=='hdfsScript'"
        class="workbench-body-navbar-group">
        <div
          v-show="!script.running"
          v-if="script.executable"
          class="workbench-body-navbar-item"
          title="F5"
          :class="{'disabled':loading}"
          @click="run">
          <Icon type="ios-play" />
          <span class="navbar-item-name">运行</span>
        </div>
        <div
          v-show="script.running"
          v-if="script.executable"
          class="workbench-body-navbar-item"
          @click="stop">
          <Icon
            type="md-square"
            style="color:red"/>
          <span class="navbar-item-name">停止</span>
        </div>
        <div
          v-if="!script.readOnly"
          class="workbench-body-navbar-item"
          title="Ctrl+S"
          @click="save">
          <Icon type="md-checkmark" />
          <span class="navbar-item-name">保存</span>
        </div>
        <div
          v-if="!script.readOnly && isSupport"
          class="workbench-body-navbar-item"
          @click="config">
          <Icon type="ios-build" />
          <span class="navbar-item-name">配置</span>
        </div>
      </div>
    </div>
    <div class="editor-content">
      <we-editor
        ref="editor"
        v-model="script.data"
        :language="script.lang"
        :id="script.id"
        :read-only="script.readOnly"
        :script-type="scriptType"
        :application="script.application"
        type="code"
        @on-operator="heartBeat"
        @on-run="run"
        @on-save="save"
        @is-parse-success="changeParseSuccess"/>
      <setting
        ref="setting"
        v-show="showConfig"
        :script="script"
        :work="work"
        @setting-close="settingClose"/>
    </div>
  </div>
</template>
<script>
import module from '../index';
import setting from './setting.vue';
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import _ from 'lodash';
export default {
    components: {
        setting,
    },
    mixins: [module.mixin],
    props: {
        script: {
            type: Object,
            required: true,
        },
        work: {
            type: Object,
            required: true,
        },
        scriptType: {
            type: String,
            default: 'workspaceScript',
        },
    },
    data() {
        return {
            showConfig: false,
            loading: false,
            isParseSuccess: true,
        };
    },
    computed: {
        listenResource() {
            return this.script.running;
        },
        isSupport() {
            return this.script.executable;
        }
    },
    watch: {
        listenResource(val) {
            if (!val) {
                api.fetch('/jobhistory/list', {
                    pageSize: 100,
                    status: 'Running,Inited,Scheduled',
                }, 'get').then((rst) => {
                    this.dispatch('Footer:updateRunningJob', rst.tasks.length);
                }).catch((err) => {
                });
            }
        },
        'work.unsave'(val) {
            if (!val) {
                this.$refs.setting.origin = JSON.stringify(this.script.params);
            }
        },
    },
    methods: {
        'Workbench:insertValue'(args) {
            if (args.id === this.script.id) {
                this.$refs.editor.insertValueIntoEditor(args.value);
            }
        },
        'Workbench:setParseAction'(id) {
            if (id === this.script.id) {
                const editor = this.$refs.editor;
                if (editor) {
                    const isParserClose = !!storage.get('isParserClose', 'local');
                    editor.isParserClose = isParserClose;
                    editor.closeParser && editor.closeParser.set(!isParserClose);
                    editor.openParser && editor.openParser.set(isParserClose);
                }
            }
        },
        undo() {
            this.$refs.editor.undo();
        },
        redo() {
            this.$refs.editor.redo();
        },
        async run() {
            // if (!this.isParseSuccess) return this.$Message.warning('代码中有语法错误，请检查后再试！');
            if (this.script.running) return this.$Message.warning('脚本运行中，请稍候！');
            let selectCode = this.$refs.editor.getValueInRange() || this.script.data;
            let validRepeat = await this.validateRepeat();
            this.$refs.editor.sqlParser(selectCode, (flag) => {
                // if (!flag) {
                //     return this.$Message.warning('代码中有语法错误，请检查后再试！');
                // }
                if (!validRepeat) return this.$Message.warning('请检查配置参数输入是否正确！');
                if (this.loading) return this.$Message.warning('接口请求中，请稍后！');
                if (!selectCode) {
                    return this.$Message.warning('无法执行空代码！');
                }
                this.loading = true;
                this.$emit('on-run', selectCode, (status) => {
                    // status是start表示已经开始执行
                    let list = ['execute', 'error', 'start', 'downgrade'];
                    if (list.indexOf(status) > -1) {
                        this.loading = false;
                    }
                });
            });
        },
        stop() {
            if (this.loading) return this.$Message.warning('接口请求中，请稍后！');
            this.loading = true;
            this.$emit('on-stop', (isKilled) => {
                this.loading = false;
            });
        },
        async save() {
            let valid = await this.validateRepeat();
            if (!valid) return this.$Message.warning('请检查配置参数输入是否正确！');
            this.$refs.editor.save();
            this.$emit('on-save');
        },
        config() {
            this.showConfig = !this.showConfig;
        },
        settingClose() {
            this.showConfig = false;
        },
        heartBeat: _.throttle(() => {
            api.fetch('/user/heartbeat', 'get');
        }, 60000),
        // 对this.script.params.variable里面是否存在key重复性进行校验
        // 这里要注意，html结构不能用v-if，只能用v-show，让设置模块处于要渲染状态
        // 否则会需要使用nextTick中await，会发生打开后没渲染的情况。
        async validateRepeat() {
            const setting = this.$refs.setting;
            let valid = true;
            // 当没有自定义参数的时候不做判断
            if (this.script.params.variable.length) {
                // 表单验证返回是个promise，所以需要用await
                valid = await setting.$refs.paramForm.validate((valid) => {
                    // 如果验证没通过，要打开setting页面
                    if (!valid) {
                        this.showConfig = true;
                    }
                    return valid;
                });
            }
            return valid;
        },
        changeParseSuccess(flag) {
            this.isParseSuccess = flag;
        },
    },
};
</script>
