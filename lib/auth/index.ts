import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/client";
import type { User, Agent } from "../db/types";

const SALT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("JWT_SECRET environment variable is required in production");
    }
    if (process.env.NODE_ENV !== "production") {
      // 生成一个随机的开发密钥
      const crypto = require('crypto');
      return 'dev_' + crypto.randomBytes(32).toString('hex');
    }
    throw new Error("JWT_SECRET is required");
  }
  return secret;
}

let _jwtSecret: string | null = null;

function jwtSecret(): string {
  if (!_jwtSecret) {
    _jwtSecret = getJwtSecret();
  }
  return _jwtSecret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User, agent: Agent | null): string {
  return jwt.sign(
    { userId: user.id, email: user.email, agentId: agent?.id },
    jwtSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): { userId: number; email: string; agentId: number | null } | null {
  try {
    return jwt.verify(token, jwtSecret()) as { userId: number; email: string; agentId: number | null };
  } catch {
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const rows = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const rows = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, agentId: number | null): Promise<User> {
  const rows = await query<User>(
    `INSERT INTO users (email, password_hash, agent_id) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [email, passwordHash, agentId]
  );
  return rows[0];
}

export async function findAgentById(id: number): Promise<Agent | null> {
  const rows = await query<Agent>("SELECT * FROM agents WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function findAgentByMoltbookId(moltbookId: string): Promise<Agent | null> {
  const rows = await query<Agent>("SELECT * FROM agents WHERE moltbook_id = $1", [moltbookId]);
  return rows[0] || null;
}

export async function createAgent(
  name: string,
  description: string,
  apiKey: string,
  claimUrl: string,
  verificationCode: string,
  moltbookId?: string
): Promise<Agent> {
  const rows = await query<Agent>(
    `INSERT INTO agents (name, description, api_key, claim_url, verification_code, moltbook_id) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [name, description, apiKey, claimUrl, verificationCode, moltbookId || null]
  );
  return rows[0];
}

export async function updateAgentClaim(
  id: number,
  xHandle: string,
  xName: string,
  xAvatar: string,
  xBio: string,
  xFollowerCount: number,
  xFollowingCount: number,
  xVerified: boolean
): Promise<Agent> {
  const rows = await query<Agent>(
    `UPDATE agents 
     SET status = 'claimed', x_handle = $2, x_name = $3, x_avatar = $4, x_bio = $5, 
         x_follower_count = $6, x_following_count = $7, x_verified = $8, updated_at = NOW()
     WHERE id = $1 
     RETURNING *`,
    [id, xHandle, xName, xAvatar, xBio, xFollowerCount, xFollowingCount, xVerified]
  );
  return rows[0];
}

export async function findAgentByVerificationCode(code: string): Promise<Agent | null> {
  const rows = await query<Agent>("SELECT * FROM agents WHERE verification_code = $1", [code]);
  return rows[0] || null;
}
