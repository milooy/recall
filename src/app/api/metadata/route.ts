import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // URL 유효성 검사
    new URL(url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // 메타데이터 추출
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      url

    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    let image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null

    // 상대 URL을 절대 URL로 변환
    if (image && !image.startsWith('http')) {
      const baseUrl = new URL(url)
      image = new URL(image, baseUrl.origin).href
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      url
    })

  } catch (error) {
    console.error('Error fetching metadata:', error)
    
    // 에러 시 기본값 반환
    return NextResponse.json({
      title: url,
      description: '',
      image: null,
      url
    })
  }
} 