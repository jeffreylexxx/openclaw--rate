# OpenClaw 版本易用性评测网页

这个目录是一个可直接发布到 GitHub Pages 的静态网页。页面打开时会尝试更新 OpenClaw Releases，只纳入 `2026.3.28` 以及之后的正式版；Beta、Alpha、RC、Preview 等预发布版本不会进入统计。页面会按版本检索公开 GitHub Issue 反馈，并结合内置公开网页、文章、论坛样本和可选搜索接口，用启动、插件、崩溃、错误、无响应、Dashboard、安装升级、Provider 和工具执行等因素生成易用性排名和升级推荐指数。

## 本地预览

在这个目录启动静态服务器：

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173
```

## 全网点击计数

GitHub Pages 本身没有数据库，也不能让匿名访客直接写入仓库文件。因此“推荐 / 不推荐”按钮默认只做本地浏览器计数。要变成全网共享计数，可以部署 `vote-worker.js` 到 Cloudflare Workers，并绑定一个 KV 命名空间 `OPENCLAW_VOTES`。

部署后，在 GitHub Pages 的 `index.html` 里、`app.js` 之前加入：

```html
<script>
  window.OPENCLAW_VOTE_API = "https://your-worker.example.workers.dev";
</script>
```

这样任何访问者都可以不登录、不认证地点击按钮，Worker 会公开累计票数。公开匿名计数天然可能被刷票，所以页面不会把这些票数计入版本排名。

## 可选外部搜索接口

浏览器静态页面不能直接无钥匙调用通用搜索引擎，也不能稳定抓取论坛和社交媒体页面。若需要每次打开页面时额外搜索网页、论坛、帖子、社交媒体和新闻，可以部署一个自有搜索代理接口，然后在 `index.html` 里、`app.js` 之前加入：

```html
<script>
  window.OPENCLAW_SEARCH_API = "https://your-search-worker.example.workers.dev";
</script>
```

接口返回格式：

```json
{
  "items": [
    {
      "title": "2026.4.15 OpenRouter onboarding succeeds but agent is silent",
      "url": "https://example.com/post",
      "sourceType": "forum",
      "sentiment": "negative",
      "dimensions": ["provider", "noResponse"],
      "strength": 2.2
    }
  ]
}
```

没有配置这个接口时，页面仍会使用 GitHub API 动态搜索和内置公开证据种子。

## 数据源

默认数据源包括：

- GitHub Releases: `https://api.github.com/repos/openclaw/openclaw/releases`
- GitHub Issue 搜索: `https://api.github.com/search/issues`
- 内置 2026-05-05 公开证据种子，用于 GitHub API 限流、离线或搜索接口不可用时兜底

评分模型从 72 分中位线起算，不再因为样本少而自动给高分。样本不足会扣分，高分会被封顶；具体负面反馈越多、越严重，分数越低；具体正向修复越明确，分数越高。

## 排名记忆

排名历史存储在浏览器 `localStorage` 中，最多保留 14 天。第二天再次打开网页时，会用当天最新评分与上一份快照比较，并显示上升、下降或持平箭头。
