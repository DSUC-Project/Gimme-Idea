import { Request, Response, NextFunction } from 'express'

const ACCESS_CODE = process.env.ACCESS_CODE || 'GMI2025'
const PUBLIC_PATHS = ['/api/access', '/api/health']

export const accessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path = req.path

  // Skip access check for public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return next()
  }

  const accessCode = req.headers['x-access-code'] as string
  const sessionToken = req.cookies?.access_token

  // Check if user has valid access (via header or cookie)
  if (accessCode === ACCESS_CODE || sessionToken === 'granted') {
    return next()
  }

  res.status(401).json({
    error: 'Access denied',
    message: 'Valid access code required'
  })
}
