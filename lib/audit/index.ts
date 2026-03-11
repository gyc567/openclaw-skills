// Audit Service Core Library
// KISS: Pure functions, clear separation of concerns

import { query } from "@/lib/db/client";
import { createPaymentRequirement, encodePaymentRequirement } from "@/lib/x402";

const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || "0x0bf07321af1bf1f77b3e96c63628192640a38206";
const AUDIT_PRICE_USD = 10;

export interface AuditRequest {
  id: number;
  email: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "paid" | "processing" | "completed" | "failed";
  amountUsd: number;
  transactionId?: number;
  paymentRequirement?: string;
  virustotalScanId?: string;
  reportData?: Record<string, unknown>;
  createdAt: Date;
  paidAt?: Date;
  completedAt?: Date;
}

export interface CreateAuditRequestInput {
  email: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

/**
 * Create a new audit request
 * Returns the request with x402 payment requirement
 */
export async function createAuditRequest(
  input: CreateAuditRequestInput
): Promise<AuditRequest> {
  // Create payment requirement for $10
  const paymentReq = createPaymentRequirement({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/audit/verify`,
    amountUsd: AUDIT_PRICE_USD,
    recipient: PLATFORM_WALLET,
    description: `Skill Audit - ${input.fileName}`,
    chain: "sepolia", // Use testnet for now
  });

  const encodedReq = encodePaymentRequirement(paymentReq);

  // Insert into database
  const result = await query<{
    id: number;
    email: string;
    file_url: string;
    file_name: string;
    file_size: number;
    status: string;
    amount_usd: number;
    payment_requirement: string;
    created_at: Date;
  }>(
    `INSERT INTO audit_requests (
      email, file_url, file_name, file_size, 
      status, amount_usd, payment_requirement
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      input.email,
      input.fileUrl,
      input.fileName,
      input.fileSize,
      "pending",
      AUDIT_PRICE_USD,
      encodedReq,
    ]
  );

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileSize: row.file_size,
    status: row.status as AuditRequest["status"],
    amountUsd: row.amount_usd,
    paymentRequirement: row.payment_requirement,
    createdAt: row.created_at,
  };
}

/**
 * Get audit request by ID
 */
export async function getAuditRequest(id: number): Promise<AuditRequest | null> {
  const result = await query<{
    id: number;
    email: string;
    file_url: string;
    file_name: string;
    file_size: number;
    status: string;
    amount_usd: number;
    transaction_id: number | null;
    payment_requirement: string;
    virustotal_scan_id: string | null;
    report_data: Record<string, unknown> | null;
    created_at: Date;
    paid_at: Date | null;
    completed_at: Date | null;
  }>("SELECT * FROM audit_requests WHERE id = $1", [id]);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    email: row.email,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileSize: row.file_size,
    status: row.status as AuditRequest["status"],
    amountUsd: row.amount_usd,
    transactionId: row.transaction_id ?? undefined,
    paymentRequirement: row.payment_requirement,
    virustotalScanId: row.virustotal_scan_id ?? undefined,
    reportData: row.report_data ?? undefined,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}

/**
 * Update audit request status after payment
 */
export async function markAuditRequestPaid(
  id: number,
  transactionId: number
): Promise<void> {
  await query(
    `UPDATE audit_requests 
     SET status = 'paid', 
         transaction_id = $1, 
         paid_at = NOW() 
     WHERE id = $2`,
    [transactionId, id]
  );
}

/**
 * Mark audit as processing (VirusTotal scan started)
 */
export async function markAuditRequestProcessing(
  id: number,
  virustotalScanId: string
): Promise<void> {
  await query(
    `UPDATE audit_requests 
     SET status = 'processing', 
         virustotal_scan_id = $1 
     WHERE id = $2`,
    [virustotalScanId, id]
  );
}

/**
 * Mark audit as completed with report data
 */
export async function markAuditRequestCompleted(
  id: number,
  reportData: Record<string, unknown>
): Promise<void> {
  await query(
    `UPDATE audit_requests 
     SET status = 'completed', 
         report_data = $1, 
         completed_at = NOW() 
     WHERE id = $2`,
    [JSON.stringify(reportData), id]
  );
}

/**
 * Mark audit as failed
 */
export async function markAuditRequestFailed(id: number): Promise<void> {
  await query(
    `UPDATE audit_requests 
     SET status = 'failed' 
     WHERE id = $2`,
    [id]
  );
}
