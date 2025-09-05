# 待办事项 (To-Do List) Web 应用

这是一个功能完整的待办事项Web应用，支持用户注册登录、任务的增删改查、任务分类和完成状态过滤等功能。

## 技术栈

### 前端
- React：用于构建用户界面
- HTML/CSS/JavaScript：前端基础技术

### 后端
- Flask：轻量级Python Web框架
- SQLite：嵌入式数据库

## 项目结构

```
TraeLesson/
├── todo-frontend/         # 前端React项目
│   ├── public/            # 静态资源文件
│   │   ├── index.html     # HTML入口文件
│   │   └── manifest.json  # PWA配置文件
│   ├── src/               # 源代码目录
│   │   ├── components/    # React组件
│   │   │   ├── Login.js      # 登录组件
│   │   │   ├── Register.js   # 注册组件
│   │   │   ├── TodoList.js   # 待办事项列表组件
│   │   │   └── TodoList.css  # 待办事项列表样式
│   │   ├── App.js         # 主应用组件
│   │   ├── App.css        # 应用样式
│   │   ├── index.js       # JavaScript入口文件
│   │   └── index.css      # 全局样式
│   └── package.json       # 前端依赖配置
├── todo-backend/          # 后端Flask项目
│   ├── app.py             # Flask应用主文件
│   └── requirements.txt   # 后端依赖配置
└── .gitignore             # Git忽略文件配置
```

## 功能特性

### 用户认证
- 用户注册：创建新账号
- 用户登录：验证用户身份
- 用户退出：安全退出登录

### 任务管理
- 添加任务：创建新的待办事项
- 查看任务：显示所有任务列表
- 更新任务：编辑任务内容和状态
- 删除任务：移除不需要的任务
- 任务分类：为任务添加分类标签
- 状态过滤：筛选已完成和未完成的任务
- 分类过滤：按分类筛选任务

## 安装和运行

### 前提条件
- Node.js 和 npm（用于前端）
- Python 和 pip（用于后端）

### 前端安装和运行

1. 进入前端目录
```bash
cd todo-frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动前端开发服务器
```bash
npm start
```

前端应用将在 http://localhost:3000 启动

### 后端安装和运行

1. 进入后端目录
```bash
cd todo-backend
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. 启动后端服务器
```bash
python app.py
```

后端API将在 http://localhost:5000 启动

## 使用说明

1. 首先注册一个新账号
2. 使用注册的账号登录
3. 在待办事项页面，可以添加、编辑、删除任务
4. 可以为任务添加分类标签
5. 使用过滤功能查看特定状态或分类的任务
6. 完成任务后，可以将其标记为已完成

## 注意事项

- 后端使用SQLite数据库，数据存储在`todo-backend/database.db`文件中
- 前端和后端需要同时运行，才能正常使用所有功能
- 密码使用SHA-256哈希存储，确保安全性

## License

MIT