# 菜单管理

自动创建的菜单数据库表，包含完整的菜单字段，支持国际化和权限控制。

## 功能特性

- ✅ 自动创建数据库表 (`bag_plugin_menus`)
- ✅ 16 个完整的菜单字段
- ✅ 支持国际化配置
- ✅ 路由和图标管理
- ✅ 排序和权限控制
- ✅ 支持嵌套菜单

## 数据库表结构

表名：`bag_plugin_menus`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Number | 主键（自动生成） |
| menuId | Number | 菜单ID（唯一） |
| title | String | 菜单名称 |
| localesKey | String | 国际化key |
| file | String | 文件路径 |
| path | String | 路由路径 |
| name | String | 路由名称 |
| icon | String | 图标 |
| hasClose | Boolean | 是否有关闭按钮 |
| sort | Number | 排序 |
| hasMenu | Boolean | 是否有菜单 |
| hasRouter | Boolean | 是否有路由 |
| hasTab | Boolean | 是否有tab |
| root | String | 路由布局 |
| keepAlive | Boolean | 是否缓存 |
| overlayRouting | Boolean | 是否覆盖路由 |
| extra | String | 角标 |

## 使用方法

### 1. 通过 Strapi Admin 管理

1. 登录 Strapi Admin
2. 进入 **Content Manager**
3. 找到 **菜单（Menu）**
4. 添加/编辑菜单数据

### 2. 使用代码操作

#### 创建菜单

```javascript
const menu = await strapi.entityService.create('plugin::bag-strapi-plugin.menu', {
  data: {
    menuId: 1,
    title: '首页',
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'home',
    sort: 0,
    hasMenu: true,
    hasRouter: true,
  },
});
```

#### 查询菜单

```javascript
const menus = await strapi.entityService.findMany('plugin::bag-strapi-plugin.menu', {
  sort: 'sort:asc',
  filters: {
    hasMenu: true,
  },
});
```

#### 更新菜单

```javascript
await strapi.entityService.update('plugin::bag-strapi-plugin.menu', menuId, {
  data: { title: '首页（新）' },
});
```

#### 删除菜单

```javascript
await strapi.entityService.delete('plugin::bag-strapi-plugin.menu', menuId);
```

## 创建 API 端点

### 1. 创建控制器

```javascript
// controllers/menu.js
module.exports = {
  async find(ctx) {
    const menus = await strapi.entityService.findMany(
      'plugin::bag-strapi-plugin.menu',
      { sort: 'sort:asc' }
    );
    
    ctx.body = {
      success: true,
      data: menus,
    };
  },
};
```

### 2. 前端调用

```javascript
const response = await fetch('http://localhost:1337/bag-strapi-plugin/menu');
const { data } = await response.json();
console.log(data); // 菜单列表
```

## 初始化菜单数据

在 Strapi 启动时初始化默认菜单：

```javascript
// src/index.js
module.exports = {
  async bootstrap({ strapi }) {
    const count = await strapi.db.query('plugin::bag-strapi-plugin.menu').count();
    
    if (count === 0) {
      console.log('🔧 初始化菜单数据...');
      
      const menus = [
        {
          menuId: 1,
          title: '首页',
          localesKey: 'menu.dashboard',
          path: '/dashboard',
          name: 'Dashboard',
          icon: 'home',
          sort: 0,
          hasMenu: true,
          hasRouter: true,
        },
        {
          menuId: 2,
          title: '用户管理',
          localesKey: 'menu.users',
          path: '/users',
          name: 'Users',
          icon: 'user',
          sort: 1,
          hasMenu: true,
          hasRouter: true,
        },
      ];
      
      for (const menu of menus) {
        await strapi.entityService.create('plugin::bag-strapi-plugin.menu', {
          data: menu,
        });
      }
      
      console.log('✅ 菜单初始化完成');
    }
  },
};
```

## 相关链接

- [菜单 API 参考](/api/menu)

