# 饭伴 FanBan

一个基于 Next.js 16 的 H5 项目，帮助用户快速生成一周午餐菜单。

## 功能特性

- 🍽️ 一键生成周一至周五的午餐菜单
- 🎯 支持个性化偏好设置（口味、饮食目标、烹饪时长、厨具、忌口、菜式）
- 🤖 使用阿里云 AI 大模型智能生成菜谱
- 📝 菜谱详情查看（食材、步骤、营养信息）
- 🛒 自动生成购物清单
- 📚 历史菜单回顾

## 环境配置

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置阿里云 API Key

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 创建 API Key
3. 在项目根目录创建 `.env.local` 文件：

```bash
DASHSCOPE_API_KEY=your_api_key_here
```

**注意**：`.env.local` 文件已添加到 `.gitignore`，不会被提交到代码仓库。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
