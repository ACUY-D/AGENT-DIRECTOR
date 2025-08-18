/**
 * Architect Agent - Diseñador de sistemas y arquitectura técnica
 */

import { createLogger } from '../../utils/logger';
import type { AgentMessage, AgentResult, AgentConfig, ProjectContext } from '../../types';

const logger = createLogger('architect-agent');

export class ArchitectAgent {
  public readonly id = 'architect';
  public readonly name = 'Architect Agent';
  public readonly capabilities = [
    'architecture-design',
    'adr-creation', 
    'risk-assessment',
    'resource-estimation'
  ];

  public readonly config: AgentConfig = {
    maxRetries: 3,
    timeout: 30000,
  };

  async execute(message: AgentMessage): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Executing architect task: ${message.content.task}`);
      
      if (!message.content.task || !message.content.context) {
        throw new Error('Invalid message format: task and context are required');
      }

      const context = message.content.context as ProjectContext;
      
      // Análisis de requisitos
      const requirementAnalysis = await this.analyzeRequirements(context);
      
      // Generación de arquitectura
      const architecture = await this.generateArchitecture(context);
      
      // Creación de ADRs
      const adrs = await this.createADRs(context);
      
      // Evaluación de riesgos
      const riskAssessment = await this.assessRisks(context);
      
      // Estimación de recursos
      const estimatedResources = await this.estimateResources(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        agentId: this.id,
        data: {
          overview: `Arquitectura diseñada para: ${context.objective}`,
          components: architecture.components || [],
          adrs: adrs,
          riskAssessment: riskAssessment,
          estimatedResources: estimatedResources,
          requirementAnalysis: requirementAnalysis
        },
        metadata: {
          duration: duration
        }
      };
      
    } catch (error) {
      logger.error('Error executing architect task:', error);
      
      return {
        success: false,
        agentId: this.id,
        data: {},
        error: (error as Error).message,
        metadata: {
          duration: Date.now() - startTime
        }
      };
    }
  }

  async executeWithRetry(message: AgentMessage): Promise<AgentResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.execute(message);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    return {
      success: false,
      agentId: this.id,
      data: {},
      error: lastError?.message || 'All retry attempts failed',
      metadata: {
        duration: 0
      }
    };
  }

  async analyzeRequirements(context: ProjectContext) {
    return {
      functional: context.requirements?.filter(req => 
        !req.toLowerCase().includes('performance') &&
        !req.toLowerCase().includes('security') &&
        !req.toLowerCase().includes('scalability')
      ) || [],
      nonFunctional: [
        'Performance optimization',
        'Security compliance', 
        'Scalability requirements',
        'Reliability standards',
        'Maintainability guidelines'
      ],
      patterns: ['REST', 'MVC', 'Layered Architecture']
    };
  }

  async generateArchitecture(context: ProjectContext) {
    return {
      components: [
        {
          name: 'API Layer',
          type: 'service',
          responsibilities: ['Request handling', 'Response formatting', 'Authentication']
        },
        {
          name: 'Business Logic',
          type: 'service', 
          responsibilities: ['Core business rules', 'Data validation', 'Process orchestration']
        },
        {
          name: 'Data Layer',
          type: 'repository',
          responsibilities: ['Data persistence', 'Query optimization', 'Transaction management']
        }
      ],
      diagram: '```mermaid\ngraph TD\n  A[Client] --> B[API Layer]\n  B --> C[Business Logic]\n  C --> D[Data Layer]\n```',
      interfaces: [
        {
          from: 'API Layer',
          to: 'Business Logic',
          protocol: 'HTTP/REST',
          description: 'RESTful API calls'
        }
      ],
      techStack: {
        backend: ['Node.js', 'TypeScript'],
        frontend: ['React', 'TypeScript'],
        database: ['PostgreSQL'],
        infrastructure: ['Docker', 'AWS']
      }
    };
  }

  async createADRs(context: ProjectContext) {
    return [
      {
        id: 'ADR-001',
        title: 'Authentication Strategy',
        status: 'accepted',
        context: 'Need secure authentication for API access',
        decision: 'Implement JWT-based authentication with refresh tokens',
        consequences: 'Stateless authentication, better scalability'
      },
      {
        id: 'ADR-002', 
        title: 'Database Technology',
        status: 'accepted',
        context: 'Need reliable data persistence',
        decision: 'Use PostgreSQL for primary data storage',
        consequences: 'ACID compliance, mature ecosystem'
      },
      {
        id: 'ADR-003',
        title: 'API Design',
        status: 'accepted', 
        context: 'Need consistent API interface',
        decision: 'Follow RESTful design principles',
        consequences: 'Standardized endpoints, better integration'
      }
    ];
  }

  async assessRisks(context: ProjectContext) {
    return {
      risks: [
        {
          id: 'RISK-001',
          description: 'Database performance bottlenecks',
          likelihood: 'medium',
          impact: 'high',
          category: 'technical',
          mitigation: 'Implement database indexing and query optimization'
        },
        {
          id: 'RISK-002',
          description: 'Authentication security vulnerabilities',
          likelihood: 'low',
          impact: 'high',
          category: 'security', 
          mitigation: 'Regular security audits and penetration testing'
        }
      ],
      overallRisk: 'medium',
      matrix: {
        high: [],
        medium: ['RISK-001'],
        low: ['RISK-002']
      }
    };
  }

  async estimateResources(context: ProjectContext) {
    return {
      development: 'Medium complexity project',
      team: 'Cross-functional development team',
      infrastructure: 'Cloud-based scalable infrastructure',
      timeline: {
        minimum: '8 weeks',
        expected: '12 weeks', 
        maximum: '16 weeks'
      },
      team: {
        roles: [
          {
            title: 'Backend Developer',
            count: 2,
            level: 'senior'
          },
          {
            title: 'Frontend Developer', 
            count: 1,
            level: 'mid'
          },
          {
            title: 'DevOps Engineer',
            count: 1,
            level: 'senior'
          }
        ]
      },
      infrastructure: {
        cost: {
          monthly: 500,
          yearly: 6000,
          currency: 'USD'
        }
      }
    };
  }
}