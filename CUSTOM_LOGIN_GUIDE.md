# 自定义登录页面指南

## 📋 概述

bag-strapi-plugin 支持覆盖 Strapi 默认的登录页面，你可以自定义登录界面的样式和功能。

---

## 🎨 已实现的功能

### 1. 自定义登录页面组件

- ✅ 现代化的渐变背景
- ✅ 美观的卡片式布局
- ✅ 完整的登录表单（邮箱、密码）
- ✅ 错误提示
- ✅ 加载状态
- ✅ 响应式设计

### 2. 页面特点

- 🎨 紫色渐变背景
- 🎯 居中布局
- 💎 圆角卡片设计
- ⚡ 流畅的用户体验
- 🌐 支持国际化

---

## 🚀 启用自定义登录页面

### 方式一：通过插件配置启用（推荐）

在你的 Strapi 项目的 `config/plugins.js` 中：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      // 是否启用自定义登录页面
      customLogin: {
        enabled: true,
      },
    },
  },
});
```

### 方式二：默认启用

插件默认会尝试覆盖登录页面。如果不想使用，可以设置：

```javascript
customLogin: {
  enabled: false,
}
```

---

## 🎨 自定义登录页面样式

### 修改登录页面

编辑 `admin/src/pages/CustomLogin.jsx`：

```javascript
// 修改背景颜色
style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  // 改为其他颜色，例如：
  // background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  // background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
}}

// 修改标题
<Typography variant="alpha" textColor="neutral800">
  🎒 Bag Strapi Plugin  // 改为你的品牌名称
</Typography>

// 修改副标题
<Typography variant="omega" textAlign="center" textColor="neutral600">
  自定义登录页面  // 改为你的标语
</Typography>
```

### 添加 Logo

```javascript
<Flex justifyContent="center" paddingBottom={6}>
  <img 
    src="/path/to/your/logo.png" 
    alt="Logo" 
    style={{ width: '150px' }}
  />
</Flex>
```

### 修改配色方案

```javascript
// 渐变配色方案

// 1. 蓝色科技风
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 2. 粉色梦幻风
background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'

// 3. 绿色清新风
background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'

// 4. 橙色活力风
background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'

// 5. 深色专业风
background: 'linear-gradient(135deg, #000000 0%, #434343 100%)'
```

---

## 🔧 高级自定义

### 添加第三方登录

```javascript
// 在 CustomLogin.jsx 中添加
const handleGoogleLogin = () => {
  window.location.href = '/api/connect/google';
};

// 添加按钮
<Button
  variant="tertiary"
  fullWidth
  onClick={handleGoogleLogin}
  style={{ marginTop: '1rem' }}
>
  使用 Google 登录
</Button>
```

### 添加验证码

```javascript
const [captcha, setCaptcha] = useState('');

// 在表单中添加
<Box paddingBottom={4}>
  <TextInput
    label="验证码"
    name="captcha"
    value={captcha}
    onChange={(e) => setCaptcha(e.target.value)}
    required
  />
</Box>
```

### 添加记住我功能

```javascript
const [rememberMe, setRememberMe] = useState(false);

// 添加复选框
import { Checkbox } from '@strapi/design-system';

<Checkbox
  checked={rememberMe}
  onChange={() => setRememberMe(!rememberMe)}
>
  记住我
</Checkbox>
```

### 添加忘记密码

```javascript
<Flex justifyContent="space-between" paddingTop={2}>
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

---

## 💡 实用示例

### 示例 1：企业品牌登录页

```javascript
const CustomLogin = () => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        backgroundImage: 'url(/uploads/company-bg.jpg)',
        backgroundSize: 'cover',
      }}
    >
      <Box
        background="neutral0"
        padding={8}
        shadow="tableShadow"
        hasRadius
      >
        <img src="/uploads/company-logo.png" alt="Logo" width="200" />
        <Typography variant="beta">企业管理后台</Typography>
        {/* 登录表单... */}
      </Box>
    </Flex>
  );
};
```

### 示例 2：带背景图的登录页

```javascript
style={{
  minHeight: '100vh',
  background: 'url(/uploads/login-bg.jpg) center/cover no-repeat',
}}
```

### 示例 3：深色主题登录页

```javascript
<Flex
  style={{
    minHeight: '100vh',
    background: '#1a1a1a',
  }}
>
  <Box
    background="#2a2a2a"
    padding={8}
    shadow="tableShadow"
    hasRadius
    style={{
      border: '1px solid #3a3a3a',
    }}
  >
    <Typography variant="alpha" textColor="neutral0">
      欢迎回来
    </Typography>
    {/* ... */}
  </Box>
</Flex>
```

---

## 🔐 添加签名验证到登录

你可以在登录时添加签名验证：

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 生成签名（使用加密工具）
  const timestamp = Date.now();
  const signData = `bag-login-${email}-${timestamp}`;
  
  // 这里需要在客户端实现 AES 加密
  // 或者使用简单签名
  const sign = 'your-sign-here';
  
  const response = await fetch('/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'sign': sign,  // 添加签名
    },
    body: JSON.stringify({ email, password }),
  });
};
```

---

## ⚠️ 注意事项

### 1. Strapi 版本兼容性

当前实现基于 Strapi 5。不同版本的 API 可能不同：

- **Strapi 5**: 使用 `app.addComponents`
- **Strapi 4**: 使用 `admin.config.auth`

### 2. 登录 API

确保登录 API 路径正确：
- Strapi 5: `/admin/login`
- Strapi 4: `/admin/auth/local`

### 3. Token 存储

登录成功后需要正确存储 token：

```javascript
// 存储 JWT token
localStorage.setItem('jwtToken', data.data.token);

// 或者
sessionStorage.setItem('jwtToken', data.data.token);
```

---

## 🧪 测试

### 1. 构建插件

```bash
npm run build && yalc publish
```

### 2. 更新 Strapi 项目

```bash
yalc update bag-strapi-plugin
npm run develop
```

### 3. 访问登录页面

打开浏览器访问：

```
http://localhost:1337/admin
```

你应该看到自定义的登录页面而不是默认的 Strapi 登录页面。

---

## 🎯 禁用自定义登录页面

如果想恢复使用 Strapi 默认登录页面，有两种方式：

### 方式 1：通过配置禁用

```javascript
// config/plugins.js
'bag-strapi-plugin': {
  config: {
    customLogin: {
      enabled: false,  // 禁用自定义登录
    },
  },
}
```

### 方式 2：移除插件中的 bootstrap 方法

注释掉 `admin/src/index.js` 中的 `bootstrap` 方法。

---

## 📚 相关文档

- [Strapi Admin Panel API](https://docs.strapi.io/dev-docs/admin-panel-customization)
- [Strapi Design System](https://design-system.strapi.io/)

---

## 💡 扩展想法

### 1. 添加多语言支持

```javascript
import { useIntl } from 'react-intl';

const { formatMessage } = useIntl();

<Typography>
  {formatMessage({ id: 'Auth.form.welcome.title', defaultMessage: '欢迎' })}
</Typography>
```

### 2. 添加动画效果

```javascript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* 登录表单 */}
</motion.div>
```

### 3. 添加背景视频

```javascript
<video
  autoPlay
  loop
  muted
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: -1,
  }}
>
  <source src="/uploads/background.mp4" type="video/mp4" />
</video>
```

---

**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

