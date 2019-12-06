<template>
  <div class="workbench workbench-tabs">
    <template v-if="workListLength>0">
      <div
        class="workbench-tab-wrapper"
        :class="{'full-screen': isTopPanelFull}">
        <div class="workbench-tab">
          <template v-for="work in worklist">
            <div
              :key="work.id"
              :class="{active:work.id==current}"
              class="workbench-tab-item"
              v-if="work.isShow">
              <we-title
                :work="work"
                @on-choose="chooseWork"
                @on-remove="removeWork"/>
            </div>
          </template>
        </div>
        <div
          class="workbench-tab-control"
          v-if="isControlBtnShow">
          <Icon
            type="ios-arrow-dropleft-circle"
            @click="tabMoving('right')"></Icon>
          <Icon
            type="ios-arrow-dropright-circle"
            @click="tabMoving('left')"></Icon>
        </div>
        <div class="workbench-tab-button">
          <Dropdown
            trigger="click"
            placement="bottom-end"
            @on-click="dropdownClick">
            <Icon type="md-list" />
            <DropdownMenu slot="list">
              <DropdownItem name="other">关闭其他</DropdownItem>
              <DropdownItem name="all">关闭全部</DropdownItem>
              <DropdownItem name="left">关闭左边</DropdownItem>
              <DropdownItem name="right">关闭右边</DropdownItem>
              <DropdownItem
                name="fullScreen"
                divided
                v-if="!isTopPanelFull">全屏</DropdownItem>
              <DropdownItem
                name="releaseFullScreen"
                v-else>取消全屏</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div class="workbench-container">
        <we-body
          v-for="work in worklist"
          v-show="current==work.id"
          :key="work.id"
          :work="work"/>
      </div>
    </template>
    <template v-if="workListLength == 0 && !loading">
      <div class="bg-page">
        <img
          class="bg-img"
          src="./image/bg-img.png">
        <p
          class="bg-text"
          :class="{weight: line.indexOf('？') !== -1, indent: line.indexOf('？') === -1}"
          v-for="(line, index) in tips.split('\n')"
          :key="index">{{ line }}</p>
      </div>
    </template>
    <template>
      <Spin
        v-if="loading"
        size="large"
        fix/>
    </template>
    <Modal
      v-model="showCloseModal"
      :closable="false"
      width="360">
      <p
        slot="header"
        class="modal-title">
        <Icon type="md-help-circle" />
        <span>关闭提示</span>
      </p>
      <div class="modal-content">
        <p style="word-break: break-all;">{{ closeModal.text }}</p>
      </div>
      <div slot="footer">
        <Button
          type="text"
          @click="closeModal.cancel" >取消</Button>
        <Button
          type="warning"
          @click="closeModal.close">直接关闭</Button>
        <Button
          v-if="closeModal.save"
          type="primary"
          @click="closeModal.save">保存</Button>
        <Button
          v-if="closeModal.saveAs"
          type="primary"
          @click="closeModal.saveAs">另存为</Button>
      </div>
    </Modal>
    <save-as
      ref="saveAs"
      @save-complete="saveAsComplete"/>
  </div>
</template>
<script>
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import module from './index';
import util from '@/js/util';
import title from './title.vue';
import body from './body.vue';
import saveAs from './script/saveAs.vue';
import { Work } from './modal.js';
import _ from 'lodash';

export default {
    components: {
        'we-body': body,
        'we-title': title,
        saveAs,
    },
    mixins: [module.mixin],
    props: {
        width: Number,
    },
    data() {
        return {
            worklist: [],
            current: '',
            closeModal: {
                text: '',
                cancel: function() {},
                close: function() {},
                save: function() {},
                saveAs: function() {},
            },
            showCloseModal: false,
            userName: '',
            tabMove: {
                maxTabLen: 0,
                leftTab: 0,
                rightTab: 0,
            },
            isControlBtnShow: false,
            tips: '什么是Scriptis？\nScriptis是微众银行微数域(WeDataSphere)打造的一站式交互式数据探索分析工具，以任意桥(Linkis)做为内核，提供多种计算存储引擎(如Spark、Hive、TiSpark等)、Hive数据库管理功能、资源(如Yarn资源、服务器资源)管理、应用管理和各种用户资源(如UDF、变量等)管理的能力。\nScriptis？\n1. 选中工作空间的目录，创建文件夹；\n2. 右键某个文件夹 =>新建脚本；\n3. 选择脚本类型，如：SQL、Pyspark、HQL等；\n4. 书写脚本，点击执行，生成结果集。',
            isTopPanelFull: false,
            loading: false,
        };
    },
    computed: {
        workListLength() {
            return this.worklist.length;
        },
    },
    watch: {
        current(val, oldVal) {
            if (oldVal) {
                this.dispatch('Workbench:setResultCache', { id: oldVal });
                this.revealInSidebar();
            }
        },
        '$route': function(val) {
            this.openQueryTab();
        },
    },
    mounted() {
        this.userName = this.getUserName();
        // if (!this.userName) {
        //     return this.$router.push('/login');
        // }
        // isCacheInit 是防止切换用户时触发两次mounted
        const isCacheInit = storage.get('isCacheLoading');
        if (!isCacheInit) {
            this.init();
        }
    },
    methods: {
        init() {
            storage.set('isCacheLoading', true);
            this.loading = true;
            // 获取hive库和表的信息，用于在tab页中的.sql脚本进行关键字联想
            // userName作为去本地数据库查找数据库缓存的key，用于区分不同用户的缓存
            this.dispatch('IndexedDB:getGlobalCache', {
                id: this.userName,
            }, (cache) => {
                if (!cache) {
                    // 调用hive模块的获取hive库和表的接口
                    this.dispatch('HiveSidebar:getAllDbsAndTables', {
                        userName: this.userName,
                    }, (args) => {
                        if (args.isError) {
                            this.$Message.warning('未获取到数据库表信息，脚本联想词功能可能存在异常！可刷新重试！');
                        }
                        this.dispatch('fnSidebar:getAllLoadedFunction', (args2) => {
                            if (args2.isError) {
                                this.$Message.warning('未获取到UDF和方法函数信息，脚本联想词功能可能存在异常！可刷新重试！');
                            }
                            this.dispatch('GlobalValiable:getGlobalVariable', (args3) => {
                                if (args3.isError) {
                                    this.$Message.warning('未获取到全局变量信息，脚本联想词功能可能存在异常！可刷新重试！');
                                }
                                this.dispatch('IndexedDB:setGlobalCache', {
                                    key: this.userName,
                                    hiveList: args.list,
                                    fnList: args2.list,
                                    variableList: args3.list,
                                    tabList: [],
                                });
                                storage.set('isCacheLoading', false);
                            });
                        });
                    });
                    // 在获取到hive信息后再打开缓存的tab页信息
                    this.getWorkList({ list: [] }).then(() => {
                        this.openQueryTab();
                        this.$nextTick(() => {
                            this.loading = false;
                            this.tabMove.maxTabLen = Math.floor(this.width / 100);
                            this.changeTabParams('init');
                        });
                    });
                } else {
                    if (!cache.hiveList || !cache.hiveList.length) {
                        this.dispatch('HiveSidebar:getAllDbsAndTables', {
                            userName: this.userName,
                        }, (args) => {
                            if (args.isError) {
                                this.$Message.warning('未获取到数据库表信息，脚本联想词功能可能存在异常！可刷新重试！');
                            }
                            this.dispatch('IndexedDB:updateGlobalCache', {
                                id: this.userName,
                                hiveList: args.list,
                            });
                            storage.set('isCacheLoading', false);
                        });
                    }
                    if (!cache.variableList || !cache.variableList.length) {
                        this.dispatch('GlobalValiable:getGlobalVariable', (args) => {
                            if (args.isError) {
                                this.$Message.warning('未获取到全局变量信息，脚本联想词功能可能存在异常！可刷新重试！');
                            }
                            this.dispatch('IndexedDB:updateGlobalCache', {
                                id: this.userName,
                                variableList: args.list,
                            });
                            storage.set('isCacheLoading', false);
                        });
                    }
                    if (!cache.fnList || !cache.fnList.length) {
                        this.dispatch('fnSidebar:getAllLoadedFunction', (args) => {
                            if (args.isError) {
                                this.$Message.warning('未获取到UDF和方法函数信息，脚本联想词功能可能存在异常！可刷新重试！');
                            }
                            this.dispatch('IndexedDB:updateGlobalCache', {
                                id: this.userName,
                                fnList: args.list,
                            });
                            storage.set('isCacheLoading', false);
                        });
                    } else {
                        storage.set('isCacheLoading', false);
                    }
                    // 这种情况适用于初始化系统是/consle，然后打开全局历史的查看
                    // 必须打开缓存的tab后再打开从全局历史传递来的query，否在无法被选中
                    this.getWorkList({ list: cache.tabList }).then(() => {
                        this.openQueryTab();
                        this.$nextTick(() => {
                            this.loading = false;
                            const innerWidth = this.width || this.getInnerWidth();
                            this.tabMove.maxTabLen = Math.floor(innerWidth / 100);
                            this.changeTabParams('init');
                        });
                    });
                }
            });
        },
        getWorkList({ list }) {
            return new Promise((resolve, reject) => {
                this.dispatch('IndexedDB:getTabs', (worklist) => {
                    worklist.forEach((work) => {
                        const isIn = list.indexOf(work.data.id);
                        const methodName = 'Workbench:add';
                        if (isIn !== -1) {
                            this[methodName]({
                                id: work.data.id,
                                filename: work.filename,
                                filepath: work.filepath,
                                code: work.data.data,
                                type: work.type,
                                data: work.data,
                                saveAs: work.saveAs,
                            });
                        }
                    });
                    resolve();
                });
            });
        },
        /**
         * 监听 Workbench:add 事件，触发往worklist塞work的逻辑
         * @param {Work} option
         * @param {Funcion} cb
         * @return {Notice}
         */
        'Workbench:add'(option, cb) {
            if (!option.id || !option.filename) {
                this.$Notice.close('developerWarning');
                return this.$Notice.error({
                    title: '警告',
                    desc: '开发者警告：调用add接口必须传入id和filename！',
                    name: 'developerWarning',
                    duration: 3,
                });
            }
            const supportedMode = _.find(this.getSupportModes(), (p) => p.rule.test(option.filename) && p.isCanBeOpen);
            if (!supportedMode) {
                this.$Notice.close('unSupport');
                return this.$Notice.warning({
                    title: '警告',
                    desc: '很抱歉，系统暂不支持打开该格式文件！',
                    name: 'unSupport',
                    duration: 3,
                });
            }
            // 如果已经在tabs中，则打开
            let repeatWork = _.find(this.worklist, (work) => work.id == option.id);
            let work = null;
            if (!repeatWork) {
                if (this.worklist.length >= 10) {
                    this.$Notice.close('boyondQuota');
                    cb && cb(false);
                    return this.$Notice.warning({
                        title: '警告',
                        desc: '您打开的脚本已超出10个，请关闭其他脚本再打开！',
                        name: 'boyondQuota',
                        duration: 3,
                    });
                }
                work = new Work(option);
                this.worklist.push(work);
                repeatWork = work;
                setTimeout(() => {
                    this.dispatch('Workbench:save', work);
                }, 500);
            }
            this.chooseWork(repeatWork);
            cb && cb(true);
        },
        'Workbench:checkExist'(option, cb) {
            api.fetch('/filesystem/isExist', {
                path: option.path,
            }, 'get').then((rst) => {
                // 如果文件已存在，则返回false
                if (rst.isExist) {
                    cb(true);
                } else {
                    cb(false);
                }
            });
        },
        'Workbench:openFile'(option, cb) {
            const filename = option.filename.slice(option.filename.indexOf('/') + 1, option.filename.length);
            const supportedMode = _.find(this.getSupportModes(), (p) => p.rule.test(filename) && p.isCanBeOpen);
            if (!supportedMode) {
                this.$Notice.close('unSupport');
                return this.$Notice.warning({
                    title: '警告',
                    desc: '很抱歉，系统暂不支持打开该格式文件！',
                    name: 'unSupport',
                    duration: 3,
                });
            }
            const md5Path = util.md5(option.path);
            const methodName = 'Workbench:add';
            api.fetch('/filesystem/openFile', {
                path: option.path,
            }, 'get').then((rst) => {
                const ismodifyByOldTab = option.code && !rst.fileContent;
                const params = ismodifyByOldTab ? option.params : this.formatParams(rst.params);
                this[methodName]({
                    id: md5Path,
                    filename: option.filename,
                    filepath: option.path,
                    code: rst.fileContent || option.code,
                    params,
                    type: option.type,
                    saveAs: option.saveAs || false,
                    unsave: ismodifyByOldTab,
                    ismodifyByOldTab,
                }, (f) => {
                    this.changeTabParams('change');
                    cb(rst);
                });
            });
        },
        async 'Workbench:remove'(path, cb) {
            const md5Path = util.md5(path);
            const findWork = _.find(this.worklist, (work) => {
                return work.id === md5Path;
            });
            if (!findWork) {
                let num = 0;
                const needForClose = [];
                /**
                 * 这里是针对层级比较深的情况，删除文件夹
                 * 不能边循环边remove，也无法使用Promise.all，因为循环很快
                 * 所以只能循环两次
                 */
                this.worklist.forEach((work) => {
                    if (work.filepath.indexOf(path) === 0) {
                        num++;
                        if (work.unsave) {
                            work.saveAs = true;
                        }
                        needForClose.push(work);
                    }
                });
                if (!num) {
                    cb('none');
                } else {
                    for (const work of needForClose) {
                        await this.removeWork(work);
                    }
                    cb('save');
                }
            } else if (findWork.unsave) {
                cb('unsave');
            } else {
                this.removeWork(findWork);
                cb('save');
            }
        },
        'Workbench:saveAs'(work) {
            this.$refs.saveAs.open(work);
        },
        'Workbench:updateTab'({ newNode, findWork, oldLabel }, cb) {
            const work = findWork || _.find(this.worklist, (work) => {
                return work.filename === oldLabel;
            });
            if (work) {
                const newKey = util.md5(newNode.path);
                const modifyLog = this.dispatch('IndexedDB:changeLogKey', { oldKey: work.id, newKey });
                const modifyHistory = this.dispatch('IndexedDB:changeHistoryKey', { oldKey: work.id, newKey });
                const modifyResult = this.dispatch('IndexedDB:changResultKey', { oldKey: work.id, newKey });
                const modifyProgress = this.dispatch('IndexedDB:changProgressKey', { oldKey: work.id, newKey });
                const modifyTab = this.dispatch('IndexedDB:changeTabKey', { oldKey: work.id, newKey });
                Promise.all([modifyLog, modifyHistory, modifyResult, modifyProgress, modifyTab]).then(() => {
                    setTimeout(() => {
                        // 在重命名成功后重新打开tab；
                        // 之前的逻辑是直接修改tab上的名称，并更新indexDb，会引发一个bug
                        // 就是在修改完成后没有无法修改work的id，然后可以再次打开一个同名的tab。
                        work.unsave = false;
                        this.$Modal.remove();
                        this.removeWork(work);
                        const methodName = 'Workbench:openFile';
                        this[methodName]({
                            path: newNode.path,
                            filename: newNode.name,
                            saveAs: false,
                            code: findWork.data.data || '',
                            params: findWork.data.params,
                        }, () => {
                            if (cb) {
                                cb();
                            }
                            setTimeout(() => {
                                this.dispatch('Workbench:save', this.worklist[this.worklist.length - 1]);
                            }, 500);
                        });
                    }, 300);
                });
            }
        },
        'Workbench:pasteInEditor'(value) {
            const work = _.find(this.worklist, (work) => work.id === this.current);
            if (!work) return this.$Message.warning('未选中脚本，请选择一个脚本再试！');
            this.dispatch('Workbench:insertValue', {
                id: this.current,
                value,
            });
        },
        // 用于获取当前打开的脚本里面有几种语言
        'Workbench:getWorksLangList'(cb) {
            const workLangList = _.uniq(this.worklist.map((item) => item.data.lang));
            cb(workLangList);
        },
        'Workbench:setTabPanelSize'() {
            this.isTopPanelFull = false;
        },
        /**
         * 选中一个tab项
         * @param {Work} work
         */
        chooseWork(work) {
            if (work) {
                const type = work.type;
                // 选中work的时候先高亮work所属的模块树，然后去清楚翻转过来的另一块文件树；
                // 由于模块间是使用v-if去切换的，所以会触发不到invert后的模块高亮请求
                this.dispatch(this.getMethodName({
                    type,
                    isInvert: false,
                }), work);
                this.dispatch(this.getMethodName({
                    type,
                    isInvert: true,
                }), '');
                this.current = work.id;
                this.dispatch('IndexedDB:toggleTab', work.id);
                this.dispatch('Workbench:setParseAction', work.id);
                this.panelControl(this.isTopPanelFull ? 'fullScreen' : 'releaseFullScreen');
            }
        },
        /**
         * 从worklist列表中移除work，对外抛出'Workbench:remove'事件。
         * 如果work修改过未保存，则提示保存；如果saveAs是true，则提示另存。
         * @param {Work} work
         * @return {Promise}
         */
        removeWork(work) {
            return new Promise((resolve, reject) => {
                let doRemove = () => {
                    let index = this.worklist.indexOf(work);
                    if (index != -1) {
                        this.worklist.splice(index, 1);
                        this.dispatch('IndexedDB:removeTab', work.id);
                        this.dispatch('IndexedDB:removeGlobalCache', {
                            id: this.userName,
                            tabId: work.id,
                        });
                        this.changeTabParams('change');
                    }
                    if (work.id == this.current) {
                        if (this.workListLength > 0) {
                            this.current = this.worklist[0].id;
                            const type = this.worklist[0].type;
                            // 先设置当前脚本高亮
                            this.dispatch(this.getMethodName({
                                type,
                                isInvert: false,
                            }), this.worklist[0]);
                            /**
                             * 清空另外一个模块的高亮，这里和上一次调用时互斥的
                             * 因为不知道是工作空间还是HDFS处于打开状态，所以两次操作只执行用户看到的模块
                             * 即设置或者清除当前用户能看到的模块高亮
                             */
                            this.dispatch(this.getMethodName({
                                type,
                                isInvert: true,
                            }), '');
                            this.dispatch('IndexedDB:toggleTab', this.current);
                        } else {
                            this.isTopPanelFull = false;
                            this.current = '';
                            this.dispatch('WorkSidebar:setHighLight', '');
                            this.dispatch('HdfsSidebar:setHighLight', '');
                        }
                    }
                    // 清空从全局历史转过来的脚本时，切换路由到/，否则刷新界面的时候会被一直打开
                    if (work.id === this.$route.query.id) {
                        this.$router.push('/');
                    }
                    resolve();
                };
                if (work.unsave) {
                    this.chooseWork(work);
                    this.showCloseModal = true;
                    // eslint-disable-next-line no-unused-expressions
                    this.closeModal.cancel = () => {
                        this.showCloseModal = false;
                        this.close = function() {};
                        this.save = function() {};
                        this.saveAs = function() {};
                        resolve();
                    };
                    this.closeModal.close = () => {
                        this.showCloseModal = false;
                        doRemove();
                    };
                    if (!work.saveAs) {
                        this.closeModal.text = `脚本 ${work.filename} 已发生改变，是否保存？`;
                        this.closeModal.save = () => {
                            this.showCloseModal = false;
                            this.dispatch('Workbench:save', work);
                            doRemove();
                        };
                        this.closeModal.saveAs = null;
                    } else {
                        const scriptText = work.type === 'hdfsScript' ? `只读脚本 ${work.filename} 已发生改变，是否另存至工作空间？` : `临时脚本 ${work.filename} 已发生改变，是否另存为文件？`;
                        this.closeModal.text = scriptText;
                        this.closeModal.save = null;
                        this.closeModal.saveAs = () => {
                            this.dispatch('Workbench:saveAs', work);
                        };
                    }
                } else {
                    doRemove();
                }
            });
        },
        /**
         * 按照类型关闭tab
         *  @param {String} name
         */
        async closeTabs(name) {
            let needCloseTabs = [];
            switch (name) {
                case 'other':
                    this.worklist.forEach((work) => {
                        if (work.id != this.current) {
                            needCloseTabs.push(work);
                        }
                    });
                    break;
                case 'all':
                    needCloseTabs = this.worklist.slice(0);
                    break;
                case 'left':
                    for (let i = 0; i < this.workListLength; i++) {
                        if (this.worklist[i].id != this.current) {
                            needCloseTabs.push(this.worklist[i]);
                        } else {
                            break;
                        }
                    }
                    break;
                case 'right':
                    for (let i = this.workListLength - 1; i > 0; i--) {
                        if (this.worklist[i].id != this.current) {
                            needCloseTabs.push(this.worklist[i]);
                        } else {
                            break;
                        }
                    }
                    break;
            }
            for (const work of needCloseTabs) {
                await this.removeWork(work);
            }
        },

        saveAsComplete(isNew, node) {
            const findWork = this.worklist.find((work) => work.id === this.current);
            // 如果是通过关闭模态框打开的，要关闭模态框
            this.closeModal.close();
            const methodName = 'Workbench:updateTab';
            this[methodName]({
                newNode: node,
                findWork,
                oldLabel: null,
            });
        },

        // 打开route.query传过来的tab页
        openQueryTab() {
            const isHistoryIn = !_.isEmpty(this.$route.query) && this.$route.query.id;
            if (this.$route.name === 'Home' && isHistoryIn) {
                const methodName = 'Workbench:add';
                this[methodName](this.$route.query);
                this.$nextTick(() => {
                    const findWork = _.find(this.workList, (item) => {
                        return item.taskID === this.$route.query.taskID;
                    });
                    this.chooseWork(findWork);
                });
            }
        },

        // 获取高亮的方法名
        getMethodName(args) {
            let { type, isInvert } = args;
            const lib = {
                workspaceScript: 'WorkSidebar:setHighLight',
                hdfsScript: 'HdfsSidebar:setHighLight',
            };
            if (isInvert) {
                type = type === 'workspaceScript' ? 'hdfsScript' : 'workspaceScript';
            }
            return lib[type];
        },

        formatParams(params) {
            const trans = (obj) => {
                const arr = [];
                _.forIn(obj, (value, key) => {
                    arr.push({
                        key,
                        value,
                    });
                });
                return arr;
            };
            const variable = trans(params.variable);
            const configuration = {};
            _.keys(params.configuration).forEach((key, index) => {
                configuration[key] = trans(params.configuration[key]);
            });
            return {
                variable,
                configuration,
            };
        },

        changeTabParams(type) {
            if (this.workListLength > this.tabMove.maxTabLen) {
                if (type === 'init') {
                    this.tabMove.rightTab = this.workListLength - this.tabMove.maxTabLen;
                    this.tabMove.leftTab = 0;
                } else {
                    this.tabMove.leftTab = this.workListLength - this.tabMove.maxTabLen;
                    this.tabMove.rightTab = 0;
                }
                this.handleTabShowOrHidden();
                this.isControlBtnShow = true;
            } else {
                this.tabMove.leftTab = 0;
                this.tabMove.rightTab = 0;
                this.isControlBtnShow = false;
                if (type !== 'init') {
                    this.handleTabShowOrHidden();
                }
            }
        },

        tabMoving(type) {
            if (type === 'right' && this.tabMove.leftTab >= 1) {
                this.tabMove.leftTab -= 1;
                this.tabMove.rightTab += 1;
            } else if (type === 'left' && this.tabMove.rightTab >= 1) {
                this.tabMove.leftTab += 1;
                this.tabMove.rightTab -= 1;
            }
            this.handleTabShowOrHidden();
        },

        handleTabShowOrHidden() {
            this.worklist.forEach((o, index) => {
                if (this.tabMove.leftTab > 0 && index <= this.tabMove.leftTab - 1) {
                    o.isShow = false;
                } else if (this.tabMove.rightTab > 0 && index > this.workListLength - this.tabMove.rightTab - 1) {
                    o.isShow = false;
                } else {
                    o.isShow = true; ;
                }
            });
        },
        getInnerWidth() {
            const el = document.getElementsByClassName('workbench workbench-tabs')[0];
            return el.offsetWidth;
        },
        panelControl(name) {
            if (name === 'fullScreen') {
                this.isTopPanelFull = true;
            } else {
                this.isTopPanelFull = false;
            }
            this.dispatch('Workbench:setEditorPanelSize', {
                id: this.current,
                status: name,
            });
        },
        dropdownClick(name) {
            const closeMenuList = ['fullScreen', 'releaseFullScreen'];
            if (closeMenuList.indexOf(name) === -1) {
                this.closeTabs(name);
            } else {
                this.panelControl(name);
            }
        },
        revealInSidebar(work) {
            let currentWork = work || this.worklist.find((item) => item.id === this.current);
            if (currentWork) {
                this.dispatch('WorkSidebar:revealInSideBar', currentWork);
            }
        },
    },
};
</script>
<style src="./index.scss" lang="scss"></style>
