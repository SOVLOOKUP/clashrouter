# ClashRouter - Clash 订阅管理系统

一个基于 Nuxt 和 Elysia 的 Clash 订阅管理系统，支持机场管理、分组配置和订阅转换。

## 功能特性

### 1. 机场管理

- ✅ 添加、编辑、删除机场
- ✅ 配置机场的用户名、密码、订阅链接、更新频率
- ✅ 自动定时更新机场节点
- ✅ 手动触发机场更新
- ✅ 查看机场状态和错误信息

### 2. 节点管理

- ✅ 查看所有节点列表
- ✅ 按延迟、状态、机场筛选节点
- ✅ 自动测试节点延迟
- ✅ 批量删除节点
- ✅ 支持 SS、SSR、VMess、Trojan、VLESS 等节点类型

### 3. 分组配置

- ✅ 创建自定义分组
- ✅ 每个机场自动创建默认分组
- ✅ 根据延迟、带宽筛选节点并自动加入分组
- ✅ 手动添加/移除分组中的节点
- ✅ 查看分组中的所有节点

### 4. 订阅转换

- ✅ 创建订阅，选择多个分组组合
- ✅ 生成唯一的订阅链接（Token）
- ✅ 支持 Clash 和 Base64 格式
- ✅ 调用 SubConverter-Extended 服务进行转换
- ✅ 重新生成订阅 Token
- ✅ 一键复制订阅链接

### 5. 插件系统

- ✅ 可扩展的机场插件架构
- ✅ 内置通用订阅插件（支持标准 Base64 订阅）
- ✅ 轻松添加自定义机场插件

### 6. 定时任务

- ✅ 每 10 分钟检查并更新需要更新的机场
- ✅ 每 30 分钟自动测试所有节点延迟
- ✅ 可手动触发更新和测试

## 技术栈

- **前端**: Nuxt 4 + Nuxt UI + Pinia
- **后端**: Elysia (Bun 运行时)
- **数据库**: SQLite (Prisma ORM)
- **订阅转换**: SubConverter-Extended
- **包管理**: Bun

## 快速开始

### 环境要求

- Bun >= 1.0.0

### 安装依赖

```bash
bun install
```

### 配置环境变量

复制 `.env.example` 到 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

环境变量说明：

```env
# SubConverter-Extended 服务地址（默认：https://api.asailor.org）
SUB_CONVERTER_URL=https://api.asailor.org

# 数据库文件路径
DATABASE_URL="file:./data/clashrouter.db"

```

### 初始化数据库

```bash
# 推送数据库模式
bun run db:push
```

### 启动开发服务器

```bash
# 启动 Nuxt 前端（端口 3000）
bun run dev

# 在另一个终端启动 Elysia 后端（端口 3001）
bun run server/api-server.ts
```

访问 http://localhost:3000 查看前端应用

## 项目结构

```
clashrouter/
├── app/                      # Nuxt 应用目录
│   ├── pages/               # 页面组件
│   ├── stores/              # Pinia 状态管理
│   ├── types/               # TypeScript 类型定义
│   └── utils/               # 工具函数（API 客户端等）
├── server/                   # Elysia 后端
│   ├── routes/              # API 路由
│   ├── services/            # 业务逻辑
│   ├── plugins/             # 机场插件系统
│   ├── utils/               # 工具函数
│   └── api-server.ts        # 后端入口文件
├── prisma/
│   └── schema.prisma        # 数据库模型定义
└── .env                     # 环境变量
```

## API 接口

详细的 API 文档请参考项目中的 API 路由文件。

主要接口包括：

- 机场管理: `/api/airports`
- 分组管理: `/api/groups`
- 节点管理: `/api/nodes`
- 订阅管理: `/api/subscriptions`
- 订阅服务: `/sub/:token`

## 添加自定义机场插件

在 `server/airport-plugins/` 目录下创建新的插件文件，并在 `loader.ts` 中注册即可。

详细说明请参考通用插件 `server/airport-plugins/generic.ts` 的实现。

## 许可证

MIT License

## 致谢

- [Nuxt](https://nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Elysia](https://elysiajs.com/)
- [Prisma](https://www.prisma.io/)
- [SubConverter-Extended](https://github.com/Aethersailor/SubConverter-Extended)
