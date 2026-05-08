# MemoFlash 前端改进实现计划

**日期：** 2026-05-08  
**设计文档：** `docs/superpowers/specs/2026-05-08-frontend-improvements-design.md`

## 概述

实现三项前端改进：标签筛选交互优化、图片显示修复、Markdown 内容渲染支持。

## 任务列表

### 任务 1：安装依赖

**目标：** 安装 markdown 渲染所需的依赖库

**步骤：**
1. 进入 `client` 目录
2. 运行 `npm install marked dompurify`
3. 验证 `package.json` 和 `package-lock.json` 更新

**验证：**
- 依赖成功添加到 `package.json`
- `node_modules` 中包含对应的包

**文件：**
- `client/package.json`
- `client/package-lock.json`

---

### 任务 2：创建 MarkdownContent 组件

**目标：** 创建可复用的 markdown 渲染组件

**步骤：**
1. 创建 `client/src/components/MarkdownContent.jsx`
2. 导入 `marked` 和 `dompurify`
3. 实现组件逻辑：
   - 接收 `content` prop
   - 使用 `marked.parse()` 解析 markdown
   - 使用 `DOMPurify.sanitize()` 清理 HTML
   - 使用 `dangerouslySetInnerHTML` 渲染
4. 添加基础样式类

**代码：**
```jsx
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function MarkdownContent({ content }) {
  const html = DOMPurify.sanitize(marked.parse(content))
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  )
}
```

**验证：**
- 组件文件创建成功
- 导入语句正确
- 组件可以被其他文件导入

**文件：**
- `client/src/components/MarkdownContent.jsx` (新建)

---

### 任务 3：修改 TagFilter 组件

**目标：** 在收起状态显示已选标签

**步骤：**
1. 打开 `client/src/components/TagFilter.jsx`
2. 在标题区域（`<div className="flex items-center gap-2">`）后添加已选标签显示
3. 添加条件渲染：仅在收起且有选中标签时显示
4. 使用 `selectedTags.join(', ')` 拼接标签名称

**关键代码：**
```jsx
<div className="flex items-center gap-2">
  <span className="text-xl">🏷️</span>
  <span className="text-base font-semibold">标签筛选</span>
  {!isExpanded && selectedTags.length > 0 && (
    <span className="text-sm text-gray-500">
      ：{selectedTags.join(', ')}
    </span>
  )}
</div>
```

**验证：**
- 收起状态显示已选标签
- 无选中时不显示冒号和标签
- 展开状态不显示已选标签

**文件：**
- `client/src/components/TagFilter.jsx`

---

### 任务 4：修改 MemoCard 组件 - 图片修复

**目标：** 修复图片字段名称，使图片正常显示

**步骤：**
1. 打开 `client/src/components/MemoCard.jsx`
2. 找到图片渲染部分（约第 30-41 行）
3. 将 `memo.resources` 改为 `memo.attachments`
4. 将 `resource` 变量改为 `attachment`
5. 将 `key={resource.uid}` 改为 `key={attachment.name}`
6. 将 `className="w-30 h-30"` 改为 `className="w-32 h-32"`

**修改前：**
```jsx
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
```

**修改后：**
```jsx
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

**验证：**
- 使用 test 标签筛选
- 图片正常加载和显示
- 图片尺寸为 128px × 128px

**文件：**
- `client/src/components/MemoCard.jsx`

---

### 任务 5：修改 MemoCard 组件 - Markdown 渲染

**目标：** 使用 MarkdownContent 组件渲染闪念内容和历史评论

**步骤：**
1. 在 `MemoCard.jsx` 顶部导入 `MarkdownContent`
2. 找到闪念内容渲染部分（约第 28 行）
3. 将纯文本 `<div>` 替换为 `<MarkdownContent>`
4. 找到历史评论内容渲染部分（约第 50 行）
5. 将纯文本 `<div>` 替换为 `<MarkdownContent>`

**导入语句：**
```jsx
import MarkdownContent from './MarkdownContent'
```

**闪念内容修改：**
```jsx
// 修改前
<div className="text-sm leading-relaxed whitespace-pre-wrap">{memo.content}</div>

// 修改后
<MarkdownContent content={memo.content} />
```

**历史评论修改：**
```jsx
// 修改前
<div className="text-sm">{relation.memo.content}</div>

// 修改后
<MarkdownContent content={relation.memo.content} />
```

**验证：**
- Markdown 格式正确渲染（粗体、斜体、链接等）
- 历史评论的 markdown 也正确渲染
- 样式与现有设计一致

**文件：**
- `client/src/components/MemoCard.jsx`

---

### 任务 6：功能测试

**目标：** 验证所有改动正常工作

**测试用例：**

1. **标签筛选测试**
   - 不选标签，收起状态不显示标签列表
   - 选择 1 个标签，收起状态显示该标签
   - 选择多个标签，收起状态显示所有标签（逗号分隔）
   - 展开状态不显示已选标签

2. **图片显示测试**
   - 选择 test 标签
   - 点击"下一条随机闪念"
   - 验证图片正常加载
   - 验证图片尺寸和布局正确

3. **Markdown 渲染测试**
   - 查看包含 markdown 格式的闪念
   - 验证粗体、斜体、链接正确渲染
   - 验证列表、代码块正确渲染
   - 查看历史评论，验证 markdown 渲染

4. **安全测试**
   - 如果有包含 HTML 标签的内容，验证被正确清理
   - 确保没有 XSS 漏洞

**验证标准：**
- 所有功能正常工作
- 无控制台错误
- 样式与设计一致

---

## 实现顺序

按照任务编号顺序执行：
1. 安装依赖
2. 创建 MarkdownContent 组件
3. 修改 TagFilter 组件
4. 修改 MemoCard 组件（图片修复）
5. 修改 MemoCard 组件（Markdown 渲染）
6. 功能测试

## 回滚计划

如果出现问题：
1. 使用 `git checkout` 恢复修改的文件
2. 如果依赖有问题，删除 `node_modules` 和 `package-lock.json`，重新 `npm install`

## 预计时间

- 任务 1-2：5 分钟
- 任务 3-5：10 分钟
- 任务 6：5 分钟
- **总计：** 约 20 分钟
