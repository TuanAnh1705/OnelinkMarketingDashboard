// File: app/api/wp-sync/route.ts (DASHBOARD) - OPTIMIZED FOR SPEED
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import he from "he"

function extractImagesFromContent(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const urls: string[] = []
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1])
  }
  return urls
}

// 🚀 Hàm xử lý một batch posts song song
async function processBatch(
  posts: any[], 
  approvedPostsMap: Map<number, { isPublished: boolean, categoryIds: number[] }>
) {
  // Xử lý tất cả posts trong batch cùng lúc
  await Promise.all(posts.map(async (post) => {
    const cover = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null
    const contentHtml = post.content?.rendered || ""
    const images = extractImagesFromContent(contentHtml)
    const decodedTitle = he.decode(post.title?.rendered || "")
    const previousState = approvedPostsMap.get(post.id)

    // Upsert post
    const saved = await prisma.blogPost.upsert({
      where: { wpId: post.id },
      update: {
        title: decodedTitle,
        slug: post.slug,
        contentHtml,
        coverImage: cover,
        wpStatus: post.status,
        wpCreatedAt: new Date(post.date),
      },
      create: {
        wpId: post.id,
        title: decodedTitle,
        slug: post.slug,
        contentHtml,
        coverImage: cover,
        wpStatus: post.status,
        wpCreatedAt: new Date(post.date),
        isPublishedOnNextjs: previousState?.isPublished || false,
      },
    })

    // Xử lý images và categories song song
    await Promise.all([
      // Images
      (async () => {
        await prisma.blogImage.deleteMany({ where: { postId: saved.id } })
        if (images.length > 0) {
          await prisma.blogImage.createMany({
            data: images.map(url => ({ url, postId: saved.id })),
            skipDuplicates: true
          })
        }
      })(),
      
      // Categories
      (async () => {
        if (previousState && previousState.categoryIds.length > 0) {
          await prisma.postCategory.deleteMany({ where: { postId: saved.id } })
          await prisma.postCategory.createMany({
            data: previousState.categoryIds.map(categoryId => ({
              postId: saved.id,
              categoryId: categoryId
            })),
            skipDuplicates: true
          })
        }
      })()
    ])
  }))
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const wpUrl = process.env.WP_BASE_URL
    const user = process.env.WP_USER
    const appPassword = process.env.WP_APP_PASSWORD
    const token = Buffer.from(`${user}:${appPassword}`).toString("base64")

    const { searchParams } = new URL(req.url)
    const full = searchParams.get("full") === "true"

    // 📦 Lưu trạng thái approve
    let approvedPostsMap = new Map<number, { 
      isPublished: boolean, 
      categoryIds: number[] 
    }>()

    if (full) {
      console.log("🔄 Backing up approved posts...")
      const approvedPosts = await prisma.blogPost.findMany({
        where: { isPublishedOnNextjs: true },
        select: {
          wpId: true,
          isPublishedOnNextjs: true,
          categories: {
            select: { categoryId: true }
          }
        }
      })

      approvedPosts.forEach(post => {
        approvedPostsMap.set(post.wpId, {
          isPublished: post.isPublishedOnNextjs,
          categoryIds: post.categories.map(c => c.categoryId)
        })
      })

      console.log(`✅ Backed up ${approvedPosts.length} approved posts`)

      // Reset database
      console.log("🗑️  Truncating tables...")
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`)
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE PostCategory;`)
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE BlogImage;`)
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE BlogPost;`)
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`)
      console.log("✅ Tables truncated")
    }

    let page = 1
    const perPage = 100 // 🚀 Tăng từ 50 lên 100
    const batchSize = 10 // 🚀 Xử lý 10 posts cùng lúc
    let imported = 0

    console.log("🚀 Starting sync from WordPress...")

    while (true) {
      const fetchStart = Date.now()
      const res = await fetch(
        `${wpUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&status=any&_embed`,
        { 
          headers: { Authorization: `Basic ${token}` },
          // 🚀 Tăng timeout
          signal: AbortSignal.timeout(30000)
        }
      )
      
      if (res.status === 400 || res.status === 404) break
      if (!res.ok) throw new Error(`Failed to fetch WP posts: ${res.status}`)

      const posts = await res.json()
      if (!posts.length) break

      console.log(`Fetched page ${page} (${posts.length} posts) in ${Date.now() - fetchStart}ms`)

      // 🚀 Chia posts thành các batches nhỏ để xử lý song song
      const batches = []
      for (let i = 0; i < posts.length; i += batchSize) {
        batches.push(posts.slice(i, i + batchSize))
      }

      const processStart = Date.now()
      
      // 🚀 Xử lý tất cả batches song song
      await Promise.all(batches.map(batch => processBatch(batch, approvedPostsMap)))
      
      imported += posts.length
      console.log(`Processed ${posts.length} posts in ${Date.now() - processStart}ms (Total: ${imported})`)
      
      page++
    }

    const totalTime = Date.now() - startTime
    const avgTimePerPost = imported > 0 ? (totalTime / imported).toFixed(2) : 0

    console.log(`Sync completed: ${imported} posts in ${totalTime}ms`)
    console.log(`Average: ${avgTimePerPost}ms per post`)

    return NextResponse.json({ 
      success: true, 
      imported,
      duration: totalTime,
      averagePerPost: avgTimePerPost
    })
  } catch (err: any) {
    console.error("Sync failed:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}