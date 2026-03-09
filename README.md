# clashrouter - 订阅管理系统

一个基于 Nuxt 4 和 Elysia 的代理订阅管理系统，支持机场管理、订阅转换和插件扩展。

<img width="1977" height="1394" alt="图片" src="https://github.com/user-attachments/assets/b8a0900b-2f42-4dc3-a576-7293a017ab89" />

<img width="1921" height="1141" alt="图片" src="https://github.com/user-attachments/assets/4c11f478-5ef8-4b99-a864-32c7b5a23d10" />

<img width="1870" height="1319" alt="图片" src="https://github.com/user-attachments/assets/0e0cc0e3-0abf-405a-9f93-f2186dd05af0" />

## 功能特性

### 1. 机场管理

- ✅ 添加、编辑、删除机场
- ✅ 支持两种配置方式：
  - 订阅链接（subUrl）
  - 用户名密码（username + password）
- ✅ 可扩展的插件系统（每种机场类型使用不同插件）
- ✅ 自动定时更新机场节点
- ✅ 手动触发单个或全部机场更新
- ✅ 查看机场状态、节点数量和错误信息

### 2. 订阅管理

- ✅ 创建订阅，选择多个机场组合
- ✅ 生成唯一的订阅链接（Token）
- ✅ 支持多种目标格式（Clash、Base64 等）
- ✅ 调用 SubConverter 服务进行转换
- ✅ 支持自定义 provider 前缀
- ✅ 重新生成订阅 Token
- ✅ 一键复制订阅链接

### 3. 插件系统

- ✅ 轻量级函数式插件架构
- ✅ 每个插件返回订阅 URL 的纯函数
- ✅ 内置通用插件（支持标准订阅链接）
- ✅ 三种插件类型：
  - `subUrl`: 仅支持订阅链接
  - `credentials`: 仅支持用户名密码
  - `either`: 两者都支持
- ✅ 轻松添加自定义机场插件

### 4. 定时任务

- ✅ 自动检查并更新需要更新的机场
- ✅ 可配置更新频率（分钟）
- ✅ 可手动触发更新

## 技术栈

- **前端**: Nuxt 4 + Nuxt UI + Pinia
- **后端**: Elysia (Bun 运行时) + Eden Treaty (类型安全的 API 客户端)
- **数据库**: SQLite (Prisma 7 ORM)
- **类型系统**: TypeScript + Zod (运行时验证)
- **订阅转换**: SubConverter
- **包管理**: Bun

## 数据模型

项目使用简洁的多对多关系模型：

```
Airport (机场)
  ├─ id: 唯一标识
  ├─ name: 机场名称
  ├─ pluginType: 插件类型
  ├─ subUrl?: 订阅链接（可选）
  ├─ username?: 用户名（可选）
  ├─ password?: 密码（可选）
  ├─ updateFrequency: 更新频率（分钟）
  ├─ lastUpdateTime?: 最后更新时间
  ├─ status: 状态（active/error）
  ├─ nodesJson?: 节点数据（JSON 数组）
  └─ subscriptions: 关联的订阅列表

Subscription (订阅)
  ├─ id: 唯一标识
  ├─ name: 订阅名称
  ├─ token: 订阅 Token（用于生成订阅链接）
  ├─ description?: 描述
  ├─ config?: 自定义配置
  └─ airports: 关联的机场列表

SubscriptionAirport (关联表)
  ├─ subscriptionId
  └─ airportId
```

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
# SubConverter 服务地址
SUB_CONVERTER_URL=https://api.v1.mk

# 数据库文件路径
DATABASE_URL="file:./prisma/data/clashrouter.db"
```

### 初始化数据库

```bash
# 运行数据库迁移
bun run db:migrate

# 或使用 push 模式（开发时）
bun run db:push
```

### 启动开发服务器

```bash
# 启动开发服务器（集成前后端，端口 3000）
bun run dev
```

访问 http://localhost:3000 查看应用

## 项目结构

```
clashrouter/
├── app/                      # Nuxt 应用目录
│   ├── pages/               # 页面组件
│   │   ├── index.vue       # 首页
│   │   ├── airports.vue    # 机场管理
│   │   └── subscriptions.vue # 订阅管理
│   ├── stores/              # Pinia 状态管理
│   │   ├── airport.ts      # 机场状态
│   │   └── subscription.ts # 订阅状态
│   ├── types/               # TypeScript 类型定义
│   │   └── api.ts          # API 类型（纯 TypeScript interfaces）
│   ├── schemas/             # Zod 验证 schemas（可选，用于客户端验证）
│   │   └── api.ts          # Zod schemas
│   └── utils/               # 工具函数
│       └── api.ts          # Eden API 客户端
├── server/                   # Elysia 后端
│   ├── elysia/              # Elysia 服务
│   │   └── routes/         # API 路由
│   │       ├── airports.ts # 机场 CRUD
│   │       ├── subscriptions.ts # 订阅 CRUD
│   │       ├── subscription-server.ts # 订阅服务（/sub/:token）
│   │       └── plugins.ts  # 插件管理
│   ├── airport-plugins/     # 机场插件系统
│   │   ├── index.ts        # 插件类型定义
│   │   ├── loader.ts       # 插件加载器
│   │   └── generic.ts      # 通用插件实现
│   ├── services/            # 业务逻辑
│   │   ├── schedulerService.ts  # 定时任务
│   │   ├── subscriptionService.ts # 订阅服务
│   │   └── updateService.ts     # 更新服务
│   └── utils/               # 工具函数
│       └── prisma.ts       # Prisma 客户端
├── prisma/
│   ├── schema.prisma       # 数据库模型定义
│   ├── migrations/         # 数据库迁移
│   └── data/               # SQLite 数据库文件
└── .env                    # 环境变量
```

## API 接口

后端使用 Elysia + Eden Treaty，提供类型安全的 API：

### 机场管理 (`/airports`)

- `GET /airports` - 获取所有机场
- `POST /airports` - 创建机场
- `GET /airports/:id` - 获取单个机场
- `PUT /airports/:id` - 更新机场
- `DELETE /airports/:id` - 删除机场
- `POST /airports/:id/update` - 触发机场更新
- `POST /airports/batch/update-all` - 触发所有机场更新

### 订阅管理 (`/subscriptions`)

- `GET /subscriptions` - 获取所有订阅
- `POST /subscriptions` - 创建订阅
- `GET /subscriptions/:id` - 获取单个订阅
- `PUT /subscriptions/:id` - 更新订阅
- `DELETE /subscriptions/:id` - 删除订阅
- `POST /subscriptions/:id/regenerate-token` - 重新生成 Token

### 插件管理 (`/plugins`)

- `GET /plugins` - 获取所有插件
- `POST /plugins/:id/toggle` - 启用/禁用插件

### 订阅服务 (`/sub`)

- `GET /sub/:token?target=clash` - 获取订阅内容（支持 clash、base64 等）

## 添加自定义机场插件

在 `server/airport-plugins/` 目录下创建新的插件文件：

```typescript
// server/airport-plugins/my-custom.ts
import type { AirportPlugin } from ".";

export const myCustomPlugin: AirportPlugin = {
  id: "my-custom",
  name: "我的自定义机场",
  type: "either", // 'subUrl' | 'credentials' | 'either'
  description: "支持我的自定义机场",

  // 核心函数：返回订阅 URL
  getSubscribeUrl: (config) => {
    if (config.subUrl) {
      // 如果提供了订阅链接，直接返回
      return config.subUrl;
    }

    if (config.username && config.password) {
      // 如果提供了用户名密码，构造订阅链接
      return `https://my-airport.com/api/subscribe?user=${config.username}&pass=${config.password}`;
    }

    throw new Error("需要提供订阅链接或用户名密码");
  },
};
```

然后在 `server/airport-plugins/loader.ts` 中注册：

```typescript
import { myCustomPlugin } from "./my-custom";

export const plugins: AirportPlugin[] = [
  genericPlugin,
  myCustomPlugin, // 添加你的插件
];
```

插件类型说明：

- `subUrl`: 仅支持订阅链接，表单只显示 subUrl 输入框
- `credentials`: 仅支持用户名密码，表单只显示 username 和 password 输入框
- `either`: 两者都支持（二选一），表单两组输入框都显示

## 工作原理

### 机场更新流程

1. 定时任务检查哪些机场需要更新（距离上次更新时间 >= updateFrequency）
2. 调用对应插件的 `getSubscribeUrl()` 获取订阅链接
3. 下载订阅内容并解析节点
4. 将节点数据存储到机场的 `nodesJson` 字段
5. 更新 `lastUpdateTime` 和 `status`

### 订阅转换流程

1. 用户创建订阅，选择多个机场
2. 系统生成唯一的 Token
3. 用户访问 `/sub/:token?target=clash`
4. 系统聚合所选机场的所有节点
5. 将节点链接传递给 SubConverter 进行转换
6. 支持自定义 provider 前缀（格式：`provider:机场名`）
7. 返回转换后的订阅内容

## 开发命令

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 类型检查
bun run typecheck

# 代码检查
bun run lint

# 数据库迁移
bun run db:migrate

# 数据库推送（开发模式）
bun run db:push

# 打开 Prisma Studio
bun run db:studio
```

## 许可证

MIT License

## 致谢

- [Nuxt](https://nuxt.com/) - 现代化的 Vue 全栈框架
- [Nuxt UI](https://ui.nuxt.com/) - 美观的 UI 组件库
- [Elysia](https://elysiajs.com/) - 高性能的 Bun Web 框架
- [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html) - 类型安全的 API 客户端
- [Prisma](https://www.prisma.io/) - 现代化的 ORM
- [Zod](https://zod.dev/) - TypeScript 运行时验证
- [SubConverter](https://github.com/Aethersailor/SubConverter-Extended) - 订阅转换服务
- [Bun](https://bun.sh/) - 快速的 JavaScript 运行时
