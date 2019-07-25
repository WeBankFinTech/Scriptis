<template>
  <div class="console-page">
    <!-- <div class="ad ad-top">广告位</div> -->
    <div class="console-page-content">
      <div class="console-page-content-head">
        <div>
          <span class="console-page-content-title">管理台</span>
          <span class="console-page-content-info">13条新消息</span>
        </div>
      </div>
      <div class="console-page-content-body">
        <div class="content-body-side-nav">
          <Card
            v-for="(card, index) in sideNavList"
            :key="index"
            :padding="card.padding"
            :title="card.name"
            :icon="card.icon"
            shadow
            class="content-body-card">
            <CellGroup
              @on-click="handleCellClick">
              <Cell
                v-for="(item, index2) in card.children"
                :key="index2"
                :title="item.name"
                :name="item.key"/>
            </CellGroup>
          </Card>
        </div>
        <div
          v-if="activedCell"
          class="content-body-side-right">
          <div class="content-body-side-right-title">
            <Breadcrumb>
              <BreadcrumbItem to="/console">{{ activedCellParent.name }}</BreadcrumbItem>
              <BreadcrumbItem>{{ activedCell.name }}</BreadcrumbItem>
            </Breadcrumb>
          </div>
          <div
            class="content-body-side-right-content"
            :style="{'height': contentHeight + 'px'}">
            <global-history
              v-if="activedCell.key==='1-1'"
              :height="contentHeight"/>
            <resource
              v-if="activedCell.key==='1-2'"
              :height="contentHeight"/>
            <setting
              v-if="activedCell.key==='1-3'"
              :height="contentHeight"/>
            <global-valiable
              v-if="activedCell.key==='1-4'"
              :height="contentHeight"/>
            <div
              v-if="activedCell.key==='1-5'"
              style="display: flex; justify-content: center; align-items: center;"
              :style="{'height': contentHeight + 'px'}">
              请在跳转页面查看……
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="ad-bottom">
      <div class="ad ad-bottom-div">广告位</div>
      <div class="ad ad-bottom-div">广告位</div>
    </div> -->
  </div>
</template>
<script>
import globalHistoryModule from '@js/module/globalHistory';
import resourceModule from '@js/module/resource';
import settingModule from '@js/module/setting';
import globalValiableModule from '@js/module/globalValiable';
export default {
    components: {
        globalHistory: globalHistoryModule.component,
        resource: resourceModule.component.resource,
        setting: settingModule.component,
        globalValiable: globalValiableModule.component,
    },
    data() {
        return {
            sideNavList: [{
                key: '1',
                name: '常用功能',
                padding: 0,
                icon: 'ios-options',
                children: [
                    { key: '1-1', name: '全局历史' },
                    { key: '1-2', name: '资源管理器' },
                    { key: '1-3', name: '设置' },
                    { key: '1-4', name: '全局变量' },
                    { key: '1-5', name: '常见问题' },
                ],
            }],
            activedCellParent: null,
            activedCell: null,
            contentHeight: 0,
        };
    },
    created() {
    },
    mounted() {
        this.handleCellClick('1-1');
        this.resize(window.innerHeight);
        // 监听窗口变化，获取浏览器宽高
        window.addEventListener('resize', () => {
            this.resize(window.innerHeight);
        });
    },
    methods: {
        handleCellClick(index) {
            this.activedCellParent = this.sideNavList[index.slice(0, 1) - 1];
            this.activedCell = this.activedCellParent.children.find((item) => item.key === index);
            if (index == '1-5') {
                const newTab = window.open('about:blank');
                setTimeout(() => {
                    newTab.location.href = this.getFAQUrl();
                }, 500);
            }
        },
        // 设置宽高
        resize(h) {
            this.contentHeight = h - 230;
        },
    },
};
</script>
<style lang="scss" src="@assets/styles/console.scss"></style>
