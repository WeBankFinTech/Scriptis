<template>
  <Modal
    v-if="node"
    v-model="show"
    width="420">
    <div slot="header">
      <p :title="node.name">正在对{{ node.name }}函数进行共享操作</p>
    </div>
    <div>
      <Form
        ref="shareForm"
        :model="shareForm"
        :rules="shareRule"
        :label-width="80"
        size="small">
        <Form-item
          v-if="!node.shared"
          label="函数类型"
          prop="fnType">
          <!--label-in-value 搭配onChange事件返回值是label和value-->
          <Select
            v-model="shareForm.fnType"
            label-in-value
            style="width: 300px;"
            @on-change="handleChange">
            <Option
              v-for="(item) in shareForm.list"
              :label="item.name"
              :value="item.id"
              :key="item.id" />
          </Select>
        </Form-item>
        <Form-item
          label="共享用户"
          prop="users">
          <Input
            v-model="shareForm.users"
            :disabled="shareEditing"
            type="textarea"
            placeholder="请输入要共享的用户，以逗号分隔"
            style="width: 300px;">
          </Input>
        </Form-item>
      </Form>
    </div>
    <div slot="footer">
      <Button
        v-if="shareEditing"
        :loading="loading"
        type="primary"
        @click="modifyShare">修改</Button>
      <Button
        v-else
        :loading="loading"
        type="primary"
        @click="submit">确认</Button>
    </div>
  </Modal>
</template>
<script>
import _ from 'lodash';
export default {
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            show: false,
            node: null,
            shareEditing: false,
            // 记录当前被选中的函数文件夹的label和key
            selectedItem: null,
            shareForm: {
                fnType: null,
                list: [],
                users: '',
            },
            shareRule: {
                fnType: [{
                    required: true,
                    type: 'number',
                    message: '请选择该共享函数的类型！',
                    trigger: 'change',
                }],
                users: [{
                    required: true,
                    message: '请填入至少一位需要共享的用户！',
                    trigger: 'change',
                }],
            },
        };
    },
    watch: {
        loading(val) {
            if (!val) {
                this.show = false;
            }
        },
        show(val) {
            if (!val) {
                this.shareEditing = false;
                this.selectedItem = null;
                this.shareForm = {
                    fnType: null,
                    list: [],
                    users: '',
                };
                this.$refs.shareForm.resetFields();
            }
        },
    },
    methods: {
        open(data) {
            let {
                shareUser,
                tree,
                node,
            } = data;
            if (data.isView) {
                this.shareEditing = true;
                this.shareForm.users = shareUser;
            }
            this.shareForm.list = tree;
            this.node = node.data;
            this.show = true;
        },
        handleChange(item) {
            this.selectedItem = item;
        },
        modifyShare() {
            this.shareEditing = false;
        },
        submit() {
            this.$refs.shareForm.validate((valid) => {
                if (!valid) return this.$Message.warning('验证项未通过，请修改后再试！');
                let {
                    fnType,
                    users,
                } = this.shareForm;
                let option = {
                    sharedUsers: users.split(','),
                };
                let method = 'update-share';
                if (!this.node.shared) {
                    option = {
                        shareParentId: fnType,
                        // _.uniq去重
                        sharedUsers: _.uniq(users.split(',')),
                    };
                    method = 'add-share';
                }
                this.$emit(method, option);
                this.show = false;
            });
        },
    },
};
</script>
