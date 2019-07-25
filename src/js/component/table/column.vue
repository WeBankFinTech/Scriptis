<template>
  <div
    class="we-column">
    <div
      v-for="(content, contentIndex) in cols"
      :title="content || contentIndex"
      :key="contentIndex"
      :class="classes(content, contentIndex)"
      class="sub-item">
      {{ content }}
    </div>
  </div>
</template>
<script>
export default {
    name: 'WeColumn',
    props: {
        cols: Array
    },
    methods: {
        classes (content, index) {
            let classes = 'we-column-item'
            if (index % 2 === 0) {
                classes += ' even'
            } else {
                classes += ' odd'
            }
            if (content === 'NULL') {
                classes += ' is-null'
            }
            return classes
        }
    }
}
</script>
<style lang="scss" src="./index.scss"></style>
