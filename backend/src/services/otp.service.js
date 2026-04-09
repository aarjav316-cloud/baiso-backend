import crypto from "crypto";
import { getRedisClient } from "../configs/redis.js";

const OTP_PREFIX = "otp:";
const OTP_ATTEMPT_PREFIX = "otp_attempt:";
const OTP_EXPIRY = 5 * 60; // 5 minutes in seconds
const MAX_OTP_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60; // 15 minutes

export const otpService = {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Hash OTP for secure storage (optional but recommended)
  hashOTP(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  },

  // Store OTP in Redis
  async storeOTP(phone, otp) {
    const redis = getRedisClient();
    if (!redis) {
      throw new Error("Redis not available");
    }

    const key = `${OTP_PREFIX}${phone}`;
    const hashedOTP = this.hashOTP(otp);

    // Store hashed OTP with expiry
    await redis.setEx(key, OTP_EXPIRY, hashedOTP);

    return {
      expiresIn: `${OTP_EXPIRY / 60} minutes`,
    };
  },

  // Verify OTP from Redis
  async verifyOTP(phone, otp) {
    const redis = getRedisClient();
    if (!redis) {
      throw new Error("Redis not available");
    }

    const key = `${OTP_PREFIX}${phone}`;
    const storedHashedOTP = await redis.get(key);

    if (!storedHashedOTP) {
      return { valid: false, reason: "OTP expired or not found" };
    }

    const hashedInputOTP = this.hashOTP(otp);

    if (storedHashedOTP !== hashedInputOTP) {
      // Track failed attempts
      await this.trackFailedAttempt(phone);
      return { valid: false, reason: "Invalid OTP" };
    }

    // OTP is valid - delete it (single use)
    await redis.del(key);

    return { valid: true };
  },

  // Delete OTP from Redis
  async deleteOTP(phone) {
    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${OTP_PREFIX}${phone}`;
    await redis.del(key);
  },

  // Check if OTP exists
  async otpExists(phone) {
    const redis = getRedisClient();
    if (!redis) {
      return false;
    }

    const key = `${OTP_PREFIX}${phone}`;
    const exists = await redis.exists(key);
    return exists === 1;
  },

  // Get remaining TTL for OTP
  async getOTPTTL(phone) {
    const redis = getRedisClient();
    if (!redis) {
      return 0;
    }

    const key = `${OTP_PREFIX}${phone}`;
    const ttl = await redis.ttl(key);
    return ttl > 0 ? ttl : 0;
  },

  // Rate limiting: Track failed OTP attempts
  async trackFailedAttempt(phone) {
    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    const key = `${OTP_ATTEMPT_PREFIX}${phone}`;
    const attempts = await redis.incr(key);

    if (attempts === 1) {
      // Set expiry on first attempt
      await redis.expire(key, ATTEMPT_WINDOW);
    }

    return attempts;
  },

  // Check if user has exceeded OTP attempts
  async isRateLimited(phone) {
    const redis = getRedisClient();
    if (!redis) {
      return false;
    }

    const key = `${OTP_ATTEMPT_PREFIX}${phone}`;
    const attempts = await redis.get(key);

    return attempts && parseInt(attempts) >= MAX_OTP_ATTEMPTS;
  },

  // Rate limiting: Track OTP request frequency
  async canRequestOTP(phone) {
    const redis = getRedisClient();
    if (!redis) {
      return { allowed: true };
    }

    // Check if OTP already exists
    const otpExists = await this.otpExists(phone);
    if (otpExists) {
      const ttl = await this.getOTPTTL(phone);
      return {
        allowed: false,
        reason: "OTP already sent",
        retryAfter: ttl,
      };
    }

    // Check rate limiting
    const isLimited = await this.isRateLimited(phone);
    if (isLimited) {
      const key = `${OTP_ATTEMPT_PREFIX}${phone}`;
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        reason: "Too many attempts",
        retryAfter: ttl,
      };
    }

    return { allowed: true };
  },
};
