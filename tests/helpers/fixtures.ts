/**
 * Test fixtures and mock factories
 */

import type { AgentMessage, AgentResult } from '../../src/types';

export const fixtures = {
  validObjective: 'Build a RESTful API for task management with authentication and real-time notifications',
  simpleObjective: 'Create a simple todo app',
  complexObjective: 'Develop a microservices-based e-commerce platform with event sourcing'
};

export function createMockAgentMessage(overrides: Partial<AgentMessage> = {}): AgentMessage {
  return {
    id: 'msg-' + Math.random().toString(36).substr(2, 9),
    to: 'architect',
    from: 'user',
    type: 'task',
    content: {
      task: 'Default task',
      context: {
        objective: fixtures.validObjective
      }
    },
    timestamp: new Date(),
    ...overrides
  };
}

export function createMockAgentResult(overrides: Partial<AgentResult> = {}): AgentResult {
  return {
    success: true,
    agentId: 'test-agent',
    data: {
      result: 'Mock result data'
    },
    metadata: {
      duration: 1000
    },
    ...overrides
  };
}

export function createMockProjectContext(overrides: Record<string, unknown> = {}) {
  return {
    objective: fixtures.validObjective,
    requirements: [
      'RESTful API',
      'User authentication',
      'Database integration',
      'Real-time notifications'
    ],
    technologies: ['Node.js', 'TypeScript', 'PostgreSQL', 'React'],
    constraints: ['Must be cloud-ready', 'High security standards'],
    ...overrides
  };
}