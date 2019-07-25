## 目录结构
```
app
├── assets  
│   ├── iconfont    // 字体文件，图标
│   ├── images      // views用到的图片
│   └── styles      // 样式
│       ├── variables.scss      // 定义样式变量，保证页面的统一风格
│       ├── iconfont.scss        // 图标样式
│       ├── app.scss             // 整理布局、公共样式
│       └── xxx.scss             // 路由(views目录下)页面的样式
├── js
│   ├── component   // 组件：不能包含业务逻辑
│   │   ├── index.js             // 组件库入口，插件化写法，组件命令为we-xxx
│   │   └── xxx                  // 组件xxx
│   │       ├── index.js             // 组件xxx的入口文件
│   │       ├── index.vue            // 组件xxx的vue文件
│   │       └── index.scss           // 组件xxx的样式，需@import(variables.scss)
│   ├── helper      // 类似工具函数，跟业务逻辑没啥关系，比工具函数大一点
│   ├── module      // 模块
│   │   ├── index.js             // 模块入口文件
│   │   ├── moduleMixin.js       // 模块配置文件处理、模块间通讯核心逻辑
│   │   └── xxx                  // 模块xxx
│   │       ├── index.js             // 模块xxx的配置
│   │       ├── index.vue            // 模块xxx的vue文件
│   │       └── index.scss           // 模块xxx的样式，需@import(variables.scss)
│   ├── service     // 服务
│   │   ├── db                   // 包含各种写IndexDB的逻辑
│   │   ├── api.js               // 访问接口的ajax封装
│   │   ├── mixin.js             // 全局的mixin
│   │   ├── router.js            // 路由配置
│   │   └── router.js            // socket封装
│   ├── utils       // 工具函数
│   ├── view        // 页面视图
│   │   ├── app.vue              // 根路由视图
│   │   ├── layout.vue           // 登录进去的页面的路由视图
│   │   ├── xxx.vue              // xxx页面
│   │   ├── router.js            // 路由配置
│   │   └── router.js            // socket封装
│   └── app.js      // webpack入口文件
├── tpls
│   └── index.html      // 入口html模板
├── mumble.json         // CLI工具mn2的配置文件
├── webpack.base.js     // webpack的基础配置
├── webpack.dev.js      // 执行`mn2 dev`命令的webpack配置
└── webpack.prod.js     // 执行`mn2 gen`命令的webpack配置
```
## 模块
模块应该是独立的，跟外界无耦合的。内部由业务组件和UI组件组成，组件之间共享统一状态容器。模块和模块之间通过事件机制来交互。

### 配置
```js
// import index from './index.vue';
export default {
    // 模块名称
    name: 'Demo',
    // 规范模块监测什么事件，或者说模块对外提供什么接口
    events: ['Demo:add'], 
    // 规范模块能够触发其他模块什么事件或者说调用其他模块什么接口
    dispatchs: ['OtherModule:add', 'OtherModule:delete'],
    // 规范模块的动作，由外部调用或者自己执行
    methods: {
        showTree(arg, cb) {
            console.log(arg);
        },
    },
    // 模块内部组件统一的状态容器
    data() {
        return {};
    },
    // 规范模块对外提供的组件
    components: {
        index: () => import('./index.vue'),
    },
};
```

### 规范
1. 模块首字母大写
2. event定义的事件名称必须是 模块名:事件名
3. index.scss需@import(variables.scss)，保证风格的统一
4. 模块不能依赖其他模块，只能使用this.dispatch调用其他模块接口

### events 和 methods 的差别
events里面定义的事件是在模块里的组件created时才加入监听者队列，而methods定义的事件是js被加载就会加入监听者队列。methods里面提供的接口，应该是跟视图无关的，大多是请求数据。


## 页面
模块和ui组件组装起来就是页面，需要在router中添加路由配置

### 规范
1. 页面的根dom样式为xxx-page
2. index.scss需@import(variables.scss)，保证风格的统一

