<template>
  <div>
    Module {{ name }}
    <we-table
      :data="data"
      :width="1000"
      :height="300"
      :size="150"
      :variable="getVarW"/>
  </div>
</template>
<script>
// import Module from './index';
import WeTable from '@js/component/table';
export default {
    // mixins: [Module.mixin],
    components: {
        WeTable,
    },
    data() {
        return {
            name: 'A',
            data: {
                bodyRows: [],
                headRows: [],
            },
            cache: [],
        };
    },
    created() {
        this.updateData();
    },
    mounted() {
        console.log(this);
        // 多结果集测试
        // setTimeout(() => {
        //     this.updateData();
        //     console.log(this.cache);
        // }, 10000);
    },
    methods: {
        updateData() {
            let bodyRows = [];
            let headRows = [];
            for (let i = 0; i < 1000; i++) {
                let random = Math.ceil(Math.random() * 50);
                let str = '';
                for (let i = 0; i < random; i++) {
                    str += 'k';
                }
                headRows.push({ content: i + str, sortable: true });
            }
            for (let i = 0; i < 200; i++) {
                bodyRows[i] = [];
                for (let j = 0; j < 1000; j++) {
                    bodyRows[i].push(j);
                }
            }
            this.cache = this.createCache(headRows);
            this.data.bodyRows = bodyRows;
            this.data.headRows = headRows;
        },
        createCache(headRows) {
            let div = document.createElement('div');
            document.body.appendChild(div);
            div.style.paddingLeft = '20px';
            div.style.paddingRight = '54px';
            div.style.position = 'absolute';
            div.style.position = 'absolute';
            let cache = [];
            for (let i = 0; i < headRows.length; i++) {
                div.innerHTML = headRows[i].content;
                let rect = div.getBoundingClientRect();
                let width = rect.right - rect.left;
                cache.push(Math.ceil(width));
            }
            document.body.removeChild(div);
            return cache;
        },
        getVarW(index) {
            return this.cache[index];
        },
    },
};
</script>
