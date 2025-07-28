# Agent Implementation Guide

## Quick Start: Creating Your First Agent

This guide provides step-by-step instructions for implementing agents in the multi-agent framework.

## 1. Base Agent Template

```typescript
// base-agent.ts
import { BaseAgent, AgentMessage, AgentResponse, AgentCapabilities } from './interfaces';

export abstract class AbstractAgent implements BaseAgent {
  id: string;
  role: string;
  state: 'active' | 'idle' | 'blocked' | 'overloaded' = 'idle';
  
  constructor(id: string, role: string) {
    this.id = id;
    this.role = role;
  }
  
  async initialize(): Promise<void> {
    // Common initialization
    this.state = 'idle';
    await this.specificInitialization();
  }
  
  abstract specificInitialization(): Promise<void>;
  abstract processMessage(message: AgentMessage): Promise<AgentResponse>;
  abstract getCapabilities(): AgentCapabilities;
  
  getStatus() {
    return {
      id: this.id,
      role: this.role,
      state: this.state,
      timestamp: new Date()
    };
  }
  
  async shutdown(): Promise<void> {
    this.state = 'idle';
    // Cleanup resources
  }
}
```

## 2. Developer Agent Implementation Example

```typescript
// developer-agent.ts
import { AbstractAgent } from './base-agent';
import { CodeGenerator } from './code-generator';
import { GitManager } from './git-manager';

export class DeveloperAgent extends AbstractAgent {
  private codeGenerator: CodeGenerator;
  private gitManager: GitManager;
  
  constructor() {
    super('developer-001', 'Developer');
  }
  
  async specificInitialization(): Promise<void> {
    this.codeGenerator = new CodeGenerator();
    this.gitManager = new GitManager();
    await this.codeGenerator.loadTemplates();
  }
  
  async processMessage(message: AgentMessage): Promise<AgentResponse> {
    this.state = 'active';
    
    try {
      switch (message.type) {
        case 'IMPLEMENT_FEATURE':
          return await this.implementFeature(message.payload);
        case 'FIX_BUG':
          return await this.fixBug(message.payload);
        case 'REFACTOR_CODE':
          return await this.refactorCode(message.payload);
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
    } finally {
      this.state = 'idle';
    }
  }
  
  private async implementFeature(spec: FeatureSpecification): Promise<AgentResponse> {
    // 1. Analyze specification
    const analysis = await this.analyzeSpecification(spec);
    
    // 2. Generate code structure
    const structure = await this.codeGenerator.generateStructure(analysis);
    
    // 3. Write implementation
    const code = await this.codeGenerator.generateCode(structure);
    
    // 4. Add tests
    const tests = await this.codeGenerator.generateTests(code);
    
    // 5. Commit to git
    const commitResult = await this.gitManager.commitChanges({
      files: [...code.files, ...tests.files],
      message: `feat: ${spec.name}`,
      branch: `feature/${spec.id}`
    });
    
    return {
      success: true,
      data: {
        generatedFiles: code.files.length + tests.files.length,
        commitHash: commitResult.hash,
        coverage: tests.coverage
      }
    };
  }
  
  getCapabilities(): AgentCapabilities {
    return {
      languages: ['TypeScript', 'JavaScript', 'Python', 'Go'],
      frameworks: ['React', 'Node.js', 'FastAPI', 'Gin'],
      tasks: ['implement', 'refactor', 'debug', 'test'],
      integrations: ['git', 'github', 'vscode']
    };
  }
}
```

## 3. Code Generation Engine

```typescript
// code-generator.ts
export class CodeGenerator {
  private templates: Map<string, CodeTemplate>;
  private astParser: ASTParser;
  
  async generateCode(structure: CodeStructure): Promise<GeneratedCode> {
    const files: CodeFile[] = [];
    
    for (const component of structure.components) {
      const template = this.selectTemplate(component);
      const ast = await this.generateAST(component, template);
      const code = await this.astToCode(ast);
      
      files.push({
        path: component.path,
        content: code,
        language: component.language
      });
    }
    
    return { files };
  }
  
  private async generateAST(component: Component, template: CodeTemplate): Promise<AST> {
    // Build Abstract Syntax Tree
    const ast = new AST();
    
    // Add imports
    for (const imp of component.imports) {
      ast.addImport(imp);
    }
    
    // Add class/function definitions
    if (component.type === 'class') {
      ast.addClass({
        name: component.name,
        extends: component.extends,
        implements: component.implements,
        properties: component.properties,
        methods: component.methods.map(m => this.generateMethod(m))
      });
    }
    
    return ast;
  }
  
  private generateMethod(method: MethodSpec): ASTMethod {
    return {
      name: method.name,
      params: method.params,
      returnType: method.returnType,
      body: this.generateMethodBody(method),
      decorators: method.decorators
    };
  }
}
```

## 4. Agent Communication Protocol

```typescript
// communication-protocol.ts
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  conversationId: string;
  replyTo?: string;
}

export class MessageBus {
  private queues: Map<string, PriorityQueue<AgentMessage>>;
  private agents: Map<string, BaseAgent>;
  
  async sendMessage(message: AgentMessage): Promise<void> {
    const queue = this.queues.get(message.to);
    if (!queue) {
      throw new Error(`Unknown recipient: ${message.to}`);
    }
    
    queue.enqueue(message, message.priority);
    await this.notifyAgent(message.to);
  }
  
  async routeMessage(message: AgentMessage): Promise<AgentResponse> {
    const agent = this.agents.get(message.to);
    if (!agent) {
      throw new Error(`Agent not found: ${message.to}`);
    }
    
    // Check agent state
    if (agent.state === 'overloaded') {
      return {
        success: false,
        error: 'Agent overloaded, try again later'
      };
    }
    
    // Process message
    return await agent.processMessage(message);
  }
}
```

## 5. Testing Your Agent

```typescript
// developer-agent.test.ts
describe('DeveloperAgent', () => {
  let agent: DeveloperAgent;
  let messageBus: MessageBus;
  
  beforeEach(async () => {
    agent = new DeveloperAgent();
    await agent.initialize();
    messageBus = new MessageBus();
    messageBus.registerAgent(agent);
  });
  
  test('should implement feature from specification', async () => {
    const message: AgentMessage = {
      id: 'msg-001',
      from: 'project-manager',
      to: 'developer-001',
      type: 'IMPLEMENT_FEATURE',
      payload: {
        name: 'User Authentication',
        requirements: ['login', 'logout', 'password reset'],
        technology: 'JWT'
      },
      priority: 'high',
      timestamp: new Date(),
      conversationId: 'conv-001'
    };
    
    const response = await messageBus.routeMessage(message);
    
    expect(response.success).toBe(true);
    expect(response.data.generatedFiles).toBeGreaterThan(0);
    expect(response.data.coverage).toBeGreaterThan(80);
  });
});
```

## 6. Deployment Configuration

```yaml
# agent-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: developer-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: developer-agent
  template:
    metadata:
      labels:
        app: developer-agent
    spec:
      containers:
      - name: agent
        image: agents/developer:latest
        env:
        - name: AGENT_ID
          value: "developer-001"
        - name: MESSAGE_BUS_URL
          value: "amqp://rabbitmq:5672"
        - name: KNOWLEDGE_BASE_URL
          value: "http://knowledge-manager:8080"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

## 7. Monitoring and Metrics

```typescript
// agent-metrics.ts
export class AgentMetrics {
  private prometheus = new PrometheusClient();
  
  constructor(agentId: string) {
    this.setupMetrics(agentId);
  }
  
  private setupMetrics(agentId: string) {
    // Message processing time
    this.messageProcessingTime = new Histogram({
      name: 'agent_message_processing_seconds',
      help: 'Time to process messages',
      labels: ['agent_id', 'message_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });
    
    // Active messages
    this.activeMessages = new Gauge({
      name: 'agent_active_messages',
      help: 'Number of messages being processed',
      labels: ['agent_id']
    });
    
    // Error rate
    this.errorRate = new Counter({
      name: 'agent_errors_total',
      help: 'Total number of errors',
      labels: ['agent_id', 'error_type']
    });
  }
  
  recordMessageProcessing(messageType: string, duration: number) {
    this.messageProcessingTime
      .labels(this.agentId, messageType)
      .observe(duration);
  }
}
```

## 8. Integration with Existing Systems

```typescript
// legacy-integration.ts
export class LegacySystemAdapter {
  async adaptGoogleAppsScript(gasCode: string): Promise<ModernCode> {
    // Parse GAS code
    const parsed = await this.parseGAS(gasCode);
    
    // Convert to modern structure
    const modernStructure = {
      imports: this.extractImports(parsed),
      components: this.convertToComponents(parsed),
      tests: this.generateTestsFromGAS(parsed)
    };
    
    // Generate modern code
    return await this.codeGenerator.generateCode(modernStructure);
  }
  
  private convertToComponents(gasCode: ParsedGAS): Component[] {
    return gasCode.functions.map(func => ({
      type: 'function',
      name: func.name,
      params: this.inferParameters(func),
      returnType: this.inferReturnType(func),
      body: this.modernizeBody(func.body)
    }));
  }
}
```

## Next Steps

1. **Choose Your First Agent**: Start with a Support Layer agent (easier) or dive into a Developer agent
2. **Set Up Development Environment**: Install Node.js, TypeScript, and testing frameworks
3. **Implement Base Functionality**: Follow the template to create your agent
4. **Add Specialized Capabilities**: Implement domain-specific features
5. **Test Thoroughly**: Unit tests, integration tests, and system tests
6. **Deploy and Monitor**: Use containers and monitoring tools
7. **Iterate and Improve**: Gather metrics and optimize performance

## Common Pitfalls to Avoid

1. **Don't Skip State Management**: Always update agent state correctly
2. **Handle Errors Gracefully**: Never let an agent crash the system
3. **Respect Message Priorities**: Process critical messages first
4. **Monitor Resource Usage**: Prevent memory leaks and CPU spikes
5. **Test Edge Cases**: What happens when the agent is overloaded?
6. **Document Your Agent**: Others need to understand how to use it
7. **Version Your Messages**: Plan for backward compatibility