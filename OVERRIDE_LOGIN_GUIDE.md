# 覆盖 Strapi 登录页面完整指南

## 📋 重要说明

在 Strapi 中，**登录页面需要在主项目中覆盖**，而不是通过插件。但插件可以提供登录组件供主项目使用。

---

## 🎯 方案一：在主项目中使用插件提供的登录组件

### 步骤 1：插件提供登录组件

插件已经提供了自定义登录组件：
- `admin/src/pages/CustomLogin.jsx`

### 步骤 2：在主项目中使用

在你的 **Strapi 主项目**（不是插件）中创建：

```
your-strapi-project/
└── src/
    └── admin/
        ├── app.js
        └── pages/
            └── Login.jsx
```

#### 创建 `src/admin/pages/Login.jsx`

```javascript
// src/admin/pages/Login.jsx
import React, { useState } from 'react';
import { Box, Flex, Button, TextInput, Typography } from '@strapi/design-system';
import { useAuth, useNotification } from '@strapi/strapi/admin';

const CustomLogin = () => {
  const { login } = useAuth();
  const toggleNotification = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({
        email,
        password,
      });
      
      // 登录成功会自动跳转
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: error.message || '登录失败',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box
        background="neutral0"
        padding={8}
        shadow="tableShadow"
        hasRadius
        style={{ width: '100%', maxWidth: '400px' }}
      >
        {/* Logo */}
        <Flex justifyContent="center" paddingBottom={6}>
          <Typography variant="alpha" textColor="neutral800">
            🎒 Bag Strapi
          </Typography>
        </Flex>

        {/* 标题 */}
        <Box paddingBottom={4}>
          <Typography variant="beta" textAlign="center">
            欢迎登录
          </Typography>
        </Box>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit}>
          <Box paddingBottom={4}>
            <TextInput
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>

          <Box paddingBottom={4}>
            <TextInput
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>

          <Button fullWidth type="submit" loading={loading}>
            登录
          </Button>
        </form>

        {/* 底部 */}
        <Box paddingTop={4}>
          <Typography variant="pi" textAlign="center" textColor="neutral600">
            Powered by bag-strapi-plugin
          </Typography>
        </Box>
      </Box>
    </Flex>
  );
};

export default CustomLogin;
```

#### 创建 `src/admin/app.js`

```javascript
// src/admin/app.js
export default {
  config: {
    auth: {
      logo: '/path/to/logo.png',  // 可选：自定义 Logo
    },
  },
  bootstrap(app) {
    console.log('自定义登录页面已加载');
  },
};
```

#### 注册登录组件

在 `src/admin/app.js` 中：

```javascript
// src/admin/app.js
import Login from './pages/Login';

export default {
  config: {
    // 使用自定义登录组件
    auth: {
      logo: '/uploads/logo.png',
    },
  },
  bootstrap(app) {
    // 替换登录页面
    app.addComponents({
      name: 'AuthPage',
      Component: Login,
    });
  },
};
```

### 步骤 3：重新构建

```bash
npm run build
npm run develop
```

---

## 🎯 方案二：通过配置启用/禁用（更灵活）

### 在主项目中创建可配置的登录页面

```javascript
// src/admin/pages/Login.jsx
import React from 'react';
import DefaultLogin from './DefaultLogin';  // 默认登录
import BagLogin from './BagLogin';  // bag-strapi-plugin 风格登录

const Login = () => {
  // 从环境变量读取配置
  const useCustomLogin = process.env.REACT_APP_CUSTOM_LOGIN === 'true';
  
  return useCustomLogin ? <BagLogin /> : <DefaultLogin />;
};

export default Login;
```

`.env` 配置：

```env
REACT_APP_CUSTOM_LOGIN=true
```

---

## 🎨 方案三：直接修改插件提供的组件

### 修改插件的登录组件

编辑插件的 `admin/src/pages/CustomLogin.jsx`，然后在主项目中使用：

```javascript
// src/admin/app.js
export default {
  async bootstrap(app) {
    // 动态导入插件提供的登录组件
    const { CustomLogin } = await import('bag-strapi-plugin/admin');
    
    app.addComponents({
      name: 'AuthPage',
      Component: CustomLogin,
    });
  },
};
```

---

## 🔍 验证登录页面是否生效

### 检查步骤：

1. **清除浏览器缓存**
2. **退出登录**
3. **重新访问** `http://localhost:1337/admin`
4. **查看登录页面样式**是否为自定义样式

### 调试：

```javascript
// 在 CustomLogin.jsx 组件顶部添加
console.log('🎨 [CustomLogin] 自定义登录页面已加载');
```

如果在浏览器控制台看到这个日志，说明自定义登录页面已生效。

---

## ⚙️ 配置参考

### 最小配置

```javascript
// config/plugins.js（主项目）
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
  },
});
```

```javascript
// src/admin/app.js（主项目）
import CustomLogin from './pages/Login';

export default {
  bootstrap(app) {
    app.addComponents({
      name: 'AuthPage',
      Component: CustomLogin,
    });
  },
};
```

---

## 📚 完整示例项目结构

```
your-strapi-project/
├── config/
│   └── plugins.js          # 启用 bag-strapi-plugin
├── src/
│   └── admin/
│       ├── app.js          # 注册自定义登录页面
│       └── pages/
│           └── Login.jsx   # 自定义登录组件
├── .env
└── package.json
```

---

## 🆘 常见问题

### Q1: 登录页面没有变化？

**解决**：
1. 清除浏览器缓存
2. 重新构建：`npm run build`
3. 重启 Strapi：`npm run develop`
4. 检查 `src/admin/app.js` 是否正确

### Q2: 登录后无法跳转？

**检查**：
1. Token 是否正确存储
2. 登录 API 路径是否正确
3. 查看浏览器控制台错误

### Q3: 样式不生效？

**确保**：
1. 使用 `@strapi/design-system` 组件
2. 检查 CSS 是否正确加载

---

## 💡 小贴士

1. ✅ 主项目和插件要使用相同版本的 `@strapi/design-system`
2. ✅ 登录组件要使用 Strapi 提供的 hooks（`useAuth`、`useNotification`）
3. ✅ 修改后记得清除浏览器缓存
4. ✅ 使用 `--watch-admin` 模式开发，实时预览

---

**参考文档**：
- [Strapi 管理面板自定义](https://docs.strapi.io/dev-docs/admin-panel-customization)
- [Strapi Design System](https://design-system.strapi.io/)

**版本**: 0.0.4

