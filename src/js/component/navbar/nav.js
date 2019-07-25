/**
 * 任务
 */
class Nav {
    /**
     * 构造器
     * @param {*} option 
     */
    constructor(option) {
        // 侧边栏type
        this.barType = option.barType;
        // 显示nav icon list
        this.navList = option.navList;
    }
    /**
     * @param {*} type
     * @return {boolean}
     * @memberof Nav
     */
    isShowNav(type) {
        return this.navList.indexOf(type) !== -1;
    }
}

export default Nav;
