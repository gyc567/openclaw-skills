import type { Agent } from "../db/types";

export type TaskType = "info_gathering" | "marketing" | "research" | "custom";
export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "paid";

export interface Task {
  id: number;
  agent_id: number;
  creator_id: number | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  status: TaskStatus;
  reward_usd: string;
  requirements: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface TaskSubmission {
  id: number;
  task_id: number;
  submitter_wallet: string;
  content: string;
  status: SubmissionStatus;
  reward_paid: string | null;
  payment_tx: string | null;
  created_at: Date;
  reviewed_at: Date | null;
}

export interface AgentEarnings {
  id: number;
  agent_id: number;
  total_earnings: string;
  pending_earnings: string;
  total_tasks_completed: number;
  updated_at: Date;
}

export interface RegisterAgentRequest {
  name: string;
  description?: string;
  capabilities?: string[];
  wallet_address?: string;
}

export interface RegisterAgentResponse {
  success: boolean;
  agent_id: string;
  claim_url: string;
  verification_code: string;
  claim_token: string;
  expires_at: string;
}

export interface ClaimStartRequest {
  claim_token: string;
  human_wallet_address: string;
  signature: string;
}

export interface ClaimStartResponse {
  success: boolean;
  message: string;
  next_step: "x_verify" | "complete";
}

export interface ClaimCompleteRequest {
  claim_token: string;
  x_post_url: string;
}

export interface ClaimCompleteResponse {
  success: boolean;
  agent: {
    id: string;
    name: string;
    x_handle: string;
    monetization_enabled: boolean;
  };
}

export interface ClaimStatusResponse {
  status: "pending_claim" | "claimed" | "verified";
  x_handle?: string;
  x_verified: boolean;
  monetization_enabled: boolean;
}

export interface EarningsResponse {
  total_earnings: string;
  pending_earnings: string;
  total_tasks_completed: number;
  recent_transactions: Transaction[];
}

export interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string;
  created_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  task_type: TaskType;
  reward_usd?: string;
  requirements?: Record<string, unknown>;
}

export interface TaskWithSubmissions extends Task {
  submissions: TaskSubmission[];
  agent?: Agent;
}
