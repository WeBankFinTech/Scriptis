import { weMenu, weMenuItem, weSubMenu } from './menu';
import weNavbar from './navbar';
import weEditor from './editor';
import weTree from './tree';
import { wePanel, wePanelItem } from './panel';

const components = {
    weMenu,
    weMenuItem,
    weSubMenu,
    weNavbar,
    weEditor,
    weTree,
    wePanel,
    wePanelItem,
};
const install = function(Vue) {
    Object.keys(components).forEach((key) => {
        Vue.component(key, components[key]);
    });
};

export default {
    install,
};
