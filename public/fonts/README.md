# 字体说明

## Anthropic Serif Web（不打包）

项目优先使用 Anthropic Serif Web，该字体是 Anthropic PBC 的专有字体
（Copyright 2025 Anthropic PBC），许可禁止再分发。因此本项目**不打包**其字体文件，仅在 CSS 中通过 `local("Anthropic Serif Web")` 引用——仅当访客设备已安装该字体时生效（如项目维护者本人的设备），不构成分发。

## Noto Serif SC（思源宋体同源，SIL OFL，打包）

作为 Anthropic Serif 不可用时的视觉接近替代，通过 [`@fontsource/noto-serif-sc`](https://www.npmjs.com/package/@fontsource/noto-serif-sc)
引入。Noto Serif SC 与思源宋体（Source Han Serif）同源，采用 SIL Open Font License，
允许自由分发与打包。

`@fontsource` 按字重将 CJK 字符集切分为上百个 `unicode-range` 分片（每个 woff2 约 40–50KB），
浏览器只下载当前页面实际用到的字符分片，避免一次性加载完整字体（>4MB/字重）。

## 字体优先级

```text
"Anthropic Serif Web"   
"Noto Serif SC"         
"Songti SC", "STSong"   
serif                  
```

定义见 `src/styles/global.css` 的 `--serif` 变量；字重 CSS 在
`src/layouts/BaseLayout.astro` 中按需 import（400 / 500 / 600 / 700）。
