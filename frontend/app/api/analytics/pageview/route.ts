import { type NextApiRequest, type NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type PageViewData = {
  url: string
  userId?: string
  postId?: string
  referrer?: string
  userAgent?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { url, userId, postId, referrer, userAgent } = req.body as PageViewData

    if (!url) {
      return res.status(400).json({ message: 'URL is required' })
    }

    // Record the pageview
    const pageview = await prisma.$transaction(async (tx) => {
      // Increment the post view count if this is a blog post
      if (postId) {
        await tx.post.update({
          where: { id: postId },
          data: { views: { increment: 1 } }
        })
      }

      // Record detailed analytics
      return await tx.analytics.create({
        data: {
          url,
          userId,
          postId,
          referrer: referrer || null,
          userAgent: userAgent || null,
          timestamp: new Date(),
          ipAddress: req.headers['x-forwarded-for'] as string || 
                    req.socket.remoteAddress || null
        }
      })
    })

    // Return success
    return res.status(200).json({
      success: true,
      data: pageview
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to record pageview'
    })
  }
}