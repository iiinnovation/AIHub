# AIHub

一个桌面应用，用于在单一窗口内管理多个 AI 聊天平台。

![平台](https://img.shields.io/badge/平台-Windows-blue)
![Electron](https://img.shields.io/badge/Electron-28.0-47848F)
![许可证](https://img.shields.io/badge/许可证-MIT-green)

## 功能特性

- **多 AI 平台切换**：支持 ChatGPT、Claude、Gemini、通义千问、DeepSeek、豆包
- **对话提取**：一键提取当前对话内容
- **上下文导入**：将文本快速注入到 AI 输入框
- **上下文压缩**：生成压缩提示词，帮助总结长对话
- **提示词模板**：创建、编辑、导入/导出常用提示词模板，支持 `{clipboard}` 变量

## 截图

```
┌─────────────────────────────────────────────────────┐
│  AIHub                                              │
├──────────┬──────────────────────────────────────────┤
│ 🟢 ChatGPT │                                        │
│ 🟠 Claude  │         AI 聊天界面                     │
│ 🔵 Gemini  │                                        │
│ 🟣 通义千问 │                                        │
│ ⚫ DeepSeek│                                        │
│ 🟤 豆包    │                                        │
├──────────┴──────────────────────────────────────────┤
│  [提取]  [导入]  [压缩]  [模板]                      │
└─────────────────────────────────────────────────────┘
```

## 安装

### 方式一：下载安装包（推荐）

前往 [Releases](../../releases) 页面下载最新的 `.exe` 安装包。

### 方式二：从源码运行

```bash
# 克隆仓库
git clone https://github.com/你的用户名/AIHub-Windows.git
cd AIHub-Windows

# 安装依赖
npm install

# 运行应用
npm start
```

## 打包构建

### 在 Windows 上打包

```bash
npm run build:win
```

构建完成后，安装包在 `dist/` 目录下。

### 使用 GitHub Actions 自动打包

推送代码到 GitHub 后，会自动触发构建流程，生成的安装包可在 Actions 的 Artifacts 中下载。

## 使用说明

### 切换 AI 平台

点击左侧边栏的 AI 名称即可切换。每个平台的登录状态会独立保存。

### 提取对话

1. 在 AI 平台进行对话
2. 点击底部「提取」按钮
3. 对话内容会显示在弹窗中
4. 点击「复制到剪贴板」保存

### 导入上下文

1. 点击底部「导入」按钮
2. 粘贴要导入的文本
3. 点击「导入」，文本会自动填入 AI 输入框

### 压缩上下文

1. 在有对话内容时，点击「压缩」按钮
2. 选择压缩比例（25%/50%/75%）
3. 点击「生成提示词」
4. 压缩提示词会复制到剪贴板，粘贴到新对话中让 AI 总结

### 提示词模板

1. 点击「模板」按钮打开模板管理
2. 点击「+ 新建」创建模板
3. 模板内容支持 `{clipboard}` 变量，使用时会替换为剪贴板内容
4. 点击模板旁的 ✓ 按钮应用模板

#### 模板示例

```
请帮我翻译以下内容为英文：

{clipboard}
```

## 项目结构

```
AIHub-Windows/
├── main.js           # 主进程
├── preload.js        # 预加载脚本（IPC 桥接）
├── package.json      # 项目配置
├── src/
│   ├── index.html    # 主窗口
│   ├── styles.css    # 样式
│   └── renderer.js   # 渲染进程逻辑
├── scripts/          # 提取/注入脚本
│   ├── extract-chatgpt.js
│   ├── extract-claude.js
│   ├── extract-gemini.js
│   ├── extract-qwen.js
│   ├── extract-deepseek.js
│   ├── extract-doubao.js
│   └── inject-context.js
└── resources/
    └── ai-providers.json  # AI 平台配置
```

## 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [electron-store](https://github.com/sindresorhus/electron-store) - 本地数据存储
- [electron-builder](https://www.electron.build/) - 应用打包工具

## 常见问题

### Q: 为什么某个 AI 平台无法正常显示？

A: 部分平台可能有反爬机制或地区限制。请确保你能在浏览器中正常访问该平台。

### Q: 提取功能不工作？

A: AI 平台会不定期更新页面结构，可能导致提取脚本失效。欢迎提交 Issue 或 PR。

### Q: 如何添加新的 AI 平台？

A: 
1. 在 `resources/ai-providers.json` 中添加平台配置
2. 在 `scripts/` 目录下创建对应的提取脚本

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
