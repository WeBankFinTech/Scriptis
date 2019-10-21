import storage from '@/js/helper/storage';

export default{
    data: function() {
        return {
            SUPPORTED_LANG_MODES: Object.freeze([
                { rule: /\.(bi)$/i, executable: false, logo: 'fi-bi', isCanBeNew: false, isCanBeOpen: true },
                { rule: /\.(sql)$/i, lang: 'hql', executable: true, application: 'spark', runType: 'sql', ext: '.sql', scriptType: 'hive', abbr: 'sql', logo: 'fi-spark', isCanBeNew: true, label: 'Sql', isCanBeOpen: true },
                { rule: /\.(hql)$/i, lang: 'hql', executable: true, application: 'hive', runType: 'hql', ext: '.hql', scriptType: 'hql', abbr: 'hql', logo: 'fi-hive', isCanBeNew: true, label: 'Hive', isCanBeOpen: true },
                { rule: /\.(mlsql)$/i, lang: 'hql', executable: true, application: 'mlsql', runType: 'mlsql', ext: '.mlsql', scriptType: 'mlsql', abbr: 'mlsql', logo: 'fi-spark', isCanBeNew: true, label: 'MLSQL', isCanBeOpen: true },
                { rule: /\.(out)$/i, lang: 'hql', executable: true, application: 'pipeline', runType: 'pipeline', ext: '.out', scriptType: 'storage', abbr: 'stor', logo: 'fi-storage', isCanBeNew: true, label: 'Storage', isCanBeOpen: true },
                { rule: /\.scala$/i, lang: 'java', executable: true, application: 'spark', runType: 'scala', ext: '.scala', scriptType: 'scala', abbr: 'scala', logo: 'fi-scala', isCanBeNew: true, label: 'Scala', isCanBeOpen: true },
                { rule: /\.jdbc$/i, lang: 'hql', executable: true, application: 'jdbc', runType: 'jdbc', ext: '.jdbc', scriptType: 'jdbc', abbr: 'jdbc', logo: 'fi-jdbc', isCanBeNew: true, label: 'JDBC', isCanBeOpen: true },
                { rule: /\.python$/i, lang: 'python', executable: true, application: 'python', runType: 'python', ext: '.python', scriptType: 'python', abbr: 'py', logo: 'fi-python', isCanBeNew: true, label: 'Python', isCanBeOpen: true },
                { rule: /\.py$/i, lang: 'python', executable: true, application: 'spark', runType: 'python', ext: '.py', scriptType: 'pythonSpark', abbr: 'py', logo: 'fi-spark-python', isCanBeNew: true, label: 'PythonSpark', isCanBeOpen: true },
                { rule: /\.r$/i, lang: 'r', executable: true, application: 'spark', runType: 'r', ext: '.r', scriptType: 'r', abbr: 'r', logo: 'fi-r', isCanBeNew: true, label: 'R', isCanBeOpen: true },
                { rule: /\.txt$/i, lang: 'text', executable: false, application: null, runType: null, ext: '.txt', scriptType: 'txt', abbr: '', logo: 'fi-txt', isCanBeNew: false, isCanBeOpen: true },
                { rule: /\.log$/i, lang: 'text', executable: false, application: null, runType: null, ext: '.log', scriptType: 'txt', abbr: '', logo: 'fi-log', isCanBeNew: false, isCanBeOpen: true },
                { rule: /\.xls$/i, logo: 'fi-xls', isCanBeNew: false, isCanBeOpen: false },
                { rule: /\.xlsx$/i, logo: 'fi-xlsx', isCanBeNew: false, isCanBeOpen: false },
                { rule: /\.csv$/i, logo: 'fi-csv', isCanBeNew: false, isCanBeOpen: false },
                { rule: /\.jar$/i, logo: 'fi-jar', isCanBeNew: false, isCanBeOpen: false },
            ]),
        };
    },
    created: function() {},
    mounted: function() {},
    beforeDestroy: function() {},
    destroyed: function() {},
    methods: {
        getUserName() {
            const userInfo = storage.get('userInfo', 'SESSION');
            return userInfo && userInfo.basic.userName;
        },
        getFAQUrl() {
            const baseInfo = storage.get('baseInfo');
            const url = baseInfo.DWSParams.faq;
            return url;
        },
        getSupportModes() {
            return this.SUPPORTED_LANG_MODES;
        },
        getLogManager() {
            const baseInfo = storage.get('baseInfo');
            if (!baseInfo.userInfo.role || !baseInfo.userInfo.role[0]) {
                return false;
            }
            const findRole = baseInfo.userInfo.role.find((role) => role.name === 'logAdmin');
            return !!findRole;
        },
    },
};
