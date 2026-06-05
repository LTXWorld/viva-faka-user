# AGENTS.md — Viva小铺前台 user 定制项目

> 本项目是 Viva小铺前台页面定制仓库，fork 自 Dujiao-Next user。

---

## 项目路径

```text
/Users/lutao/vibeCodingProjects/viva/viva-faka-user
```

GitHub：

```text
https://github.com/LTXWorld/viva-faka-user
```

上游：

```text
https://github.com/dujiao-next/user
```

当前分支：

```text
viva-custom
```

---

## 作用范围

本仓库负责 Viva小铺前台用户端：

```text
首页
商品列表
商品详情
购物车
结算页
支付页
游客查单
订单详情
```

不负责：

```text
后端 API
后台管理端
服务器配置
支付密钥
数据库
```

---

## 第一阶段源码化目标

当前生产站点通过 `site_config.scripts` 热修了游客购买字段提示。

需要在本仓库源码中正规实现：

```text
1. 结算页游客购买邮箱字段显示 label：邮箱：
2. 结算页游客购买密码字段显示 label：密码：
3. 显示说明文字：
   - 邮箱用于接收订单信息、查询订单和找回卡密
   - 密码用于游客查单查看订单和卡密
4. 适配暗色模式
5. 构建后不再依赖生产环境注入脚本
```

可能涉及：

```text
src/views/Checkout.vue
src/locales 或 i18n 文案文件
```

实际路径需通过搜索确认。

---

## 开发命令

查看 `package.json` 后确定。常见命令：

```bash
npm install
npm run dev
npm run build
```

---

## 与 fullstack 仓库关系

最终生产部署不是单独部署本仓库，而是：

```text
1. 构建本仓库得到 dist/
2. fullstack 仓库 viva-faka-custom 将 dist/ embed 进 dujiao-server
3. 部署 dujiao-server 到 /srv/faka/app/dujiao-server
```

---

## 敏感信息规则

本仓库只包含前端源码，禁止提交：

```text
支付密钥
后台密码
服务器私钥
数据库
生产 config.yml
```

---

*最后更新：2026-06-05*
