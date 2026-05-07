# MemoFlash 随机回顾闪念页面设计文档

## 项目概述

MemoFlash 是一个基于 memos 的随机闪念回顾 Web 应用。用户可以通过标签筛选，随机浏览过去的闪念（memo），查看历史评论和图片，并添加新评论。

## 核心功能

1. 标签筛选：路径形式展示（如 `日记/情绪/开心`），支持多选和搜索，选择持久化到 localStorage
2. 随机展示：根据选中标签随机获取一条闪念详情
3. 内容展示：显示闪念正文、图片附件、历史评论
4. 评论功能：对当前闪念添加新评论
5. 响应式设计：支持 PC 和移动端

## 技术架构

### 技术栈

**后端（Python）**
- FastAPI + uvicorn
- uv（依赖管理）
- sqlite3（标准库）
- httpx（HTTP 客户端）
- python-dotenv（环境变量管理）

**前端（React）**
- Vite + React 18
- 状态管理：React hooks
- 样式：Tailwind CSS
- HTTP 客户端：fetch API

### 项目结构

```
MemoFlash/
├── backend/
│   ├── main.py              # FastAPI 入口 + 路由定义
│   ├── db.py                # sqlite3 数据库读取逻辑
│   ├── pyproject.toml       # uv 项目配置
│   └── uv.lock              # uv 锁文件
├── client/
│   ├── src/
│   │   ├── App.jsx          # 主应用组件
│   │   ├── components/
│   │   │   ├── TagFilter.jsx    # 标签筛选器（路径形式）
│   │   │   ├── MemoCard.jsx     # 闪念详情展示
│   │   │   └── CommentBox.jsx   # 评论输入组件
│   │   └── hooks/
│   │       └── useSelectedTags.js  # 标签选择持久化 hook
│   ├── vite.config.js
│   └── package.json
├── Dockerfile               # 单一 Docker 镜像（后端 + 前端静态文件）
├── build.sh                 # 一键构建脚本
├── .env.example             # 环境变量示例
└── README.md
```

### 环境变量

```bash
MEMOS_TOKEN=memos_pat_xxx        # memos API Bearer token
MEMOS_USER=zhengwenfeng          # memos 用户名
MEMOS_API_BASE=https://memos.zhengwenfeng.com  # memos API 地址
DB_PATH=~/.memos/memos_prod.db   # sqlite3 数据库路径
```

## API 设计

### 后端接口

**1. 获取标签列表**
```
GET /api/tags
Response: {
  "tags": {
    "日记/情绪/开心": 2,
    "三省吾身/感悟": 6,
    ...
  }
}
```

**2. 随机获取闪念**
```
GET /api/random-memo?tags=tag1,tag2
Query: tags - 逗号分隔的标签列表（可选）
Response: {
  "uid": "inEQMXeX8GU933Cnxi6QAr",
  "content": "...",
  "createTime": "2026-05-06T14:01:16Z",
  "tags": ["InBox"],
  "attachments": [...],
  "relations": [...]  // 历史评论
}
```

**3. 提交评论**
```
POST /api/memos/{uid}/comments
Body: {
  "content": "评论内容"
}
Response: {
  "name": "memos/xxx",
  "content": "...",
  "createTime": "..."
}
```

### 后端实现逻辑

**数据库 Schema：**
```sql
-- memo 表结构
CREATE TABLE memo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL UNIQUE,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL,
  updated_ts BIGINT NOT NULL,
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  content TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL CHECK (visibility IN ('PUBLIC', 'PROTECTED', 'PRIVATE')) DEFAULT 'PRIVATE',
  payload TEXT NOT NULL DEFAULT '{}',  -- JSON 字段，包含标签等元数据
  pinned INTEGER NOT NULL CHECK (pinned IN (0, 1)) DEFAULT 0
);
```

**随机获取闪念流程：**
1. 从 sqlite3 使用 SQL 直接随机取一条 uid（高效）：
   ```sql
   SELECT uid FROM memo 
   WHERE row_status = 'NORMAL' 
   AND json_extract(payload, '$.tags') LIKE '%tag1%'
   ORDER BY RANDOM() 
   LIMIT 1;
   ```
2. 调用 memos API `GET /api/v1/memos/{uid}` 获取完整详情
3. 返回给前端

**标签获取流程：**
1. 调用 memos API `GET /api/v1/users/{username}:getStats`
   - Header: `Authorization: Bearer {MEMOS_TOKEN}`
2. 提取 `tagCount` 字段
3. 返回给前端

**评论提交流程：**
1. 接收前端请求
2. 构造请求体 `{"state": "NORMAL", "content": "...", "visibility": "PRIVATE"}`
3. 转发到 memos API `POST /api/v1/memos/{uid}/comments`
   - Header: `Authorization: Bearer {MEMOS_TOKEN}`
4. 返回结果

## 数据流

```
1. 页面加载
   → 前端调用 GET /api/tags
   → 渲染标签列表（路径形式，如 `日记/情绪/开心`）
   → 从 localStorage 恢复上次选中的标签

2. 用户选择标签
   → 更新 localStorage
   → 自动触发随机获取（可选）

3. 点击"下一条"
   → 前端调用 GET /api/random-memo?tags=...
   → 后端从 sqlite3 随机取 uid
   → 后端调用 memos API 获取详情
   → 前端渲染 MemoCard

4. 用户提交评论
   → 前端调用 POST /api/memos/{uid}/comments
   → 后端转发到 memos API
   → 成功后刷新当前闪念详情
```

## UI 设计

### 布局结构

单栏布局，闪念详情为主体：

```
┌──────────────────────────────────┐
│ 🏷️ 标签筛选 [展开/收起]           │
│ ┌────────────────────────────┐  │
│ │ 🔍 搜索标签                 │  │
│ │ ☐ 日记/情绪/开心            │  │
│ │ ☐ 三省吾身/感悟             │  │
│ │ ☐ 记录/人物/爸妈            │  │
│ └────────────────────────────┘  │
├──────────────────────────────────┤
│        [下一条随机闪念]           │
├──────────────────────────────────┤
│ 闪念内容正文                      │
│                                  │
│ 图片(如有)                        │
│                                  │
│ ──────────────────────────      │
│ 历史评论:                         │
│ - 评论1                          │
│ - 评论2                          │
│ ──────────────────────────      │
│ 💬 添加评论                       │
│ ┌────────────────────────────┐  │
│ │ 输入框                      │  │
│ └────────────────────────────┘  │
│              [提交评论]           │
└──────────────────────────────────┘
```

### 交互细节

**标签选择器：**
- 默认收起，点击展开
- 路径形式展示（如 `日记/情绪/开心`）
- 多选 checkbox
- 顶部搜索框实时过滤
- 选中状态持久化到 localStorage

**闪念卡片：**
- 显示创建时间
- Markdown 渲染正文内容
- 图片附件网格展示（点击放大）
- 历史评论按时间倒序

**评论输入：**
- 多行文本框
- 提交后清空输入
- 失败时保留内容并提示错误

**响应式：**
- 移动端：标签区折叠为顶部抽屉
- PC 端：标签区固定在顶部，可展开/收起

## 错误处理

### 后端错误

| 场景 | HTTP 状态码 | 处理方式 |
|------|------------|---------|
| 数据库文件不存在 | 500 | 返回错误提示 |
| 标签筛选后无结果 | 404 | 返回 "没有符合条件的闪念" |
| memos API 调用失败 | 502 | 返回原始错误信息 |
| 环境变量缺失 | - | 启动时检查并退出 |

### 前端错误

| 场景 | 处理方式 |
|------|---------|
| API 请求失败 | Toast 提示错误信息 |
| 无可用闪念 | 显示空状态 "选择其他标签试试" |
| 评论提交失败 | 保留输入内容，显示错误 |

## 部署方案

### 开发环境

```bash
# 后端
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000

# 前端
cd client
npm install
npm run dev
```

### 生产环境

**直接部署：**
```bash
# 后端
cd backend
uv sync
uv run uvicorn main:app --host 0.0.0.0 --port 8000

# 前端构建
cd client
npm run build

# 静态文件由 FastAPI 托管或使用 nginx
```

**Docker 部署：**
```bash
# 使用一键构建脚本
./build.sh

# 或手动构建
docker build -t memoflash .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -v ~/.memos/memos_prod.db:/app/memos_prod.db \
  -e MEMOS_TOKEN=xxx \
  -e MEMOS_USER=zhengwenfeng \
  -e MEMOS_API_BASE=https://memos.zhengwenfeng.com \
  -e DB_PATH=/app/memos_prod.db \
  memoflash
```

`build.sh` 脚本功能：
- 检查 Docker 是否安装
- 构建 Docker 镜像
- 可选：直接运行容器（从 .env 文件读取环境变量）

Dockerfile 多阶段构建：
```dockerfile
# 阶段 1: 构建前端
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 阶段 2: 运行后端 + 托管前端
FROM python:3.12-slim
WORKDIR /app

# 安装 uv
RUN pip install uv

# 复制后端代码
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

COPY backend/ ./
COPY --from=frontend-builder /app/client/dist ./client/dist

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/api/tags || exit 1

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 安全考虑

1. **Token 保护**：memos API token 仅存储在服务端环境变量，不暴露给前端
2. **CORS 配置**：FastAPI 配置 CORS 中间件
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],  # 开发环境
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. **输入验证**：使用 Pydantic 模型验证请求参数
4. **评论可见性**：默认 PRIVATE，仅用户自己可见

## 技术实现细节

### FastAPI 关键配置

**静态文件托管：**
```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app.mount("/assets", StaticFiles(directory="client/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if not full_path.startswith("api/"):
        return FileResponse("client/dist/index.html")
```

**Pydantic 模型：**
```python
from pydantic import BaseModel

class CommentRequest(BaseModel):
    content: str

class MemoResponse(BaseModel):
    uid: str
    content: str
    createTime: str
    tags: list[str]
    attachments: list[dict]
    relations: list[dict]
```

### React 关键配置

**Toast 提示库**：使用 `react-hot-toast`

**状态管理**：
- `useState` - 标签选择、闪念数据
- `useEffect` - 数据加载
- `useCallback` - 事件处理优化
- 自定义 hook `useSelectedTags` - localStorage 持久化

## 未来扩展

1. 标签统计：显示每个标签下的闪念数量
2. 收藏功能：标记喜欢的闪念
3. 导出功能：导出选中标签的所有闪念
4. 时间筛选：按日期范围过滤闪念
