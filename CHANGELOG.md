# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [1.1.0] - 2026-03-17

### Added

- 新增 Cloudflare Worker 入口 `src/worker/index.ts`
- 新增通用订阅代理层 `src/service/proxy.ts`
- 新增 Worker 健康检查与入口页
- 新增 Worker 入口测试
- 新增 Worker 部署与使用说明

### Changed

- 项目从 Loon 假域名插件方案重构为 Cloudflare Worker 方案
- 构建方式改为 `wrangler deploy --dry-run`
- 文档改为 Worker 部署和 Loon 直接订阅真实 HTTPS 地址的使用方式
- GitHub Actions 改为执行 Worker dry-run 构建

### Removed

- 移除 Loon 假域名插件模板和相关构建脚本
- 移除 `localflag64.loon/sub?...` 路线

## [1.0.0] - 2026-03-17

### Added

- 初始化 `LocalFlag64` Loon 插件项目结构
- 实现固定本地入口 `https://localflag64.loon/sub?url=...`
- 支持 Base64 订阅识别、解码、重命名和回编码
- 支持 `ss`、`ssr`、`trojan`、`vmess`、`vless`、`hysteria`、`hysteria2`、`hy2`、`tuic`
- 内置地区匹配规则，重点覆盖香港、台湾、日本、韩国、新加坡、美国、俄罗斯、菲律宾、迪拜
- 增加 jsDelivr `release` 分支分发方式
- 增加 GitHub Actions 自动测试、构建、`release` 分支同步和 Release 发布
- 增加单元测试与订阅处理回归测试

### Changed

- 插件默认脚本分发地址改为 jsDelivr 加速链接
- 修复 GitHub Actions 环境下插件渲染测试对 `GITHUB_REPOSITORY` 的兼容问题
- 升级工作流中 `actions/checkout` 和 `actions/setup-node` 到 v5

## [Unreleased]

- 暂无
