# 覆盖登录页面 - 完整示例

## 📋 方案概述

bag-strapi-plugin 提供了自定义登录组件，你需要在**主 Strapi 项目**中使用它来覆盖默认登录页面。

---

## 🚀 完整步骤

### 第 1 步：安装插件

```bash
# 在你的 Strapi 项目中
npm install bag-strapi-plugin
# 或
yalc add bag-strapi-plugin
```

### 第 2 步：在主项目中创建登录页面

在你的 **Strapi 主项目**中创建以下文件结构：

```
your-strapi-project/
└── src/
    └── admin/
        ├── app.js           # 主配置文件（创建）
        └── pages/
            └── Login.jsx    # 登录页面（创建）
```

#### 创建 `src/admin/pages/Login.jsx`

```javascript
// src/admin/pages/Login.jsx
import React, { useState } from 'react';
import { Box, Flex, Button, TextInput, Typography } from '@strapi/design-system';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwtToken', data.data.token);
        window.location.href = '/admin';
      } else {
        setError(data.error?.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
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
            🎒 我的项目
          </Typography>
        </Flex>

        {/* 标题 */}
        <Box paddingBottom={4}>
          <Typography variant="beta" textAlign="center">
            欢迎登录
          </Typography>
          <Typography variant="omega" textAlign="center" textColor="neutral600">
            管理后台
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Box background="danger100" padding={3} marginBottom={4} hasRadius>
            <Typography textColor="danger700">❌ {error}</Typography>
          </Box>
        )}

        {/* 表单 */}
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
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>

        {/* 底部 */}
        <Box paddingTop={4}>
          <Typography variant="pi" textAlign="center" textColor="neutral600">
            Powered by Bag Plugin
          </Typography>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
```

#### 创建 `src/admin/app.js`

```javascript
// src/admin/app.js
export default {
  config: {
    // 可选：其他配置
    locales: ['zh'],
  },
};
```

### 第 3 步：构建并启动

```bash
# 构建管理面板
npm run build

# 或者使用 watch 模式（实时预览）
npm run develop -- --watch-admin
```

### 第 4 步：访问登录页面

访问 `http://localhost:1337/admin`，你会看到自定义的登录页面。

---

## 🎨 自定义样式

### 修改背景颜色

```javascript
// src/admin/pages/Login.jsx

// 紫色渐变（默认）
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 蓝色渐变
background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'

// 粉色渐变
background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'

// 绿色渐变
background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'

// 纯色背景
background: '#f5f5f5'

// 背景图片
background: 'url(/uploads/bg.jpg) center/cover no-repeat'
```

### 添加公司 Logo

```javascript
{/* 替换 Typography 为图片 */}
<Flex justifyContent="center" paddingBottom={6}>
  <img 
    src="/uploads/company-logo.png" 
    alt="Company Logo" 
    style={{ height: '60px' }}
  />
</Flex>
```

### 修改卡片样式

```javascript
<Box
  background="neutral0"
  padding={8}
  shadow="tableShadow"
  hasRadius
  style={{
    width: '100%',
    maxWidth: '400px',
    borderRadius: '16px',  // 更大的圆角
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',  // 更强的阴影
  }}
>
```

---

## 🔐 添加登录签名验证

### 在登录时验证签名

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 生成签名（需要在前端实现加密）
    const timestamp = Date.now();
    const sign = 'your-generated-sign';  // 这里需要加密

    const response = await fetch('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sign': sign,  // 添加签名
        'timestamp': timestamp,
      },
      body: JSON.stringify({ email, password }),
    });

    // ...
  } catch (err) {
    setError('登录失败');
  }
};
```

---

## 🌐 添加第三方登录

### Google 登录

```javascript
const handleGoogleLogin = () => {
  window.location.href = '/api/connect/google';
};

// 在表单下方添加
<Box paddingTop={3}>
  <Typography variant="pi" textAlign="center" paddingBottom={2}>
    或使用以下方式登录
  </Typography>
  
  <Button
    variant="tertiary"
    fullWidth
    onClick={handleGoogleLogin}
  >
    🔐 使用 Google 登录
  </Button>
</Box>
```

### GitHub 登录

```javascript
<Button
  variant="tertiary"
  fullWidth
  onClick={() => window.location.href = '/api/connect/github'}
>
  🔐 使用 GitHub 登录
</Button>
```

---

## 💡 高级功能

### 1. 添加验证码

```javascript
import { useState, useEffect } from 'react';

const [captcha, setCaptcha] = useState('');
const [captchaImage, setCaptchaImage] = useState('');

useEffect(() => {
  // 加载验证码图片
  fetch('/api/captcha')
    .then(res => res.json())
    .then(data => setCaptchaImage(data.image));
}, []);

// 在表单中添加
<Box paddingBottom={4}>
  <Flex gap={2}>
    <TextInput
      label="验证码"
      value={captcha}
      onChange={(e) => setCaptcha(e.target.value)}
      required
    />
    <img src={captchaImage} alt="验证码" style={{ height: '40px' }} />
  </Flex>
</Box>
```

### 2. 记住我功能

```javascript
import { Checkbox } from '@strapi/design-system';

const [rememberMe, setRememberMe] = useState(false);

<Flex paddingTop={2} paddingBottom={4}>
  <Checkbox
    checked={rememberMe}
    onChange={() => setRememberMe(!rememberMe)}
  >
    记住我
  </Checkbox>
</Flex>
```

### 3. 忘记密码链接

```javascript
<Flex justifyContent="flex-end" paddingTop={2}>
  <a 
    href="/admin/auth/forgot-password"
    style={{ 
      fontSize: '14px', 
      color: '#667eea',
      textDecoration: 'none',
    }}
  >
    忘记密码？
  </a>
</Flex>
```

### 4. 多语言支持

```javascript
import { useIntl } from 'react-intl';

const { formatMessage } = useIntl();

<Typography variant="beta" textAlign="center">
  {formatMessage({ 
    id: 'Auth.form.welcome.title', 
    defaultMessage: '欢迎登录' 
  })}
</Typography>
```

---

## 📁 完整文件示例

### src/admin/pages/Login.jsx

```javascript
import React, { useState } from 'react';
import { Box, Flex, Button, TextInput, Typography, Checkbox } from '@strapi/design-system';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('jwtToken', data.data.token);
        window.location.href = '/admin';
      } else {
        setError(data.error?.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
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
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Logo */}
        <Flex justifyContent="center" paddingBottom={6}>
          <Typography variant="alpha" textColor="neutral800">
            🎒 我的项目
          </Typography>
        </Flex>

        {/* 标题 */}
        <Box paddingBottom={4}>
          <Typography variant="beta" textAlign="center">
            欢迎登录
          </Typography>
          <Typography variant="omega" textAlign="center" textColor="neutral600">
            管理后台
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Box background="danger100" padding={3} marginBottom={4} hasRadius>
            <Typography textColor="danger700">❌ {error}</Typography>
          </Box>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <Box paddingBottom={4}>
            <TextInput
              label="邮箱"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>

          <Box paddingBottom={4}>
            <TextInput
              label="密码"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>

          <Flex justifyContent="space-between" paddingBottom={4}>
            <Checkbox
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            >
              记住我
            </Checkbox>
            
            <a 
              href="/admin/auth/forgot-password"
              style={{ fontSize: '14px', color: '#667eea' }}
            >
              忘记密码？
            </a>
          </Flex>

          <Button fullWidth type="submit" loading={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>

        {/* 底部 */}
        <Box paddingTop={4}>
          <Typography variant="pi" textAlign="center" textColor="neutral600">
            Powered by bag-strapi-plugin v0.0.4
          </Typography>
        </Box>
      </Box>

      {/* 页面底部 */}
      <Box paddingTop={4}>
        <Typography variant="pi" textColor="neutral0">
          © 2024 Your Company. All rights reserved.
        </Typography>
      </Box>
    </Flex>
  );
};

export default Login;
```

#### 创建 `src/admin/app.js`

```javascript
// src/admin/app.js
export default {
  config: {
    // 自定义配置
    locales: ['zh'],  // 可选：启用中文
  },
  bootstrap(app) {
    console.log('自定义管理面板已加载');
  },
};
```

### 第 3 步：构建并启动

```bash
# 开发模式（实时预览）
npm run develop -- --watch-admin

# 或者先构建再启动
npm run build
npm run develop
```

### 第 4 步：访问登录页面

打开浏览器：`http://localhost:1337/admin`

你会看到自定义的登录页面！

---

## 🎨 快速自定义

### 修改标题和 Logo

```javascript
{/* 修改这里 */}
<Typography variant="alpha" textColor="neutral800">
  你的公司名称  {/* 改这里 */}
</Typography>
```

### 修改背景

```javascript
style={{
  background: 'linear-gradient(135deg, #你的颜色1, #你的颜色2)',
}}
```

### 添加 Logo 图片

```javascript
<Flex justifyContent="center" paddingBottom={6}>
  <img 
    src="/uploads/logo.png"  {/* 你的 Logo 路径 */}
    alt="Logo" 
    style={{ height: '60px' }}
  />
</Flex>
```

---

## 🔧 Strapi 4 vs Strapi 5

### Strapi 4

```javascript
// src/admin/app.js
import AuthLogo from './extensions/my-logo.png';

export default {
  config: {
    auth: {
      logo: AuthLogo,
    },
  },
};
```

### Strapi 5（当前版本）

```javascript
// src/admin/pages/Login.jsx
// 直接创建完整的登录组件

// src/admin/app.js
export default {
  config: {},
};
```

---

## ✅ 验证是否生效

### 检查清单：

- [ ] 创建了 `src/admin/pages/Login.jsx`
- [ ] 创建了 `src/admin/app.js`（可选）
- [ ] 运行了 `npm run build` 或 `npm run develop -- --watch-admin`
- [ ] 清除了浏览器缓存
- [ ] 访问 `/admin` 看到了自定义登录页面

### 调试：

在 `Login.jsx` 开头添加：

```javascript
console.log('🎨 自定义登录页面已加载');
```

如果浏览器控制台显示这条日志，说明自定义登录页面已生效。

---

## 🆘 常见问题

### Q1: 登录页面没有变化？

**解决方案**：
1. 确认文件路径正确：`src/admin/pages/Login.jsx`
2. 清除浏览器缓存（Ctrl + Shift + Delete）
3. 重新构建：`npm run build`
4. 硬刷新页面（Ctrl + F5）

### Q2: 报错 "Cannot find module"？

**解决方案**：
1. 确保安装了依赖：`npm install`
2. 检查导入路径是否正确
3. 重新构建项目

### Q3: 登录后无法跳转？

**检查**：
1. Token 是否正确保存到 localStorage
2. 登录 API 返回的数据结构
3. 浏览器控制台是否有错误

### Q4: 样式显示不正常？

**确认**：
1. `@strapi/design-system` 版本是否一致
2. 是否使用了正确的组件
3. CSS 是否被其他样式覆盖

---

## 📚 推荐配色方案

```javascript
// 1. 商务蓝
background: 'linear-gradient(135deg, #0052D4 0%, #65C7F7 100%)'

// 2. 优雅紫
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 3. 活力橙
background: 'linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)'

// 4. 清新绿
background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'

// 5. 科技蓝
background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'

// 6. 深色专业
background: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
```

---

## 📖 相关文档

- [Strapi 管理面板自定义](https://docs.strapi.io/dev-docs/admin-panel-customization)
- [Strapi Design System](https://design-system.strapi.io/)
- [覆盖登录指南](./OVERRIDE_LOGIN_GUIDE.md)

---

**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

