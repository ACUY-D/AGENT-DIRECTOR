/**
 * Prompts Registry for MCP Role Director
 */

import { ValidationError } from '../core/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('prompts-registry');

export interface PromptDefinition {
  name: string;
  description: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  variables?: Record<string, unknown>;
  suggestedTools?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface BuiltPrompt extends PromptDefinition {
  variables: Record<string, unknown>;
}

class PromptRegistry {
  private prompts = new Map<string, PromptDefinition>();

  register(prompt: PromptDefinition): void {
    logger.info(`Registering prompt: ${prompt.name}`);
    this.prompts.set(prompt.name, prompt);
  }

  list(): PromptDefinition[] {
    return Array.from(this.prompts.values());
  }

  async build(name: string, variables: Record<string, unknown> = {}): Promise<BuiltPrompt> {
    const prompt = this.prompts.get(name);
    
    if (!prompt) {
      throw new ValidationError(`Prompt not found: ${name}`);
    }

    // Validate variables based on prompt requirements
    if (name === '/hand_off' && variables.role) {
      const validRoles = ['architect', 'developer', 'tester', 'debugger', 'devops', 'analyst'];
      if (!validRoles.includes(variables.role as string)) {
        throw new ValidationError(`Invalid role: ${variables.role}`);
      }
    }

    // Process template variables in messages
    const processedMessages = prompt.messages.map(msg => ({
      ...msg,
      content: this.processTemplate(msg.content, variables)
    }));

    return {
      ...prompt,
      messages: processedMessages,
      variables: { ...prompt.variables, ...variables }
    };
  }

  private processTemplate(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }
}

const registry = new PromptRegistry();

export function getPromptRegistry(): PromptRegistry {
  return registry;
}