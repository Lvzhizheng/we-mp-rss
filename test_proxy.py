"""
代理功能测试脚本
用于测试 iframe 跨域代理是否正常工作
"""
import requests
import json
from urllib.parse import quote

def test_proxy():
    """测试代理功能"""
    
    # 测试配置
    base_url = "http://localhost:8001"
    test_urls = [
        "https://mp.weixin.qq.com/s/test",  # 微信公众号文章示例
        "https://example.com",  # 简单网页
    ]
    
    print("=" * 60)
    print("代理功能测试")
    print("=" * 60)
    
    for test_url in test_urls:
        print(f"\n测试 URL: {test_url}")
        print("-" * 60)
        
        # 构建代理 URL
        encoded_url = quote(test_url, safe='')
        proxy_url = f"{base_url}/proxy/proxy?url={encoded_url}"
        
        print(f"代理 URL: {proxy_url}")
        
        try:
            # 发起请求
            response = requests.get(
                proxy_url,
                timeout=30,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )
            
            print(f"状态码: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
            print(f"响应大小: {len(response.content)} bytes")
            
            # 检查关键头
            cors_origin = response.headers.get('Access-Control-Allow-Origin', 'N/A')
            x_frame = response.headers.get('X-Frame-Options', 'N/A')
            csp = response.headers.get('Content-Security-Policy', 'N/A')
            
            print(f"CORS Origin: {cors_origin}")
            print(f"X-Frame-Options: {x_frame}")
            print(f"Content-Security-Policy: {csp}")
            
            # 检查 HTML 内容
            if 'html' in response.headers.get('content-type', '').lower():
                content = response.text
                
                # 检查 base 标签
                if '<base' in content:
                    import re
                    base_match = re.search(r'<base[^>]+href="([^"]+)"', content)
                    if base_match:
                        print(f"✓ Base 标签: {base_match.group(1)}")
                    else:
                        print("✗ Base 标签未找到")
                else:
                    print("✗ 未找到 base 标签")
                
                # 检查代理 URL
                proxy_count = content.count('/proxy/proxy?url=')
                print(f"✓ 代理 URL 数量: {proxy_count}")
                
                # 检查相对路径
                if '/images/' in content or '/css/' in content or '/js/' in content:
                    print("✓ 检测到相对路径资源")
                
                # 显示部分内容
                print("\nHTML 内容预览 (前500字符):")
                print(content[:500])
            
            print("\n✓ 测试成功")
            
        except requests.exceptions.Timeout:
            print("✗ 请求超时")
        except requests.exceptions.ConnectionError:
            print("✗ 连接失败，请确保服务正在运行")
        except Exception as e:
            print(f"✗ 错误: {str(e)}")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


def test_url_rewriting():
    """测试 URL 重写逻辑"""
    from urllib.parse import urljoin, urlparse, quote
    
    print("\n" + "=" * 60)
    print("URL 重写逻辑测试")
    print("=" * 60)
    
    test_cases = [
        {
            "base": "https://mp.weixin.qq.com/s/abc123",
            "relative": "/images/logo.png",
            "expected": "https://mp.weixin.qq.com/images/logo.png"
        },
        {
            "base": "https://example.com/page/sub",
            "relative": "css/style.css",
            "expected": "https://example.com/page/css/style.css"
        },
        {
            "base": "https://test.com/a/b/c.html",
            "relative": "../js/app.js",
            "expected": "https://test.com/a/js/app.js"
        },
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}:")
        print(f"  Base URL: {test['base']}")
        print(f"  相对路径: {test['relative']}")
        
        # 计算基础目录
        parsed = urlparse(test['base'])
        path = parsed.path
        if path and '/' in path:
            path = path.rsplit('/', 1)[0]
        else:
            path = ''
        base_dir = f"{parsed.scheme}://{parsed.netloc}{path}/"
        
        # 转换为绝对 URL
        absolute_url = urljoin(base_dir, test['relative'])
        
        # 转换为代理 URL
        encoded_url = quote(absolute_url, safe='')
        proxy_url = f"/proxy/proxy?url={encoded_url}"
        
        print(f"  基础目录: {base_dir}")
        print(f"  绝对 URL: {absolute_url}")
        print(f"  代理 URL: {proxy_url}")
        print(f"  期望 URL: {test['expected']}")
        
        if absolute_url == test['expected']:
            print("  ✓ 测试通过")
        else:
            print(f"  ✗ 测试失败")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--url-rewriting":
        test_url_rewriting()
    else:
        print("用法:")
        print("  python test_proxy.py              # 测试代理功能")
        print("  python test_proxy.py --url-rewriting  # 测试 URL 重写逻辑")
        print("\n开始测试代理功能...")
        test_proxy()
