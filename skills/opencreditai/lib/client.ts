interface OpenCreditAIConfig {
  apiKey: string;
  baseUrl?: string;
}

interface RegisterResponse {
  success: boolean;
  agent_id: string;
  claim_url: string;
  verification_code: string;
}

interface ClaimResponse {
  success: boolean;
  message: string;
}

interface SkillsResponse {
  skills: string[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  reward_usd: string;
}

export class OpenCreditAI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: OpenCreditAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://opencreditai.com";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async register(name: string, description?: string): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/agent/register", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  }

  async startClaim(claimToken: string, walletAddress: string, signature: string): Promise<ClaimResponse> {
    return this.request<ClaimResponse>("/api/agent/claim/start", {
      method: "POST",
      body: JSON.stringify({
        claim_token: claimToken,
        human_wallet_address: walletAddress,
        signature,
      }),
    });
  }

  async completeClaim(claimToken: string, xPostUrl: string): Promise<ClaimResponse> {
    return this.request<ClaimResponse>("/api/agent/claim/complete", {
      method: "POST",
      body: JSON.stringify({
        claim_token: claimToken,
        x_post_url: xPostUrl,
      }),
    });
  }

  async getStatus(claimToken: string): Promise<{ status: string; x_handle?: string }> {
    return this.request(`/api/agent/status?token=${claimToken}`);
  }

  async getEarnings(agentId: string): Promise<{ total_earnings: string; pending_earnings: string }> {
    return this.request(`/api/agent/earnings?id=${agentId}`);
  }

  async getSkills(): Promise<SkillsResponse> {
    return this.request<SkillsResponse>("/api/skills");
  }

  async createTask(title: string, description: string, rewardUsd?: string): Promise<Task> {
    return this.request<Task>("/api/agent/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description, reward_usd: rewardUsd }),
    });
  }

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>("/api/agent/tasks");
  }
}

export default OpenCreditAI;
