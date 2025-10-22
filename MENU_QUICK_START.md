# 菜单数据库 - 快速开始

## 🚀 3分钟上手

### 1️⃣ 安装插件

当你安装 `bag-strapi-plugin` 后，Strapi 会自动创建菜单数据库表 `bag_plugin_menus`。

```bash
# 在你的 Strapi 项目中
npm install bag-strapi-plugin
```

### 2️⃣ 启用插件

在 `config/plugins.js` 中：

```javascript
module.exports = {
  'bag-strapi-plugin': {
    enabled: true,
  },
};
```

### 3️⃣ 启动 Strapi

```bash
npm run develop
```

✅ **数据库表已自动创建！**

---

## 📊 数据库表结构

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

---

## 💻 使用方法

### 方法 1：在 Strapi Admin 中管理

1. 登录 Strapi Admin
2. 进入 **Content Manager**
3. 找到 **菜单（Menu）**
4. 添加/编辑菜单数据

### 方法 2：使用代码操作

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
  },
});
```

#### 查询菜单

```javascript
const menus = await strapi.entityService.findMany('plugin::bag-strapi-plugin.menu', {
  sort: 'sort:asc',
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

---

## 🎯 完整示例

### 在项目启动时初始化菜单

在 `src/index.js` 中：

```javascript
module.exports = {
  async bootstrap({ strapi }) {
    // 检查是否已有菜单
    const count = await strapi.db.query('plugin::bag-strapi-plugin.menu').count();
    
    if (count === 0) {
      console.log('🔧 初始化菜单数据...');
      
      // 创建菜单
      await strapi.entityService.create('plugin::bag-strapi-plugin.menu', {
        data: {
          menuId: 1,
          title: '首页',
          localesKey: 'menu.dashboard',
          path: '/dashboard',
          name: 'Dashboard',
          icon: 'home',
          hasClose: false,
          sort: 0,
        },
      });
      
      console.log('✅ 菜单初始化完成');
    }
  },
};
```

---

## 🌐 创建 API 端点

### 1. 创建路由

`src/api/menu/routes/menu.js`：

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/menus',
      handler: 'menu.find',
    },
  ],
};
```

### 2. 创建控制器

`src/api/menu/controllers/menu.js`：

```javascript
module.exports = {
  async find(ctx) {
    const menus = await strapi.entityService.findMany(
      'plugin::bag-strapi-plugin.menu',
      { sort: 'sort:asc' }
    );
    ctx.body = { data: menus };
  },
};
```

### 3. 前端调用

```javascript
const response = await fetch('http://localhost:1337/api/menus');
const { data } = await response.json();
console.log(data);
```

---

## 📚 详细文档

完整使用说明请查看：**[菜单数据库文档](./MENU_DATABASE.md)**

---

**版本**: 0.0.4

