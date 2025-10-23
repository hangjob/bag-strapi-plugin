---
layout: home

hero:
  name: "bag-strapi-plugin"
  text: "Strapi 通用功能插件"
  tagline: 为 Strapi 提供完整的认证、加密、限流、菜单管理等功能
  image:
    src: https://vite.itnavs.com/doc/logo-min.png
    alt: bag-strapi-plugin
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/hangjob/bag-strapi-plugin

features:
  - icon: 🔐
    title: JWT 认证系统
    details: 完整的用户认证解决方案，支持注册、登录、密码修改、Token 刷新等功能
  
  - icon: 🖼️
    title: 验证码系统
    details: 支持图形验证码、数学运算验证码、邮件验证码和短信验证码，集成简单
  
  - icon: ⚡
    title: API 限流
    details: 基于 rate-limiter-flexible 的强大限流系统，支持 Redis 存储和多种限流策略
  
  - icon: 🔒
    title: 加密工具库
    details: AES 对称加密、RSA 非对称加密、哈希函数、HMAC 签名等完整的加密解决方案
  
  - icon: 📋
    title: 菜单管理
    details: 自动创建菜单数据库表，包含完整的菜单字段，支持国际化和权限控制
  
  - icon: ✍️
    title: 签名验证
    details: 支持简单签名和加密签名验证，一次性签名机制，防止重放攻击
  
  - icon: 🎨
    title: 自定义登录页
    details: 提供现代化的登录组件，可轻松覆盖 Strapi 默认登录页面
  
  - icon: ⚙️
    title: 灵活配置
    details: 支持环境变量、配置文件等多种配置方式，白名单机制，满足各种场景需求
  
  - icon: 🌐
    title: 全局可用
    details: 在 Strapi 任何地方通过 strapi.crypto、strapi.auth 等全局对象调用插件功能
---

## 快速安装

::: code-group

```bash [npm]
npm install bag-strapi-plugin
```

```bash [yarn]
yarn add bag-strapi-plugin
```

```bash [pnpm]
pnpm add bag-strapi-plugin
```

:::

## 简单配置

在你的 Strapi 项目中配置 `config/plugins.js`：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      // JWT 认证配置
      auth: {
        enableCaptcha: true,
        jwt: {
          secret: env('JWT_SECRET'),
          expiresIn: '7d',
        },
      },
      
      // API 限流配置
      rateLimit: {
        enabled: true,
        points: 100,
        duration: 60,
      },
      
      // 加密工具配置
      crypto: {
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
      },
    },
  },
});
```

## 主要特性

### 🔐 完整的认证系统

- ✅ 用户注册与登录
- ✅ JWT Token 管理
- ✅ 密码加密存储
- ✅ Token 刷新机制
- ✅ 用户信息管理
- ✅ 密码重置功能

### 🖼️ 验证码保护

- ✅ SVG 图形验证码
- ✅ 数学运算验证码
- ✅ 邮件验证码
- ✅ 短信验证码
- ✅ 自动过期清理
- ✅ 防暴力破解

### ⚡ API 限流

- ✅ 基于 IP 限流
- ✅ 基于用户限流
- ✅ 支持 Redis 存储
- ✅ 多种限流策略
- ✅ 白名单机制
- ✅ 自定义限流规则

### 🔒 加密工具

- ✅ AES-256 对称加密
- ✅ RSA 非对称加密
- ✅ SHA 系列哈希
- ✅ HMAC 签名
- ✅ UUID 生成
- ✅ 随机字符串

### 📋 菜单管理

- ✅ 自动创建数据库表
- ✅ 16 个完整字段
- ✅ 支持国际化
- ✅ 路由配置
- ✅ 图标管理
- ✅ 权限控制

### ✍️ 签名验证

- ✅ 简单签名验证
- ✅ 加密签名验证
- ✅ 一次性签名
- ✅ 自动过期清理
- ✅ 白名单支持
- ✅ 全局中间件

## 为什么选择 bag-strapi-plugin？

- **📦 开箱即用** - 安装即可使用，无需复杂配置
- **🔧 高度可配置** - 支持环境变量、配置文件等多种方式
- **🚀 性能优异** - 基于成熟的第三方库，经过生产环境验证
- **📚 文档完善** - 提供详细的使用文档和示例代码
- **🔒 安全可靠** - 遵循安全最佳实践，提供多层安全保护
- **🌐 国际化支持** - 内置中英文支持，易于扩展
- **💪 生产就绪** - 已在生产环境中稳定运行

## 技术栈

- **Strapi** 5.x
- **bcrypt** - 密码加密
- **jsonwebtoken** - JWT 认证
- **svg-captcha** - 验证码生成
- **rate-limiter-flexible** - API 限流
- **Node.js** 内置 crypto 模块 - 加密工具

## 兼容性

- **Strapi**: 5.x
- **Node.js**: 22.10.0+
- **数据库**: 支持 Strapi 支持的所有数据库

## 许可证

[MIT License](https://github.com/hangjob/bag-strapi-plugin/blob/main/LICENSE)

## 作者

**yanghang** <470193837@qq.com>

## 支持

如有问题或建议，欢迎：

- 📖 查看[完整文档](/guide/introduction)
- 🐛 提交 [Issue](https://github.com/hangjob/bag-strapi-plugin/issues)
- 💬 参与 [讨论](https://github.com/hangjob/bag-strapi-plugin/discussions)
