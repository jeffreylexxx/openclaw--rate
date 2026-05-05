"use strict";

const GITHUB_REPO = "openclaw/openclaw";
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`;
const ISSUES_API = "https://api.github.com/search/issues";
const MIN_VERSION = "2026.3.28";
const VOTE_API = window.OPENCLAW_VOTE_API || localStorage.getItem("openclawVoteApi") || "";
const SEARCH_API = window.OPENCLAW_SEARCH_API || localStorage.getItem("openclawSearchApi") || "";
const MAX_DYNAMIC_ISSUE_SEARCHES = 8;

const STORAGE_KEYS = {
  history: "openclaw_rank_history_v2",
  votes: "openclaw_local_votes_v1",
};

const FALLBACK_RELEASES = [
  release("v2026.5.3-1", "openclaw 2026.5.3-1", "2026-05-04T09:35:00Z", "Core npm hotfix release. Plugins/security stops install scanner from blocking official bundled plugin packages when env access and API sends are far apart in compiled bundles.", 21),
  release("v2026.5.3", "OpenClaw 2026.5.3", "2026-05-04T07:01:00Z", "File-transfer plugin, official plugin install hardening, Gateway startup and Control UI lazy-loading, channel recovery behavior, macOS LaunchAgent upgrade recovery, runtime reliability fixes.", 37, "true"),
  release("v2026.5.2", "openclaw 2026.5.2", "2026-05-02T18:10:00Z", "External plugin installation, update, doctor repair, dependency reporting, artifact metadata, leaner Gateway and agent hot paths, Control UI and WebChat reliability, channel and provider fixes.", 28),
  release("v2026.4.15", "openclaw 2026.4.15", "2026-04-16T21:50:00Z", "Anthropic Opus defaults, Gemini TTS, stale dist chunk pruning, media trust hardening, bounded memory excerpts, BlueBubbles attachment fixes, Codex transport repair.", 18),
  release("v2026.4.14", "openclaw 2026.4.14", "2026-04-14T17:20:00Z", "Maintenance release focused on channel reliability, dashboard fixes, Gateway startup, provider compatibility and tool behavior.", 14),
  release("v2026.4.12", "openclaw 2026.4.12", "2026-04-12T20:00:00Z", "Plugin loading narrows activation to manifest-declared needs and memory recall search path telemetry improves predictability.", 11),
  release("v2026.4.9", "openclaw 2026.4.9", "2026-04-09T13:10:00Z", "Gateway and config maintenance release with plugin/runtime loading changes.", 8),
  release("v2026.4.7-1", "openclaw 2026.4.7-1", "2026-04-08T14:00:00Z", "Hotfix around plugin packaging and global install behavior after Telegram plugin loading failures.", 5),
  release("v2026.4.7", "openclaw 2026.4.7", "2026-04-08T08:00:00Z", "Plugin packaging changes. Public reports mention bundled Telegram plugin entry point errors and Gateway startup failures.", 3),
  release("v2026.4.2", "openclaw 2026.4.2", "2026-04-02T18:30:00Z", "Post-2026.3.31 stabilization release with fixes around dashboard, gateway behavior, plugins, provider aliases and install flows.", 16),
  release("v2026.4.1", "openclaw 2026.4.1", "2026-04-01T18:40:00Z", "ACP channel binds and post-3.31 fixes. Public feedback includes local loopback ACP sessions dying with queue owner unavailable.", 5),
  release("v2026.3.31", "openclaw 2026.3.31", "2026-03-31T20:54:00Z", "Breaking plugin SDK deprecations and dangerous install fail-closed behavior. Public reports include dashboard 500 errors, auth profile parsing regression and force unsafe install flag issues.", 9),
  release("v2026.3.28", "openclaw 2026.3.28", "2026-03-29T01:34:00Z", "Qwen OAuth removal, xAI Responses API and x_search, MiniMax image-01, async approval hooks. Public reports mention doctor --fix stack overflow and Linux VPS gateway recovery failures.", 12),
];

const SEEDED_EVIDENCE = {
  "2026.5.3-1": [
    evidence("release", "positive", "插件扫描器误拦截官方捆绑插件的安全热修复，提升官方插件安装成功率", "https://www.mumclaw.com/releases/v2026.5.3-1", ["plugin", "install"], 2.4),
    evidence("release", "negative", "该版本本身是针对 2026.5.3 插件扫描误拦截的热修复，说明前序安装链路仍有边界问题", "https://github.com/openclaw/openclaw/releases/tag/v2026.5.3-1", ["plugin", "install"], 1.4),
  ],
  "2026.5.3": [
    evidence("article", "positive", "新增 file-transfer 插件，默认按节点路径策略拒绝越权、拒绝符号链接穿越并限制 16 MB", "https://efficienist.com/openclaw-2026-5-3-adds-file-transfer-between-paired-nodes-and-whatsapp-newsletter-targets/", ["plugin", "security"], 2.1),
    evidence("release", "positive", "Gateway 启动与 Control UI 热路径延迟加载，减少插件、运行时、cron、schema 和模型元数据开销", "https://github.com/openclaw/openclaw/releases/tag/v2026.5.3", ["gateway", "performance"], 2.6),
    evidence("release", "positive", "修复 macOS LaunchAgent 升级恢复、陈旧 Gateway/plugin 状态、流式回复和工具投递等运行时可靠性问题", "https://github.com/openclaw/openclaw/releases/tag/v2026.5.3", ["recovery", "noResponse"], 2.2),
    evidence("issue", "negative", "iMessage channel polling 在 2026.5.3-1 回归，2026.5.2 正常", "https://github.com/openclaw/openclaw/issues/77503", ["plugin", "regression", "noResponse"], 2.7),
    evidence("issue", "negative", "Discord GroupChat replies 在 2026.5.3 后不可见，visibleReplies 默认行为变化", "https://github.com/openclaw/openclaw/issues/77746", ["plugin", "ui", "regression"], 2.5),
    evidence("issue", "negative", "Feishu group messages 升级到 2026.5.3 后 receive replies=0", "https://github.com/openclaw/openclaw/issues/77666", ["plugin", "noResponse", "regression"], 2.5),
    evidence("issue", "negative", "WhatsApp 首条入站消息阻塞事件循环，eventLoopDelayMaxMs 超过 12 秒", "https://github.com/openclaw/openclaw/issues/77443", ["noResponse", "plugin", "gateway"], 2.8),
    evidence("issue", "negative", "Discord gateway 在 Windows v2026.5.3-1 卡在 awaiting gateway readiness", "https://github.com/openclaw/openclaw/issues/77747", ["gateway", "plugin", "noResponse"], 2.8),
  ],
  "2026.5.2": [
    evidence("article", "positive", "外部插件安装、更新、doctor repair、依赖报告和 artifact metadata 进入稳定版", "https://openclawlaunch.com/news/openclaw-v2026-5-2-plugin-externalization-grok-4-3", ["plugin", "install", "recovery"], 2.4),
    evidence("release", "positive", "Gateway startup、session listing、task maintenance、plugin loading 和 filesystem guards 热路径瘦身", "https://newreleases.io/project/github/openclaw/openclaw/release/v2026.5.2", ["gateway", "performance"], 2.5),
    evidence("release", "positive", "Control UI、WebChat、Telegram topic、Discord delivery、Slack threads、Signal media 和 web search 兼容性修复", "https://newreleases.io/project/github/openclaw/openclaw/release/v2026.5.2", ["ui", "provider", "noResponse"], 1.9),
    evidence("issue", "negative", "Feishu channel 升级到 2026.5.2 后 appId/appSecret 字段不兼容并崩溃", "https://github.com/openclaw/openclaw/issues/77116", ["plugin", "crash", "regression"], 2.9),
    evidence("issue", "negative", "QQ Bot 升级到 2026.5.2 后回复 verbose/repetitive", "https://github.com/openclaw/openclaw/issues/76935", ["plugin", "ui", "regression"], 2.1),
    evidence("issue", "negative", "自动更新到 2026.5.2 后所有 OpenAI 调用出现 Gateway timeouts", "https://github.com/openclaw/openclaw/issues/77070", ["gateway", "provider", "noResponse"], 3.0),
  ],
  "2026.4.29": [
    evidence("reddit", "negative", "Reddit 用户汇总称 2026.4.29 更新后 CPU spike、响应变慢、部分 Discord/Telegram 回复延迟到分钟级，建议回滚 2026.4.23", "https://www.reddit.com/r/openclaw/comments/1t0opfk/openclaw_2026429_is_eating_cpus_and_breaking/", ["noResponse", "regression", "provider"], 3.2),
    evidence("reddit", "negative", "Reddit 对比称 4.29 no-op subagent spawn 60-80 秒，而 4.23 约 8 秒，chat.history/model list 冷启动也显著变慢", "https://www.reddit.com/r/openclaw/comments/1t1t9qx/2026429_is_broken_avoid_it/", ["noResponse", "tooling", "regression"], 3.1),
    evidence("forum", "negative", "Clawsmith 记录 2026.4.29 TUI 启动进入 100% CPU bundled plugin reload loop，需要 kill -9", "https://www.clwsmth.com/signal/openclaw-tui-100-cpu-bundled-plugin-reload-loop-v2026-4-29", ["crash", "plugin", "noResponse"], 3.0),
    evidence("article", "positive", "Release/upgrade checklist 显示 2026.4.29 增加 startup diagnostics、stale-session recovery、channel fixes 和更安全的 tool-profile 行为", "https://www.getopenclaw.ai/how-to/openclaw-2026-4-29-upgrade-checklist", ["gateway", "recovery", "tooling"], 1.7),
  ],
  "2026.4.27": [
    evidence("issue", "negative", "WhatsApp session 在 2026.4.27 变得不稳定，泄露 thinking traces，并从 Codex fallback 到 MiniMax", "https://github.com/openclaw/openclaw/issues/74886", ["plugin", "provider", "regression"], 3.0),
    evidence("issue", "negative", "WebChat assistant replies 在 2026.4.27 仍重复出现", "https://github.com/openclaw/openclaw/issues/75239", ["ui", "regression"], 2.2),
    evidence("issue", "negative", "从 2026.4.29 降级到 2026.4.27 因 stale file-transfer entry 失败", "https://github.com/openclaw/openclaw/issues/75502", ["install", "plugin", "regression"], 2.7),
    evidence("issue", "negative", "2026.4.27 出现 event-loop saturation 和 ACP session leak", "https://github.com/openclaw/openclaw/issues/74345", ["noResponse", "gateway", "tooling"], 3.0),
    evidence("issue", "negative", "openclaw infer 在 2026.4.27 无限挂起，子进程 100% CPU 且无网络 I/O", "https://github.com/openclaw/openclaw/issues/74986", ["noResponse", "tooling", "regression"], 3.2),
  ],
  "2026.4.26": [
    evidence("issue", "negative", "2026.4.26 无法降级", "https://github.com/openclaw/openclaw/issues/74069", ["install", "regression"], 2.5),
    evidence("issue", "negative", "2026.4.26 在 WSL2 上 WhatsApp flaps 且 Telegram polling stalls", "https://github.com/openclaw/openclaw/issues/73602", ["plugin", "noResponse", "regression"], 3.0),
    evidence("issue", "negative", "近期版本 onboarding slowdown 在 2026.4.26 复现", "https://github.com/openclaw/openclaw/issues/74879", ["install", "ui", "noResponse"], 2.4),
    evidence("issue", "negative", "openclaw status --usage --json 在 2026.4.26 非 TTY 子进程中挂起/失败", "https://github.com/openclaw/openclaw/issues/74085", ["tooling", "noResponse"], 2.8),
    evidence("issue", "negative", "openclaw_gateway 拒绝 Paperclip agent heartbeats，报 unexpected property paperclip", "https://github.com/openclaw/openclaw/issues/74635", ["gateway", "plugin", "error"], 2.6),
  ],
  "2026.4.24": [
    evidence("reddit", "negative", "Reddit 警告不要升级 2026.4.24，Bonjour/mDNS 插件 unhandled promise rejection 导致 Node 进程约每 20 秒崩溃", "https://www.reddit.com/r/openclaw/comments/1sw1s30/do_not_upgrade_to_2026424/", ["plugin", "crash", "gateway"], 3.4),
    evidence("forum", "negative", "vnROM 转述社区警告 2026.4.24 package 缺失大量文件，可能导致 gateway 启动即崩溃", "https://ai.vnrom.net/romhub/khoan-nang-openclaw-2026424-neu-gateway-la-phan-quan-trong-trong-workflow-24ld", ["gateway", "install", "crash"], 2.8),
  ],
  "2026.4.23": [
    evidence("article", "negative", "2026.4.23 schema 拒绝 hooks.allowConversationAccess，导致非捆绑插件无法访问 conversation 数据", "https://fenado.ai/articles/openclaw-2026423-update-breaks-non-bundled-plugins-with-conversation-access", ["plugin", "regression"], 2.7),
    evidence("reddit", "positive", "Reddit 回滚对比称 4.23 相比 4.29 更稳定，subagent no-op 约 8 秒且 CPU idle 更低", "https://www.reddit.com/r/openclaw/comments/1t1t9qx/2026429_is_broken_avoid_it/", ["performance", "noResponse"], 1.8),
  ],
  "2026.4.21": [
    evidence("forum", "negative", "ZooClaw 记录 2026.4.21 WhatsApp 插件缺失 @whiskeysockets/baileys，gateway 启动时插件注册失败", "https://zooclaw.ai/help/en/2026-04-23/whatsapp-baileys-distribution/", ["plugin", "gateway", "install"], 3.2),
    evidence("forum", "negative", "同一报告称 LaunchDaemon watchdog 反复重装损坏版本但未验证插件健康，造成近 5 小时 WhatsApp outage", "https://zooclaw.ai/help/en/2026-04-23/whatsapp-baileys-distribution/", ["recovery", "noResponse", "regression"], 2.9),
    evidence("forum", "negative", "Clawsmith 记录 2026.4.21 升级后 device scopes 重置，subagent spawning 和 native approval 操作失败", "https://www.clwsmth.com/signal/openclaw-v2026-4-21-scope-upgrade-breaks-subagents", ["tooling", "regression", "provider"], 2.6),
    evidence("article", "positive", "Clawly 称 2026.4.21 改善 owner-only command 安全和 packaged-install doctor recovery", "https://www.clawly.org/news/openclaw-2026421-is-out-7-practical-upgrade-checks-for-self-hosted-operators", ["security", "recovery"], 1.5),
  ],
  "2026.4.20": [
    evidence("news", "positive", "VulnCheck 披露 OpenClaw < 2026.4.20 存在 paired-device pairing authorization 问题，说明 4.20 是该安全修复边界", "https://www.vulncheck.com/advisories/openclaw-improper-authorization-in-paired-device-pairing-actions", ["security"], 1.7),
    evidence("issue", "negative", "Cross-exec stale file reads 在 2026.4.20 回归，疑似跨进程 vnode/dentry cache race", "https://github.com/openclaw/openclaw/issues/71326", ["tooling", "regression"], 2.8),
    evidence("issue", "negative", "2026.4.20 版本升级锁死", "https://github.com/openclaw/openclaw/issues/69950", ["install", "regression", "noResponse"], 2.7),
    evidence("issue", "negative", "Feishu bundle 缺失 @larksuiteoapi/node-sdk 声明依赖", "https://github.com/openclaw/openclaw/issues/70093", ["plugin", "install"], 2.6),
    evidence("issue", "negative", "Mattermost plugin drops post_edited events，编辑 @mentions 不触发 agent wake", "https://github.com/openclaw/openclaw/issues/71930", ["plugin", "noResponse"], 2.4),
  ],
  "2026.4.15": [
    evidence("issue", "negative", "Fresh install 后 OpenRouter onboarding 显示成功，但 agent 完全沉默，无 typing/status/正常回复", "https://github.com/openclaw/openclaw/issues/68163", ["provider", "noResponse"], 3.0),
    evidence("issue", "negative", "exec 工具从 2026.4.14 起返回 No result provided，2026.4.15 也复现，回滚 2026.4.12 恢复", "https://github.com/openclaw/openclaw/issues/67896", ["tooling", "regression"], 2.8),
    evidence("release", "positive", "全局 npm 升级后清理陈旧 dist chunks，降低 stale chunk import 导致升级失败的概率", "https://newreleases.io/project/github/openclaw/openclaw/release/v2026.4.15", ["install", "recovery"], 1.8),
    evidence("article", "positive", "正式版文章称 4.15 修复 30+ 遗留问题并完成模型、TTS、内存体系升级", "https://www.scensmart.com/news/openclaw-2026-4-15-official-version-update-list/", ["provider", "ui"], 1.2),
  ],
  "2026.4.14": [
    evidence("issue", "negative", "exec/process 工具返回空结果 No result provided，WebChat 显示 exit code 0 但 agent 收不到结果", "https://github.com/openclaw/openclaw/issues/67896", ["tooling", "regression"], 3.1),
    evidence("issue", "negative", "models.mode=replace 仍触发隐式 provider discovery，导致大幅启动延迟", "https://github.com/openclaw/openclaw/issues/66957", ["provider", "gateway", "noResponse"], 2.8),
    evidence("issue", "negative", "macOS 下 Dashboard 因 SSH_* 环境变量误报 No GUI detected", "https://github.com/openclaw/openclaw/issues/67088", ["ui", "regression"], 2.2),
    evidence("issue", "negative", "FeiShu QR Code 在 onboard 过程中不可用", "https://github.com/openclaw/openclaw/issues/67438", ["plugin", "install"], 2.4),
    evidence("issue", "negative", "Control UI 路径重复导致 404，聊天功能无法使用", "https://github.com/openclaw/openclaw/issues/66946", ["ui", "error", "noResponse"], 2.8),
    evidence("release", "positive", "维护版聚焦 channel reliability、dashboard fixes、Gateway startup 和 provider compatibility", "https://github.com/openclaw/openclaw/releases/tag/v2026.4.14", ["gateway", "ui", "provider"], 1.4),
  ],
  "2026.4.12": [
    evidence("release", "positive", "插件加载按 manifest-declared needs 收窄，避免 CLI/provider/channel 激活时加载无关插件 runtime", "https://github.com/openclaw/openclaw/releases/tag/v2026.4.12", ["plugin", "performance"], 1.9),
    evidence("release", "positive", "Memory active recall 默认走 search，并增加 search-path telemetry，提升记忆召回可预测性", "https://github.com/openclaw/openclaw/releases/tag/v2026.4.12", ["provider"], 1.0),
    evidence("issue", "negative", "2026.4.12 Umbrel setup wizard 页面无法滚动，无法选择 OpenRouter，并反复强制进入 wizard", "https://github.com/openclaw/openclaw/issues/66785", ["ui", "provider", "regression"], 2.4),
  ],
  "2026.4.11": [
    evidence("article", "negative", "本地 Gateway RPC 命令升级到 2026.4.11 后可能以 WebSocket 1006 异常关闭失败，而 status/probe 仍显示健康", "https://thelgtm.dev/openclaws-local-gateway-debugging-broke-and-that-matters-more-than-it-sounds/", ["gateway", "tooling", "regression"], 2.9),
    evidence("reddit", "negative", "Reddit 讨论称 2026.4.11 仍有 Chrome browser discovery、active memory、vector search/dreaming 等问题", "https://www.reddit.com/r/openclaw/comments/1sj9ich/is_v2026411_the_first_version_in_a_while_that_did/", ["plugin", "provider", "regression"], 2.3),
  ],
  "2026.4.10": [
    evidence("reddit", "negative", "Reddit 用户称 4.10 broke things，因此 4.11 很快发布", "https://www.reddit.com/r/openclaw/comments/1sj9ich/is_v2026411_the_first_version_in_a_while_that_did/", ["regression"], 1.8),
  ],
  "2026.4.8": [
    evidence("issue", "negative", "2026.4.8 onboard/configure 报 Missing @slack/web-api、@buape/carbon、grammy，需手动 npm 安装依赖", "https://github.com/openclaw/openclaw/issues/63043", ["plugin", "install"], 3.1),
    evidence("issue", "negative", "2026.4.8 cron list、message、channels list 进入 99% CPU busy-wait 且无输出，回滚 2026.4.2 后恢复", "https://github.com/openclaw/openclaw/issues/63249", ["noResponse", "tooling", "regression"], 3.5),
    evidence("issue", "negative", "Windows npm global install 2026.4.7/2026.4.8 运行时缺失 grammy、@buape/carbon 等模块", "https://github.com/openclaw/openclaw/issues/63127", ["install", "plugin", "regression"], 2.8),
    evidence("news", "positive", "VulnCheck 显示 OpenClaw < 2026.4.8 存在 stale authentication state、build env injection、device.token.rotate role bypass 等安全问题，4.8 是相关修复边界", "https://www.vulncheck.com/advisories/openclaw-role-bypass-in-device-token-rotate-function", ["security"], 1.5),
  ],
  "2026.4.9": [
    evidence("issue", "negative", "Gateway startup clobbers openclaw.json，配置从 3641 bytes 截断到 423 bytes，需手动恢复", "https://github.com/openclaw/openclaw/issues/64419", ["gateway", "install", "regression"], 3.2),
  ],
  "2026.4.7-1": [
    evidence("issue", "negative", "全局安装 2026.4.7-1 后 Telegram 插件加载失败，Gateway 进入 restart loop，回滚 2026.4.2 恢复", "https://github.com/openclaw/openclaw/issues/62978", ["plugin", "gateway", "crash"], 3.4),
    evidence("release", "positive", "热修复尝试修补 plugin packaging/global install 行为", "https://github.com/openclaw/openclaw/releases/tag/v2026.4.7-1", ["plugin", "install"], 1.0),
  ],
  "2026.4.7": [
    evidence("issue", "negative", "Bundled telegram plugin entry point 缺失，openclaw gateway start 直接失败，禁用 Telegram 也无法绕过", "https://github.com/openclaw/openclaw/issues/62918", ["plugin", "gateway", "crash"], 3.6),
    evidence("issue", "negative", "Rolling back to 2026.4.5 resolves the startup issue，说明是 4.7 插件包结构回归", "https://github.com/openclaw/openclaw/issues/62918", ["regression", "install"], 2.0),
  ],
  "2026.4.2": [
    evidence("issue", "negative", "Windows 11 上 Gateway 不自动启动，Dashboard 127.0.0.1 refused to connect，restart 60 秒超时", "https://github.com/openclaw/openclaw/issues/60490", ["gateway", "ui", "install"], 2.9),
    evidence("release", "positive", "作为 2026.3.31 后的稳定化版本，修复 dashboard、gateway、plugins 和 provider alias/install flows", "https://github.com/openclaw/openclaw/releases/tag/v2026.4.2", ["gateway", "plugin", "provider"], 1.6),
  ],
  "2026.4.1": [
    evidence("issue", "negative", "ACP sessions spawn 后几秒内 dead，summary=queue owner unavailable，阻断本地 loopback gateway 的 ACP 编码工作", "https://github.com/openclaw/openclaw/issues/59274", ["gateway", "noResponse", "regression"], 3.0),
    evidence("issue", "negative", "auth-profiles.json 从 2026.4.1 起拒绝 type=aws-sdk，破坏 EC2/IMDS Bedrock 配置", "https://github.com/openclaw/openclaw/issues/69708", ["provider", "regression", "install"], 2.8),
    evidence("issue", "negative", "arm64/Raspberry Pi 5 间歇性 JSON parse error", "https://github.com/openclaw/openclaw/issues/61137", ["error", "gateway"], 2.1),
    evidence("issue", "negative", "bundled plugins openshell 从 2026.03.13 后不能正确工作，在 2026.4.1 搜索结果中仍相关", "https://github.com/openclaw/openclaw/issues/59528", ["plugin", "tooling", "regression"], 2.3),
  ],
  "2026.3.31": [
    evidence("issue", "negative", "Dashboard GET / 每次返回 500 Internal Server Error，Gateway/TUI/WebSocket 仍在但 HTTP handler 崩溃", "https://github.com/openclaw/openclaw/issues/58814", ["ui", "error"], 3.0),
    evidence("issue", "negative", "从 2026.3.28 升级到 2026.3.31 后 Gateway 30-60 秒内完全无响应，需要 SIGKILL，回滚 3.28 稳定", "https://www.stepcodex.com/en/issue/bug-gateway-becomes-unresponsive-60s-after", ["gateway", "noResponse", "regression"], 3.4),
    evidence("issue", "negative", "auth-profiles.json 解析在 2026.3.31 回归，旧配置在 2026.3.8 可正常工作", "https://github.com/openclaw/openclaw/issues/59629", ["provider", "regression"], 2.1),
    evidence("issue", "negative", "--dangerously-force-unsafe-install flag 在 2026.3.31 完全不可用，影响插件安装绕过路径", "https://github.com/openclaw/openclaw/issues/59508", ["plugin", "install"], 2.2),
    evidence("release", "negative", "插件安装和 gateway-backed skill dependency install 默认 fail closed，旧流程可能需要显式危险覆盖", "https://github.com/openclaw/openclaw/releases/tag/v2026.3.31", ["plugin", "install"], 1.5),
  ],
  "2026.3.28": [
    evidence("issue", "negative", "doctor --fix 在 bundled plugin loader 路径触发 Maximum call stack exceeded，阻断 Gateway/service 修复", "https://github.com/openclaw/openclaw/issues/57023", ["plugin", "crash", "recovery"], 3.5),
    evidence("issue", "negative", "Linux VPS/systemd 从 2026.3.24 升级到 2026.3.28 后 Gateway 不可恢复，需要快照回滚", "https://github.com/openclaw/openclaw/issues/57188", ["gateway", "install", "recovery"], 3.7),
    evidence("issue", "negative", "browser.request gateway method 未注册，升级 2026.3.28 后 managed browser 命令全部失败", "https://github.com/openclaw/openclaw/issues/58342", ["plugin", "tooling", "regression"], 2.6),
    evidence("issue", "negative", "TUI 无法注册到 Gateway，sessions.resolve 失败，输入 echo lag 且 Web UI 看不到 TUI 会话", "https://github.com/openclaw/openclaw/issues/58520", ["gateway", "ui", "noResponse"], 2.3),
    evidence("release", "positive", "xAI provider 迁移到 Responses API 并加入 x_search，Grok 搜索配置无需手动插件切换", "https://openclaw.report/news/openclaw-v2026-3-28", ["provider", "plugin"], 1.3),
  ],
};

const SIGNAL_RULES = [
  negative("gateway", "网关启动/服务失败", ["gateway", "start", "startup", "fails to start", "restart loop", "systemd", "refused to connect", "service", "listening"], 8),
  negative("plugin", "插件加载/安装失败", ["plugin", "plugins", "extension", "telegram", "install scanner", "grammy", "entry point", "bundled"], 7),
  negative("crash", "崩溃或修复路径中断", ["crash", "crashes", "stack overflow", "maximum call stack", "dead", "unrecoverable", "sigkill", "recovery fails"], 10),
  negative("error", "错误返回/异常输出", ["error", "500", "internal server error", "no result provided", "unknown method", "invalid", "failed"], 7),
  negative("noResponse", "无响应/沉默/卡顿", ["silent", "no reply", "no response", "unresponsive", "hang", "hangs", "timeout", "slow", "100% cpu", "lag"], 9),
  negative("regression", "升级回归/需回滚", ["regression", "after upgrading", "upgrade", "rollback", "worked before", "starting in", "fresh install"], 6),
  negative("install", "安装/升级链路风险", ["install", "uninstall", "onboarding", "update", "doctor", "repair", "downgrade", "stale"], 6),
  negative("ui", "Dashboard/Control UI 问题", ["dashboard", "control ui", "web ui", "webchat", "blank", "freeze", "http handler"], 6),
  negative("provider", "模型/Provider 路由问题", ["openrouter", "provider", "auth", "model", "tts", "realtime", "ollama", "anthropic"], 5),
  negative("tooling", "工具执行/结果传递问题", ["exec", "process tool", "browser.request", "tool result", "sessions.resolve", "tui"], 6),
  positive("startupPerf", "启动热路径瘦身", ["lazy-load", "lazy-loading", "hot path", "hot paths", "startup", "leaner", "benchmark", "cache"], 5),
  positive("pluginBetter", "插件安装链路改善", ["plugin install", "plugin update", "external plugin", "official plugin", "dependency reporting", "clawhub", "scanner trust"], 4),
  positive("recoveryBetter", "修复/恢复能力增强", ["recover", "repair", "doctor", "fix", "fixed", "self-heal", "stale", "restore"], 4),
  positive("channelBetter", "通道投递可靠性增强", ["delivery", "recovery", "streaming", "telegram", "discord", "slack", "signal", "whatsapp", "channel"], 3),
  positive("securityBetter", "安全边界更明确", ["default-deny", "operator approval", "symlink", "trust", "reject", "security", "path policy"], 3),
  positive("providerBetter", "Provider/模型兼容增强", ["provider", "openrouter", "anthropic", "gemini", "tts", "realtime", "deepseek", "openai-compatible"], 3),
  positive("uiBetter", "界面和 WebChat 修复", ["control ui", "webchat", "dashboard", "sessions", "cron", "selection contrast", "pwa"], 2),
];

const SOURCE_WEIGHT = {
  issue: 1.2,
  reddit: 1.05,
  forum: 1.05,
  social: 0.95,
  article: 0.85,
  news: 0.75,
  release: 0.7,
  search: 0.8,
};

const FALLBACK_ISSUE_COUNTS = {
  "2026.5.3-1": 152,
  "2026.5.3": 187,
  "2026.5.2": 340,
  "2026.4.29": 429,
  "2026.4.27": 282,
  "2026.4.26": 573,
  "2026.4.25": 344,
  "2026.4.24": 601,
  "2026.4.23": 439,
  "2026.4.22": 384,
  "2026.4.21": 390,
  "2026.4.20": 214,
  "2026.4.15": 240,
  "2026.4.14": 586,
  "2026.4.12": 361,
  "2026.4.11": 300,
  "2026.4.10": 260,
  "2026.4.9": 130,
  "2026.4.8": 210,
  "2026.4.7": 300,
  "2026.4.5": 808,
  "2026.4.2": 220,
  "2026.4.1": 390,
  "2026.3.31": 220,
  "2026.3.28": 180,
};

const VERIFIED_FALLBACK_ISSUE_COUNTS = new Set([
  "2026.5.3-1",
  "2026.5.3",
  "2026.5.2",
  "2026.4.29",
  "2026.4.27",
  "2026.4.26",
  "2026.4.25",
  "2026.4.24",
  "2026.4.23",
  "2026.4.12",
  "2026.4.20",
  "2026.4.22",
  "2026.4.5",
  "2026.4.14",
  "2026.4.1",
]);

const state = {
  filter: "all",
  rows: [],
  votes: {},
  issueSearchesUsed: 0,
};

const els = {
  syncStatus: document.getElementById("syncStatus"),
  refreshButton: document.getElementById("refreshButton"),
  latestStable: document.getElementById("latestStable"),
  latestAny: document.getElementById("latestAny"),
  versionCount: document.getElementById("versionCount"),
  snapshotNote: document.getElementById("snapshotNote"),
  rankingBody: document.getElementById("rankingBody"),
  rowTemplate: document.getElementById("rowTemplate"),
  filters: Array.from(document.querySelectorAll(".filter-button")),
};

function release(tagName, name, publishedAt, body, plusOne = 0, makeLatest = "false") {
  return {
    tag_name: tagName,
    name,
    prerelease: false,
    make_latest: makeLatest,
    html_url: `https://github.com/${GITHUB_REPO}/releases/tag/${tagName}`,
    published_at: publishedAt,
    body,
    reactions: { "+1": plusOne, hooray: 0, rocket: Math.round(plusOne / 4) },
  };
}

function evidence(sourceType, sentiment, title, url, dimensions, strength = 1) {
  return { sourceType, sentiment, title, url, dimensions, strength };
}

function negative(key, label, terms, weight) {
  return { key, label, terms, weight, polarity: "negative" };
}

function positive(key, label, terms, weight) {
  return { key, label, terms, weight, polarity: "positive" };
}

function versionFromTag(tag) {
  return String(tag || "").replace(/^openclaw\s*/i, "").replace(/^v/i, "").trim();
}

function versionParts(version) {
  return version
    .replace(/-.+$/, "")
    .split(".")
    .map((part) => Number(part) || 0);
}

function compareVersions(a, b) {
  const left = versionParts(a);
  const right = versionParts(b);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff !== 0) return diff;
  }
  return a.includes("-") === b.includes("-") ? 0 : a.includes("-") ? -1 : 1;
}

function isAtLeastMin(version) {
  return compareVersions(version, MIN_VERSION) >= 0;
}

function isFormalRelease(release) {
  const text = `${release.version || ""} ${release.tag_name || ""} ${release.name || ""}`.toLowerCase();
  return !release.prerelease && !/\b(beta|alpha|rc|preview|pre-release)\b/.test(text);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashVersion(version) {
  return Array.from(version).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 1000003, 7);
}

function setStatus(text, tone = "") {
  els.syncStatus.textContent = text;
  els.syncStatus.className = `status-pill ${tone}`.trim();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchReleases() {
  try {
    const releases = await fetchJson(RELEASES_API);
    return releases.length ? releases : FALLBACK_RELEASES;
  } catch (error) {
    console.warn("Using fallback releases:", error);
    setStatus("GitHub 限流，使用快照", "warn");
    return FALLBACK_RELEASES;
  }
}

async function fetchIssuesForVersion(version) {
  if (state.issueSearchesUsed >= MAX_DYNAMIC_ISSUE_SEARCHES && !SEEDED_EVIDENCE[version]) {
    return {
      items: [],
      totalCount: FALLBACK_ISSUE_COUNTS[version] || 0,
      estimated: !VERIFIED_FALLBACK_ISSUE_COUNTS.has(version),
    };
  }
  state.issueSearchesUsed += 1;

  const queries = [`repo:${GITHUB_REPO} is:issue ${version}`];
  const seen = new Set();
  const issues = [];
  let totalCount = FALLBACK_ISSUE_COUNTS[version] || 0;
  let estimated = !VERIFIED_FALLBACK_ISSUE_COUNTS.has(version);

  for (const query of queries) {
    const url = `${ISSUES_API}?q=${encodeURIComponent(query)}&per_page=12`;
    try {
      const data = await fetchJson(url);
      if (typeof data.total_count === "number") {
        totalCount = data.total_count;
        estimated = false;
      }
      for (const item of data.items || []) {
        if (seen.has(item.html_url)) continue;
        seen.add(item.html_url);
        issues.push({
          title: item.title || "",
          body: item.body || "",
          url: item.html_url,
          state: item.state,
          comments: item.comments || 0,
          labels: (item.labels || []).map((label) => label.name || ""),
          sourceType: "issue",
        });
      }
    } catch (error) {
      console.warn(`Issue search failed for ${version}:`, error);
    }
  }

  return { items: issues, totalCount, estimated };
}

async function fetchExternalEvidence(version) {
  const seeded = (SEEDED_EVIDENCE[version] || []).map((item) => ({ ...item }));
  if (!SEARCH_API) return seeded;

  try {
    const url = `${SEARCH_API.replace(/\/$/, "")}/search?version=${encodeURIComponent(version)}&project=openclaw`;
    const data = await fetch(url).then((response) => response.json());
    const external = (data.items || []).map((item) =>
      evidence(
        item.sourceType || "search",
        item.sentiment === "positive" ? "positive" : "negative",
        item.title || item.snippet || "外部反馈",
        item.url || `https://github.com/${GITHUB_REPO}/issues?q=${encodeURIComponent(version)}`,
        item.dimensions || [],
        Number(item.strength || 1),
      ),
    );
    return dedupeEvidence([...seeded, ...external]);
  } catch (error) {
    console.warn(`External search failed for ${version}:`, error);
    return seeded;
  }
}

function dedupeEvidence(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.url}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function issueToEvidence(issue) {
  const text = `${issue.title} ${issue.body} ${issue.labels.join(" ")}`.toLowerCase();
  const negativeMatched = SIGNAL_RULES.some(
    (rule) => rule.polarity === "negative" && rule.terms.some((term) => text.includes(term.toLowerCase())),
  );
  const labelMatched = /bug|regression|crash|broken|error|fails|unresponsive/.test(text);
  const sentiment = negativeMatched || labelMatched ? "negative" : "positive";
  const strength = 1 + Math.min(issue.comments, 12) * 0.08 + (issue.state === "open" ? 0.25 : 0);
  return evidence("issue", sentiment, issue.title, issue.url, [], strength);
}

function releaseToEvidence(releaseItem) {
  return evidence("release", "positive", releaseItem.body || releaseItem.name || releaseItem.version, releaseItem.html_url, [], 1.1);
}

function issueVolumeEvidence(version, issueResult) {
  const count = Number(issueResult.totalCount || 0);
  if (!count) return [];
  return [
    evidence(
      "issue",
      "negative",
      `GitHub Issues 搜索发现 ${issueResult.estimated ? "约 " : ""}${count.toLocaleString("zh-CN")} 条版本相关结果`,
      `https://github.com/${GITHUB_REPO}/issues?q=${encodeURIComponent(version)}`,
      ["regression"],
      clamp(Math.log10(count + 1) * 0.55, 0.8, 1.8),
    ),
  ];
}

function scoreEvidence(items, releaseItem, issueMeta = {}) {
  const counters = new Map(SIGNAL_RULES.map((rule) => [rule.key, 0]));
  const labels = [];
  const riskLabels = [];
  let positiveScore = 0;
  let negativeScore = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  const releaseText = `${releaseItem.name || ""} ${releaseItem.body || ""}`.toLowerCase();

  for (const item of items) {
    const text = `${item.title} ${(item.dimensions || []).join(" ")}`.toLowerCase();
    const sourceWeight = SOURCE_WEIGHT[item.sourceType] || SOURCE_WEIGHT.search;
    const baseStrength = Math.max(0.4, Number(item.strength || 1)) * sourceWeight;
    let matched = false;

    for (const rule of SIGNAL_RULES) {
      const directDimension = (item.dimensions || []).includes(rule.key.replace(/Better$|Perf$/, ""));
      const termMatch = rule.terms.some((term) => text.includes(term.toLowerCase()));
      if (!directDimension && !termMatch) continue;
      matched = true;
      const weighted = baseStrength * rule.weight;
      if (rule.polarity === "positive" && item.sentiment === "positive") {
        counters.set(rule.key, counters.get(rule.key) + 1);
        positiveScore += weighted;
        positiveCount += 1;
      } else if (rule.polarity === "negative" && item.sentiment === "negative") {
        counters.set(rule.key, counters.get(rule.key) + 1);
        negativeScore += weighted;
        negativeCount += 1;
      }
    }

    if (!matched) {
      if (item.sentiment === "positive") {
        positiveScore += baseStrength * 2;
        positiveCount += 1;
      } else {
        negativeScore += baseStrength * 3;
        negativeCount += 1;
      }
    }
  }

  const issueCount = Number(issueMeta.totalCount || 0);
  const issueDerivedSamples = issueCount > 0 ? Math.min(18, Math.max(4, Math.round(Math.log2(issueCount + 1) * 2))) : 0;
  const sampleCount = Math.max(items.length, issueDerivedSamples);
  const releaseAge = daysSince(releaseItem.published_at);
  const versionHash = hashVersion(releaseItem.version);
  const samplePenalty = sampleCoveragePenalty(sampleCount);
  const veryNewPenalty = releaseAge <= 3 ? 6.4 : releaseAge <= 7 ? 3.1 : releaseAge <= 14 ? 1.2 : 0;
  const hotfixPenalty = /-\d+$/.test(releaseItem.version) ? 4.7 : 0;
  const reactionBoost = Math.min(5.2, reactionScore(releaseItem.reactions) * 0.86);
  const releaseComplexity = releaseComplexityScore(releaseText);
  const releaseRisk = releaseRiskScore(releaseText);
  const sourceDiversity = new Set([...items.map((item) => item.sourceType), issueCount > 0 ? "issue" : ""].filter(Boolean)).size;
  const diversityBoost = Math.min(3.2, sourceDiversity * 0.8);
  const maturityBoost = clamp(Math.log1p(Math.max(0, releaseAge)) * 1.1, 0, 4.5);
  const evidenceBalance = (positiveCount - negativeCount) * 0.37;
  const deterministicSpread = (((versionHash % 29) - 14) / 14) * 2.25;
  const issueVolumePenalty = issueCount > 0 ? Math.min(8, Math.log10(issueCount + 1) * 2.15) : 0;

  let score =
    63 +
    positiveScore * 0.52 +
    reactionBoost +
    diversityBoost +
    maturityBoost +
    evidenceBalance +
    deterministicSpread -
    negativeScore * 0.61 -
    samplePenalty -
    issueVolumePenalty -
    veryNewPenalty -
    hotfixPenalty -
    releaseRisk * 1.8 -
    releaseComplexity * 0.9;

  const lowSampleCap = lowSampleScoreCap(sampleCount, releaseItem, {
    releaseAge,
    reactionBoost,
    releaseComplexity,
    releaseRisk,
    sourceDiversity,
    versionHash,
  });
  if (sampleCount < 6) score = Math.min(score, lowSampleCap);
  if (negativeCount === 0 && sampleCount < 9) score = Math.min(score, lowSampleCap + 5.5);
  if (positiveCount === 0) score -= 5;
  score += scoreSpread(releaseItem.version);
  score = Math.round(score * 100) / 100;
  if (score < 20) score = 5 + (hashVersion(releaseItem.version) % 15) + (((hashVersion(releaseItem.version) * 53) % 100) / 100);
  score = clamp(score, 1, 94);

  if (sampleCount < 3) riskLabels.push({ text: `公开样本极少，置信度低`, type: "negative" });
  else if (sampleCount < 6) riskLabels.push({ text: `样本偏少，限制高分`, type: "negative" });
  if (negativeCount === 0 && sampleCount < 9) riskLabels.push({ text: `未找到足够负面样本，不等于无问题`, type: "negative" });
  if (releaseComplexity >= 2) riskLabels.push({ text: `变更面较大，升级风险 +${releaseComplexity.toFixed(1)}`, type: "negative" });
  if (releaseRisk > 0) riskLabels.push({ text: `含破坏/迁移风险词`, type: "negative" });
  if (veryNewPenalty > 0) riskLabels.push({ text: `版本较新，观察期不足`, type: "negative" });
  if (hotfixPenalty > 0) riskLabels.push({ text: `热修复版稳定性折扣`, type: "negative" });

  for (const rule of SIGNAL_RULES) {
    const count = counters.get(rule.key);
    if (count > 0) labels.push({ text: `${rule.label} ${count}`, type: rule.polarity });
  }
  labels.unshift(...riskLabels);
  if (samplePenalty > 0) labels.push({ text: `样本覆盖扣 ${samplePenalty.toFixed(1)} 分`, type: "negative" });

  let upgradeIndex = score + Math.min(8, positiveScore * 0.18) - Math.min(12, negativeScore * 0.12) - hotfixPenalty - veryNewPenalty;
  if (upgradeIndex < 20) upgradeIndex = Math.max(0, score - 4 - (hashVersion(releaseItem.version) % 5));
  upgradeIndex = Math.round(clamp(upgradeIndex, 0, 100) * 10) / 10;

  const topEvidence = items
    .slice()
    .sort((a, b) => Number(b.strength || 1) - Number(a.strength || 1))
    .slice(0, 5);

  return {
    score,
    upgradeIndex,
    labels,
    positiveCount,
    negativeCount,
    sampleCount,
    topEvidence,
  };
}

function sampleCoveragePenalty(sampleCount) {
  if (sampleCount <= 1) return 18.5;
  if (sampleCount === 2) return 14.2;
  if (sampleCount === 3) return 10.4;
  if (sampleCount === 4) return 7.1;
  if (sampleCount === 5) return 4.8;
  if (sampleCount < 9) return (9 - sampleCount) * 0.9;
  return 0;
}

function lowSampleScoreCap(sampleCount, releaseItem, meta) {
  const base = sampleCount <= 1 ? 50 : sampleCount === 2 ? 56 : sampleCount === 3 ? 63 : sampleCount === 4 ? 68 : 72;
  const maturity = clamp(Math.log1p(Math.max(0, meta.releaseAge)) * 1.8, 0, 6);
  const reaction = clamp(meta.reactionBoost * 0.7, 0, 3.2);
  const diversity = clamp((meta.sourceDiversity - 1) * 1.3, 0, 3.5);
  const complexityDrag = clamp(meta.releaseComplexity * 1.4 + meta.releaseRisk * 2.2, 0, 7);
  const versionSpread = ((meta.versionHash % 17) - 8) * 0.42;
  const hotfixDrag = /-\d+$/.test(releaseItem.version) ? 2.4 : 0;
  return base + maturity + reaction + diversity + versionSpread - complexityDrag - hotfixDrag;
}

function releaseComplexityScore(text) {
  const changeTerms = [
    "breaking",
    "migration",
    "migrate",
    "remove",
    "removed",
    "rewrite",
    "refactor",
    "gateway",
    "plugin",
    "provider",
    "install",
    "runtime",
    "transport",
    "security",
    "dashboard",
    "webchat",
    "doctor",
    "launchagent",
    "config",
  ];
  const matches = changeTerms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
  const lengthLoad = Math.min(3, text.length / 1200);
  return clamp(matches * 0.35 + lengthLoad, 0, 6);
}

function releaseRiskScore(text) {
  const riskTerms = ["breaking", "dangerous", "force", "unsafe", "remove", "removed", "migration", "fail closed", "hotfix", "rollback"];
  return riskTerms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}

function daysSince(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return 99;
  return Math.max(0, (Date.now() - date.getTime()) / 86400000);
}

function reactionScore(reactions = {}) {
  return Math.min(8, ((reactions["+1"] || 0) + (reactions.hooray || 0) * 1.2 + (reactions.rocket || 0) * 1.5) / 4);
}

function classifyRecommendation(index) {
  if (index >= 82) return { text: "强烈推荐", className: "good" };
  if (index >= 68) return { text: "推荐", className: "good" };
  if (index >= 50) return { text: "谨慎升级", className: "careful" };
  return { text: "不推荐", className: "bad" };
}

function factorLabels(row) {
  const labels = row.labels
    .filter((item) => !/GitHub Issues|Reddit|REDDIT|CSDN|Discord/i.test(item.text))
    .slice(0, 7);
  for (const item of row.topEvidence) {
    const text = cleanFeedbackText(item.title);
    if (text) labels.push({ text: truncate(text, 30), type: item.sentiment });
  }
  return labels.slice(0, 10);
}

function scoreSpread(version) {
  return (((hashVersion(version) * 37) % 101) - 50) / 100;
}

function formatScore(value) {
  return Number(value).toFixed(2);
}

function cleanFeedbackText(text) {
  return String(text || "")
    .replace(/^GitHub Issues 搜索发现.*$/i, "")
    .replace(/\b(Reddit|GitHub Issues|GitHub|CSDN|Discord|REDDIT)\b[:：]?\s*/gi, "")
    .replace(/^(ZooClaw|Clawsmith|vnROM|VulnCheck|Clawly)\s*(记录|披露|转述社区警告|称)?\s*/i, "")
    .replace(/^(用户称|讨论称|同一报告称|正式版文章称)\s*/i, "")
    .replace(/^\[[^\]]+\]:?\s*/g, "")
    .replace(/^#+\s*/g, "")
    .replace(/^OpenClaw\s*/i, "")
    .trim();
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

async function buildRows() {
  setStatus("正在更新正式版", "");
  state.issueSearchesUsed = 0;
  const releases = await fetchReleases();
  const filtered = releases
    .map((item) => ({ ...item, version: versionFromTag(item.tag_name || item.name) }))
    .filter((item) => item.version && isAtLeastMin(item.version) && isFormalRelease(item))
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  const latestAny = filtered[0];
  const latestStable =
    filtered.find((item) => item.make_latest === "true") ||
    filtered.find((item) => !/-\d+$/.test(item.version)) ||
    filtered[0];

  const rows = [];
  for (const [index, releaseItem] of filtered.entries()) {
    setStatus(`检索正式版反馈 ${index + 1}/${filtered.length}`, "");
    const [issueResult, externalEvidence] = await Promise.all([fetchIssuesForVersion(releaseItem.version), fetchExternalEvidence(releaseItem.version)]);
    const issues = issueResult.items;
    const evidenceItems = dedupeEvidence([
      releaseToEvidence(releaseItem),
      ...issueVolumeEvidence(releaseItem.version, issueResult),
      ...issues.map(issueToEvidence),
      ...externalEvidence,
    ]);
    const scoring = scoreEvidence(evidenceItems, releaseItem, issueResult);
    const isHotfix = /-\d+$/.test(releaseItem.version);
    rows.push({
      version: releaseItem.version,
      name: releaseItem.name || releaseItem.tag_name,
      date: releaseItem.published_at,
      prerelease: false,
      isLatestAny: releaseItem === latestAny,
      isLatestStable: releaseItem === latestStable,
      isHotfix,
      url: releaseItem.html_url,
      issues,
      issueCount: issueResult.totalCount,
      issueCountEstimated: issueResult.estimated,
      evidenceItems,
      labels: scoring.labels,
      topEvidence: scoring.topEvidence,
      sampleCount: scoring.sampleCount,
      positiveCount: scoring.positiveCount,
      negativeCount: scoring.negativeCount,
      score: scoring.score,
      upgradeIndex: scoring.upgradeIndex,
    });
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  rows.sort((a, b) => b.score - a.score || b.upgradeIndex - a.upgradeIndex || compareVersions(b.version, a.version));
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });

  applyRankMovements(rows);
  saveTodaySnapshot(rows);
  state.rows = rows;
  await loadVotes(rows);

  els.latestStable.textContent = latestStable ? latestStable.version : "未找到";
  els.latestAny.textContent = latestAny ? latestAny.version : "未找到";
  els.versionCount.textContent = String(rows.length);
  els.snapshotNote.textContent = `最新评分时间：${new Date().toLocaleString("zh-CN")}，Beta/预发布已排除`;
  setStatus("已更新正式版", "ok");
  render();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "{}");
  } catch {
    return {};
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function applyRankMovements(rows) {
  const history = getHistory();
  const keys = Object.keys(history).sort();
  const previousKey = keys.filter((key) => key < todayKey()).pop() || keys.pop();
  const previous = previousKey ? history[previousKey] : {};
  for (const row of rows) {
    const oldRank = previous[row.version];
    row.movement = typeof oldRank === "number" ? oldRank - row.rank : 0;
  }
}

function saveTodaySnapshot(rows) {
  const history = getHistory();
  history[todayKey()] = Object.fromEntries(rows.map((row) => [row.version, row.rank]));
  const keys = Object.keys(history).sort();
  while (keys.length > 14) delete history[keys.shift()];
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function localVotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.votes) || "{}");
  } catch {
    return {};
  }
}

function saveLocalVotes(votes) {
  localStorage.setItem(STORAGE_KEYS.votes, JSON.stringify(votes));
}

async function loadVotes(rows) {
  const local = localVotes();
  state.votes = {};

  if (!VOTE_API) {
    for (const row of rows) state.votes[row.version] = local[row.version] || { recommend: 0, reject: 0, source: "本地" };
    return;
  }

  await Promise.all(
    rows.map(async (row) => {
      try {
        const url = `${VOTE_API.replace(/\/$/, "")}/votes?version=${encodeURIComponent(row.version)}`;
        const data = await fetch(url).then((response) => response.json());
        state.votes[row.version] = {
          recommend: Number(data.recommend || 0),
          reject: Number(data.reject || 0),
          source: "公开",
        };
      } catch (error) {
        console.warn(`Vote API failed for ${row.version}:`, error);
        state.votes[row.version] = local[row.version] || { recommend: 0, reject: 0, source: "本地" };
      }
    }),
  );
}

async function vote(version, choice) {
  const key = choice === "recommend" ? "recommend" : "reject";
  const current = state.votes[version] || { recommend: 0, reject: 0, source: VOTE_API ? "公开" : "本地" };

  if (VOTE_API) {
    try {
      const response = await fetch(`${VOTE_API.replace(/\/$/, "")}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, choice: key }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      state.votes[version] = {
        recommend: Number(data.recommend || 0),
        reject: Number(data.reject || 0),
        source: "公开",
      };
      render();
      return;
    } catch (error) {
      console.warn("Vote API failed, falling back to local count:", error);
    }
  }

  current[key] += 1;
  current.source = "本地";
  state.votes[version] = current;
  const local = localVotes();
  local[version] = current;
  saveLocalVotes(local);
  render();
}

function trendNode(movement) {
  const span = document.createElement("span");
  if (movement > 0) {
    span.className = "trend up";
    span.textContent = `↑${movement}`;
  } else if (movement < 0) {
    span.className = "trend down";
    span.textContent = `↓${Math.abs(movement)}`;
  } else {
    span.className = "trend flat";
    span.textContent = "→";
  }
  return span;
}

function scoreMeter(value) {
  const wrap = document.createElement("div");
  wrap.className = "score-meter";
  const number = document.createElement("span");
  number.className = "score-number";
  number.textContent = formatScore(value);
  const bar = document.createElement("span");
  bar.className = "bar";
  const fill = document.createElement("span");
  fill.style.width = `${value}%`;
  fill.className = value < 45 ? "low" : value < 68 ? "mid" : "";
  bar.append(fill);
  wrap.append(number, bar);
  return wrap;
}

function render() {
  const rows = state.rows.filter((row) => {
    if (state.filter === "stable") return !row.isHotfix;
    if (state.filter === "hotfix") return row.isHotfix;
    if (state.filter === "recommended") return row.upgradeIndex >= 68 && !row.isHotfix;
    return true;
  });

  els.rankingBody.textContent = "";
  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "loading-row";
    td.textContent = "当前筛选没有结果";
    tr.append(td);
    els.rankingBody.append(tr);
    return;
  }

  for (const row of rows) {
    const tr = els.rowTemplate.content.firstElementChild.cloneNode(true);

    const rankLine = document.createElement("div");
    rankLine.className = "rank-line";
    const rankNumber = document.createElement("span");
    rankNumber.textContent = `#${row.rank}`;
    rankNumber.className = "rank-number";
    rankLine.append(rankNumber, trendNode(row.movement));
    tr.querySelector(".rank-cell").append(rankLine);

    const version = tr.querySelector(".version-cell");
    const versionTitle = document.createElement("div");
    versionTitle.className = "version-title";
    const versionText = document.createElement("span");
    versionText.textContent = row.version;
    versionTitle.append(versionText);
    if (row.isLatestStable) versionTitle.append(badge("最新", "latest"));
    if (row.isHotfix) versionTitle.append(badge("热修复", "hotfix"));
    const date = document.createElement("div");
    date.className = "version-date";
    date.textContent = `${new Date(row.date).toLocaleDateString("zh-CN")} · 样本 ${row.sampleCount}`;
    version.append(versionTitle, date);

    const recommendation = classifyRecommendation(row.upgradeIndex);
    const recommendLabel = document.createElement("span");
    recommendLabel.className = `recommend-label ${recommendation.className}`;
    recommendLabel.textContent = recommendation.text;
    const scoreCell = tr.querySelector(".score-cell");
    scoreCell.append(scoreMeter(row.score), recommendLabel);

    const factorList = document.createElement("div");
    factorList.className = "factor-list";
    for (const factor of factorLabels(row)) {
      const chip = document.createElement("span");
      chip.className = `factor-chip ${factor.type}`;
      chip.textContent = factor.text;
      factorList.append(chip);
    }
    tr.querySelector(".factor-cell").append(factorList);

    tr.querySelector(".vote-cell").append(voteControls(row));
    els.rankingBody.append(tr);
  }
}

function badge(text, type) {
  const span = document.createElement("span");
  span.className = `badge ${type}`;
  span.textContent = text;
  return span;
}

function sourceLinks(row) {
  const sourceLinksWrap = document.createElement("div");
  sourceLinksWrap.className = "source-links";

  const releaseLink = document.createElement("a");
  releaseLink.href = row.url;
  releaseLink.target = "_blank";
  releaseLink.rel = "noreferrer";
  releaseLink.textContent = "Release";
  sourceLinksWrap.append(releaseLink);

  const issueLink = document.createElement("a");
  issueLink.href = `https://github.com/${GITHUB_REPO}/issues?q=${encodeURIComponent(row.version)}`;
  issueLink.target = "_blank";
  issueLink.rel = "noreferrer";
  issueLink.textContent = `Issues ${formatIssueCount(row)}`;
  sourceLinksWrap.append(issueLink);

  for (const item of row.topEvidence.filter((entry) => entry.url !== row.url).slice(0, 2)) {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = item.sourceType === "issue" ? "具体反馈" : "外部样本";
    sourceLinksWrap.append(link);
  }
  return sourceLinksWrap;
}

function voteControls(row) {
  const votes = state.votes[row.version] || { recommend: 0, reject: 0, source: VOTE_API ? "公开" : "本地" };
  const wrap = document.createElement("div");
  wrap.className = "vote-stack";

  const yes = document.createElement("button");
  yes.className = `vote-button yes ${votes.recommend > votes.reject && votes.recommend > 0 ? "active" : ""}`;
  yes.type = "button";
  yes.textContent = "推荐";
  yes.addEventListener("click", () => vote(row.version, "recommend"));

  const no = document.createElement("button");
  no.className = `vote-button no ${votes.reject > votes.recommend && votes.reject > 0 ? "active" : ""}`;
  no.type = "button";
  no.textContent = "不推荐";
  no.addEventListener("click", () => vote(row.version, "reject"));

  const count = document.createElement("span");
  const dominant = votes.recommend === votes.reject ? "neutral" : votes.recommend > votes.reject ? "yes" : "no";
  count.className = `vote-count ${dominant}`;
  count.textContent = `${votes.recommend} / ${votes.reject}`;

  const hint = document.createElement("span");
  hint.className = "vote-hint";
  hint.textContent = `${votes.source}计数，不参与排名`;

  const links = sourceLinks(row);

  wrap.append(yes, no, count, hint, links);
  return wrap;
}

function formatIssueCount(row) {
  const count = Number(row.issueCount || 0);
  if (!count) return "搜索";
  return `${row.issueCountEstimated ? "约" : ""}${count.toLocaleString("zh-CN")}`;
}

els.refreshButton.addEventListener("click", buildRows);
for (const button of els.filters) {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    els.filters.forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
}

buildRows().catch((error) => {
  console.error(error);
  setStatus("更新失败，显示正式版快照", "warn");
  const rows = FALLBACK_RELEASES.map((releaseItem) => {
    const version = versionFromTag(releaseItem.tag_name);
    const issueResult = {
      totalCount: FALLBACK_ISSUE_COUNTS[version] || 0,
      estimated: !VERIFIED_FALLBACK_ISSUE_COUNTS.has(version),
    };
    const evidenceItems = dedupeEvidence([
      releaseToEvidence({ ...releaseItem, version }),
      ...issueVolumeEvidence(version, issueResult),
      ...(SEEDED_EVIDENCE[version] || []),
    ]);
    const scoring = scoreEvidence(evidenceItems, { ...releaseItem, version }, issueResult);
    return {
      version,
      name: releaseItem.name,
      date: releaseItem.published_at,
      prerelease: false,
      isLatestAny: false,
      isLatestStable: version === "2026.5.3",
      isHotfix: /-\d+$/.test(version),
      url: releaseItem.html_url,
      issues: [],
      issueCount: issueResult.totalCount,
      issueCountEstimated: issueResult.estimated,
      evidenceItems,
      labels: scoring.labels,
      topEvidence: scoring.topEvidence,
      sampleCount: scoring.sampleCount,
      positiveCount: scoring.positiveCount,
      negativeCount: scoring.negativeCount,
      score: scoring.score,
      upgradeIndex: scoring.upgradeIndex,
      movement: 0,
    };
  }).sort((a, b) => b.score - a.score || compareVersions(b.version, a.version));
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });
  state.rows = rows;
  render();
});
