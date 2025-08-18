/**
 * Core types for MCP Role Director
 */

export interface AgentMessage {
  id: string;
  to: string;
  from: string;
  type: 'task' | 'response' | 'status';
  content: Record<string, unknown>;
  timestamp: Date;
}

export interface AgentResult {
  success: boolean;
  agentId: string;
  data: Record<string, unknown>;
  error?: string;
  metadata?: {
    duration: number;
    tokens?: number;
  };
}

export interface AgentConfig {
  maxRetries: number;
  timeout: number;
}

export interface ProjectContext {
  objective: string;
  requirements?: string[];
  constraints?: string[];
  technologies?: string[];
}