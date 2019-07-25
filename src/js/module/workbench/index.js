export default {
    name: 'Workbench',
    // 规范模块监测什么事件
    events: ['Workbench:add', 'Workbench:remove', 'Workbench:save', 'Workbench:socket', 'Workbench:openFile', 'Workbench:run', 'Workbench:pasteInEditor', 'Workbench:saveAs', 'Workbench:updateTab', 'Workbench:setResultCache', 'Workbench:setResult', 'Workbench:insertValue', 'Workbench:checkExist', 'Workbench:getWorksLangList', 'Workbench:setEditorPanelSize', 'Workbench:setTabPanelSize'],
    // 规范模块能够触发什么事件
    dispatchs: {
        Workbench: ['remove', 'save', 'saveAs', 'run', 'add', 'setResultCache', 'setResult', 'insertValue', 'openFile', 'checkExist', 'setEditorPanelSize', 'setTabPanelSize'],
        IndexedDB: [
            'appendLog', 'clearLog', 'getLog', 'changeLogKey',
            'updateHistory', 'appendHistory', 'getHistory', 'clearHistory', 'changeHistoryKey',
            'updateResult', 'appendResult', 'getResult', 'clearResult', 'changResultKey',
            'updateProgress', 'clearProgress', 'getProgress', 'changProgressKey',
            'getTabs', 'recordTab', 'toggleTab', 'removeTab', 'changeTabKey',
            'getGlobalCache', 'setGlobalCache', 'updateGlobalCache', 'removeGlobalCache',
            'deleteDb',
        ],
        WebSocket: ['init', 'send'],
        WorkSidebar: ['setHighLight', 'showTree', 'revealInSideBar'],
        HdfsSidebar: ['setHighLight'],
        HiveSidebar: ['getAllDbsAndTables'],
        fnSidebar: ['getAllLoadedFunction'],
        Footer: ['updateRunningJob'],
        GlobalValiable: ['getGlobalVariable'],
    },
    data: {
        API_PATH: process.env.VUE_APP_MN_CONFIG_PREFIX,
    },
    component: () =>
        import('./container.vue'),
    config: {
    },
};
