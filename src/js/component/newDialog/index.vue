<template>
  <Modal v-model="show">
    <div
      slot="header"
      width="300">
      <span>{{ modalTitle }}</span>
    </div>
    <div>
      <Form
        ref="newForm"
        :model="newForm"
        :rules="rules"
        :label-width="80"
        size="small">
        <Form-item
          v-if="businessType.length"
          label="节点类型"
          prop="type">
          <Select v-model="newForm.businessType">
            <Option
              v-for="(item) in businessType"
              :label="item"
              :value="item"
              :key="item"/>
          </Select>
        </Form-item>
        <FormItem
          v-if="isLeaf"
          label="名称"
          prop="scriptName">
          <Input
            v-model="newForm.scriptName"
            placeholder="请输入脚本名称"
            style="width: 360px;"></Input>
          <span>{{ ext }}</span>
        </FormItem>
        <FormItem
          v-else
          label="名称"
          prop="name">
          <Input
            v-model="newForm.name"
            placeholder="请输入目录名称"></Input>
        </FormItem>
        <Form-item
          v-if="isLeaf && scriptType.length"
          label="脚本类型："
          prop="type">
          <Select v-model="newForm.scriptType">
            <Option
              v-for="(item, index) in scriptType"
              :label="item.label"
              :value="item.scriptType"
              :key="index"/>
          </Select>
        </Form-item>
        <FormItem
          v-if="isDescShow"
          label="描述">
          <Input
            v-model="newForm.description"
            type="textarea"></Input>
        </FormItem>
        <FormItem
          v-if="targetFolder"
          label="目标文件夹"
        >
          <Input
            v-model="targetFolder"
            disabled></Input>
        </FormItem>
        <FormItem
          v-if="isPathShow"
          label="创建路径"
          prop="targetScriptPath"
        >
          <directory-dialog
            fs-type="script"
            :tree="tree"
            :load-data-fn="loadDataFn"
            :filter-node="filterNode"
            :path="newForm.targetScriptPath"
            @set-node="setNode"/>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="show=false">取 消</Button>
      <Button
        :loading="loading"
        type="primary"
        @click="submitForm('newForm')">确 定</Button>
    </div>
  </Modal>
</template>
<script>
import directoryDialog from '@js/component/directoryDialog/index.vue';
export default {
    name: 'NewDialog',
    components: {
        directoryDialog,
    },
    props: {
        isLeaf: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        businessType: {
            type: Array,
            default: () => {
                return [];
            },
        },
        scriptType: {
            type: Array,
            defalut: () => {
                return [];
            },
        },
        targetFolder: {
            type: String,
            defalut: '',
        },
        isPathShow: {
            type: Boolean,
            defalut: false,
        },
        isDescShow: {
            type: Boolean,
            default: true,
        },
        isNew: {
            type: Boolean,
            default: true,
        },
        type: {
            type: String,
            default: '文件夹',
        },
        node: {
            type: Object,
            default: () => {},
        },
        tree: {
            type: Array,
            default: () => [],
        },
        defaultPath: {
            type: String,
            default: '',
        },
        loadDataFn: Function,
        filterNode: Function,
    },
    data() {
        return {
            show: false,
            newForm: {
                name: '',
                scriptName: '',
                description: '',
                businessType: '',
                targetScriptPath: '',
                scriptType: '',
            },
            rules: {
                scriptName: [
                    { required: true, message: '请输入脚本名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在1到200个字符', trigger: 'change' },
                    { type: 'string', pattern: /^[\w\u4e00-\u9fa5]+$/, message: '仅支持中文、大小写字母、数字和下划线', trigger: 'change' },
                ],
                name: [
                    { required: true, message: '请输入目录名称', trigger: 'blur' },
                    { min: 1, max: 200, message: '长度在1到200个字符', trigger: 'change' },
                    { type: 'string', pattern: /^[\w\u4e00-\u9fa5]+$/, message: '仅支持中文、大小写字母、数字和下划线', trigger: 'change' },
                ],
                targetScriptPath: [
                    { required: true, message: '请选择目标脚本路径！', trigger: 'change' },
                ],
            },
        };
    },
    computed: {
        ext() {
            const item = this.scriptType.find((o) => o.scriptType === this.newForm.scriptType);
            return item ? item.ext : '';
        },
        modalTitle() {
            if (this.isNew) {
                return `新建${this.type}`;
            }
            return `重命名${this.type}`;
        },
    },
    methods: {
        open(data) {
            this.reset();
            this.show = true;
            this.$nextTick(() => {
                if (this.defaultPath) {
                    this.newForm.targetScriptPath = this.defaultPath;
                }
                if (this.node && this.node.businessType) {
                    this.newForm.businessType = this.node.businessType;
                }
                // isNew为false表示是修改，需填充数据
                if (!this.isNew) {
                    let { name, description } = this.node.data;
                    this.newForm.name = name;
                    this.newForm.description = description;
                }
            });
        },
        close() {
            this.show = false;
            this.reset();
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.update(this.isNew);
                }
            });
        },
        update(isNew) {
            const name = this.isLeaf ? this.newForm.scriptName + this.ext : this.newForm.name;
            const path = isNew ? `${this.newForm.targetScriptPath}/${name}` : this.newForm.targetScriptPath;
            const node = {
                name,
                path,
                businessType: this.newForm.businessType,
                description: this.newForm.description,
                isLeaf: this.isLeaf,
                type: this.type,
            };
            const method = isNew ? 'add' : 'update';
            this.$emit(method, node);
            this.show = false;
        },
        setNode(node) {
            this.newForm.targetScriptPath = node.path;
        },
        reset() {
            this.newForm = {
                name: '',
                scriptName: '',
                description: '',
                businessType: '',
                targetScriptPath: '',
                scriptType: 'hive',
            };
            this.$refs.newForm.resetFields();
        },
    },
};
</script>
