# 如何覆盖 Strapi 登录页面

## ⚠️ 重要说明

在 Strapi 5 中，**登录页面覆盖需要在主项目中实现**，插件只提供登录组件。

---

## 🚀 3 步完成登录页面覆盖

### 步骤 1️⃣：在主项目中创建登录页面

在你的 **Strapi 主项目**（不是插件）中创建：

```
your-strapi-project/
└── src/
    └── admin/
        └── pages/
            └── Login.jsx  ← 创建这个文件
```

**复制以下代码到 `src/admin/pages/Login.jsx`：**

```javascript
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
      setError('网络错误');
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
        <Flex justifyContent="center" paddingBottom={6}>
          <Typography variant="alpha" textColor="neutral800">
            🎒 我的项目
          </Typography>
        </Flex>

        <Box paddingBottom={4}>
          <Typography variant="beta" textAlign="center">
            欢迎登录
          </Typography>
        </Box>

        {error && (
          <Box background="danger100" padding={3} marginBottom={4} hasRadius>
            <Typography textColor="danger700">❌ {error}</Typography>
          </Box>
        )}

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

        <Box paddingTop={4}>
          <Typography variant="pi" textAlign="center" textColor="neutral600">
            Powered by bag-strapi-plugin
          </Typography>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
```

### 步骤 2️⃣：重新构建

```bash
npm run build
```

或者使用 watch 模式（实时预览）：

```bash
npm run develop -- --watch-admin
```

### 步骤 3️⃣：访问登录页面

打开浏览器访问：

```
http://localhost:1337/admin
```

你会看到自定义的登录页面！🎉

---

## ✅ 验证是否成功

### 检查清单：

- [ ] 文件创建在正确位置：`src/admin/pages/Login.jsx`
- [ ] 运行了 `npm run build` 或 `npm run develop -- --watch-admin`
- [ ] 清除了浏览器缓存（Ctrl + Shift + Delete）
- [ ] 访问 `/admin` 看到了自定义样式

### 调试：

在 `Login.jsx` 第一行添加：

```javascript
console.log('🎨 自定义登录页面已加载');
```

如果浏览器控制台显示这条日志，说明成功了！

---

## 🎨 快速自定义

### 修改标题

```javascript
<Typography variant="alpha" textColor="neutral800">
  你的公司名称  {/* 改这里 */}
</Typography>
```

### 修改背景颜色

```javascript
background: 'linear-gradient(135deg, #你的颜色1, #你的颜色2)',

// 推荐配色：
// 蓝色：'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
// 粉色：'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
// 绿色：'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
```

### 添加 Logo

```javascript
<Flex justifyContent="center" paddingBottom={6}>
  <img 
    src="/uploads/your-logo.png" 
    alt="Logo" 
    style={{ height: '60px' }}
  />
</Flex>
```

---

## 🆘 常见问题

### Q: 登录页面没变化？

**解决**：
1. 清除浏览器缓存（Ctrl + Shift + Delete）
2. 硬刷新（Ctrl + F5）
3. 确认文件路径：`src/admin/pages/Login.jsx`（不是插件目录）
4. 重新构建：`npm run build`

### Q: 报错 "Cannot find module"？

**原因**：文件路径不对或拼写错误

**解决**：确保文件在 `src/admin/pages/Login.jsx`

### Q: 登录后无法跳转？

**检查**：
1. 浏览器控制台是否有错误
2. localStorage 是否保存了 token
3. 网络请求是否成功

---

## 💡 为什么插件不能直接覆盖？

在 Strapi 架构中：
- ✅ **主项目**可以覆盖任何页面（包括登录页面）
- ❌ **插件**不能直接覆盖系统页面（登录、404等）
- ✅ **插件**可以提供组件供主项目使用

所以正确的做法是：
1. 插件提供登录组件 ✅
2. 主项目使用插件组件 ✅

---

## 📚 完整示例

详细的完整示例和高级功能，请查看：

- **[登录页面使用示例](./LOGIN_USAGE_EXAMPLE.md)** - 完整代码和步骤

---

**总结**：
1. ✅ 插件已移除错误的 `app.addComponents` 调用
2. ✅ 插件提供了 `CustomLogin` 组件
3. ✅ 你需要在**主项目**的 `src/admin/pages/Login.jsx` 中使用它
4. ✅ 按上面的步骤操作即可

现在重新构建插件：

```bash
npm run build && yalc publish
```

然后在主项目中创建 `src/admin/pages/Login.jsx` 文件即可！

