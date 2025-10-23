/**
 * JWT 认证中间件
 * 
 * 使用方法：
 * 1. 在路由配置中添加此中间件
 * 2. 或在全局中间件中使用
 */

export default (config, { strapi }) => {
    return async (ctx, next) => {
        try {
            // 获取 Authorization header
            const authHeader = ctx.request.header.authorization;

            if (!authHeader) {
                ctx.status = 401;
                return ctx.body = {
                    success: false,
                    message: '未提供认证信息',
                };
            }

            // 解析 Bearer token
            const token = authHeader.replace('Bearer ', '');

            if (!token) {
                ctx.status = 401;
                return ctx.body = {
                    success: false,
                    message: 'Token 格式错误',
                };
            }

            // 验证 token 并获取用户信息
            const user = await strapi
                .plugin('bag-strapi-plugin')
                .service('auth')
                .validateUser(token);

            // 将用户信息挂载到 ctx.state
            ctx.state.user = user;

            // 继续执行后续中间件
            await next();
        } catch (error) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                message: error.message || '认证失败',
            };
        }
    };
};

