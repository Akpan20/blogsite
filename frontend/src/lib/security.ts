import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Redis } from '@upstash/redis'

const SALT_ROUNDS = 12
const redis = Redis.fromEnv()

export const passwordRequirements = z
  .string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function isPasswordBreached(password: string): Promise<boolean> {
    try {
      // Step 1: Hash the password using SHA-1
      const sha1Password = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex')
        .toUpperCase()
  
      // Step 2: Get the first 5 characters of the hash (prefix)
      const prefix = sha1Password.substring(0, 5)
      const suffix = sha1Password.substring(5)
  
      // Step 3: Call the HIBP API with k-anonymity
      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`,
        {
          headers: {
            'User-Agent': 'YourApp/1.0',
            'Accept': 'text/plain'
          }
        }
      )
  
      if (!response.ok) {
        throw new Error('Failed to check password breach status')
      }
  
      // Step 4: Get the text response and split into lines
      const text = await response.text()
      const hashes = text.split('\n')
  
      // Step 5: Check if our hash suffix exists in the response
      for (const hash of hashes) {
        const [hashSuffix, count] = hash.split(':')
        if (hashSuffix.trim() === suffix) {
          return true // Password has been found in data breaches
        }
      }
  
      return false // Password not found in known breaches
    } catch (error) {
      // Log the error securely without exposing password details
      console.error('Error checking password breach status:', 
        error instanceof Error ? error.message : 'Unknown error')
      
      // Default to true in case of errors to be safe
      return true
    }
}
  
  // Optional: Add rate limiting wrapper
  export async function isPasswordBreachedWithRateLimit(
    password: string,
    rateLimiter?: RateLimiter
  ): Promise<boolean> {
    if (rateLimiter) {
      const canProceed = await rateLimiter.checkLimit()
      if (!canProceed) {
        throw new Error('Rate limit exceeded for password breach checking')
      }
    }
  
    return isPasswordBreached(password)
}
  
  // Optional: Add caching to reduce API calls
  export class PasswordBreachCache {
    private cache: Map<string, { result: boolean; timestamp: number }>
    private readonly TTL: number // Time to live in milliseconds
  
    constructor(ttlMinutes: number = 60) {
      this.cache = new Map()
      this.TTL = ttlMinutes * 60 * 1000
    }
  
    async check(password: string): Promise<boolean> {
      const sha1Password = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex')
        .toUpperCase()
  
      const cached = this.cache.get(sha1Password)
      if (cached && Date.now() - cached.timestamp < this.TTL) {
        return cached.result
      }
  
      const result = await isPasswordBreached(password)
      this.cache.set(sha1Password, {
        result,
        timestamp: Date.now()
      })
  
      return result
    }
  
    clearCache() {
      this.cache.clear()
    }
}

export async function addToBlacklist(token: string, expiresIn: number) {
  await redis.set(`blacklist:${token}`, '1', {
    ex: expiresIn
  })
}

export async function isBlacklisted(token: string): Promise<boolean> {
  const exists = await redis.exists(`blacklist:${token}`)
  return exists === 1
}