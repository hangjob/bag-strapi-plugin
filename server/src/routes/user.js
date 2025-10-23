/**
 * 用户路由
 */

export default  [
    // 获取所有用户
    {
        method: 'GET',
        path: '/users',
        handler: 'user.find',
        config: {
            policies: [],
        },
    },

    // 获取单个用户
    {
        method: 'GET',
        path: '/users/:id',
        handler: 'user.findOne',
        config: {
            policies: [],
        },
    },

    // 根据用户名获取用户
    {
        method: 'GET',
        path: '/users/username/:username',
        handler: 'user.findByUsername',
        config: {
            policies: [],
        },
    },

    // 创建用户
    {
        method: 'POST',
        path: '/users',
        handler: 'user.create',
        config: {
            policies: [],
        },
    },

    // 更新用户
    {
        method: 'PUT',
        path: '/users/:id',
        handler: 'user.update',
        config: {
            policies: [],
        },
    },

    // 删除用户
    {
        method: 'DELETE',
        path: '/users/:id',
        handler: 'user.delete',
        config: {
            policies: [],
        },
    },

    // 批量删除用户
    {
        method: 'POST',
        path: '/users/delete-many',
        handler: 'user.deleteMany',
        config: {
            policies: [],
        },
    },

    // 批量创建用户
    {
        method: 'POST',
        path: '/users/create-many',
        handler: 'user.createMany',
        config: {
            policies: [],
        },
    },
];

