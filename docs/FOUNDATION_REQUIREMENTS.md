# Foundation Requirements

**Living Document - Last Updated: July 27, 2025**  
**Purpose: Define extensible foundation requirements for Google Workspace Automation**

## Core Principles

1. **Extensibility First**: Every component must be designed for extension
2. **Don't Repeat Yourself**: Shared code for common functionality
3. **Fail Gracefully**: Robust error handling and recovery
4. **Test Everything**: Automated testing for confidence
5. **Document Patterns**: Clear examples and guidelines

## Foundation Components

### 1. Shared Library System

#### Requirements
- [ ] Central library accessible by all scripts
- [ ] Version management for library updates
- [ ] Backward compatibility guarantees
- [ ] Auto-loading mechanism

#### Implementation
```javascript
// @google-apps-script/core
class GWSCore {
  static VERSION = '1.0.0';
  
  // Utilities
  utils = {
    date: DateUtils,
    string: StringUtils,
    array: ArrayUtils,
    object: ObjectUtils
  };
  
  // Services
  services = {
    gmail: GmailService,
    drive: DriveService,
    sheets: SheetsService
  };
  
  // Infrastructure
  infra = {
    config: ConfigManager,
    logger: Logger,
    error: ErrorHandler,
    cache: CacheManager
  };
}

// Usage in any script
const { utils, services, infra } = GWSCore;
```

### 2. Configuration Management

#### Requirements
- [ ] Environment-based configuration
- [ ] Secure secrets management
- [ ] Runtime configuration updates
- [ ] Configuration validation
- [ ] Feature flags support

#### Implementation
```javascript
class ConfigManager {
  // Load configuration based on environment
  static load(options = {}) {
    const env = options.env || this.detectEnvironment();
    const config = this.loadBase();
    const envConfig = this.loadEnvironment(env);
    const secrets = this.loadSecrets(env);
    
    return this.merge(config, envConfig, secrets);
  }
  
  // Feature flags
  static isEnabled(feature) {
    return this.features[feature] || false;
  }
  
  // Dynamic updates
  static update(key, value) {
    this.validateUpdate(key, value);
    this.cache.set(key, value);
    this.notifyListeners(key, value);
  }
}
```

### 3. Error Handling Framework

#### Requirements
- [ ] Consistent error types and codes
- [ ] Automatic retry with backoff
- [ ] Circuit breaker pattern
- [ ] Error aggregation and reporting
- [ ] User-friendly error messages

#### Implementation
```javascript
class ErrorHandler {
  static wrap(fn) {
    return new ErrorWrapper(fn);
  }
}

class ErrorWrapper {
  constructor(fn) {
    this.fn = fn;
    this.retries = 0;
    this.fallback = null;
  }
  
  withRetry(count, backoff = 'exponential') {
    this.retries = count;
    this.backoff = backoff;
    return this;
  }
  
  withFallback(fn) {
    this.fallback = fn;
    return this;
  }
  
  async execute() {
    let lastError;
    
    for (let i = 0; i <= this.retries; i++) {
      try {
        return await this.fn();
      } catch (error) {
        lastError = error;
        ErrorReporter.log(error);
        
        if (i < this.retries) {
          await this.waitBackoff(i);
        }
      }
    }
    
    if (this.fallback) {
      return this.fallback(lastError);
    }
    
    throw new EnhancedError(lastError);
  }
}
```

### 4. Service Abstraction Layer

#### Requirements
- [ ] Consistent interface across services
- [ ] Mock implementations for testing
- [ ] Rate limiting and quota management
- [ ] Request/response interceptors
- [ ] Batch operation support

#### Implementation
```javascript
abstract class BaseService {
  constructor(client, options = {}) {
    this.client = client;
    this.rateLimiter = new RateLimiter(options.limits);
    this.cache = new ServiceCache(options.cache);
    this.interceptors = [];
  }
  
  async request(method, params) {
    // Pre-request interceptors
    params = await this.runInterceptors('request', params);
    
    // Check cache
    const cached = await this.cache.get(method, params);
    if (cached) return cached;
    
    // Rate limiting
    await this.rateLimiter.acquire();
    
    try {
      // Make request
      const response = await this.client[method](params);
      
      // Post-response interceptors
      const final = await this.runInterceptors('response', response);
      
      // Cache result
      await this.cache.set(method, params, final);
      
      return final;
    } catch (error) {
      throw this.enhanceError(error);
    }
  }
}

class GmailService extends BaseService {
  async getLabels(options = {}) {
    return this.request('labels.list', options);
  }
  
  async batchGetMessages(ids) {
    return this.batchRequest('messages.get', ids);
  }
}
```

### 5. Data Models & Validation

#### Requirements
- [ ] Type-safe data models
- [ ] Runtime validation
- [ ] Serialization/deserialization
- [ ] Schema evolution support
- [ ] Data transformation pipelines

#### Implementation
```javascript
class Model {
  static schema = {};
  
  constructor(data) {
    this.validate(data);
    Object.assign(this, data);
  }
  
  validate(data) {
    const errors = Validator.validate(data, this.constructor.schema);
    if (errors.length) {
      throw new ValidationError(errors);
    }
  }
  
  toJSON() {
    return Serializer.serialize(this, this.constructor.schema);
  }
  
  static fromJSON(json) {
    const data = Serializer.deserialize(json, this.schema);
    return new this(data);
  }
}

class Label extends Model {
  static schema = {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    type: { type: 'enum', values: ['system', 'user'] },
    messageCount: { type: 'number', min: 0 }
  };
}
```

### 6. Testing Framework

#### Requirements
- [ ] Unit test support for GAS
- [ ] Mock implementations for Google services
- [ ] Integration test runner
- [ ] Coverage reporting
- [ ] Performance benchmarking

#### Implementation
```javascript
// Test framework
class GASTest {
  static describe(name, fn) {
    const suite = new TestSuite(name);
    fn(suite);
    return suite;
  }
}

// Mock framework
class MockBuilder {
  static mock(service) {
    return new Proxy({}, {
      get: (target, prop) => {
        return jest.fn();
      }
    });
  }
}

// Usage
GASTest.describe('LabelExporter', (suite) => {
  suite.beforeEach(() => {
    this.gmail = MockBuilder.mock(GmailApp);
    this.sheets = MockBuilder.mock(SpreadsheetApp);
  });
  
  suite.test('exports all labels', async () => {
    this.gmail.getUserLabels.mockReturnValue([
      { getName: () => 'Label1' },
      { getName: () => 'Label2' }
    ]);
    
    const exporter = new LabelExporter(this.gmail, this.sheets);
    const result = await exporter.export();
    
    expect(result.count).toBe(2);
    expect(this.sheets.getActiveSheet).toHaveBeenCalled();
  });
});
```

### 7. Plugin Architecture

#### Requirements
- [ ] Dynamic plugin loading
- [ ] Plugin lifecycle management
- [ ] Dependency resolution
- [ ] Plugin communication
- [ ] Security sandboxing

#### Implementation
```javascript
class PluginManager {
  static plugins = new Map();
  
  static register(plugin) {
    this.validate(plugin);
    this.plugins.set(plugin.name, plugin);
    this.notifyListeners('registered', plugin);
  }
  
  static async execute(type, data) {
    const plugins = this.getPluginsByType(type);
    const results = [];
    
    for (const plugin of plugins) {
      if (await plugin.canHandle(data)) {
        const result = await plugin.execute(data);
        results.push({ plugin: plugin.name, result });
      }
    }
    
    return results;
  }
}

// Plugin definition
class ExportPlugin {
  static metadata = {
    name: 'AdvancedExporter',
    version: '1.0.0',
    type: 'exporter',
    dependencies: ['core@^1.0.0']
  };
  
  async canHandle(data) {
    return data.format === 'advanced';
  }
  
  async execute(data) {
    // Plugin logic
  }
}
```

### 8. Build & Deployment Pipeline

#### Requirements
- [ ] TypeScript support
- [ ] Code bundling and optimization
- [ ] Environment-specific builds
- [ ] Automated versioning
- [ ] Rollback capability

#### Implementation
```yaml
# build.config.yaml
pipeline:
  stages:
    - compile:
        typescript: true
        target: 'es2020'
    
    - bundle:
        optimizer: 'webpack'
        splitChunks: true
        treeshake: true
    
    - test:
        runner: 'jest'
        coverage: 80
        
    - deploy:
        environments:
          - dev
          - staging
          - production
        strategy: 'blue-green'
        rollback: automatic
```

## Implementation Priorities

### Phase 1: Core Infrastructure (Immediate)
1. Shared library structure
2. Basic error handling
3. Configuration management
4. Logging framework

### Phase 2: Service Layer (Next Month)
1. Service abstraction
2. Data models
3. Validation framework
4. Caching strategy

### Phase 3: Developer Experience (Month 2)
1. Testing framework
2. Build pipeline
3. Documentation generator
4. CLI tools

### Phase 4: Advanced Features (Month 3+)
1. Plugin system
2. Event architecture
3. Monitoring/metrics
4. Performance optimization

## Migration Strategy

### Step 1: Create Core Library
```bash
# Create library project
clasp create --type library --title "GWS Core"
```

### Step 2: Implement Utilities
- Date/time helpers
- String manipulation
- Array operations
- Object utilities

### Step 3: Add to Existing Scripts
```javascript
// Before
function formatDate(date) {
  // Custom implementation
}

// After
const { formatDate } = GWSCore.utils.date;
```

### Step 4: Gradual Migration
- Start with high-use scripts
- Add tests during migration
- Update documentation
- Monitor performance

## Success Criteria

### Technical
- [ ] 90% code reuse through libraries
- [ ] 80% test coverage on core
- [ ] 50% reduction in code duplication
- [ ] 100% error handling coverage

### Operational
- [ ] 5-minute deployments
- [ ] Zero-downtime updates
- [ ] Automated rollbacks
- [ ] Real-time monitoring

### Development
- [ ] New script in <30 minutes
- [ ] Feature development 2x faster
- [ ] Bug fixes affect one place
- [ ] Onboarding time <1 day

## Open Questions

1. **Google Apps Script Limitations**
   - How to work around no module system?
   - Best approach for code sharing?
   - Testing strategy within GAS?

2. **Architecture Decisions**
   - Monorepo vs multiple repos?
   - Library versioning strategy?
   - Breaking change management?

3. **Performance Considerations**
   - Impact of library loading?
   - Caching strategies?
   - Execution time limits?

## Next Actions

1. [ ] Create proof-of-concept library
2. [ ] Test library sharing mechanism
3. [ ] Design error handling patterns
4. [ ] Build configuration prototype
5. [ ] Create migration plan

---

**This is a living document. Update as requirements evolve.**

## Change Log

### July 27, 2025
- Initial foundation requirements
- Identified 8 core components
- Created implementation priorities
- Added success criteria