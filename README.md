# LocalFlag64

LocalFlag64 是一个面向 Loon 的本地订阅改写插件：它通过固定的本地入口 `https://localflag64.loon/sub?url=...` 拉取原始 Base64 订阅，在本地解码节点名称、按地区关键词补充 emoji 国旗，再重新编码后返回给 Loon。

仓库地址：`https://github.com/ZeroDevi1/LocalFlag64`

## 功能特性

- 纯本地改写，不依赖第三方订阅转换服务
- 首版支持 `ss`、`ssr`、`trojan`、`vmess`、`vless`、`hysteria`、`hysteria2`、`hy2`、`tuic`
- 已带 emoji 前缀的节点不重复添加
- 对未知协议、私有扩展和无法解析的行保持原样
- 支持 GitHub Actions 自动测试、构建和发布插件产物

## 工作原理

1. Loon 安装 `LocalFlag64.plugin`
2. 用户把原始订阅包装为 `https://localflag64.loon/sub?url=<URL 编码后的原订阅链接>`
3. 插件脚本拦截这个本地入口请求
4. 插件脚本向上游订阅地址发起请求
5. 若响应体是 Base64 节点订阅，则本地解码并重命名节点
6. 脚本将改写后的 Base64 文本返回给 Loon

## 使用方式

### 1. 安装插件

发布后，Loon 插件地址为：

`https://cdn.jsdelivr.net/gh/ZeroDevi1/LocalFlag64@release/LocalFlag64.plugin`

GitHub Release 备用地址：

`https://github.com/ZeroDevi1/LocalFlag64/releases/latest/download/LocalFlag64.plugin`

插件内部引用的脚本地址为：

`https://cdn.jsdelivr.net/gh/ZeroDevi1/LocalFlag64@release/localflag64.min.js`

### 2. 包装原订阅链接

假设原始订阅链接如下：

```text
https://example.com/subscription/base64
```

包装后给 Loon 使用的订阅链接如下：

```text
https://localflag64.loon/sub?url=https%3A%2F%2Fexample.com%2Fsubscription%2Fbase64
```

你也可以用任意 URL 编码工具对原订阅地址进行编码后再拼接。

## 本地开发

### 环境要求

- Node.js 20 及以上
- npm 10 及以上

### 常用命令

```bash
npm install
npm run typecheck
npm test
npm run build
```

构建完成后会生成：

- `dist/localflag64.min.js`
- `dist/LocalFlag64.plugin`

## 项目结构

```text
src/
  core/
    base64.ts
    flags.ts
    protocols.ts
    subscription.ts
  loon/
    handler.ts
    main.ts
    runtime.ts
scripts/
  build.mjs
  lib/render-plugin.mjs
templates/
  LocalFlag64.plugin.tpl
tests/
```

## 支持协议与重命名策略

- `vmess`：解码 JSON 后修改 `ps`
- `ssr`：解码 `remarks` 后重新写回
- 其余协议：优先改 `#fragment`，若无 fragment 则尝试 `remarks`、`remark`、`name`、`ps`
- 仅在节点名未带 emoji 前缀时补充国旗

## GitHub Actions 发布

仓库内置工作流会执行以下步骤：

- `push` / `pull_request`：安装依赖、类型检查、单测、构建、上传 artifact
- `push` 到 `main`：同步 `dist` 产物到 `release` 分支，供 jsDelivr 加速分发
- `push tag v*`：在通过校验后自动发布 GitHub Release

发布资产包括：

- `LocalFlag64.plugin`
- `localflag64.min.js`

## 注意事项

- 本项目不依赖未公开确认的 Loon `[subscription]` 钩子
- 插件只代理用户提供的原始订阅地址，不提供任何第三方中转服务
- 如果上游订阅不是 Base64 节点列表，插件会直接透传原始内容
- 某些机场若使用私有协议或非标准备注格式，节点名可能保持不变
