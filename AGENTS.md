# AGENTS.md — Viva小铺前台 user 定制项目

> 本仓库负责 Viva小铺前台用户端 SPA，生产分支为 `viva-custom`。

---

## 仓库信息

```text
路径：/Users/lutao/vibeCodingProjects/viva/viva-faka-user
GitHub：https://github.com/LTXWorld/viva-faka-user
生产分支：viva-custom
```

历史 upstream 配置为 `https://github.com/dujiao-next/user`；2026-08-27 直接验证时该地址不可用。同步上游前必须先确认官方前台仓库的新地址，不要盲目修改生产分支历史。

---

## 作用范围

本仓库负责：

```text
首页和导航
商品列表与商品详情
购物车和结算页
游客购买流程
支付页
游客查单和订单详情
登录、注册、找回密码
统一兑换入口
ChatGPT Plus / Gemini 兑换页面
Viva小铺前台 UI 和文案
```

不负责：

```text
后端 API
后台管理端
生产服务器配置
支付和充值供应商密钥
数据库
```

---

## 当前生产基线

2026-08-27 核验结果：

```text
生产 user commit：5f2d22214740bae9aa4563600e5684aaddc8816e
对应 API/fullstack：c6113ff1d153e5492399c1bda1cdac9ee967585f
部署时间：2026-08-28 20:53（Asia/Shanghai）
```

已经完成：

```text
游客购买邮箱/密码 label、说明和暗色模式适配
游客字段提示从 site_config.scripts 热修迁移到源码
VivaStore/Viva小铺品牌和联系信息
密码找回入口
ChatGPT Plus 兑换页
Gemini 兑换页
统一兑换页 /redeem
订单详情和游客订单详情兑换按钮
ChatGPT Token 辅助链接
邮箱验证码注册与密码重置
注册/重置发码内置图片 Captcha
```

当前生产注册配置：

```text
开放注册：开启
邮箱验证：开启
允许邮箱域名：gmail.com、qq.com、163.com
Captcha：image，作用于 register_send_code 和 reset_send_code
```

旧文档中的“第一阶段源码化目标”已经完成，不再作为待办。

---

## 主要定制文件

```text
src/views/Checkout.vue
src/views/OrderDetail.vue
src/views/GuestOrderDetail.vue
src/views/Redeem.vue
src/views/ChatGPTPlusRedeem.vue
src/views/GeminiRedeem.vue
src/api/recharge.ts
src/router/index.ts
src/i18n/index.ts
src/components/Navbar.vue
src/components/Footer.vue
```

新增功能前先确认属于前台、本仓库 API 调用，还是需要同时修改 `viva-faka-custom` 后端。

---

## 开发与构建

```bash
cd /Users/lutao/vibeCodingProjects/viva/viva-faka-user
git checkout viva-custom
npm ci
npm run dev
npm run build
```

推荐检查：

```text
/viva-check user
/viva-check push --quick
```

`dist/` 和 `node_modules/` 已被 Git 忽略。

---

## 与生产部署的关系

推送本仓库：

```bash
git push origin viva-custom
```

只会更新前台仓库，不会立即部署生产。生产部署统一由：

```text
LTXWorld/viva-faka-custom → Deploy Production
```

执行。该 workflow 会构建本仓库 `dist/`，与 admin `dist/` 一起嵌入 fullstack Go 二进制后部署到 `/srv/faka/app/dujiao-server`。

所以前台上线顺序是：

```text
1. 本仓库 npm run build 通过
2. 提交并推送 viva-faka-user:viva-custom
3. 在 viva-faka-custom 触发下一次自动或手动 Deploy Production
```

---

## 敏感信息规则

禁止提交：

```text
支付密钥
充值供应商 API Key
后台密码
服务器 SSH 私钥
数据库
生产 config.yml
用户 Token 或订单隐私数据
```

---

*最后更新：2026-08-27*
