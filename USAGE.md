# LocalFlag64 使用说明

本文档说明如何把 LocalFlag64 作为 Cloudflare Worker 部署，并在 Loon 中作为真实订阅地址使用。

## 一、准备工作

开始前请确认：

- 你有一个 Cloudflare 账号
- 你本地已安装 Node.js 20+
- 你准备处理的是 Base64 节点订阅
- 你可以在 Loon 中添加自定义订阅地址

## 二、安装与登录

安装依赖：

```bash
npm install
```

登录 Cloudflare：

```bash
npx wrangler login
```

如果你不使用网页登录，也可以用 API Token 方式配置 Wrangler，详见 Cloudflare 官方文档：

- [Wrangler 安装与登录](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## 三、本地调试

执行：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:8787/health
```

如果返回 `{"name":"LocalFlag64","ok":true,...}`，说明 Worker 正常。

## 四、部署到 Cloudflare

执行：

```bash
npm run deploy
```

首次部署成功后，你会看到类似地址：

```text
https://localflag64.<your-subdomain>.workers.dev
```

你也可以后续在 Cloudflare 后台给 Worker 绑定自己的域名。

## 五、Loon 中如何填写订阅

### 原始订阅示例

```text
https://example.com/subscription/base64
```

### URL 编码后

```text
https%3A%2F%2Fexample.com%2Fsubscription%2Fbase64
```

### 最终在 Loon 中填写的地址

```text
https://localflag64.<your-subdomain>.workers.dev/sub?url=https%3A%2F%2Fexample.com%2Fsubscription%2Fbase64
```

重点：

- 必须保留 `/sub`
- `url=` 后面必须是 URL 编码后的真实订阅地址
- 不需要安装任何 Loon 插件

## 六、你的地址为什么之前会 502

之前那版是“假域名插件接管”方案，例如：

```text
https://localflag64.loon/sub?url=...
```

这个地址在 Loon 订阅流程里没有真实上游服务，因此会失败。  
Cloudflare Worker 版不再使用 `localflag64.loon` 这种伪本地域名，而是使用真实可访问的 HTTPS 地址，所以可以直接作为订阅使用。

## 七、当前支持的重点地区

- 香港
- 台湾
- 日本
- 韩国
- 新加坡
- 美国
- 俄罗斯
- 菲律宾
- 迪拜 / 阿联酋

如果节点已经是 `🇭🇰 HK 01` 这类格式，Worker 会自动跳过，不重复添加。

## 八、常见问题

### 1. 为什么没有加旗？

常见原因：

- 上游订阅不是 Base64 节点文本
- 节点名称没有命中当前支持的地区关键词
- 机场使用私有协议或私有备注格式
- 你访问的不是 `/sub?url=...` 格式

### 2. 为什么 Worker 返回 502？

这表示 Worker 成功运行了，但它拉取你的上游订阅失败。常见原因：

- 原始订阅 URL 已失效
- 原始订阅源临时不可访问
- `url` 参数没有正确 URL 编码
- 上游服务对 Cloudflare IP 或地区做了限制

### 3. 中国大陆能访问吗？

通常可以，但不保证所有网络环境都同样稳定。  
如果你在大陆使用，建议优先：

- 先测试 `workers.dev` 地址
- 如稳定性一般，再绑定自定义域名
- 如需长期稳定可控，再评估 Cloudflare 中国网络或国内中转方案

### 4. 真实订阅会不会暴露到 GitHub？

不会。  
仓库里不会保存你的真实订阅地址。真实订阅只会出现在你自己填写的 Worker 请求 URL 中。

## 九、开发者说明

核心文件：

- 国旗规则：`src/core/flags.ts`
- 协议解析：`src/core/protocols.ts`
- 订阅处理：`src/core/subscription.ts`
- Worker 代理逻辑：`src/service/proxy.ts`
- Worker 入口：`src/worker/index.ts`

本地验证：

```bash
npm run typecheck
npm test
npm run build
```
