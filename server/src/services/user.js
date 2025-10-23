/**
 * 用户服务
 */

const service = ({ strapi }) => ({
    /**
     * 获取所有用户
     */
    async findAll(params = {}) {
        return await strapi.entityService.findMany('plugin::bag-strapi-plugin.bag-user', params);
    },

    /**
     * 分页查询用户
     */
    async findPage(params = {}) {
        const { page = 1, pageSize = 100, sort = 'createdAt:desc', filters = {} } = params;

        return await strapi.entityService.findPage('plugin::bag-strapi-plugin.bag-user', {
            page,
            pageSize,
            sort,
            filters,
        });
    },

    /**
     * 根据ID获取用户
     */
    async findOne(id) {
        return await strapi.entityService.findOne('plugin::bag-strapi-plugin.bag-user', id);
    },

    /**
     * 创建用户
     */
    async create(data) {
        return await strapi.entityService.create('plugin::bag-strapi-plugin.bag-user', {
            data,
        });
    },

    /**
     * 更新用户
     */
    async update(id, data) {
        return await strapi.entityService.update('plugin::bag-strapi-plugin.bag-user', id, {
            data,
        });
    },

    /**
     * 删除用户
     */
    async delete(id) {
        return await strapi.entityService.delete('plugin::bag-strapi-plugin.bag-user', id);
    },

    /**
     * 批量创建用户
     */
    async createMany(userList) {
        const results = [];

        for (const userData of userList) {
            const user = await this.create(userData);
            results.push(user);
        }

        return results;
    },

    /**
     * 批量删除用户
     */
    async deleteMany(ids) {
        const results = [];

        for (const id of ids) {
            const user = await this.delete(id);
            results.push(user);
        }

        return results;
    },

    /**
     * 根据用户名查找用户
     */
    async findByUsername(username) {
        const users = await strapi.entityService.findMany('plugin::bag-strapi-plugin.bag-user', {
            filters: { username },
            limit: 1,
        });

        return users.length > 0 ? users[0] : null;
    },

    /**
     * 根据邮箱查找用户
     */
    async findByEmail(email) {
        const users = await strapi.entityService.findMany('plugin::bag-strapi-plugin.bag-user', {
            filters: { email },
            limit: 1,
        });

        return users.length > 0 ? users[0] : null;
    },
});

export default service;

