<template>
  <div>
    <Spin
      v-if="loading"
      size="large"
      fix/>
    <div class="job-manager">
      <div
        class="job-manager-empty"
        v-if="!jobList.length">暂无数据</div>
      <div
        class="job-manager-type"
        v-for="(type) in jobTypeList"
        :key="type.en">
        <span
          class="job-manager-title"
          v-if="jobList.length && checkJobLength(type.en)">{{ type.cn }}</span>
        <div
          v-for="(item, index) in jobList"
          :key="index">
          <div
            v-if="item.requestApplicationName === type.en"
            class="job-manager-item-wrapper"
            :style="getClass(item)"
            :class="{'actived': item.isActive}"
            @click="handleItemClick(item)"
            @contextmenu.prevent.stop="handleItemMenu($event, item)">
            <Icon
              type="md-checkmark"
              class="job-manager-item-active"
              v-if="item.isActive"
            ></Icon>
            <span
              class="job-manager-item-progress"
              :style="{'width': item.progress ? (item.progress * 100).toFixed(2) + '%' : 0}"></span>
            <i
              class="job-manager-item-icon"
              :class="getIconClass(item)"></i>
            <span class="job-manager-item-label">{{ item.fileName || '未知脚本名称' }}</span>
            <span class="job-manager-item-progress-label">{{ item.progress ? (item.progress * 100).toFixed(2) + '%' : '' }}</span>
            <Icon
              size="16"
              type="ios-close-circle-outline"
              class="job-manager-item-close"
              @click="openKillModal('任务')"/>
          </div>
        </div>
      </div>
      <we-menu
        ref="contextMenu"
        id="jobManager">
        <we-menu-item
          @select="openKillModal('引擎和任务')"
          v-if="lastClick && lastClick.status !== 'Inited'">
          <span>结束引擎和任务</span>
        </we-menu-item>
        <we-menu-item @select="openHistoryScript">
          <span>查看脚本信息</span>
        </we-menu-item>
        <we-menu-item @select="copyInfos">
          <span>复制脚本信息</span>
        </we-menu-item>
      </we-menu>
    </div>
    <detele-modal
      ref="killModal"
      :loading="loading"
      @delete="kill"></detele-modal>
  </div>
</template>
<script>
import _ from 'lodash';
import Module from './index';
import util from '@/js/util';
import api from '@/js/service/api';
import deteleModal from '@js/component/deleteDialog';
export default {
    name: 'Job',
    components: {
        deteleModal,
    },
    mixins: [Module.mixin],
    data() {
        return {
            loading: false,
            jobTypeList: [],
            jobList: [],
            lastClick: null,
        };
    },
    watch: {
        loading(val) {
            this.$emit('change-loading', val);
        },
    },
    methods: {
        getJobList() {
            this.jobList = [];
            api.fetch('/jobhistory/list', {
                pageSize: 100,
                status: 'Running,Inited,Scheduled',
            }, 'get').then((rst) => {
                this.dispatch('Footer:updateRunningJob', rst.tasks.length);
                this.jobTypeList = [{ 'en': 'IDE', 'cn': '开发' }];
                rst.tasks.forEach((item, index) => {
                    const tmpItem = Object.assign({}, item, { isActive: false });
                    this.jobList.push(tmpItem);
                });
                this.jobList = _.orderBy(this.jobList, ['status', 'fileName']);
                this.$emit('update-job', rst.tasks.length);
            }).catch((err) => {
                this.isLoading = false;
            });
        },
        // 删除当前工作
        killJob() {
            const item = this.lastClick;
            if (this.loading) return this.$Message.warning('请等待接口返回！');
            if (!item) return this.$Message.warning('请选择一条记录！');
            if (!item.strongerExecId) return this.$Message.warning('未获取到strongerExecId，请联系管理员查看！');
            this.loading = true;
            api.fetch(`/entrance/${item.strongerExecId}/kill`, 'get').then((rst) => {
                this.loading = false;
                this.$emit('close-modal');
                // 停止执行
                this.$Notice.close(item.scriptPath);
                this.$Notice.warning({
                    title: '运行提示',
                    desc: `已经停止执行脚本 ${item.fileName} ！`,
                    name: item.scriptPath,
                    duration: 3,
                });
            }).catch((err) => {
                this.loading = false;
            });
        },
        async killJobAndEngine() {
            const item = this.lastClick;
            if (this.loading) return this.$Message.warning('请等待接口返回！');
            if (!item.strongerExecId) return this.$Message.warning('未获取到strongerExecId，请联系管理员查看！');
            if (!item.engineInstance) return this.$Message.warning('未获取到engineInstance，请联系管理员查看！');
            this.loading = true;
            await api.fetch(`/entrance/${item.strongerExecId}/kill`, 'get');
            api.fetch('/resourcemanager/engines').then((res) => {
                const engines = res.engines;
                const engine = engines.find((e) => e.engineInstance === item.engineInstance);
                if (engine) {
                    const params = [{
                        ticketId: engine.ticketId,
                        moduleName: engine.moduleName,
                        engineManagerInstance: engine.engineManagerInstance,
                        creator: engine.creator,
                    }];
                    api.fetch(`/resourcemanager/enginekill`, params).then((rst) => {
                        this.loading = false;
                        this.$emit('close-modal');
                        this.$Notice.close(item.scriptPath);
                        this.$Notice.warning({
                            title: '运行提示',
                            desc: `结束引擎和任务成功`,
                            name: item.scriptPath,
                            duration: 3,
                        });
                    }).catch((err) => {
                        this.loading = false;
                    });
                }
            }).catch((err) => {
                this.loading = false;
            });
        },
        openHistoryScript() {
            const item = this.lastClick;
            if (item.requestApplicationName === 'IDE') {
                const supportModes = this.getSupportModes();
                const match = supportModes.find((s) => s.rule.test(item.fileName));
                const ext = match ? match.ext : '.hql';
                const name = `history_item_${item.taskID}${ext}`;
                const md5Id = util.md5(name);
                this.$emit('close-modal');
                if (this.$route.name === 'Home') {
                    this.dispatch('Workbench:add', {
                        id: md5Id, // 唯一标识，就算文件名修改，它都能标识它是它
                        taskID: item.taskID,
                        filename: name,
                        filepath: item.scriptPath,
                        // saveAs表示临时脚本，需要关闭或保存时另存
                        saveAs: true,
                        code: item.executionCode,
                        type: 'historyScript',
                    }, (f) => {
                        if (f) {
                            this.$Message.success('打开成功');
                        }
                    });
                } else {
                    this.$router.push({ path: '/',
                        query: {
                            id: md5Id,
                            taskID: item.taskID,
                            filename: name,
                            filepath: item.scriptPath,
                            saveAs: true,
                            type: 'historyScript',
                            code: item.executionCode,
                        } });
                }
            }
        },
        getColor(item) {
            let color = '';
            if (item.status === 'Inited') {
                color = '#515a6e';
            } else if (item.status === 'Running') {
                color = 'rgb(45, 140, 240)';
            } else {
                color = 'rgba(243, 133, 243, 0.5)';
            }
            return color;
        },
        getClass(item) {
            const color = this.getColor(item);
            return {
                // border: `1px solid ${color}`,
                color,
            };
        },
        getIconClass(script) {
            let logos = this.getSupportModes().filter((item) => {
                return item.rule.test(script.fileName) || item.runType === script.runType;
            });
            if (logos.length > 0) {
                return logos[0].logo;
            } else {
                return 'fi-bi';
            }
        },
        handleItemClick(item) {
            this.$emit('change-job-disabled', false);
            if (!this.lastClick) {
                this.lastClick = item;
                item.isActive = true;
            } else if (this.lastClick !== item) {
                this.lastClick.isActive = false;
                this.lastClick = item;
                item.isActive = true;
            }
        },
        handleItemMenu(ev, item) {
            this.handleItemClick(item);
            this.$refs.contextMenu.open(ev);
        },
        copyInfos() {
            util.executeCopy(JSON.stringify(this.lastClick));
            this.$Message.success('脚本信息已复制到粘贴板，请使用ctrl+v组合键粘贴！');
        },
        checkJobLength(type) {
            const list = this.jobList.filter((item) => item.requestApplicationName === type);
            return list.length;
        },
        openKillModal(type) {
            this.$refs.killModal.open({ type, name: '' });
        },
        kill(type) {
            if (type === '引擎和任务') {
                this.killJobAndEngine();
            } else {
                this.killJob();
            }
        },
    },
};
</script>
