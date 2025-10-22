/**
 * 菜单控制器
 */

const controller = ({ strapi }) => ({
    /**
     * 获取所有菜单（支持分页）
     */
    async find(ctx) {
        try {
            const { page = 1, pageSize = 100, sort = 'sort:asc' } = ctx.query;

            const result = await strapi.plugin('bag-strapi-plugin').service('menu').findPage({
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
            ctx.throw(500, `获取菜单列表失败: ${error.message}`);
        }
    },

    /**
     * 根据ID获取单个菜单
     */
    async findOne(ctx) {
        try {
            const { id } = ctx.params;

            const menu = await strapi.plugin('bag-strapi-plugin').service('menu').findOne(id);

            if (!menu) {
                return ctx.notFound('菜单不存在');
            }

            ctx.body = { data: menu };
        } catch (error) {
            ctx.throw(500, `获取菜单失败: ${error.message}`);
        }
    },

    /**
     * 创建菜单
     */
    async create(ctx) {
        try {
            const data = ctx.request.body;

            const menu = await strapi.plugin('bag-strapi-plugin').service('menu').create(data);

            ctx.body = { data: menu };
        } catch (error) {
            ctx.throw(500, `创建菜单失败: ${error.message}`);
        }
    },

    /**
     * 更新菜单
     */
    async update(ctx) {
        try {
            const { id } = ctx.params;
            const data = ctx.request.body;

            const menu = await strapi.plugin('bag-strapi-plugin').service('menu').update(id, data);

            ctx.body = { data: menu };
        } catch (error) {
            ctx.throw(500, `更新菜单失败: ${error.message}`);
        }
    },

    /**
     * 删除菜单
     */
    async delete(ctx) {
        try {
            const { id } = ctx.params;

            const menu = await strapi.plugin('bag-strapi-plugin').service('menu').delete(id);

            ctx.body = { data: menu };
        } catch (error) {
            ctx.throw(500, `删除菜单失败: ${error.message}`);
        }
    },

    /**
     * 批量删除菜单
     */
    async deleteMany(ctx) {
        try {
            const { ids } = ctx.request.body;

            if (!ids || !Array.isArray(ids)) {
                return ctx.badRequest('ids 必须是数组');
            }

            const results = await strapi.plugin('bag-strapi-plugin').service('menu').deleteMany(ids);

            ctx.body = {
                data: results,
                message: `成功删除 ${results.length} 个菜单`,
            };
        } catch (error) {
            ctx.throw(500, `批量删除菜单失败: ${error.message}`);
        }
    },

    /**
     * 批量创建菜单
     */
    async createMany(ctx) {
        try {
            const { menus } = ctx.request.body;

            if (!menus || !Array.isArray(menus)) {
                return ctx.badRequest('menus 必须是数组');
            }

            const results = await strapi.plugin('bag-strapi-plugin').service('menu').createMany(menus);

            ctx.body = {
                data: results,
                message: `成功创建 ${results.length} 个菜单`,
            };
        } catch (error) {
            ctx.throw(500, `批量创建菜单失败: ${error.message}`);
        }
    },
});

export default controller

