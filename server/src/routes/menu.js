/**
 * 菜单路由
 */

export default  [
    // 获取所有菜单
    {
        method: 'GET',
        path: '/menus',
        handler: 'menu.find',
        config: {
            policies: [],
        },
    },

    // 获取单个菜单
    {
        method: 'GET',
        path: '/menus/:id',
        handler: 'menu.findOne',
        config: {
            policies: [],
        },
    },

    // 创建菜单
    {
        method: 'POST',
        path: '/menus',
        handler: 'menu.create',
        config: {
            policies: [],
        },
    },

    // 更新菜单
    {
        method: 'PUT',
        path: '/menus/:id',
        handler: 'menu.update',
        config: {
            policies: [],
        },
    },

    // 删除菜单
    {
        method: 'DELETE',
        path: '/menus/:id',
        handler: 'menu.delete',
        config: {
            policies: [],
        },
    },

    // 批量删除菜单
    {
        method: 'POST',
        path: '/menus/delete-many',
        handler: 'menu.deleteMany',
        config: {
            policies: [],
        },
    },

    // 批量创建菜单
    {
        method: 'POST',
        path: '/menus/create-many',
        handler: 'menu.createMany',
        config: {
            policies: [],
        },
    },
];

