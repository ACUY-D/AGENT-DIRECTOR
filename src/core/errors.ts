/**
 * Core error classes for MCP Role Director
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class OrchestratorError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class AgentError extends Error {
  constructor(message: string, public agentId?: string) {
    super(message);
    this.name = 'AgentError';
  }
}