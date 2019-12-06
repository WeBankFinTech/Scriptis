<template>
  <div
    class="login"
    @keyup.enter.stop.prevent="handleSubmit('loginForm')">
    <i class="login-bg"/>
    <div class="login-main">
      <Form
        ref="loginForm"
        :model="loginForm"
        :rules="ruleInline">
        <FormItem>
          <span class="login-title">欢迎登录Scriptis系统！</span>
        </FormItem>
        <FormItem prop="user">
          <Input
            v-model="loginForm.user"
            type="text"
            placeholder="请输入用户名"
            size="large">
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input
            v-model="loginForm.password"
            type="password"
            placeholder="pin+token"
            size="large">
          </Input>
          <Checkbox
            v-model="rememberUserNameAndPass"
            class="remember-user-name"
            style="">记住当前用户</Checkbox>
        </FormItem>
        <FormItem>
          <Button
            :loading="loading"
            type="primary"
            long
            size="large"
            shape="circle"
            @click="handleSubmit('loginForm')">登录</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script>
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import socket from '@js/module/webSocket';
export default {
    data() {
        return {
            loading: false,
            loginForm: {
                user: '',
                password: '',
            },
            ruleInline: {
                user: [
                    { required: true, message: '请输入用户名！', trigger: 'blur' },
                    // {type: 'string', pattern: /^[0-9a-zA-Z\.\-_]{4,16}$/, message: '无效的用户名！', trigger: 'change'},
                ],
                password: [
                    { required: true, message: '请输入pin+token！', trigger: 'blur' },
                    // {type: 'string', pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,18}$/, message: '请输入6至12位的密码', trigger: 'change'},
                ],
            },
            rememberUserNameAndPass: false,
        };
    },
    created() {
        let userNameAndPass = storage.get('saveUserNameAndPass', 'local');
        if (userNameAndPass) {
            this.rememberUserNameAndPass = true;
            this.loginForm.user = userNameAndPass.split('&')[0];
            this.loginForm.password = userNameAndPass.split('&')[1];
        }
    },
    mounted() {
        // 如果有登录状态，且用户手动跳转到login页，则判断登录态是否过期
        const userInfo = storage.get('userInfo');
        if (userInfo) {
            this.getIfLogin();
        }
        socket.methods.close();
    },
    methods: {
        getIfLogin() {
            api.fetch('/application/getBaseInfo', 'get').then((rst) => {
                this.$router.push('/');
            }).catch((err) => {
                this.clearSession();
            });
        },
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    if (!this.rememberUserNameAndPass) {
                        storage.remove('saveUserNameAndPass', 'local');
                    }
                    this.loginForm.user = this.loginForm.user.toLocaleLowerCase();
                    const params = {
                        userName: this.loginForm.user,
                        password: this.loginForm.password,
                    };
                    api
                        .fetch(`/user/login`, params)
                        .then((rst) => {
                            this.loading = false;
                            // 保存用户名
                            if (this.rememberUserNameAndPass) {
                                storage.set('saveUserNameAndPass', `${this.loginForm.user}&${this.loginForm.password}`, 'local');
                            }
                            if (rst) {
                                storage.set('userInfo', {
                                    basic: rst,
                                });
                                this.$router.push('/');
                                this.$Message.success('登录成功！');
                            }
                        })
                        .catch((err) => {
                            if (this.rememberUserNameAndPass) {
                                storage.set('saveUserNameAndPass', `${this.loginForm.user}&${this.loginForm.password}`, 'local');
                            }
                            if (err.message.indexOf('您已经登录，请不要重复登录') !== -1) {
                                this.$router.push('/');
                            }
                            this.loading = false;
                        });
                } else {
                    this.$Message.error('验证未通过！');
                }
            });
        },
        clearSession() {
            storage.clear();
        },
    },
};
</script>
<style lang="scss" src="@assets/styles/login.scss"></style>
