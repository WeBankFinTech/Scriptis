# Compilation

## Getting Started

### Prerequisites

Install Node.js on your computer. Download Link:  [http://nodejs.cn/download/](http://nodejs.cn/download/). Recommend using the latest stable version.

**Only do this step at the first time.**

### Installation

Run the following commands in terminal:

```
git clone https://github.com/WeBankFinTech/Scriptis.git
cd wds-ide
npm install
```

 Commands explanation:

1. Pull remote repository to local:	`git clone https://github.com/WeBankFinTech/Scriptis.git`

2. Change to the root directory of the project:	`cd wds-ide`

3. Install all dependencies required for the project:	`npm install`

**Only do this step at the first time.**

### Configuration 

You need to make some configurations in your code, such as port address of backend server and socket address of backend server in .env.development file in root directory.

```
//prefix of Backend service
VUE_APP_MN_CONFIG_PREFIX=/api/rest_j/v1/
//prefix of websocket service
VUE_APP_MN_CONFIG_SOCKET=/ws/api/entrance/connect
//server host  example http://yourIp:yourPort
SERVER_HOST=
//front end run port  default 8080
PORT=
```

You can refer to the official documentation of vue-cli for detailed explanation. [Modes and environment variables](https://cli.vuejs.org/guide/mode-and-env.html#modes)

### Building project

You can run the following command in terminal to build the project:

```
npm run build 
```

A folder named "dist" would appear in your project's root directory if the command has run successfully and you can directly put "dist" to your static server.

### How to run

You would need to run the following command in terminal if you want to run project on your local browser and see corresponding effects after making changes to the code.

```
npm run serve
```

### FAQ

#### Failed installation when running npm install

Try to use Taobao npm mirror:

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

Next,  run the following command instead of npm install:

```
cnpm install
```

Note that you can still use `npm run serve` and `npm run build` to run and build project.