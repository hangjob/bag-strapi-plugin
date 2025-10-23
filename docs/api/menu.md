# 菜单 API

菜单管理相关的 API 接口。

## GET /menu

获取菜单列表

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "menuId": 1,
      "title": "首页",
      "path": "/dashboard",
      "icon": "home",
      "sort": 0
    }
  ]
}
```

详细说明请参考 [菜单管理](/features/menu)。

