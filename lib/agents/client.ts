import type {
  RegisterAgentRequest,
  RegisterAgentResponse,
  ClaimStartRequest,
  ClaimStartResponse,
  ClaimCompleteRequest,
  ClaimCompleteResponse,
  ClaimStatusResponse,
  EarningsResponse,
  CreateTaskRequest,
  Task,
} from "../types/agents";

const API_BASE = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

class AgentClientError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AgentClientError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new AgentClientError(response.status, error.error || "Request failed");
  }

  return response.json();
}

export async function registerAgent(data: RegisterAgentRequest): Promise<RegisterAgentResponse> {
  return fetchApi<RegisterAgentResponse>("/api/agent", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function startClaim(data: ClaimStartRequest): Promise<ClaimStartResponse> {
  return fetchApi<ClaimStartResponse>("/api/agent/claim/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeClaim(data: ClaimCompleteRequest): Promise<ClaimCompleteResponse> {
  return fetchApi<ClaimCompleteResponse>("/api/agent/claim/complete", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getClaimStatus(claimToken: string): Promise<ClaimStatusResponse> {
  return fetchApi<ClaimStatusResponse>(`/api/agent?claimToken=${claimToken}`);
}

export async function getEarnings(agentId: string): Promise<EarningsResponse> {
  return fetchApi<EarningsResponse>(`/api/agent/earnings?id=${agentId}`);
}

export async function createTask(agentId: string, data: CreateTaskRequest): Promise<Task> {
  return fetchApi<Task>(`/api/agent/${agentId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTasks(agentId: string): Promise<Task[]> {
  return fetchApi<Task[]>(`/api/agent/${agentId}/tasks`);
}

export async function getTask(taskId: string): Promise<Task> {
  return fetchApi<Task>(`/api/agent/tasks/${taskId}`);
}

export function parseXLink(url: string): { username: string; postId: string } | null {
  const patterns = [
    /^https?:\/\/x\.com\/([^/]+)\/status\/(\d+)/,
    /^https?:\/\/twitter\.com\/([^/]+)\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { username: match[1], postId: match[2] };
    }
  }
  return null;
}

export function isValidXLink(url: string): boolean {
  return parseXLink(url) !== null;
}
