<template>
  <Modal
    v-model="show"
    width="430"
    class="save-as-modal">
    <div slot="header">
      <span>另存为脚本</span>
    </div>
    <div>
      <Form
        ref="saveAsForm"
        :model="form"
        :rules="rules"
        :label-width="90">
        <FormItem
          prop="fileName"
          label="文件名：">
          <Input
            v-model="form.fileName"
            class="save-as-modal-name">
          </Input>
          <span>{{ form.ext }}</span>
        </FormItem>
        <FormItem
          prop="selectedPath"
          label="选择路径：">
          <directory-dialog
            :tree="fileTree"
            :load-data-fn="loadDataFn"
            :filter-node="filterNode"
            :path="form.selectedPath"
            class="save-as-modal-path"
            fs-type="script"
            @set-node="setNode"/>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button
        :loading="isLoading"
        type="primary"
        @click="submit">确定</Button>
    </div>
  </Modal>
</template>
<script>
import _ from 'lodash';
import module from '../index';
import storage from '@/js/helper/storage';
import directoryDialog from '@js/component/directoryDialog/index.vue';

export default {
    components: {
        directoryDialog,
    },
    mixins: [module.mixin],
    data() {
        return {
            show: false,
            form: {
                fileName: '',
                ext: '',
                selectedPath: '',
            },
            fileTree: [],
            loadDataFn: () => {},
            isLoading: false,
            oldPath: '',
            rules: {
                fileName: [
                    { required: true, message: '请输入文件名', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在1到200个字符', trigger: 'change' },
                    { type: 'string', pattern: /^[\w\u4e00-\u9fa5]+$/, message: '脚本名称只支持大小写字母、数字和下划线', trigger: 'change' },
                ],
                selectedPath: [
                    { required: true, message: '请选择一个目录', trigger: 'blur' },
                ],
            },
        };
    },
    methods: {
        async open(work) {
            this.show = true;
            this.form.fileName = work.filename.slice(0, work.filename.lastIndexOf('.'));
            this.form.ext = work.data.ext;
            this.oldPath = work.filePath;
            await this.setFileTree();
        },
        filterNode(node) {
            return !node.isLeaf;
        },
        setNode(node, fsType) {
            this.form.selectedPath = node.path;
        },
        setFileTree() {
            if (_.isEmpty(this.fileTree)) {
                const tmpTree = storage.get('scriptTree', 'SESSION');
                if (!tmpTree || (tmpTree && _.isEmpty(tmpTree))) {
                    this.dispatch('WorkSidebar:showTree', {
                        type: 'work',
                    }, (f) => {
                        this.shareComponent = f;
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
                    if (this.shareComponent) {
                        this.loadDataFn = this.shareComponent.loadDataFn;
                    } else {
                        this.dispatch('WorkSidebar:showTree', {
                            type: 'work',
                        }, (f) => {
                            this.shareComponent = f;
                            this.loadDataFn = f.loadDataFn;
                        });
                    }
                }
            }
        },
        submit() {
            if (!this.isLoading) {
                this.$refs.saveAsForm.validate((valid) => {
                    if (valid) {
                        this.isLoading = true;
                        const path = this.form.selectedPath + '/' + this.form.fileName + this.form.ext;
                        this.dispatch('Workbench:checkExist', {
                            path,
                        }, (flag) => {
                            if (flag) {
                                this.isLoading = false;
                                this.$Message.warning(`文件${path}已经存在`);
                            } else {
                                // 如果path是不存在的，说明是临时脚本，需要调用新建接口
                                if (!this.oldPath) {
                                    this.createFile(path);
                                // 这里是实现另存为路径，预留接口
                                } else {
                                    this.moveTo(path);
                                }
                            }
                        });
                    } else {
                        this.$Message.warning('请查看未验证通过项！');
                    }
                });
            }
        },
        createFile(path) {
            this.shareComponent.handleCreating({
                isLeaf: true,
                path,
            }, (flag) => {
                this.show = false;
                this.isLoading = false;
                if (flag) {
                    const node = {
                        path,
                        name: this.form.fileName + this.form.ext,
                        // scriptData: this.scriptData,
                    };
                    this.$emit('save-complete', true, node);
                    this.$Message.success('另存脚本成功，请手动刷新目录树！');
                }
            });
        },
        moveTo(path) {
            this.shareComponent.rename(path, this.oldPath, (flag) => {
                this.show = false;
                this.isLoading = false;
                if (flag) {
                    const node = {
                        path,
                        name: this.form.fileName + this.form.ext,
                        // scriptData: this.scriptData,
                    };
                    this.$emit('save-complete', false, node);
                    this.$Message.success('另存脚本成功，请手动刷新目录树！');
                }
            });
        },
    },
};
</script>
<style lang="scss" src="../index.scss">
</style>
