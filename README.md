# NODE ASF BOT

使用 **[node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)** 搭建，用于通过 Telegram 发送命令给 ASF (ArchiSteamFarm)。

## 安装

```bash
git clone https://github.com/ZvonimirSun/node-asf-bot.git
cd node-asf-bot
npm start
```

## 配置

### 修改环境变量(推荐)

方法一，使用环境变量。

**必填配置：**

```bash
# The API token of your Telegram bot
export TELEGRAM_TOKEN=987654321:XXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Your Telegram number ID (not the username)
export ADMIN_ID=123456789
# ASF IPC address
export IPC_ADDR=http://127.0.0.1:1242/
# ASF IPC password
export IPC_PASS=PASSWORD
```

**可选配置：**

```bash
# 采用websocket监听，而非polling方式，响应更及时，必须为https，利用nginx反代此端口实现
export URL=https://asf.example.com
# 自定义监听端口，用于websocket
export PORT=3000
```

### 直接修改 app.js

将等号后的内容替换为对应配置项。

**必填配置：**

```js
const token = process.env.TELEGRAM_TOKEN;
const admin = process.env.ADMIN_ID;
const ipc_addr = process.env.IPC_ADDR;
const ipc_pass = process.env.IPC_PASS || "";
```

**可选配置：**

```js
const url = process.env.URL;
const port = process.env.PORT || 3000;
```
