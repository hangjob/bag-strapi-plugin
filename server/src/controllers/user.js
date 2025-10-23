/**
 * 用户控制器
 */

const controller = ({ strapi }) => ({
    /**
     * 获取所有用户（支持分页）
     */
    async find(ctx) {
        try {
            const { page = 1, pageSize = 100, sort = 'createdAt:desc' } = ctx.query;

            const result = await strapi.plugin('bag-strapi-plugin').service('user').findPage({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                sort,
            });

            ctx.body = {
                data: result.results,
                meta: {
                    pagination: result.pagination,
                },
            };
        } catch (error) {
            ctx.throw(500, `获取用户列表失败: ${error.message}`);
        }
    },

    /**
     * 根据ID获取单个用户
     */
    async findOne(ctx) {
        try {
            const { id } = ctx.params;

            const user = await strapi.plugin('bag-strapi-plugin').service('user').findOne(id);

            if (!user) {
                return ctx.notFound('用户不存在');
            }

            ctx.body = { data: user };
        } catch (error) {
            ctx.throw(500, `获取用户失败: ${error.message}`);
        }
    },

    /**
     * 创建用户
     */
    async create(ctx) {
        try {
            const data = ctx.request.body;

            const user = await strapi.plugin('bag-strapi-plugin').service('user').create(data);

            ctx.body = { data: user };
        } catch (error) {
            ctx.throw(500, `创建用户失败: ${error.message}`);
        }
    },

    /**
     * 更新用户
     */
    async update(ctx) {
        try {
            const { id } = ctx.params;
            const data = ctx.request.body;

            const user = await strapi.plugin('bag-strapi-plugin').service('user').update(id, data);

            ctx.body = { data: user };
        } catch (error) {
            ctx.throw(500, `更新用户失败: ${error.message}`);
        }
    },

    /**
     * 删除用户
     */
    async delete(ctx) {
        try {
            const { id } = ctx.params;

            const user = await strapi.plugin('bag-strapi-plugin').service('user').delete(id);

            ctx.body = { data: user };
        } catch (error) {
            ctx.throw(500, `删除用户失败: ${error.message}`);
        }
    },

    /**
     * 批量删除用户
     */
    async deleteMany(ctx) {
        try {
            const { ids } = ctx.request.body;

            if (!ids || !Array.isArray(ids)) {
                return ctx.badRequest('ids 必须是数组');
            }

            const results = await strapi.plugin('bag-strapi-plugin').service('user').deleteMany(ids);

            ctx.body = {
                data: results,
                message: `成功删除 ${results.length} 个用户`,
            };
        } catch (error) {
            ctx.throw(500, `批量删除用户失败: ${error.message}`);
        }
    },

    /**
     * 批量创建用户
     */
    async createMany(ctx) {
        try {
            const { users } = ctx.request.body;

            if (!users || !Array.isArray(users)) {
                return ctx.badRequest('users 必须是数组');
            }

            const results = await strapi.plugin('bag-strapi-plugin').service('user').createMany(users);

            ctx.body = {
                data: results,
                message: `成功创建 ${results.length} 个用户`,
            };
        } catch (error) {
            ctx.throw(500, `批量创建用户失败: ${error.message}`);
        }
    },

    /**
     * 根据用户名查找用户
     */
    async findByUsername(ctx) {
        try {
            const { username } = ctx.params;

            const user = await strapi.plugin('bag-strapi-plugin').service('user').findByUsername(username);

            if (!user) {
                return ctx.notFound('用户不存在');
            }

            ctx.body = { data: user };
        } catch (error) {
            ctx.throw(500, `查找用户失败: ${error.message}`);
        }
    },
});

export default controller

