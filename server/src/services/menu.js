/**
 * 菜单服务
 */

const service = ({ strapi }) => ({
    /**
     * 获取所有菜单
     */
    async findAll(params = {}) {
        return await strapi.entityService.findMany('plugin::bag-strapi-plugin.bag-menu', params);
    },

    /**
     * 分页查询菜单
     */
    async findPage(params = {}) {
        const { page = 1, pageSize = 100, sort = 'sort:asc', filters = {} } = params;

        return await strapi.entityService.findPage('plugin::bag-strapi-plugin.bag-menu', {
            page,
            pageSize,
            sort,
            filters,
        });
    },

    /**
     * 根据ID获取菜单
     */
    async findOne(id) {
        return await strapi.entityService.findOne('plugin::bag-strapi-plugin.bag-menu', id);
    },

    /**
     * 创建菜单
     */
    async create(data) {
        return await strapi.entityService.create('plugin::bag-strapi-plugin.bag-menu', {
            data,
        });
    },

    /**
     * 更新菜单
     */
    async update(id, data) {
        return await strapi.entityService.update('plugin::bag-strapi-plugin.bag-menu', id, {
            data,
        });
    },

    /**
     * 删除菜单
     */
    async delete(id) {
        return await strapi.entityService.delete('plugin::bag-strapi-plugin.bag-menu', id);
    },

    /**
     * 批量创建菜单
     */
    async createMany(menuList) {
        const results = [];

        for (const menuData of menuList) {
            const menu = await this.create(menuData);
            results.push(menu);
        }

        return results;
    },

    /**
     * 批量删除菜单
     */
    async deleteMany(ids) {
        const results = [];

        for (const id of ids) {
            const menu = await this.delete(id);
            results.push(menu);
        }

        return results;
    },
});

export default service;

