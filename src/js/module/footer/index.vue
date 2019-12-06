<template>
  <div class="layout-footer">
    <resource-simple
      ref="resourceSimple"
      @update-job="updateJob">
    </resource-simple>
    <div
      :title="msg"
      class="footer-channel"
      @click="toast">
      <Icon
        class="footer-channel-job"
        type="ios-swap"/>
      <span class="footer-channel-job-num">{{ num }}</span>
    </div>
  </div>
</template>
<script>
import module from './index';
import resourceSimpleModule from '@js/module/resourceSimple';
import api from '@/js/service/api';
export default {
    components: {
        resourceSimple: resourceSimpleModule.component,
    },
    mixins: [module.mixin],
    data() {
        return {
            num: 0,
            msg: '',
        };
    },
    created() {
        // 让其它接口请求保持在getBasicInfo接口后面请求
        setTimeout(() => {
            this.getRunningJob();
        }, 500);
    },
    methods: {
        getRunningJob() {
            api.fetch('/jobhistory/list', {
                pageSize: 100,
                status: 'Running,Inited,Scheduled',
            }, 'get').then((rst) => {
                this.num = rst.tasks.length;
            });
        },
        'Footer:updateRunningJob'(num) {
            this.num = num;
        },
        'Footer:getRunningJob'(cb) {
            cb(this.num);
        },
        updateJob(num) {
            const method = 'Footer:updateRunningJob';
            this[method](num);
        },
        toast() {
            this.$refs.resourceSimple.open();
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
