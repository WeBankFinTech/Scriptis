<template>
  <div>
    <template-list 
      :item-size-getter="itemSizeGetter"
      :estimated-item-size="30"  
      :data="data"></template-list>
  </div>
</template>
<script>
import vuescroll from 'vuescroll';
import templateList from './list.vue';
export default {
    components: {
        vueScroll: vuescroll,
        templateList,
    },
    data() {
        let data = [];
        for (let i = 0; i < 5; i++) { // 500行
            data[i] = [];
            for (let j = 0; j < 1000; j++) { // 1000列
                data[i].push('col' + j);
            }
        }
        data = this.revert(data);
        return {
            data,
        };
    },
    created() {
        
    },
    mounted() {
    
    },
    methods: {
        itemSizeGetter(item) {
            return 30 + Math.random() * 1000;
        },
        revert(data) {
            let newData = [];
            let firstRowLen = data[0] ? data[0].length : 0;
            for (let i = 0; i < firstRowLen; i++) {
                newData[i] = [];
                for (let j = 0; j < data.length; j++) {
                    newData[i][j] = data[j][i];
                }
            }
            return newData;
        },
    },
};
</script>
