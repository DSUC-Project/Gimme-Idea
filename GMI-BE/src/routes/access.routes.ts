import { Router, Request, Response } from 'express'

const router = Router()
const ACCESS_CODE = process.env.ACCESS_CODE || 'GMI2025'

/**
 * POST /api/access
 * Verify access code
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Access code required' })
    }

    if (code !== ACCESS_CODE) {
      return res.status(401).json({ error: 'Invalid access code' })
    }

    // Set cookie for future requests
    res.cookie('access_token', 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.json({
      success: true,
      message: 'Access granted'
    })
  } catch (error) {
    console.error('[Access] Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
