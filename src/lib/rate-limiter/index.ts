/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'

interface RateLimiterConfig {
    limit: number;    // Maximum number of requests
    window: number;   // Time window in milliseconds
}

interface RequestRecord {
    timestamps: number[];
    resetTime: number;
}

// Store rate limiting data in memory
const rateLimit = new Map<string, RequestRecord>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimit.entries()) {
        if (record.resetTime < now) {
            rateLimit.delete(key);
        }
    }
}, 60000); // Clean up every minute

async function rateLimiter(
    key: string,
    config: RateLimiterConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const windowStart = now - config.window;

    // Get or create record for this key
    let record = rateLimit.get(key);
    if (!record) {
        record = {
            timestamps: [],
            resetTime: now + config.window
        };
        rateLimit.set(key, record);
    }

    // Clean up old timestamps
    record.timestamps = record.timestamps.filter(time => time > windowStart);

    // Check if limit is exceeded
    if (record.timestamps.length >= config.limit) {
        const oldestTimestamp = record.timestamps[0];
        const resetTime = oldestTimestamp + config.window;
        return {
            success: false,
            remaining: 0,
            reset: Math.ceil((resetTime - now) / 1000) // Convert to seconds
        };
    }

    // Add new timestamp
    record.timestamps.push(now);
    record.resetTime = now + config.window;

    return {
        success: true,
        remaining: config.limit - record.timestamps.length,
        reset: Math.ceil(config.window / 1000) // Convert to seconds
    };
}

// Higher-order function to wrap server actions with rate limiting
function withRateLimit(
    actionFn: (...args: any[]) => Promise<any>,
    config: RateLimiterConfig
) {
    return async (...args: any[]) => {
        const identifier = args[0]?.identifier || 'default';
        const key = `rate-limit:${identifier}`;

        const result = await rateLimiter(key, config);

        if (!result.success) {
            throw new Error(
                `Rate limit exceeded. Try again in ${result.reset} seconds. ` +
                `Remaining attempts: ${result.remaining}`
            );
        }

        return actionFn(...args);
    };
}

export function createRateLimitedAction<T>(
    actionFn: (formData: FormData) => Promise<T>,
    config = {
        limit: 5,
        window: 60000
    }
) {
    // Create rate limited version of the action
    const rateLimitedFn = withRateLimit(actionFn, config);

    // Return a wrapper function that handles the rate limiting
    return async (formData: FormData): Promise<T> => {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        // Create a new FormData and copy all entries
        const formDataWithIP = new FormData();
        for (const [key, value] of formData.entries()) {
            formDataWithIP.append(key, value);
        }
        formDataWithIP.append('identifier', ip);

        try {
            return await rateLimitedFn(formDataWithIP);
        } catch (error) {
            throw error;
        }
    };
}