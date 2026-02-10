import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { news } from '@/storage/database/shared/schema'
import * as schema from '@/storage/database/shared/schema'

// 解码压缩内容
async function fetchWithDecompression(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  const text = new TextDecoder('utf-8').decode(buffer)
  return text
}

// 解析新闻列表
function parseNewsList(html: string) {
  const newsItems: any[] = []

  // 尝试匹配不同的新闻列表模式
  // 模式1: 包含 "新闻" 或 "news" 的链接
  const newsLinkRegex = /<a[^>]*href=["']([^"']*(?:news|新闻)[^"']*)["'][^>]*>([^<]*(?:新闻|动态)[^<]*)<\/a>/gi
  let match

  while ((match = newsLinkRegex.exec(html)) !== null) {
    newsItems.push({
      title: match[2].trim(),
      link: match[1],
      source: 'lowato-pump.com'
    })
  }

  // 模式2: 匹配新闻列表项
  const newsItemRegex = /<(?:li|div|article)[^>]*class=["'][^"']*(?:news|article|item)[^"']*["'][^>]*>[\s\S]*?<h[23][^>]*>([^<]+)<\/h[23]>/gi

  return newsItems
}

// 抓取新闻详情
async function fetchNewsDetail(url: string) {
  try {
    const html = await fetchWithDecompression(url)

    // 提取标题
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<h2[^>]*>([^<]+)<\/h2>/i) ||
                      html.match(/<title>([^<]+)<\/title>/i)

    // 提取摘要（通常是第一个段落）
    const summaryMatch = html.match(/<p[^>]*>([^<]{10,200})<\/p>/i)

    // 提取内容（所有段落）
    const contentMatches = html.matchAll(/<p[^>]*>([^<]+)<\/p>/gi)
    const content = Array.from(contentMatches)
      .map(m => m[1].trim())
      .filter(p => p.length > 20)
      .join('\n')

    return {
      title: titleMatch ? titleMatch[1].trim() : '未命名新闻',
      summary: summaryMatch ? summaryMatch[1].trim() : '',
      content: content.substring(0, 500), // 限制内容长度
    }
  } catch (error) {
    console.error('获取新闻详情失败:', url, error)
    return null
  }
}

// 主抓取函数
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url = 'https://www.lowato-pump.com/' } = body

    // 抓取网站首页
    const html = await fetchWithDecompression(url)

    // 解析新闻列表
    const newsList = parseNewsList(html)

    // 抓取每条新闻的详情
    const results: any[] = []
    const db = await getDb(schema)

    for (const newsItem of newsList) {
      // 构建完整URL
      const fullUrl = newsItem.link.startsWith('http')
        ? newsItem.link
        : `${new URL(url).origin}${newsItem.link}`

      // 获取详情
      const detail = await fetchNewsDetail(fullUrl)

      if (detail) {
        // 保存到数据库
        const [inserted] = await db.insert(news).values({
          title: detail.title,
          category: '公司新闻',
          summary: detail.summary || detail.title,
          content: detail.content,
          image_url: null,
          is_published: true,
          publish_date: new Date(),
          display_order: 0,
        }).returning()

        results.push(inserted)
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功抓取并保存 ${results.length} 条新闻`,
      data: results,
    })
  } catch (error) {
    console.error('抓取新闻失败:', error)
    return NextResponse.json({
      success: false,
      error: '抓取新闻失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// GET 方法：返回抓取状态
export async function GET() {
  return NextResponse.json({
    message: '新闻抓取API',
    usage: 'POST /api/website/fetch-news with body: { "url": "https://www.lowato-pump.com/" }'
  })
}
