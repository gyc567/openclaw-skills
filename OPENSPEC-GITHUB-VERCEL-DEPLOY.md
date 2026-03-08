# GitHub 自动触发 Vercel 部署工作流方案

## 1. 工作流概述

本工作流实现代码从 GitHub 仓库自动部署到 Vercel 平台的功能。当开发者将代码推送到指定的 GitHub 仓库时，Vercel 将自动检测到代码变更，并触发构建部署流程，最终将最新的网站内容部署到生产环境。

整个流程包括以下关键环节：首先，开发者在本地完成代码开发并提交到 GitHub 仓库；然后，GitHub 检测到推送事件并通知 Vercel；接着，Vercel 从仓库拉取最新代码并执行构建；最后，构建完成后自动部署到 Vercel 的全球 CDN 网络。整个过程完全自动化，无需人工干预。

## 2. 实现步骤

### 步骤一：连接 GitHub 仓库到 Vercel

首先需要将 GitHub 仓库与 Vercel 项目关联。访问 Vercel 控制台（https://vercel.com），使用 GitHub 账号登录。在仪表板中点击"Add New Project"按钮，选择"Import Project"选项。Vercel 会列出 GitHub 账户中所有可用的仓库，选择目标仓库（openclaw-skills）并点击"Import"按钮。

在导入过程中，Vercel 会自动检测项目类型（Next.js），并预配置构建命令。对于 Next.js 项目，默认的构建命令为 `npm run build`，输出目录为 `.next`。确认配置无误后，点击"Deploy"按钮完成首次部署。

### 步骤二：配置自动部署

首次部署完成后，Vercel 会自动为该仓库配置 Git 钩子。在仓库的设置页面中，可以看到"Vercel"集成已自动启用。每次向仓库的默认分支（main 或 master）推送代码时，Vercel 都会自动触发新的部署。

如果需要更精细的控制，可以在 Vercel 项目的设置中配置"Git"选项。可以选择部署的分支（如仅部署 main 分支）、设置预览部署（Preview Deployments）选项，以及配置生产部署（Production Deployments）的触发条件。

### 步骤三：配置环境变量（如需要）

如果项目使用了环境变量，需要在 Vercel 项目设置中配置。在项目设置页面点击"Environment Variables"选项，添加所需的环境变量。常见的变量包括数据库连接字符串、API 密钥等敏感信息。注意，生产环境的变量值应该与本地开发环境分开配置。

### 步骤四：验证部署状态

部署完成后，Vercel 会通过邮件通知部署结果。也可以在 Vercel 控制台的"Deployments"页面查看所有部署记录，包括部署时间、状态（成功或失败）、构建日志等信息。每个部署都有一个唯一的 URL，可以访问查看部署效果。

## 3. 所需配置

### 3.1 GitHub 仓库配置

确保 GitHub 仓库为公开或私有状态均可，但需要确保 Vercel 有权限访问该仓库。如果是私有仓库，需要在 GitHub 设置中为 Vercel 授予仓库访问权限。仓库的默认分支应设置为 main 或 master，以确保正确的部署分支。

### 3.2 Vercel 项目配置

在 Vercel 项目设置中，需要确认以下配置项：构建命令（Build Command）设置为 `npm run build`、输出目录（Output Directory）设置为 `.next`、安装命令（Install Command）使用默认的 `npm install` 即可。如果项目使用不同的包管理器（如 yarn 或 pnpm），需要相应调整安装命令。

### 3.3 部署分支策略

建议配置为仅在默认分支（main）推送时触发生产部署。开发分支的推送可以触发预览部署，便于在合并到主分支前进行测试和审查。这种策略可以确保生产环境始终部署经过验证的稳定版本。

## 4. 验证方法

### 4.1 触发测试部署

进行一次代码提交并推送到 GitHub 仓库，验证自动部署是否正常工作。推送命令示例：

```bash
git add .
git commit -m "test: trigger vercel deployment"
git push origin main
```

推送完成后，在 Vercel 控制台的"Deployments"页面应该能在几秒内看到新的部署任务开始执行。构建过程通常需要一到三分钟，完成后状态会变为"Ready"。

### 4.2 检查部署日志

如果部署失败，可以点击失败的部署记录查看详细的构建日志。日志中会显示错误信息，帮助定位问题原因。常见的构建错误包括依赖安装失败、TypeScript 编译错误、构建命令配置错误等。

### 4.3 访问部署结果

部署成功后，Vercel 会生成一个唯一的部署 URL（格式为 project-name-xxx.vercel.app）。生产部署的 URL 则是项目的主域名（如 openclawai.vercel.app）。访问该 URL 即可查看最新部署的网站效果。

## 5. 注意事项

### 5.1 部署时间考虑

Vercel 的自动部署需要一定的构建时间，具体取决于项目复杂度、依赖数量和网络状况。对于本项目，通常需要一到三分钟完成构建和部署。在推送代码后，需要等待片刻才能看到最新效果。

### 5.2 环境变量管理

切勿将敏感信息（如 API 密钥、数据库密码等）直接提交到 GitHub 仓库。这些信息应该通过 Vercel 的环境变量功能配置，或者使用 .env.local 文件并将其添加到 .gitignore 中。Vercel 提供了敏感变量保护功能，可以防止变量在客户端暴露。

### 5.3 预览部署功能

Vercel 的预览部署功能可以为每个 Pull Request 生成独立的预览链接，方便在合并代码前进行视觉测试和功能验证。建议在团队开发流程中充分利用这一功能，提高代码质量和协作效率。

### 5.4 域名配置

如果需要将自定义域名指向 Vercel 部署，可以在 Vercel 项目设置中的"Domains"选项中添加域名。添加后，按照指引配置 DNS 记录即可。Vercel 会自动为域名配置 SSL 证书，实现 HTTPS 访问。

---

本方案为一次性配置，配置完成后即可实现全自动的 CI/CD 部署流程，无需后续维护。
