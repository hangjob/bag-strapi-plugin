# 菜单数据库自动创建

## 📋 概述

当用户安装 `bag-strapi-plugin` 插件后，Strapi 会自动创建一个菜单数据库表 `bag_plugin_menus`。

---

## 🎯 功能

- ✅ 自动创建数据库表（无需手动操作）
- ✅ 在 Strapi Admin 的 Content Manager 中可见
- ✅ 可以通过 Strapi 的 Entity Service API 操作

---

## 📊 数据库字段

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | Number | 是 | 自动生成 | Strapi 自动生成的主键 |
| `menuId` | Number | 是 | - | 菜单ID（唯一） |
| `title` | String | 是 | - | 菜单名称 |
| `localesKey` | String | 否 | - | 菜单名称的国际化key |
| `file` | String | 否 | - | 菜单对应的文件路径 |
| `path` | String | 是 | - | 菜单对应的路径 |
| `name` | String | 是 | - | 菜单对应的路由名称 |
| `icon` | String | 否 | - | 菜单对应的图标 |
| `hasClose` | Boolean | 否 | true | 是否有关闭按钮 |
| `sort` | Number | 否 | 0 | 菜单排序 |
| `hasMenu` | Boolean | 否 | true | 是否有菜单 |
| `hasRouter` | Boolean | 否 | true | 是否有路由 |
| `hasTab` | Boolean | 否 | true | 是否有tab |
| `root` | String | 否 | 'layout' | 路由布局 |
| `keepAlive` | Boolean | 否 | false | 是否缓存路由 |
| `overlayRouting` | Boolean | 否 | false | 是否覆盖路由 |
| `extra` | String | 否 | - | 角标 |

---

## 🚀 自动创建流程

### 1. 安装插件

```bash
npm install bag-strapi-plugin
# 或
yarn add bag-strapi-plugin
```

### 2. 配置插件

在 `config/plugins.js` 中启用插件：

```javascript
module.exports = {
  'bag-strapi-plugin': {
    enabled: true,
  },
};
```

### 3. 启动 Strapi

```bash
npm run develop
```

**Strapi 会自动：**
- ✅ 检测到插件的 Content Type 定义
- ✅ 在数据库中创建 `bag_plugin_menus` 表
- ✅ 创建所有字段和索引

---

## 💻 如何使用数据库表

### 方法 1：在 Strapi Admin 中管理

1. 启动 Strapi
2. 登录 Admin 面板
3. 进入 **Content Manager**
4. 找到 **菜单（Menu）** 集合
5. 可以手动添加、编辑、删除菜单数据

---

### 方法 2：使用 Entity Service API

在你的 Strapi 代码中操作菜单数据：

#### 查询所有菜单

```javascript
const menus = await strapi.entityService.findMany('plugin::bag-strapi-plugin.menu', {
  sort: 'sort:asc',
});

console.log(menus);
```

#### 创建菜单

```javascript
const newMenu = await strapi.entityService.create('plugin::bag-strapi-plugin.menu', {
  data: {
    menuId: 1,
    title: '首页',
    localesKey: 'menu.dashboard',
    file: '/views/Dashboard.vue',
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'home',
    hasClose: false,
    sort: 0,
    hasMenu: true,
    hasRouter: true,
    hasTab: true,
    root: 'layout',
    keepAlive: true,
    overlayRouting: false,
    extra: '',
  },
});

console.log('创建成功:', newMenu);
```

#### 更新菜单

```javascript
const updatedMenu = await strapi.entityService.update(
  'plugin::bag-strapi-plugin.menu',
  menuId,  // Strapi 的 ID（不是 menuId 字段）
  {
    data: {
      title: '首页（修改）',
      sort: 10,
    },
  }
);
```

#### 删除菜单

```javascript
await strapi.entityService.delete('plugin::bag-strapi-plugin.menu', menuId);
```

#### 根据条件查询

```javascript
// 根据 menuId 字段查询
const menu = await strapi.db.query('plugin::bag-strapi-plugin.menu').findOne({
  where: { menuId: 1 },
});

console.log(menu);
```

---

### 方法 3：使用数据库查询

```javascript
// 使用 Strapi 的 db.query API
const menus = await strapi.db.query('plugin::bag-strapi-plugin.menu').findMany({
  where: {
    hasMenu: true,
  },
  orderBy: { sort: 'asc' },
});

console.log(menus);
```

---

## 📝 完整示例

### 在生命周期函数中初始化菜单

在你的 Strapi 项目中创建 `src/index.js`：

```javascript
module.exports = {
  async bootstrap({ strapi }) {
    console.log('🔧 初始化菜单数据...');

    // 检查是否已有菜单数据
    const existingMenus = await strapi.entityService.findMany(
      'plugin::bag-strapi-plugin.menu'
    );

    if (existingMenus.length === 0) {
      // 初始化菜单数据
      const menus = [
        {
          menuId: 1,
          title: '首页',
          localesKey: 'menu.dashboard',
          path: '/dashboard',
          name: 'Dashboard',
          icon: 'home',
          hasClose: false,
          sort: 0,
        },
        {
          menuId: 2,
          title: '系统管理',
          localesKey: 'menu.system',
          path: '/system',
          name: 'System',
          icon: 'setting',
          sort: 10,
        },
        {
          menuId: 3,
          title: '用户管理',
          localesKey: 'menu.system.users',
          path: '/system/users',
          name: 'SystemUsers',
          icon: 'user',
          sort: 20,
        },
      ];

      for (const menuData of menus) {
        await strapi.entityService.create('plugin::bag-strapi-plugin.menu', {
          data: menuData,
        });
      }

      console.log('✅ 菜单数据初始化完成');
    } else {
      console.log('ℹ️ 菜单数据已存在，跳过初始化');
    }
  },
};
```

---

### 在控制器中使用

```javascript
// src/api/custom/controllers/custom.js
module.exports = {
  async getMenus(ctx) {
    try {
      // 获取所有启用的菜单
      const menus = await strapi.entityService.findMany(
        'plugin::bag-strapi-plugin.menu',
        {
          filters: { hasMenu: true },
          sort: 'sort:asc',
        }
      );

      ctx.body = {
        success: true,
        data: menus,
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async createMenu(ctx) {
    try {
      const menuData = ctx.request.body;

      const menu = await strapi.entityService.create(
        'plugin::bag-strapi-plugin.menu',
        { data: menuData }
      );

      ctx.body = {
        success: true,
        data: menu,
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
```

---

### 在服务中使用

```javascript
// src/api/custom/services/custom.js
module.exports = {
  async getUserMenus(userId) {
    // 获取用户权限对应的菜单
    const menus = await strapi.entityService.findMany(
      'plugin::bag-strapi-plugin.menu',
      {
        filters: {
          hasMenu: true,
          hasRouter: true,
        },
        sort: 'sort:asc',
      }
    );

    // 根据用户权限过滤菜单
    // ... 你的业务逻辑

    return menus;
  },

  async buildMenuTree(menus) {
    // 构建菜单树形结构
    // ... 你的业务逻辑
    return menus;
  },
};
```

---

## 🗂️ 数据库表名

- **表名**: `bag_plugin_menus`
- **位置**: 在你的 Strapi 数据库中

你可以通过数据库客户端查看这个表：

```sql
-- 查看所有菜单
SELECT * FROM bag_plugin_menus ORDER BY sort ASC;

-- 查询启用的菜单
SELECT * FROM bag_plugin_menus WHERE hasMenu = 1 ORDER BY sort ASC;
```

---

## 🎨 在前端使用

### 创建 API 端点获取菜单

在 `src/api/menu/routes/menu.js` 中：

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/menus',
      handler: 'menu.find',
      config: {
        auth: false,  // 或根据需要配置权限
      },
    },
  ],
};
```

在 `src/api/menu/controllers/menu.js` 中：

```javascript
module.exports = {
  async find(ctx) {
    const menus = await strapi.entityService.findMany(
      'plugin::bag-strapi-plugin.menu',
      {
        filters: { hasMenu: true },
        sort: 'sort:asc',
      }
    );

    ctx.body = { data: menus };
  },
};
```

### 前端调用

```javascript
// 获取菜单数据
async function loadMenus() {
  const response = await fetch('http://localhost:1337/api/menus');
  const { data } = await response.json();
  return data;
}

// 使用菜单数据
const menus = await loadMenus();
console.log(menus);
```

---

## ⚠️ 注意事项

1. **自动创建**：数据库表会在 Strapi 启动时自动创建，无需手动操作
2. **表名固定**：表名为 `bag_plugin_menus`，不可修改
3. **唯一性**：`menuId` 字段设置了唯一索引，不能重复
4. **必填字段**：`menuId`、`title`、`path`、`name` 是必填的

---

## 🔧 配置选项

### 在 Content Manager 中显示/隐藏

如果你想在 Content Manager 中隐藏这个 Content Type，可以修改 `server/src/content-types/menu.js`：

```javascript
pluginOptions: {
    'content-manager': {
        visible: false,  // 改为 false 隐藏
    },
},
```

---

## 📚 相关文档

- [Strapi Entity Service API](https://docs.strapi.io/dev-docs/api/entity-service)
- [Strapi Content Types](https://docs.strapi.io/dev-docs/backend-customization/models)
- [Strapi Database API](https://docs.strapi.io/dev-docs/database)

---

## 🧪 测试数据库表是否创建成功

### 方法 1：通过 Strapi Admin

1. 启动 Strapi
2. 登录 Admin 面板
3. 查看 Content Manager
4. 应该能看到 "菜单（Menu）" 集合

### 方法 2：通过数据库客户端

连接你的数据库，查看是否存在 `bag_plugin_menus` 表：

```sql
-- MySQL/MariaDB
SHOW TABLES LIKE 'bag_plugin_menus';

-- PostgreSQL
SELECT * FROM information_schema.tables 
WHERE table_name = 'bag_plugin_menus';

-- SQLite
SELECT name FROM sqlite_master 
WHERE type='table' AND name='bag_plugin_menus';
```

### 方法 3：通过代码测试

在 `src/index.js` 的 `bootstrap` 中：

```javascript
module.exports = {
  async bootstrap({ strapi }) {
    // 测试查询菜单表
    const menus = await strapi.entityService.findMany(
      'plugin::bag-strapi-plugin.menu'
    );
    
    console.log('✅ 菜单表创建成功！当前菜单数量:', menus.length);
  },
};
```

---

**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

