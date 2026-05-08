# MemoFlash 前端改进设计文档

**日期：** 2026-05-08  
**作者：** Claude  
**状态：** 待审核

## 概述

本文档描述了 MemoFlash 前端的三项改进：标签筛选交互优化、图片显示修复、Markdown 内容渲染支持。

## 背景

当前存在以下问题：
1. 标签筛选收起时，用户无法看到已选中的标签
2. 闪念中的图片附件无法显示
3. 闪念内容是 markdown 格式，但页面只显示纯文本

## 目标

1. 提升标签筛选的可用性，让用户在收起状态下也能看到选中的标签
2. 修复图片显示问题，正确渲染附件图片
3. 支持完整的 markdown 渲染，包括格式化、链接、列表等

## 技术方案

### 方案选择

采用**纯前端修复方案**：
- 所有改动集中在前端代码
- 不修改后端逻辑
- 改动最小，风险最低

### 详细设计

#### 1. 标签筛选交互优化

**组件：** `TagFilter.jsx`

**改动：**
- 在收起状态下，标题区域显示已选标签名称列表
- 格式：`标签筛选：tag1, tag2, tag3`
- 无选中标签时不显示冒号和列表
- 已选标签使用灰色小字显示

**UI 示例：**
```
收起状态（有选中）：
🏷️ 标签筛选：test, 记录    [展开]

收起状态（无选中）：
🏷️ 标签筛选    [展开]

展开状态：
🏷️ 标签筛选    [收起]
[搜索框]
[标签列表...]
```

**实现要点：**
- 在 `!isExpanded` 条件下添加已选标签显示
- 使用 `selectedTags.join(', ')` 拼接标签名称
- 添加条件渲染：`selectedTags.length > 0`

#### 2. 图片显示修复

**组件：** `MemoCard.jsx`

**问题根因：**
- API 返回的字段名是 `attachments`
- 前端代码使用的是 `resources`
- 字段不匹配导致图片无法渲染

**改动：**
1. 将 `memo.resources` 改为 `memo.attachments`
2. 将 `resource` 变量名改为 `attachment`
3. 修复 key 属性：从 `resource.uid` 改为 `attachment.name`
4. 修复 CSS 类名：`w-30 h-30` 改为 `w-32 h-32`（Tailwind 标准尺寸）

**代码对比：**
```jsx
// 修改前
{memo.resources && memo.resources.length > 0 && (
  <div className="flex gap-2 flex-wrap">
    {memo.resources.map(resource => (
      <img
        key={resource.uid}
        src={resource.externalLink}
        alt=""
        className="w-30 h-30 object-cover rounded-lg"
      />
    ))}
  </div>
)}

// 修改后
{memo.attachments && memo.attachments.length > 0 && (
  <div className="flex gap-2 flex-wrap">
    {memo.attachments.map(attachment => (
      <img
        key={attachment.name}
        src={attachment.externalLink}
        alt=""
        className="w-32 h-32 object-cover rounded-lg"
      />
    ))}
  </div>
)}
```

#### 3. Markdown 内容渲染

**新增组件：** `MarkdownContent.jsx`

**依赖库：**
- `marked`：轻量级 markdown 解析器
- `dompurify`：HTML 清理库，防止 XSS 攻击

**组件实现：**
```jsx
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function MarkdownContent({ content }) {
  const html = DOMPurify.sanitize(marked.parse(content))
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

**安全措施：**
- 使用 `DOMPurify.sanitize()` 清理所有 HTML
- 防止 XSS 注入攻击
- 保留安全的 markdown 特性

**应用位置：**
1. 闪念主内容：`MemoCard.jsx` 中的 `memo.content`
2. 历史评论内容：`relation.memo.content`

**样式处理：**
- 添加基础 markdown 样式
- 支持标题、列表、链接、代码块等元素
- 保持与现有设计风格一致

## 实现步骤

1. 安装依赖：`npm install marked dompurify`
2. 创建 `MarkdownContent.jsx` 组件
3. 修改 `TagFilter.jsx` 添加已选标签显示
4. 修改 `MemoCard.jsx` 修复图片字段和渲染 markdown
5. 测试所有改动

## 测试计划

### 功能测试

1. **标签筛选**
   - 收起状态显示已选标签
   - 无选中时不显示标签列表
   - 多个标签用逗号分隔

2. **图片显示**
   - 使用 test 标签筛选
   - 验证图片正常加载和显示
   - 检查图片尺寸和布局

3. **Markdown 渲染**
   - 测试基础格式（粗体、斜体、链接）
   - 测试列表和代码块
   - 测试历史评论的 markdown 渲染

### 安全测试

- 测试 XSS 防护：尝试注入 `<script>` 标签
- 验证 DOMPurify 正确清理恶意代码

## 风险评估

**低风险：**
- 改动仅限前端展示层
- 不影响数据存储和后端逻辑
- 可快速回滚

**潜在问题：**
- Markdown 渲染可能影响页面性能（大量内容时）
- 需要确保 DOMPurify 配置正确

## 后续优化

1. 考虑添加 markdown 编辑器（评论输入时）
2. 优化图片加载（懒加载、占位符）
3. 支持更多 markdown 特性（表格、任务列表）
