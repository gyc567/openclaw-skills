const VIRUSTOTAL_API_BASE = "https://www.virustotal.com/api/v3";
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

export interface VirusTotalReport {
  scanId: string;
  status: "clean" | "malicious" | "suspicious" | "timeout";
  stats: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
  };
  engines: Array<{
    name: string;
    category: "malicious" | "suspicious" | "undetected" | "harmless";
    result: string | null;
  }>;
  permalink: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  if (!VIRUSTOTAL_API_KEY) {
    throw new Error("VIRUSTOTAL_API_KEY not configured");
  }

  return fetch(url, {
    ...options,
    headers: {
      "x-apikey": VIRUSTOTAL_API_KEY,
      ...options.headers,
    },
  });
}

export async function uploadFileForScan(fileUrl: string): Promise<string> {
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download file: ${fileResponse.status}`);
  }

  const blob = await fileResponse.blob();
  const formData = new FormData();
  formData.append("file", blob);

  const response = await fetchWithAuth(`${VIRUSTOTAL_API_BASE}/files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`VirusTotal upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data.id;
}

function mapCategory(category: string): VirusTotalReport["engines"][0]["category"] {
  switch (category) {
    case "malicious":
      return "malicious";
    case "suspicious":
      return "suspicious";
    case "undetected":
      return "undetected";
    case "harmless":
      return "harmless";
    default:
      return "undetected";
  }
}

function determineStatus(stats: VirusTotalReport["stats"]): VirusTotalReport["status"] {
  if (stats.malicious > 0) return "malicious";
  if (stats.suspicious > 0) return "suspicious";
  return "clean";
}

export async function getScanReport(scanId: string): Promise<VirusTotalReport> {
  const response = await fetchWithAuth(`${VIRUSTOTAL_API_BASE}/analyses/${scanId}`);

  if (!response.ok) {
    throw new Error(`Failed to get scan report: ${response.status}`);
  }

  const data = await response.json();
  const attributes = data.data.attributes;

  const stats = {
    malicious: attributes.stats.malicious || 0,
    suspicious: attributes.stats.suspicious || 0,
    undetected: attributes.stats.undetected || 0,
    harmless: attributes.stats.harmless || 0,
  };

  const engines = Object.entries(attributes.results || {}).map(([name, result]: [string, unknown]) => {
    const r = result as { category: string; result: string | null };
    return {
      name,
      category: mapCategory(r.category),
      result: r.result,
    };
  });

  return {
    scanId,
    status: determineStatus(stats),
    stats,
    engines,
    permalink: `https://www.virustotal.com/gui/file-analysis/${scanId}`,
  };
}

export async function scanFile(fileUrl: string): Promise<VirusTotalReport> {
  const scanId = await uploadFileForScan(fileUrl);

  const maxAttempts = 30;
  const delayMs = 10000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    try {
      const response = await fetchWithAuth(`${VIRUSTOTAL_API_BASE}/analyses/${scanId}`);
      const data = await response.json();

      if (data.data.attributes.status === "completed") {
        return getScanReport(scanId);
      }
    } catch {
      // Continue polling
    }
  }

  return {
    scanId,
    status: "timeout",
    stats: { malicious: 0, suspicious: 0, undetected: 0, harmless: 0 },
    engines: [],
    permalink: `https://www.virustotal.com/gui/file-analysis/${scanId}`,
  };
}
