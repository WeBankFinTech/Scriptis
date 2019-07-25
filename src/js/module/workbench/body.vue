<template>
  <div class="workbench-body">
    <scriptView
      v-if="work.type=='workspaceScript' || work.type=='hdfsScript'"
      :work="work"/>
    <historyScriptView
      v-if="work.type=='historyScript'"
      :work="work"/>
    <workflowView
      v-if="work.type=='workflow'"
      :work="work"/>
  </div>
</template>
<script>
import module from './index';
import scriptView from './script/script.vue';
import historyScriptView from './script/historyScript.vue';
import workflowView from './workflow/workflow.vue';
export default {
    components: {
        scriptView,
        historyScriptView,
        workflowView,
    },
    mixins: [module.mixin],
    props: {
        work: Object,
    },
    created() {
    },
    mounted() {
    },
};
</script>
