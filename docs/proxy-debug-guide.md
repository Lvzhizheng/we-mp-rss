# Iframe 代理调试指南

## 问题：相对资源 404

如果代理后相对资源仍然返回 404，请按照以下步骤进行调试：

## 1. 检查服务器日志

启动服务时，确保日志级别设置为 INFO 或 DEBUG：

```bash
python main.py
```

查看日志输出，应该能看到：
- `收到代理请求: <url>` - 代理请求被接收
- `原始 URL: <url>` - 原始 URL
- `基础目录: <dir>` - 计算出的基础目录
- `重写: <relative> -> <proxy_url>` - URL 重写记录
- `HTML 内容处理完成` - HTML 处理成功
- `CSS 内容处理完成` - CSS 处理成功

## 2. 使用测试脚本

运行测试脚本验证代理功能：

```bash
# 测试代理功能
python test_proxy.py

# 测试 URL 重写逻辑
python test_proxy.py --url-rewriting
```

## 3. 浏览器开发者工具

### Network 标签
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 刷新页面
4. 查看所有请求：
   - 检查是否有 404 错误
   - 检查请求的 URL 格式是否正确
   - 检查响应头是否包含 CORS 信息

### Console 标签
1. 切换到 Console 标签
2. 查找错误信息：
   - `Mixed Content` - 混合内容错误
   - `CORS` - 跨域错误
   - `404` - 资源未找到错误

### Elements 标签
1. 切换到 Elements 标签
2. 检查 HTML 源代码：
   - 是否存在 `<base>` 标签
   - 资源 URL 是否正确
   - URL 格式是否为 `/proxy/proxy?url=...`

## 4. 常见问题排查

### 问题 1: Base 标签缺失
**症状：** 相对路径没有正确解析

**检查：**
```javascript
// 在浏览器控制台运行
document.querySelector('base')?.href
```

**解决：** 确保代理正确添加了 `<base>` 标签

### 问题 2: URL 编码问题
**症状：** URL 中包含特殊字符导致 404

**检查：** 查看浏览器 Network 标签，确认 URL 是否正确编码

**解决：** 代理应该自动处理 URL 编码

### 问题 3: CSS 文件 404
**症状：** 页面样式错乱，CSS 文件 404

**检查：**
1. 查看 Network 标签中的 CSS 请求
2. 确认请求 URL 格式正确
3. 检查服务器日志

**解决：**
- 确认 CSS 文件中的 `url()` 被正确重写
- 检查 CSS 文件路径是否正确

### 问题 4: 图片 404
**症状：** 图片无法显示

**检查：**
1. 在 Network 标签中找到图片请求
2. 查看请求 URL
3. 检查响应状态

**解决：**
- 确认 `src` 属性被正确重写
- 检查 `data-src` 属性（懒加载图片）
- 检查 `srcset` 属性（响应式图片）

### 问题 5: JavaScript 404
**症状：** JavaScript 功能异常

**检查：**
1. 查看 Console 标签中的错误
2. 在 Network 标签中找到 JS 请求
3. 检查脚本内容

**解决：**
- 确认 `<script src="...">` 被正确重写
- 检查 JS 文件路径是否正确

## 5. 手动测试代理URL

在浏览器中直接访问代理 URL：

```
http://localhost:8001/proxy/proxy?url=https://example.com
http://localhost:8001/proxy/proxy?url=https://example.com/css/style.css
http://localhost:8001/proxy/proxy?url=https://example.com/images/logo.png
```

检查：
- 页面是否正常加载
- 资源 URL 是否被正确重写
- 是否有 JavaScript 错误

## 6. 检查代理路由

确认代理路由已正确注册：

```bash
# 访问 API 文档
http://localhost:8001/api/docs

# 应该能看到 "代理服务" 分组下的端点
```

## 7. 检查配置

确认 `web.py` 中已注册代理路由：

```python
from apis.proxy import router as proxy_router
# ...
api_router.include_router(proxy_router)
```

## 8. 启用详细日志

修改 `apis/proxy.py` 中的日志级别：

```python
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # 启用 DEBUG 级别
```

## 9. 检查域名白名单

如果配置了域名白名单，确保目标域名在列表中：

```python
ALLOWED_DOMAINS = None  # 或包含目标域名的列表
```

## 10. 测试不同类型的资源

创建一个简单的测试页面：

```html
<!DOCTYPE html>
<html>
<head>
    <base href="https://example.com/">
    <title>代理测试</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <img src="/images/logo.png" alt="Logo">
    <script src="/js/app.js"></script>
    <a href="/page/other">链接</a>
</body>
</html>
```

通过代理访问此页面，检查所有资源是否正确加载。

## 11. 使用 curl 测试

```bash
# 测试 HTML 代理
curl -v "http://localhost:8001/proxy/proxy?url=https://example.com"

# 测试 CSS 代理
curl -v "http://localhost:8001/proxy/proxy?url=https://example.com/css/style.css"

# 测试图片代理
curl -v "http://localhost:8001/proxy/proxy?url=https://example.com/images/logo.png"
```

## 12. 检查响应头

使用 curl 检查响应头：

```bash
curl -I "http://localhost:8001/proxy/proxy?url=https://example.com"
```

应该看到：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: *
X-Frame-Options: ALLOWALL
Content-Security-Policy: frame-ancestors *
```

## 13. 性能检查

如果代理响应很慢：

1. 检查网络连接
2. 确认目标服务器响应正常
3. 检查代理超时设置（默认 30 秒）
4. 考虑添加缓存机制

## 14. 常见错误信息

| 错误信息 | 可能原因 | 解决方法 |
|---------|---------|---------|
| `Missing 'url' parameter` | 未提供 url 参数 | 添加 `?url=...` 参数 |
| `Domain not allowed` | 域名不在白名单 | 添加域名到白名单或禁用白名单 |
| `Request timeout` | 请求超时 | 增加超时时间或检查网络 |
| `Proxy error` | 代理内部错误 | 查看服务器日志 |
| `404 Not Found` | 资源未找到 | 检查 URL 重写逻辑 |
| `Mixed Content` | 混合内容 | 确保 HTTPS 资源通过 HTTPS 代理 |

## 15. 获取帮助

如果以上步骤都无法解决问题：

1. **收集信息：**
   - 服务器日志
   - 浏览器控制台错误
   - Network 标签中的请求详情
   - 代理 URL 和原始 URL

2. **提交问题：**
   - 包含完整的错误信息
   - 提供测试 URL
   - 说明预期行为和实际行为
   - 附上相关日志

3. **检查文档：**
   - `docs/iframe-proxy-guide.md` - 代理使用指南
   - `docs/proxy-debug-guide.md` - 本文档

## 总结

调试代理问题的关键步骤：
1. ✅ 检查服务器日志
2. ✅ 使用测试脚本
3. ✅ 检查浏览器开发者工具
4. ✅ 手动测试代理 URL
5. ✅ 检查配置和路由
6. ✅ 启用详细日志
7. ✅ 测试不同类型的资源

按照以上步骤，你应该能够定位并解决大多数代理相关的问题。
