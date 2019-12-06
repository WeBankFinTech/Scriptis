<template>
  <Modal
    v-model="show"
    class="we-upload"
    width="340">
    <div slot="header">
      <span>上传脚本文件</span>
    </div>
    <div class="we-upload-content">
      <Upload
        ref="upload"
        :action="updateUrl"
        :headers="headers"
        :data="uploadData"
        :max-size="maxSize"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-progress="handleProgress"
        :on-exceeded-size="exceededSize"
        multiple
        type="drag">
        <div style="padding: 20px 0">
          <Icon
            type="ios-cloud-upload"
            size="52"
            style="color: #3399ff"/>
          <p class="el-upload__text">将文件拖到此处，或<em>点击上传</em></p>
          <p class="el-upload__tip">{{ msg }}</p>
          <p class="we-upload_path">路径：{{ path }}</p>
        </div>
      </Upload>
      <Spin
        v-if="isUploading"
        size="large"
        fix/>
    </div>
    <template slot="footer">
      <Button
        :disabled="isUploading"
        size="small"
        type="warning"
        @click="resetUpload">清空列表</Button>
      <!--<Button size="small" type="success" @click="upload" :loading="isUploading">上传至服务器</Button>-->
    </template>
  </Modal>
</template>
<script>
import _ from 'lodash';

export default {
    props: {
        refresh: Function,
    },
    data() {
        return {
            show: false,
            uploadFiles: [],
            updateUrl: '',
            maxSize: 0,
            msg: null,
            path: null,
            listName: null,
            uploadData: null,
            isBtnShow: true,
            isUploading: false,
        };
    },
    computed: {
        headers() {
            return {
                // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            };
        },
    },
    watch: {
        show(val) {
            if (!val) {
                this.uploadFiles = [];
                this.path = null;
                this.uploadData = null;
                this.listName = null;
                this.isBtnShow = true;
                this.isUploading = false;
                this.$refs.upload.clearFiles();
            }
        },
    },
    methods: {
        // 打开的时候赋值
        async open(data) {
            this.path = data.path;
            if (data.nameList) {
                this.listName = data.nameList;
            }
            this.uploadData = { path: data.type + this.path };
            this.show = true;
            if (data.type === 'file://') {
                this.msg = '(上传脚本文件不得超过2MB！)';
                this.maxSize = 2048;
            } else {
                this.msg = '(上传脚本文件不得超过100MB！)';
                this.maxSize = 102400;
            }
            this.updateUrl = `${data.apiPrefix}filesystem/upload`;
        },

        // 关闭的时候清空数据
        close() {
            if (this.isUploading) {
                this.$confirm('此操作将中断文件上传，是否继续？', '提示', {
                    confirmButtonText: '直接关闭',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    this.path = null;
                    this.listName = null;
                    this.uploadData = null;
                    this.isUploading = false;
                    this.show = false;
                }).catch(() => {
                    this.isUploading = true;
                    this.$Message.warning('取消关闭上传窗口!');
                });
            } else {
                this.show = false;
                this.path = null;
                this.listName = null;
                this.uploadData = null;
                this.isUploading = false;
            }
        },

        // 错误时的回调
        handleError(err, file, fileList) {
            this.$Message.error(err.message);
            this.isUploading = false;
            this.refresh();
            this.close();
        },

        // 成功时的回调
        handleSuccess(response, file, fileList) {
            if (response.status === 0) {
                this.$Message.success(`文件 ${file.name} 上传成功！`);
                this.isUploading = false;
                this.close();
                setTimeout(() => {
                    this.refresh();
                }, 800);
            } else {
                this.$Message.warning(response.message);
            }
        },

        exceededSize(file, fileList) {
            this.$Message.warning(`文件大小超出限额！`);
        },

        // 发生改变时的回调
        beforeUpload(file) {
            const isInFlag = _.find(this.listName, (item) => item === file.name);
            const regLeaf = /^[.\w\u4e00-\u9fa5]{1,200}\.[A-Za-z]+$/;
            if (isInFlag) {
                this.$Message.warning('文件已存在，请选择其它文件或选择其它文件夹！');
                return false;
            } else if (!regLeaf.test(file.name)) {
                // 18.2.8 新增正则判断，如果验证不通过则提示警告，不让上传
                this.$Message.warning('文件名称不合法，仅支持以字母、数字、中文、下划线且带后缀的命名！');
                return false;
            }
            this.uploadFiles.push(file);
            // return false;
        },

        // 上传文件过程中的回调
        handleProgress(event, file, fileList) {
            if (file.status === 'uploading') {
                this.isUploading = true;
            } else {
                this.isUploading = false;
            }
        },

        // 提交表单
        upload() {
            this.isUploading = true;
        },

        // 清除文件列表
        resetUpload() {
            if (this.isUploading) {
                this.$Message.warning('文件上传中，无法清空上传列表！');
            } else {
                this.$refs.upload.clearFiles();
            }
        },
    },
};
</script>
<style lang="scss" src="./index.scss">
</style>
