<template>
  <div>
    <Index/>
  </div>
</template>
<script>
export default{
    components: {
        index: () => import('./index.vue'),
    },
};
</script>
