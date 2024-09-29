
# Cloudflare Workers 镜像加速代理

## 介绍 / Introduction
此项目是一个基于 Cloudflare Workers 的镜像加速代理，帮助用户加速从 Docker Hub、Quay、GCR 等多个镜像仓库的拉取速度。通过使用 Cloudflare Workers，用户可以利用地理分布式的优势，加速镜像的下载。

This project is a Cloudflare Workers-based image acceleration proxy, designed to help users speed up pulling images from multiple registries like Docker Hub, Quay, GCR, and more. By leveraging the geographic distribution of Cloudflare Workers, users can accelerate the download of container images.

---

## 快速开始 / Getting Started

### 步骤 / Steps

1. **Fork 本仓库 / Fork this repository**

   在 GitHub 上点击 "Fork" 按钮，创建此仓库的副本到你的账户中。

   Click the "Fork" button on GitHub to create a copy of this repository under your account.

2. **修改域名 / Update domain in configuration**

   打开 `./src/index.ts` 文件，并将文件内的 `example.com` 替换为你自己的域名。

   Open the `./src/index.ts` file and replace `example.com` with your own domain name.

3. **修改 wrangler.toml 配置 / Update `wrangler.toml` configuration**

   编辑 `wrangler.toml` 文件，找到 `example.com` 并替换为你的域名。

   Edit the `wrangler.toml` file, locate `example.com`, and replace it with your domain name.

4. **安装 Wrangler / Install Wrangler**

   使用以下命令将 Wrangler 安装到本地全局环境：

   Use the following command to install Wrangler globally:

   ```bash
   npm install -g wrangler
   ```

5. **登入 Cloudflare 账号 / Log in to your Cloudflare account**

   使用 Wrangler 登录你的 Cloudflare 账号：

   Use the following command to log in to your Cloudflare account:

   ```bash
   wrangler login
   ```

6. **部署到 Cloudflare Workers / Deploy to Cloudflare Workers**

   在终端运行以下命令，将项目部署到 Cloudflare Workers 的生产环境：

   Run the following command in the terminal to deploy the project to the production environment of Cloudflare Workers:

   ```bash
   wrangler deploy --env production
   ```

---

## 注意事项 / Notes

1. **域名替换 / Domain Replacement**

   请确保正确替换 `example.com` 为你的实际域名，错误的域名配置将导致 Workers 无法正确代理请求。

   Ensure that `example.com` is correctly replaced with your actual domain name. Incorrect domain configuration will cause Workers to fail in proxying requests.

2. **Cloudflare 账号 / Cloudflare Account**

   你需要一个有效的 Cloudflare 账号来使用 Workers。如果你还没有账号，可以前往 [Cloudflare 注册](https://www.cloudflare.com)。

   You need a valid Cloudflare account to use Workers. If you don't have an account yet, you can sign up at [Cloudflare](https://www.cloudflare.com).

3. **配置 Wrangler / Configuring Wrangler**

   在部署之前，请确保 `wrangler.toml` 中的所有配置都已正确设置。

   Before deploying, ensure that all configurations in `wrangler.toml` are correctly set.

4. **生产环境部署 / Production Environment Deployment**

   使用 `--env production` 进行部署时，确保你的配置已经经过测试，避免将未完成或存在问题的代码部署到生产环境。

   When deploying with `--env production`, ensure your configuration has been thoroughly tested to avoid deploying unfinished or problematic code to production.

---

## 支持与贡献 / Support & Contributions

原作者仓库: [https://github.com/ciiiii/cloudflare-docker-proxy](https://github.com/ciiiii/cloudflare-docker-proxy)

help.html 作者: [https://lixueduan.com](https://lixueduan.com)

如果你在使用过程中遇到问题，请通过 [issues](https://github.com/Criogaid/cloudflare-docker-proxy/issues) 提交，或者发送 PR 来贡献你的改进。

If you encounter issues while using the project, please submit them via [issues](https://github.com/Criogaid/cloudflare-docker-proxy/issues), or contribute your improvements by sending a PR.

---