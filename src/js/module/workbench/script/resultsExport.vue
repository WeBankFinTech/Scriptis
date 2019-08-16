<template>
  <Modal
    v-model="show"
    class="results-export"
    width="450">
    <div slot="header">
      <span>结果集导出</span>
    </div>
    <div class="results-export-content">
      <Form
        ref="resultsExport"
        :model="exportOption"
        :rules="rules"
        :label-width="80">
        <FormItem
          label="导出名称"
          prop="name">
          <Input
            v-model="exportOption.name"
            placeholder="请输入导出名称……"
            style="width: 320px;"></Input>
          <Icon
            title="导出后缀可在管理台-常用功能-设置-应用级-pipeline中设置！"
            type="md-help-circle"
            class="results-export-content-help"
          ></Icon>
        </FormItem>
        <FormItem
          label="存储路径"
          prop="path">
          <directory-dialog
            :filter-node="filterNode"
            :path="exportOption.path"
            :tree="fileTree"
            :load-data-fn="loadDataFn"
            fs-type="script"
            title="结果集导出"
            @set-node="setNode"/>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button
        type="primary"
        @click="submit">确定</Button>
    </div>
  </Modal>
</template>
<script>
import _ from 'lodash';
import module from '../index';
import storage from '@/js/helper/storage';
import util from '@/js/util';
import directoryDialog from '@js/component/directoryDialog/index.vue';
export default {
    name: 'ResultsExport',
    components: {
        directoryDialog,
    },
    mixins: [module.mixin],
    props: {
        currentPath: {
            type: String,
            default: '',
        },
        script: [Object],
    },
    data() {
        return {
            show: false,
            exportOption: {
                name: '',
                path: '',
            },
            fileTree: [],
            hdfsComponent: null,
            loadDataFn: () => {},
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在1到200个字符', trigger: 'change' },
                    { type: 'string', pattern: /^[\w\u4e00-\u9fa5]+$/, message: '仅支持中文、大小写字母、数字和下划线', trigger: 'change' },
                ],
                path: [
                    { required: true, message: '请选择导出路径！', trigger: 'change' },
                ],
            },
        };
    },
    methods: {
        open() {
            this.show = true;
            this.reset();
            const fileName = this.script.fileName.replace(/\./g, '_');
            this.exportOption.name = `${fileName}__${Date.now()}`;
            this.setFileTree();
        },
        setFileTree() {
            if (_.isEmpty(this.fileTree)) {
                const tmpTree = storage.get('scriptTree', 'SESSION');
                if (!tmpTree || (tmpTree && _.isEmpty(tmpTree))) {
                    this.dispatch('WorkSidebar:showTree', {
                        type: 'work',
                    }, (f) => {
                        this.hdfsComponent = f;
                        f.getRootPath((flag) => {
                            f.getTree((tree) => {
                                if (tree) {
                                    this.fileTree.push(tree);
                                    this.loadDataFn = f.loadDataFn;
                                }
                            });
                        });
                    });
                } else {
                    this.fileTree = _.cloneDeep(tmpTree);
                    if (this.hdfsComponent) {
                        this.loadDataFn = this.hdfsComponent.loadDataFn;
                    } else {
                        this.dispatch('WorkSidebar:showTree', {
                            type: 'work',
                        }, (f) => {
                            this.hdfsComponent = f;
                            this.loadDataFn = f.loadDataFn;
                        });
                    }
                }
            }
        },
        filterNode(node) {
            return !node.isLeaf;
        },
        setNode(node, fsType) {
            this.exportOption.path = node.path;
        },
        submit() {
            this.$refs.resultsExport.validate((valid) => {
                if (!valid) return false;
                this.show = false;
                this.exportConfirm();
            });
        },
        exportConfirm() {
            const tabName = `new_stor_${Date.now()}.out`;
            const code = `from ${this.currentPath} to ${this.exportOption.path}/${this.exportOption.name}`;
            const md5Path = util.md5(tabName);
            this.dispatch('Workbench:add', {
                id: md5Path,
                filename: tabName,
                filepath: '',
                // saveAs表示临时脚本，需要关闭或保存时另存
                saveAs: true,
                code,
            }, (f) => {
                if (!f) {
                    return;
                }
                this.$nextTick(() => {
                    this.dispatch('Workbench:run', { id: md5Path });
                });
            });
        },
        reset() {
            this.exportOption = {
                name: '',
                path: '',
            };
            this.fileTree = [];
        },
    },
};
</script>
<style lang="scss" src="../index.scss">

</style>
