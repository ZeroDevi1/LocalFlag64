# LocalFlag64

LocalFlag64 现已重构为 Cloudflare Worker 版 Base64 订阅加旗服务。它接收一个真实可访问的上游订阅链接，拉取 Base64 节点内容，在边缘侧按地区关键词补充 emoji 国旗后返回结果，供 Loon 直接作为订阅地址使用。

- 仓库地址：`https://github.com/ZeroDevi1/LocalFlag64`
- 当前版本：`v1.1.0`
- 推荐部署：Cloudflare Workers

## 先说结论

- 一般情况下，Cloudflare Worker 在中国大陆可以访问，但稳定性和速度取决于运营商、地区以及你使用的是 `workers.dev` 还是自定义域名
- 如果追求更稳，建议绑定你自己的自定义域名
- 如果追求“面向中国大陆长期稳定可控”，还需要考虑 Cloudflare 中国网络、备案和企业能力，这已经超出普通免费 Worker 范围

关于这点，我依据 Cloudflare 官方文档做了判断：Cloudflare Workers 默认运行在其全球网络；而 Cloudflare 中国网络是单独能力，面向需要中国大陆本地化接入的场景。也就是说，普通 Worker 通常能访问，但不等于“官方承诺在大陆始终最佳”。  
参考：

- [Cloudflare Workers 概览](https://developers.cloudflare.com/workers/)
- [Cloudflare 中国网络概览](https://developers.cloudflare.com/china-network/)

## 功能概览

- 支持 `ss`、`ssr`、`trojan`、`vmess`、`vless`、`hysteria`、`hysteria2`、`hy2`、`tuic`
- 已带 emoji 前缀的节点不会重复添加
- 未识别协议、私有扩展、解析失败的节点保持原样
- 支持香港、台湾、日本、韩国、新加坡、美国、俄罗斯、菲律宾、迪拜 / 阿联酋等重点地区
- 真实订阅地址不需要写进 GitHub 仓库，只在你自己的 Loon 订阅配置里使用

## 工作原理

1. 你部署一个自己的 Cloudflare Worker
2. Loon 访问 Worker 地址：`https://<your-worker>.workers.dev/sub?url=<编码后的原始订阅>`
3. Worker 拉取上游原始订阅
4. Worker 判断响应体是否为 Base64 节点订阅
5. Worker 解析节点名并按关键词补充 emoji 国旗
6. Worker 返回处理后的 Base64 内容给 Loon

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 本地调试

```bash
npm run dev
```

默认会启动本地 Worker 调试服务。

### 4. 部署到 Cloudflare Worker

```bash
npm run deploy
```

部署成功后，你会拿到一个类似下面的地址：

```text
https://localflag64.<your-subdomain>.workers.dev
```

### 5. 在 Loon 中使用

假设你的原始订阅地址是：

```text
https://example.com/subscription/base64
```

则在 Loon 中填写的订阅地址应为：

```text
https://localflag64.<your-subdomain>.workers.dev/sub?url=https%3A%2F%2Fexample.com%2Fsubscription%2Fbase64
```

## 使用说明

更详细的安装、部署、Loon 配置和排错说明见：

- `USAGE.md`

## 项目结构

```text
src/
  core/
    base64.ts
    flags.ts
    protocols.ts
    subscription.ts
  service/
    proxy.ts
  worker/
    index.ts
tests/
CHANGELOG.md
USAGE.md
wrangler.jsonc
```

## 开发命令

```bash
npm run typecheck
npm test
npm run build
npm run dev
npm run deploy
```

其中：

- `npm run build`：执行 Worker 的 dry-run 构建
- `npm run deploy`：发布到 Cloudflare

## GitHub Actions

当前工作流会：

- 在 `push` / `pull_request` 时执行安装依赖、类型检查、单测、Worker dry-run 构建
- 在打 tag 时创建 GitHub Release

注意：当前仓库默认不自动部署到你的 Cloudflare 账号，因为这需要你自行配置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`

## 安全说明

- 你的真实订阅地址不会被写进仓库代码
- 真实订阅仅出现在你自己填入的 Worker 请求 URL 中
- 如果你不希望在 Loon 配置里直接出现真实订阅地址，可以后续再加一层自定义 token 或 Worker Secret 映射
