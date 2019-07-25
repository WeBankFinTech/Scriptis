<template>
  <div class="queue-manager">
    <Spin
      v-if="loading"
      size="large"
      fix/>
    <div
      class="queue-manager-select-warpper"
      v-if="queueList.length">
      <Select
        v-model="current"
        class="queue-manager-select"
        placeholder="请选择队列"
        @on-change="getQueueInfo">
        <Option
          v-for="(queue, index) in queueList"
          :key="index"
          :value="queue">{{ queue }}</Option>
      </Select>
    </div>
    <div v-if="infos">
      <div class="queue-manager-used">
        <div class="queue-manager-title">资源使用率</div>
        <div class="queue-manager-circle-warpper">
          <v-circle
            :percent="infos.queueInfo.usedPercentage.cores"
            :used="infos.queueInfo.usedResources.cores.toString()"
            :max="infos.queueInfo.maxResources.cores.toString()"
            suffixe="核"
            width="120px"
            height="120px"
            title="CPU"
            class="queue-manager-circle"></v-circle>
          <v-circle
            :percent="infos.queueInfo.usedPercentage.memory"
            :used="formatToGb(infos.queueInfo.usedResources.memory)"
            :max="formatToGb(infos.queueInfo.maxResources.memory)"
            suffixe="GB"
            width="120px"
            height="120px"
            title="内存"></v-circle>
        </div>
      </div>
      <div class="queue-manager-top">
        <span class="queue-manager-title">资源使用排行榜</span>
        <div
          class="queue-manager-top-content"
          v-if="infos.userResources.length">
          <div
            v-for="(item, index) in infos.userResources"
            :key="index"
            class="queue-manager-item">
            <span class="queue-manager-name">{{ item.username }}</span>
            <Tooltip
              :content="`${formatToPercent(item.idlePercentage)}空闲 / ${formatToPercent(item.busyPercentage)}繁忙`"
              placement="top">
              <span class="queue-manager-status">
                <span
                  class="queue-manager-status-busy"
                  :style="{'width': formatToPercent(item.busyPercentage)}"
                  :title="formatToPercent(item.busyPercentage)">
                  <i class="queue-manager-status-label"></i>
                </span><span
                  class="queue-manager-status-idle"
                  :style="{'width': formatToPercent(item.busyPercentage + item.idlePercentage)}"
                  :title="formatToPercent(item.idlePercentage)">
                  <i class="queue-manager-status-label"></i>
                </span>
              </span>
            </Tooltip>
            <span class="queue-manager-total">{{ formatToPercent(item.totalPercentage) }}</span>
          </div>
        </div>
        <div
          class="queue-manager-item"
          v-else>暂无</div>
      </div>
    </div>
  </div>
</template>
<script>
import api from '@/js/service/api';
import circle from '@/js/component/circleProgress/index.vue';
export default {
    components: {
        'v-circle': circle,
    },
    data() {
        return {
            queueList: [],
            current: '',
            infos: null,
            loading: true,
        };
    },
    methods: {
        getQueueList() {
            this.loading = true;
            api.fetch('/resourcemanager/queues').then((res) => {
                this.loading = false;
                this.queueList = res.queues;
                this.current = this.queueList[0];
                this.getQueueInfo(this.current);
            }).catch((err) => {
                this.loading = false;
            });
        },
        getQueueInfo(name) {
            this.loading = true;
            api.fetch('/resourcemanager/queueresources', {
                queuename: name,
            }).then((res) => {
                this.loading = false;
                this.infos = res;
            }).catch((err) => {
                this.loading = false;
            });
        },
        formatToPercent(val) {
            return (val * 100).toFixed(0) + '%';
        },
        formatToGb(val) {
            return (val / 1024 / 1024 / 1024).toFixed(0);
        },
    },
};
</script>
