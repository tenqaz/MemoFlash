# MemoFlash

MemoFlash 是一个基于 memos 的随机闪念回顾 Web 应用。通过标签筛选，随机浏览过去的闪念，查看历史评论和图片，并添加新评论。

## 功能特性

- **标签筛选**：路径形式展示（如 `日记/情绪/开心`），支持多选和搜索，选择持久化到 localStorage
- **随机展示**：根据选中标签随机获取一条闪念详情
- **内容展示**：显示闪念正文、图片附件、历史评论
- **评论功能**：对当前闪念添加新评论
- **响应式设计**：支持 PC 和移动端

## 技术栈

### 后端
- FastAPI + uvicorn
- uv（依赖管理）
- sqlite3（标准库）
- httpx（HTTP 客户端）
- python-dotenv（环境变量管理）

### 前端
- Vite + React 18
- Tailwind CSS
- fetch API

## 开发环境启动

### 前置要求

- Python 3.12+
- Node.js 20+
- uv（Python 依赖管理工具）

### 环境变量配置

复制 `.env.example` 到 `.env` 并配置：

```bash
MEMOS_TOKEN=memos_pat_xxx        # memos API Bearer token
MEMOS_USER=zhengwenfeng          # memos 用户名
MEMOS_API_BASE=https://memos.zhengwenfeng.com  # memos API 地址
DB_PATH=~/.memos/memos_prod.db   # sqlite3 数据库路径
```

### 启动后端

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

后端将运行在 `http://localhost:8000`

### 启动前端

```bash
cd client
npm install
npm run dev
```

前端将运行在 `http://localhost:5173`

## Docker 部署

### 构建镜像

使用提供的构建脚本：

```bash
./build.sh [tag]
```

或直接使用 Docker 命令：

```bash
docker build -t memoflash:latest .
```

### 运行容器

```bash
docker run -d \
  -p 8000:8000 \
  -e MEMOS_TOKEN=your_token \
  -e MEMOS_USER=your_username \
  -e MEMOS_API_BASE=https://your-memos-instance.com \
  -e DB_PATH=/data/memos_prod.db \
  -v /path/to/memos_prod.db:/data/memos_prod.db \
  memoflash:latest
```

应用将运行在 `http://localhost:8000`

### Docker 镜像说明

- 使用多阶段构建，前端静态文件在构建时编译
- 后端使用 uv 管理依赖
- 前端构建产物作为静态文件由 FastAPI 服务
- 单一镜像包含完整应用

## 项目结构

```
MemoFlash/
├── backend/              # Python 后端
│   ├── main.py          # FastAPI 入口 + 路由定义
│   ├── db.py            # sqlite3 数据库读取逻辑
│   ├── pyproject.toml   # uv 项目配置
│   └── uv.lock          # uv 锁文件
├── client/              # React 前端
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── hooks/
│   ├── vite.config.js
│   └── package.json
├── Dockerfile           # Docker 构建配置
├── build.sh            # 构建脚本
└── .env.example        # 环境变量示例
```

## API 接口

### 获取标签列表
```
GET /api/tags
```

### 随机获取闪念
```
GET /api/random-memo?tags=tag1,tag2
```

### 提交评论
```
POST /api/memos/{uid}/comments
```

## License

MIT
