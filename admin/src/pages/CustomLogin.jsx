import React, { useState } from 'react';
import { Box, Flex, Button, TextInput, Typography } from '@strapi/design-system';

/**
 * 自定义登录页面
 * 可在主项目中导入使用：
 * import { CustomLogin } from 'bag-strapi-plugin/admin';
 */
const CustomLogin = ({ onSubmit, config = {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 如果传入了自定义的 onSubmit，使用自定义的
      if (onSubmit) {
        await onSubmit({ email, password });
      } else {
        // 默认的登录逻辑
        const response = await fetch('/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 登录成功，保存 token 并跳转
          localStorage.setItem('jwtToken', data.data.token);
          window.location.href = '/admin';
        } else {
          setError(data.error?.message || '登录失败');
        }
      }
    } catch (err) {
      setError(err.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 从配置中获取样式设置
  const {
    title = '🎒 Bag Strapi Plugin',
    subtitle = '自定义登录页面',
    background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    logoUrl = '',
  } = config;

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        background: background,
      }}
    >
      <Box
        background="neutral0"
        padding={8}
        shadow="tableShadow"
        hasRadius
        style={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Logo 区域 */}
        <Flex justifyContent="center" paddingBottom={6}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ height: '60px' }} />
          ) : (
            <Typography variant="alpha" textColor="neutral800">
              {title}
            </Typography>
          )}
        </Flex>

        {/* 标题 */}
        <Box paddingBottom={4}>
          <Typography variant="beta" textAlign="center">
            欢迎登录
          </Typography>
          <Typography variant="omega" textAlign="center" textColor="neutral600">
            {subtitle}
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Box
            background="danger100"
            padding={3}
            marginBottom={4}
            hasRadius
          >
            <Typography textColor="danger700" variant="omega">
              ❌ {error}
            </Typography>
          </Box>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit}>
          <Box paddingBottom={4}>
            <TextInput
              label="邮箱"
              name="email"
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
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>

          <Button
            fullWidth
            type="submit"
            disabled={loading}
            loading={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>

        {/* 底部信息 */}
        <Box paddingTop={4}>
          <Typography variant="pi" textAlign="center" textColor="neutral600">
            Powered by bag-strapi-plugin v0.0.4
          </Typography>
        </Box>
      </Box>

      {/* 页面底部信息 */}
      <Box paddingTop={4}>
        <Typography variant="pi" textColor="neutral0">
          © 2024 Bag Strapi Plugin. All rights reserved.
        </Typography>
      </Box>
    </Flex>
  );
};

export { CustomLogin };

