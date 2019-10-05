# NODE ASF BOT

使用 **[node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)** 搭建，用于通过 Telegram 发送命令给 ASF (ArchiSteamFarm)。

## 直接运行

### 依赖

- Node.js

### 下载文件

```bash
git clone https://github.com/ZvonimirSun/node-asf-bot.git
cd node-asf-bot
```

### 修改配置

配置环境变量。

**必需配置：**

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

### 运行

```bash
npm start
```

## Docker

### 依赖

- docker-ce
- docker-compose

### 下载文件

```bash
git clone https://github.com/ZvonimirSun/node-asf-bot.git
cd node-asf-bot
```

### 修改配置

修改`docker-compose.yml`文件配置环境变量。

```yml
environment:
  - TELEGRAM_TOKEN=987654321:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  - ADMIN_ID=123456789
  - IPC_ADDR=http://127.0.0.1:1242
  - IPC_PASS=password
  # - URL=https://asfbot.example.com
  # - PORT=3000
```

将对应配置项替换。

### 运行

```bash
docker-compose up -d
```