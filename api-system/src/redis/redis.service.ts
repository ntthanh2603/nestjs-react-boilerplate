import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Save a value to Redis
   * @param key - Key to store the value
   * @param value - Value to store
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.redis.set(key, value, 'EX', ttl);
    }
    return await this.redis.set(key, value);
  }

  /**
   * Get a value from Redis by key
   * @param key - Key to retrieve
   * @returns Value of the key, or null if not found
   */
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  /**
   * Delete one or more keys from Redis
   * @param keys - Keys to delete
   * @returns Number of keys that were removed
   */
  async del(...keys: string[]): Promise<number> {
    return await this.redis.del(keys);
  }

  /**
   * Check if a key exists
   * @param key - Key to check
   * @returns 1 if key exists, 0 if it doesn't
   */
  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  /**
   * Set a key's time to live in seconds
   * @param key - Key to set TTL for
   * @param seconds - Time to live in seconds
   * @returns 1 if successful, 0 if key doesn't exist
   */
  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  /**
   * Increment the integer value of a key by 1
   * @param key - Key to increment
   * @returns Value after incrementing
   */
  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  /**
   * Increment the integer value of a key by the given amount
   * @param key - Key to increment
   * @param increment - Amount to increment by
   * @returns Value after incrementing
   */
  async incrBy(key: string, increment: number): Promise<number> {
    return await this.redis.incrby(key, increment);
  }

  /**
   * Decrement the integer value of a key by 1
   * @param key - Key to decrement
   * @returns Value after decrementing
   */
  async decr(key: string): Promise<number> {
    return await this.redis.decr(key);
  }

  /**
   * Decrement the integer value of a key by the given amount
   * @param key - Key to decrement
   * @param decrement - Amount to decrement by
   * @returns Value after decrementing
   */
  async decrBy(key: string, decrement: number): Promise<number> {
    return await this.redis.decrby(key, decrement);
  }

  // ------ HASH OPERATIONS ------

  /**
   * Set the string value of a hash field
   * @param key - Hash key
   * @param field - Field name
   * @param value - Field value
   * @returns 1 if field is new, 0 if field was updated
   */
  async hSet(
    key: string,
    field: string,
    value: string | number,
  ): Promise<number> {
    return await this.redis.hset(key, field, value.toString());
  }

  /**
   * Set multiple hash fields to multiple values
   * @param key - Hash key
   * @param fieldValues - Object containing field-value pairs
   * @returns OK if successful
   */
  async hMSet(key: string, fieldValues: Record<string, any>): Promise<'OK'> {
    return await this.redis.hmset(key, fieldValues);
  }

  /**
   * Get the value of a hash field
   * @param key - Hash key
   * @param field - Field name
   * @returns Value of the field, or null if not found
   */
  async hGet(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  /**
   * Get the values of all given hash fields
   * @param key - Hash key
   * @param fields - Field names
   * @returns Array of values in the same order as the input fields
   */
  async hMGet(key: string, ...fields: string[]): Promise<(string | null)[]> {
    return await this.redis.hmget(key, ...fields);
  }

  /**
   * Get all fields and values in a hash
   * @param key - Hash key
   * @returns Object containing field-value pairs, or null if hash is empty
   */
  async hGetAll(key: string): Promise<any> {
    const result = await this.redis.hgetall(key);
    return Object.keys(result).length === 0 ? null : result;
  }

  /**
   * Delete one or more hash fields
   * @param key - Hash key
   * @param fields - Field names to delete
   * @returns Number of fields that were removed
   */
  async hDel(key: string, ...fields: string[]): Promise<number> {
    return await this.redis.hdel(key, ...fields);
  }

  /**
   * Determine if a hash field exists
   * @param key - Hash key
   * @param field - Field name
   * @returns 1 if field exists, 0 if it doesn't
   */
  async hExists(key: string, field: string): Promise<number> {
    return await this.redis.hexists(key, field);
  }

  // ------ LIST OPERATIONS ------

  /**
   * Prepend one or multiple values to a list
   * @param key - List key
   * @param values - Values to prepend
   * @returns Length of the list after the push operation
   */
  async lPush(key: string, ...values: any[]): Promise<number> {
    return await this.redis.lpush(key, ...values);
  }

  /**
   * Append one or multiple values to a list
   * @param key - List key
   * @param values - Values to append
   * @returns Length of the list after the push operation
   */
  async rPush(key: string, ...values: any[]): Promise<number> {
    return await this.redis.rpush(key, ...values);
  }

  /**
   * Remove and get the first element in a list
   * @param key - List key
   * @returns First element of the list, or null if list is empty
   */
  async lPop(key: string): Promise<string | null> {
    return await this.redis.lpop(key);
  }

  /**
   * Remove and get the last element in a list
   * @param key - List key
   * @returns Last element of the list, or null if list is empty
   */
  async rPop(key: string): Promise<string | null> {
    return await this.redis.rpop(key);
  }

  /**
   * Get a range of elements from a list
   * @param key - List key
   * @param start - Start index (0-based)
   * @param stop - End index (inclusive, -1 for all elements)
   * @returns Array of elements in the specified range
   */
  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.lrange(key, start, stop);
  }

  /**
   * Get the length of a list
   * @param key - List key
   * @returns Length of the list
   */
  async lLen(key: string): Promise<number> {
    return await this.redis.llen(key);
  }

  // ------ SET OPERATIONS ------

  /**
   * Add one or more members to a set
   * @param key - Set key
   * @param members - Members to add
   * @returns Number of members added to the set
   */
  async sAdd(key: string, ...members: string[]): Promise<number> {
    return await this.redis.sadd(key, ...members);
  }

  /**
   * Remove one or more members from a set
   * @param key - Set key
   * @param members - Members to remove
   * @returns Number of members removed from the set
   */
  async sRem(key: string, ...members: string[]): Promise<number> {
    return await this.redis.srem(key, ...members);
  }

  /**
   * Get all members in a set
   * @param key - Set key
   * @returns Array of all members in the set
   */
  async sMembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }

  /**
   * Check if a value is a member of a set
   * @param key - Set key
   * @param member - Value to check
   * @returns 1 if member exists in set, 0 if not
   */
  async sIsMember(key: string, member: string): Promise<number> {
    return await this.redis.sismember(key, member);
  }

  // ------ SORTED SET OPERATIONS ------

  /**
   * Add one or more members to a sorted set, or update their scores
   * @param key - Sorted set key
   * @param score - Score for the member
   * @param member - Member to add
   * @returns Number of elements added to the sorted set
   */
  async zAdd(key: string, score: number, member: string): Promise<number> {
    return await this.redis.zadd(key, score.toString(), member);
  }

  /**
   * Get the score of a member in a sorted set
   * @param key - Sorted set key
   * @param member - Member to get score for
   * @returns Score of the member, or null if member doesn't exist
   */
  async zScore(key: string, member: string): Promise<number | null> {
    const score = await this.redis.zscore(key, member);
    return score === null ? null : parseFloat(score);
  }

  /**
   * Get a range of members in a sorted set by index
   * @param key - Sorted set key
   * @param start - Start index (0-based)
   * @param stop - End index (-1 for all elements)
   * @param withScores - Whether to include scores in the result
   * @returns Array of members (with scores if withScores is true)
   */
  async zRange(
    key: string,
    start: number,
    stop: number,
    withScores: boolean = false,
  ): Promise<string[] | { member: string; score: number }[]> {
    if (withScores) {
      const result = await this.redis.zrange(key, start, stop, 'WITHSCORES');
      const members: { member: string; score: number }[] = [];
      for (let i = 0; i < result.length; i += 2) {
        members.push({
          member: result[i],
          score: parseFloat(result[i + 1]),
        });
      }
      return members;
    }
    return await this.redis.zrange(key, start, stop);
  }

  // ------ KEY OPERATIONS ------

  /**
   * Find all keys matching the given pattern
   * @param pattern - Pattern to match keys against
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  /**
   * Get the time to live for a key in seconds
   * @param key - Key to check
   * @returns TTL in seconds, -2 if key doesn't exist, -1 if key exists but has no TTL
   */
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }

  /**
   * Remove the expiration from a key
   * @param key - Key to persist
   * @returns 1 if the timeout was removed, 0 if key does not exist or has no timeout
   */
  async persist(key: string): Promise<number> {
    return await this.redis.persist(key);
  }

  // ------ PUB/SUB OPERATIONS ------

  /**
   * Publish a message to a channel
   * @param channel - Channel to publish to
   * @param message - Message to publish
   * @returns Number of clients that received the message
   */
  async publish(channel: string, message: string): Promise<number> {
    return await this.redis.publish(channel, message);
  }

  /**
   * Subscribe to one or more channels
   * @param channels - Channels to subscribe to
   * @returns Number of channels subscribed to
   */
  async subscribe(...channels: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.subscribe(...channels, (err, count: number) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  }

  /**
   * Unsubscribe from one or more channels
   * @param channels - Channels to unsubscribe from
   * @returns Number of channels unsubscribed from
   */
  async unsubscribe(...channels: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redis.unsubscribe(...channels, (err, count: number) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  }
}
