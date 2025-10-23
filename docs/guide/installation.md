# 安装指南

本指南提供详细的安装步骤和不同安装方式的说明。

## 系统要求

### 必需

- **Strapi**: 5.x
- **Node.js**: 22.10.0 或更高版本
- **数据库**: Strapi 支持的任何数据库（SQLite、PostgreSQL、MySQL、MariaDB）

### 推荐

- **Redis**: 用于 API 限流（生产环境推荐）
- **邮件服务**: 用于邮件验证码（可选）
- **短信服务**: 用于短信验证码（可选）

## 安装方式

### 方式 1: npm（推荐）

```bash
npm install bag-strapi-plugin
```

### 方式 2: yarn

```bash
yarn add bag-strapi-plugin
```

### 方式 3: pnpm

```bash
pnpm add bag-strapi-plugin
```

### 方式 4: yalc（开发/测试）

如果你需要本地开发或测试插件：

```bash
# 在插件项目中发布
cd bag-strapi-plugin
npm run build
yalc publish

# 在你的 Strapi 项目中安装
cd your-strapi-project
yalc add bag-strapi-plugin

# 更新插件
yalc update bag-strapi-plugin

# 移除插件
yalc remove bag-strapi-plugin
```

## 安装依赖

插件需要以下依赖包。如果你的项目中还没有安装，请运行：

```bash
npm install bcrypt jsonwebtoken svg-captcha rate-limiter-flexible @strapi/icons
```

### 依赖说明

| 依赖包 | 版本 | 用途 | 必需 |
|--------|------|------|------|
| `bcrypt` | ^5.1.1 | 密码加密 | ✅ |
| `jsonwebtoken` | ^9.0.2 | JWT 认证 | ✅ |
| `svg-captcha` | ^1.4.0 | 验证码生成 | ✅ |
| `rate-limiter-flexible` | ^5.0.3 | API 限流 | ✅ |
| `@strapi/icons` | 2.0.0-rc.30 | 图标 | ✅ |
| `ioredis` | latest | Redis 客户端 | ⭕ |

::: tip
`ioredis` 仅在使用 Redis 存储限流数据时需要，开发环境可以使用内存存储。
:::

## 可选依赖

### Redis（生产环境推荐）

如果你计划在生产环境使用 Redis 存储限流数据：

```bash
npm install ioredis
```

## 验证安装

### 1. 检查插件是否已安装

```bash
npm list bag-strapi-plugin
```

应该看到类似输出：

```
your-strapi-project@1.0.0 /path/to/your-strapi-project
└── bag-strapi-plugin@0.0.4
```

### 2. 启动 Strapi

```bash
npm run develop
```

### 3. 检查日志

启动时应该看到类似日志：

```
[2024-01-01 12:00:00.000] info: ✅ bag-strapi-plugin initialized
[2024-01-01 12:00:00.000] info: 🔐 Auth routes registered
[2024-01-01 12:00:00.000] info: 🖼️  Captcha routes registered
[2024-01-01 12:00:00.000] info: ⚡ Rate limit middleware loaded
[2024-01-01 12:00:00.000] info: 🔒 Crypto utils available globally
```

### 4. 检查数据库表

启动后，检查数据库是否创建了以下表：

- `bag_users` - 用户表
- `bag_plugin_menus` - 菜单表

### 5. 测试 API

测试认证接口：

```bash
curl http://localhost:1337/bag-strapi-plugin/auth/login
```

应该返回：

```json
{
  "success": false,
  "message": "用户名和密码不能为空"
}
```

测试验证码接口：

```bash
curl http://localhost:1337/bag-strapi-plugin/captcha/image
```

应该返回包含 SVG 图片的 JSON。

## 常见问题

### 问题 1: 安装失败 - Peer Dependencies

**错误信息**:
```
npm ERR! Could not resolve dependency:
npm ERR! peer @strapi/strapi@"^5.28.0" from bag-strapi-plugin@0.0.4
```

**解决方案**:

确保你的 Strapi 版本是 5.x：

```bash
# 检查 Strapi 版本
npm list @strapi/strapi

# 如果版本不匹配，升级 Strapi
npm install @strapi/strapi@latest
```

或使用 `--legacy-peer-deps` 标志：

```bash
npm install bag-strapi-plugin --legacy-peer-deps
```

### 问题 2: bcrypt 编译错误

**错误信息**:
```
Error: Cannot find module 'node-gyp'
```

**解决方案**:

```bash
# Windows
npm install --global windows-build-tools
npm install bcrypt

# macOS
xcode-select --install
npm install bcrypt

# Linux (Debian/Ubuntu)
sudo apt-get install build-essential
npm install bcrypt
```

### 问题 3: 数据库表未创建

**可能原因**:

- 插件未正确启用
- 数据库连接失败
- 权限不足

**解决方案**:

1. 检查 `config/plugins.js` 中 `enabled: true`
2. 检查数据库连接配置
3. 查看 Strapi 启动日志
4. 手动重建数据库：

```bash
npm run strapi build
npm run develop
```

### 问题 4: 路由 404

**错误信息**:
```
404 Not Found - GET /bag-strapi-plugin/auth/login
```

**解决方案**:

1. 确认插件已正确安装
2. 重启 Strapi 服务
3. 清除缓存：

```bash
# 删除 .cache 和 build 目录
rm -rf .cache build
npm run develop
```

### 问题 5: TypeScript 类型错误

**错误信息**:
```
Property 'crypto' does not exist on type 'Strapi'
```

**解决方案**:

创建类型声明文件 `types/bag-strapi-plugin.d.ts`：

```typescript
declare module '@strapi/strapi' {
  export interface Strapi {
    crypto: {
      aes: any;
      rsa: any;
      hash: any;
      random: any;
      config: any;
    };
  }
}
```

## 升级插件

### 升级到最新版本

```bash
npm update bag-strapi-plugin
```

### 升级到指定版本

```bash
npm install bag-strapi-plugin@0.0.4
```

### 检查可用更新

```bash
npm outdated bag-strapi-plugin
```

## 卸载插件

### 1. 禁用插件

编辑 `config/plugins.js`：

```javascript
module.exports = {
  'bag-strapi-plugin': {
    enabled: false,  // 禁用插件
  },
};
```

### 2. 卸载包

```bash
npm uninstall bag-strapi-plugin
```

### 3. 清理数据库（可选）

如果不再需要插件创建的数据表，手动删除：

```sql
DROP TABLE IF EXISTS bag_users;
DROP TABLE IF EXISTS bag_plugin_menus;
```

::: warning
删除数据表会永久删除所有数据，请谨慎操作！
:::

### 4. 清理配置文件

删除 `config/plugins.js` 中的插件配置。

## 下一步

安装完成后，继续：

- [配置插件](/guide/configuration)
- [快速开始](/guide/quick-start)
- [功能介绍](/features/auth)

## 获取帮助

遇到安装问题？

- 📖 查看[调试指南](/guide/debugging)
- 🐛 提交 [Issue](https://github.com/hangjob/bag-strapi-plugin/issues)
- 💬 参与 [讨论](https://github.com/hangjob/bag-strapi-plugin/discussions)

