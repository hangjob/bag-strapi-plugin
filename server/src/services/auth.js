/**
 * 认证服务
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const service = ({ strapi }) => ({
    /**
     * 生成 JWT Token
     */
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        // 从插件配置中获取 JWT 配置，优先使用环境变量
        const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
        const jwtConfig = pluginConfig?.auth?.jwt || {};
        
        const secret = process.env.JWT_SECRET || jwtConfig.secret || 'your-secret-key-change-in-production';
        const expiresIn = process.env.JWT_EXPIRES_IN || jwtConfig.expiresIn || '7d';

        return jwt.sign(payload, secret, { expiresIn });
    },

    /**
     * 验证 JWT Token
     */
    verifyToken(token) {
        try {
            // 从插件配置中获取 JWT 密钥，优先使用环境变量
            const pluginConfig = strapi.config.get('plugin::bag-strapi-plugin');
            const jwtConfig = pluginConfig?.auth?.jwt || {};
            
            const secret = process.env.JWT_SECRET || jwtConfig.secret || 'your-secret-key-change-in-production';
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error('Token 无效或已过期');
        }
    },

    /**
     * 刷新 Token
     */
    refreshToken(oldToken) {
        try {
            const decoded = this.verifyToken(oldToken);
            const user = {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role,
            };
            return this.generateToken(user);
        } catch (error) {
            throw new Error('无法刷新 Token');
        }
    },

    /**
     * 加密密码
     */
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    },

    /**
     * 验证密码
     */
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    /**
     * 用户注册
     */
    async register(data) {
        const { username, email, password, nickname, phone } = data;

        // 验证必填字段
        if (!username || !password) {
            throw new Error('用户名和密码为必填项');
        }

        // 检查用户名是否已存在
        const existingUser = await strapi
            .plugin('bag-strapi-plugin')
            .service('user')
            .findByUsername(username);

        if (existingUser) {
            throw new Error('用户名已存在');
        }

        // 检查邮箱是否已存在
        if (email) {
            const existingEmail = await strapi
                .plugin('bag-strapi-plugin')
                .service('user')
                .findByEmail(email);

            if (existingEmail) {
                throw new Error('邮箱已被注册');
            }
        }

        // 加密密码
        const hashedPassword = await this.hashPassword(password);

        // 创建用户
        const user = await strapi
            .plugin('bag-strapi-plugin')
            .service('user')
            .create({
                username,
                email,
                password: hashedPassword,
                nickname: nickname || username,
                phone,
                status: 'active',
                role: 'user',
            });

        // 生成 Token
        const token = this.generateToken(user);

        // 返回用户信息（不包含密码）
        const { password: _, ...userData } = user;

        return {
            user: userData,
            token,
        };
    },

    /**
     * 用户登录
     */
    async login(identifier, password) {
        // 验证必填字段
        if (!identifier || !password) {
            throw new Error('用户名/邮箱和密码为必填项');
        }

        // 查找用户（支持用户名或邮箱登录）
        let user;
        
        // 判断是邮箱还是用户名
        if (identifier.includes('@')) {
            user = await strapi
                .plugin('bag-strapi-plugin')
                .service('user')
                .findByEmail(identifier);
        } else {
            user = await strapi
                .plugin('bag-strapi-plugin')
                .service('user')
                .findByUsername(identifier);
        }

        if (!user) {
            throw new Error('用户名或密码错误');
        }

        // 检查用户状态
        if (user.status === 'banned') {
            throw new Error('该账号已被封禁');
        }

        if (user.status === 'inactive') {
            throw new Error('该账号未激活');
        }

        // 验证密码
        const isPasswordValid = await this.comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('用户名或密码错误');
        }

        // 更新最后登录时间
        await strapi
            .plugin('bag-strapi-plugin')
            .service('user')
            .update(user.id, {
                lastLoginAt: new Date(),
            });

        // 生成 Token
        const token = this.generateToken(user);

        // 返回用户信息（不包含密码）
        const { password: _, ...userData } = user;

        return {
            user: userData,
            token,
        };
    },

    /**
     * 验证当前用户
     */
    async validateUser(token) {
        try {
            const decoded = this.verifyToken(token);
            
            // 从数据库获取最新用户信息
            const user = await strapi
                .plugin('bag-strapi-plugin')
                .service('user')
                .findOne(decoded.id);

            if (!user) {
                throw new Error('用户不存在');
            }

            if (user.status !== 'active') {
                throw new Error('用户状态异常');
            }

            // 返回用户信息（不包含密码）
            const { password: _, ...userData } = user;
            
            return userData;
        } catch (error) {
            throw new Error('Token 验证失败');
        }
    },

    /**
     * 修改密码
     */
    async changePassword(userId, oldPassword, newPassword) {
        // 获取用户
        const user = await strapi
            .plugin('bag-strapi-plugin')
            .service('user')
            .findOne(userId);

        if (!user) {
            throw new Error('用户不存在');
        }

        // 验证旧密码
        const isPasswordValid = await this.comparePassword(oldPassword, user.password);

        if (!isPasswordValid) {
            throw new Error('原密码错误');
        }

        // 加密新密码
        const hashedPassword = await this.hashPassword(newPassword);

        // 更新密码
        await strapi
            .plugin('bag-strapi-plugin')
            .service('user')
            .update(userId, {
                password: hashedPassword,
            });

        return { message: '密码修改成功' };
    },

    /**
     * 重置密码（忘记密码场景）
     */
    async resetPassword(identifier, newPassword) {
        // 查找用户
        let user;
        
        if (identifier.includes('@')) {
            user = await strapi
                .plugin('bag-strapi-plugin')
                .service('user')
                .findByEmail(identifier);
        } else {
            user = await strapi
                .plugin('bag-strapi-plugin')
                .service('user')
                .findByUsername(identifier);
        }

        if (!user) {
            throw new Error('用户不存在');
        }

        // 加密新密码
        const hashedPassword = await this.hashPassword(newPassword);

        // 更新密码
        await strapi
            .plugin('bag-strapi-plugin')
            .service('user')
            .update(user.id, {
                password: hashedPassword,
            });

        return { message: '密码重置成功' };
    },
});

export default service;

