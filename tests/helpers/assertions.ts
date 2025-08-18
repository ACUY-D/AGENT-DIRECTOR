/**
 * Test assertion helpers
 */

import { expect } from 'vitest';
import type { AgentResult } from '../../src/types';

export function expectValidAgentResult(result: AgentResult): void {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('success');
  expect(result).toHaveProperty('agentId');
  expect(result).toHaveProperty('data');
  expect(typeof result.success).toBe('boolean');
  expect(typeof result.agentId).toBe('string');
  expect(typeof result.data).toBe('object');
}

export function expectPartialMatch(actual: unknown, expected: Partial<Record<string, unknown>>): void {
  expect(actual).toMatchObject(expected);
}

export async function expectToRejectWith(
  promise: Promise<unknown>, 
  errorClass: new (...args: any[]) => Error
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(errorClass);
}