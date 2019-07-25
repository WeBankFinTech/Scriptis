<template>
  <div class="editor-setting">
    <div class="editor-setting-header">
      <span>配置</span>
      <Icon
        type="ios-close"
        @click="$emit('setting-close')"/>
    </div>
    <Form
      ref="paramForm"
      label-position="top"
      :model="script.params"
      class="editor-setting-content">
      <FormItem
        v-for="(item, index) in script.params.variable"
        :key="index"
        :label="'自定义参数' + (index + 1)">
        <Row>
          <Col span="10">
          <!-- 这里必须和上面的model挂钩，prop是以model为基础的路径
          例如第一个key的实际路径是script.params.variable[0].key，他的prop就是'variable.' + index + '.key'
          当一个FormItem里面有两个需要验证表单元素时，每一个子表单元素需要用FormItem包着
          且prop和rules需要写在子FormItem上，rules可以是object或array -->
          <FormItem
            :prop="'variable.' + index + '.key'"
            :rules="[{required: true,message: `参数${index+1}的key为空`,trigger: 'blur'},{min: 1, max: 128, message: '长度超过128字符', trigger: 'change'},{type: 'string', pattern: /^[a-zA-z][^\s\u4e00-\u9fa5]*$/, message: '仅支持以字母开头，且不得存在空格和中文', trigger: 'change'},{validator:validateKey,trigger: 'blur'}]">
            <Input
              v-model="item.key"
              type="text"
              placeholder="请输入参数"></Input>
          </FormItem>
          </Col>
          <Col
            span="2"
            class="tc">
          =
          </Col>
          <Col span="10">
          <FormItem
            :prop="'variable.' + index + '.value'"
            :rules="[{required: true, message: `参数${index+1}的value为空`, trigger: 'blur'},{min: 1, max: 128, message: '长度超过128字符', trigger: 'change'}]">
            <Input
              v-model="item.value"
              type="text"
              placeholder="请输入值"></Input>
          </FormItem>
          </Col>
          <Col
            span="2"
            class="tc">
          <Icon
            type="ios-close"
            class="editor-setting-close"
            @click.native="handleDelete(index)"></Icon>
          </Col>
        </Row>
      </FormItem>
      <FormItem>
        <Row>
          <Col span="12">
          <Button
            type="dashed"
            long
            icon="md-add"
            @click="handleAdd">增加参数</Button>
          </Col>
        </Row>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import _ from 'lodash';
export default {
    name: 'Setting',
    props: {
        work: {
            type: Object,
            required: true,
        },
        script: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            origin: null,
            validateKey: (rule, value, callback) => {
                const prop = rule.field;
                // 拿到当前编辑的item的index
                const current = prop.slice(prop.indexOf('.') + 1, prop.lastIndexOf('.'));
                // 必须当key相等，而且index不等的时候才是repeat
                const findRepeat = this.script.params.variable.find((item, index) => {
                    return item.key === value && current != index;
                });
                if (findRepeat) {
                    callback(new Error('存在同名key'));
                }
                callback();
            },
        };
    },
    watch: {
        'script.params': {
            handler: function(val) {
                this.work.unsave = !_.isEqual(JSON.parse(this.origin), val);
            },
            deep: true,
        },
    },
    mounted() {
        this.origin = JSON.stringify(this.script.params);
    },
    methods: {
        handleAdd() {
            if (this.script.params.variable.length) {
                this.$refs.paramForm.validate((valid) => {
                    if (valid) {
                        this.script.params.variable.push({
                            key: '',
                            value: '',
                        });
                    } else {
                        this.$Message.warning('验证项未通过，请检查后再试！');
                    }
                });
            } else {
                this.script.params.variable.push({
                    key: '',
                    value: '',
                });
            }
        },
        handleDelete(index) {
            this.script.params.variable.splice(index, 1);
        },
    },
};
</script>
