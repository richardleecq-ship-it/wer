# Web Link Extractor - Coze 插件

> 从任何网页提取所有链接，支持 JavaScript 渲染、中文内容、智能描述生成

## 🎯 功能特性

- ✅ **智能提取**: 自动提取网页中的所有链接
- ✅ **JavaScript 支持**: 处理动态渲染的单页应用
- ✅ **中文支持**: 完美处理中文网站和内容
- ✅ **描述生成**: 自动生成链接的可读描述
- ✅ **元数据完整**: 包含 URL、描述、锚文本、标题
- ✅ **简单接口**: 统一的输入输出格式

## 🚀 快速开始

### 本地测试

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务器
npm run server:prod

# 测试接口
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 📡 API 接口

### 输入格式

```json
{
  "url": "https://example.com"
}
```

### 输出格式

```json
{
  "success": true,
  "data": [
    {
      "url": "https://example.com/page",
      "description": "页面描述",
      "anchorText": "链接文本",
      "title": "页面标题"
    }
  ],
  "sourceUrl": "https://example.com",
  "totalLinks": 1
}
```

## 🔌 Coze 配置

### 方法 1: 使用 OpenAPI（推荐）

1. 部署服务到公网
2. 在 Coze 创建插件，选择"OpenAPI"
3. 输入: `https://your-domain.com/openapi.json`

### 方法 2: 手动配置

- **接口地址**: `https://your-domain.com/extract`
- **请求方法**: POST
- **Content-Type**: application/json
- **参数**: `{ "url": "string" }`

## 🌐 部署选项

### Docker 部署

```bash
npm run build
docker build -t web-link-extractor .
docker run -p 3000:3000 web-link-extractor
```

### 云服务部署

**Railway:**
```bash
railway up
```

**Vercel:**
```bash
vercel
```

**Heroku:**
```bash
git push heroku main
```

### 本地测试（ngrok）

```bash
npm run server:prod
ngrok http 3000
```

## 📚 文档

- [部署指南](./DEPLOYMENT.md) - Railway 部署步骤
- [API 文档](./README.md) - 完整 API 参考

## 🧪 测试示例

### 测试英文网站

```javascript
const response = await fetch('http://localhost:3000/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await response.json();
console.log(`提取了 ${result.totalLinks} 个链接`);
```

### 测试中文网站

```javascript
const response = await fetch('http://localhost:3000/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://job.ceair.com/campus/campusJobList.html'
  })
});

const result = await response.json();
result.data.forEach(link => {
  console.log(`${link.anchorText}: ${link.url}`);
});
```

## 📊 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | API 文档 |
| `/health` | GET | 健康检查 |
| `/openapi.json` | GET | OpenAPI 规范 |
| `/extract` | POST | 提取链接（JSON） |
| `/extract?url=` | GET | 提取链接（查询参数） |

## 🎨 使用场景

- 🔍 **网站分析**: 分析网站链接结构
- 📊 **数据收集**: 批量收集网页链接
- 🤖 **AI 应用**: 为 AI 提供网页链接数据
- 🔗 **链接检查**: 检查网站的链接状态
- 📝 **内容抓取**: 提取网页内容链接

## 🔧 环境要求

- Node.js >= 18.0.0
- 内存 >= 512MB
- 磁盘空间 >= 500MB

## 🐛 故障排查

### 端口被占用

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Playwright 错误

```bash
npx playwright install chromium
```

### 内存不足

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run server
```

## 📦 项目结构

```
.
├── src/
│   ├── coze-api.ts          # Coze API 接口
│   ├── coze-server.ts       # HTTP 服务器
│   ├── core/                # 核心功能
│   ├── services/            # 服务层
│   └── types/               # 类型定义
├── openapi.json             # OpenAPI 规范
├── Dockerfile               # Docker 配置
└── package.json             # 依赖配置
```

## 💡 使用提示

1. **首次运行**: 会自动下载 Chromium 浏览器（约 150MB）
2. **生产部署**: 建议使用 Docker 部署
3. **端口配置**: 通过环境变量 `PORT` 修改端口
4. **CORS 支持**: 已启用，可直接从浏览器调用
5. **超时设置**: 默认 30 秒，可在代码中调整

## 🌟 特色功能

### 智能描述生成

自动为链接生成可读的描述：
- 优先使用 title 属性
- 其次使用 aria-label
- 最后使用锚文本
- 自动清理和格式化

### 完整元数据

每个链接包含：
- URL（规范化的绝对路径）
- 描述（智能生成）
- 锚文本（原始文本）
- 标题（title 属性）

### JavaScript 支持

使用 Playwright 渲染页面：
- 支持单页应用（SPA）
- 支持动态加载内容
- 等待网络空闲后提取

### 中文支持

完美处理中文内容：
- UTF-8 编码
- 中文字符正确显示
- 中文网站完全支持

## 📈 性能指标

- **平均响应时间**: 2-5 秒
- **超时设置**: 30 秒
- **内存使用**: ~200MB
- **并发支持**: 根据服务器配置

## 🔐 安全性

- CORS 已启用
- 输入验证
- 错误处理
- 超时保护

## 📄 许可证

MIT License

## 🤝 支持

遇到问题？查看：
1. [部署指南](./DEPLOYMENT.md)
2. [API 文档](./README.md)
3. Railway 部署日志

---

**快速命令：**
```bash
# 本地测试
npm install && npm run build && npm run server:prod

# Docker 构建
docker build -t web-link-extractor .
docker run -p 3000:3000 web-link-extractor
```
