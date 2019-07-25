<template>
  <div 
    class="list-view" 
    ref="list">
    <vue-scroll 
      :ops="ops" 
      @handle-scroll="handleScroll">
      <list-body 
        ref="body"
        :cache="cache"
        :item-size-getter="itemSizeGetter"
        :estimated-item-size="30"  
        :data="data">
        <div 
          slot-scope="{col, index}">
          <div
            v-for="(content, contentIndex) in col"
            :title="content || contentIndex"
            :key="contentIndex"
            class="we-column-item">
            {{ content }}
          </div>
        </div>
      </list-body>
    </vue-scroll>
  </div>
</template>
<script>
import listBody from './body.vue';
import vueScroll from 'vuescroll';
export default {
    components: {
        vueScroll,
        listBody,
    },
    props: {
        cache: {
            type: Object,
            default: () => {
                return {};
            },
        },
        data: {
            type: Array,
            required: true,
        },

        estimatedItemSize: {
            type: Number,
            default: 30,
        },

        itemSizeGetter: {
            type: Function,
        },
    },

    data() {
        return {
            ops: {
                bar: {
                    background: '#5e9de0',
                    keepShow: true,
                    minSize: 0.05,
                },
                rail: {
                    size: '10px',
                    opacity: 1,
                    background: '#fff',
                },
                scrollButton: {
                    enable: true,
                    background: '#cecece',
                },
            },
        };
    },
    methods: {
        handleScroll(v, h) {
            this.$emit('on-scroll', { v, h });
            this.$refs.body.handleScroll(v, h);
        },
    },
};
</script>
