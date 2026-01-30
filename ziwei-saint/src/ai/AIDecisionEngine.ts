/**
 * AI Decision Engine for Ziwei Saint 1.0
 * Provides intelligent decision making and learning capabilities
 */

interface Decision {
  id: string;
  timestamp: Date;
  input: any;
  decision: string;
  confidence: number; // 0-1 scale
  outcome?: any;
  feedback?: string;
  learned: boolean;
}

interface LearningRecord {
  id: string;
  scenario: string;
  decision: string;
  outcome: any;
  timestamp: Date;
  effectiveness: number; // -1 to 1 scale
}

interface AIDecisionConfig {
  learningEnabled: boolean;
  confidenceThreshold: number; // Minimum confidence to act
  decisionTimeout: number; // milliseconds
  feedbackLearningRate: number; // How quickly to adapt based on feedback
}

export class AIDecisionEngine {
  private decisions: Decision[];
  private learningRecords: LearningRecord[];
  private config: AIDecisionConfig;
  private decisionWeights: Map<string, number>; // For adaptive decision making
  
  constructor(config?: Partial<AIDecisionConfig>) {
    this.decisions = [];
    this.learningRecords = [];
    this.decisionWeights = new Map();
    this.config = {
      learningEnabled: true,
      confidenceThreshold: 0.7,
      decisionTimeout: 5000,
      feedbackLearningRate: 0.1,
      ...config
    };
    
    this.initializeEngine();
  }
  
  private initializeEngine(): void {
    console.log('🧠 Initializing AI Decision Engine...');
    
    // Initialize default decision weights
    this.decisionWeights.set('security_response', 0.9);
    this.decisionWeights.set('resource_allocation', 0.8);
    this.decisionWeights.set('communication_routing', 0.7);
    this.decisionWeights.set('update_approval', 0.95);
    this.decisionWeights.set('task_prioritization', 0.75);
    
    // Load any saved learning records (simulated)
    this.loadLearningHistory();
    
    console.log('✅ AI Decision Engine initialized');
  }
  
  public async makeDecision(input: any): Promise<Decision> {
    console.log(`🤔 Making decision for input: ${JSON.stringify(input)}`);
    
    // Generate a unique ID for this decision
    const decisionId = this.generateId();
    
    // Determine the decision based on input and weights
    const { decision, confidence } = await this.processInput(input);
    
    // Create decision object
    const decisionObj: Decision = {
      id: decisionId,
      timestamp: new Date(),
      input,
      decision,
      confidence,
      learned: false
    };
    
    // Add to decision history
    this.decisions.push(decisionObj);
    
    // Keep only recent decisions (last 1000)
    if (this.decisions.length > 1000) {
      this.decisions = this.decisions.slice(-1000);
    }
    
    console.log(`✅ Decision made: ${decision} (confidence: ${confidence.toFixed(2)})`);
    return decisionObj;
  }
  
  private async processInput(input: any): Promise<{ decision: string, confidence: number }> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Determine decision type based on input
    let decisionType = 'generic';
    if (input.type) {
      decisionType = input.type;
    } else if (typeof input === 'string') {
      if (input.toLowerCase().includes('security') || input.toLowerCase().includes('threat')) {
        decisionType = 'security_response';
      } else if (input.toLowerCase().includes('update') || input.toLowerCase().includes('upgrade')) {
        decisionType = 'update_approval';
      } else if (input.toLowerCase().includes('resource') || input.toLowerCase().includes('memory')) {
        decisionType = 'resource_allocation';
      } else if (input.toLowerCase().includes('communicate') || input.toLowerCase().includes('connect')) {
        decisionType = 'communication_routing';
      } else if (input.toLowerCase().includes('task') || input.toLowerCase().includes('priority')) {
        decisionType = 'task_prioritization';
      }
    }
    
    // Get base weight for this decision type
    let weight = this.decisionWeights.get(decisionType) || 0.5;
    
    // Adjust based on input complexity and importance
    if (input.importance) {
      weight = Math.min(1.0, weight + (input.importance * 0.1));
    }
    
    // Calculate confidence based on weight and other factors
    const baseConfidence = weight;
    const contextFactor = input.context ? 0.1 : 0;
    const urgencyFactor = input.urgent ? 0.1 : 0;
    
    let confidence = Math.min(1.0, baseConfidence + contextFactor + urgencyFactor);
    
    // Add some randomness to make it more realistic
    confidence = confidence - 0.1 + (Math.random() * 0.2); // ±0.1 variance
    confidence = Math.max(0.1, Math.min(1.0, confidence)); // Clamp between 0.1 and 1.0
    
    // Generate decision based on type
    let decision = '';
    switch (decisionType) {
      case 'security_response':
        decision = this.makeSecurityDecision(input);
        break;
      case 'update_approval':
        decision = this.makeUpdateDecision(input);
        break;
      case 'resource_allocation':
        decision = this.makeResourceDecision(input);
        break;
      case 'communication_routing':
        decision = this.makeCommunicationDecision(input);
        break;
      case 'task_prioritization':
        decision = this.makeTaskDecision(input);
        break;
      default:
        decision = this.makeGenericDecision(input);
    }
    
    return { decision, confidence };
  }
  
  private makeSecurityDecision(input: any): string {
    // For security decisions, err on the side of caution
    if (input.level === 'critical' || input.threat_level === 'high') {
      return 'IMMEDIATE_ACTION_REQUIRED';
    } else if (input.level === 'high' || input.threat_level === 'medium') {
      return 'INVESTIGATE_AND_ALERT';
    } else {
      return 'MONITOR_CONTINUOUSLY';
    }
  }
  
  private makeUpdateDecision(input: any): string {
    // For update decisions, consider safety
    if (input.risk_level === 'high' || input.critical_system) {
      return 'DEFER_UNTIL_MAINTENANCE_WINDOW';
    } else if (input.security_patch || input.emergency_fix) {
      return 'APPLY_IMMEDIATELY_WITH_BACKUP';
    } else {
      return 'SCHEDULE_FOR_LATER_APPROVAL';
    }
  }
  
  private makeResourceDecision(input: any): string {
    // For resource allocation, optimize efficiency
    if (input.urgent_task) {
      return 'ALLOCATE_ADDITIONAL_RESOURCES';
    } else if (input.low_priority) {
      return 'MAINTAIN_CURRENT_ALLOCATION';
    } else {
      return 'OPTIMIZE_RESOURCE_DISTRIBUTION';
    }
  }
  
  private makeCommunicationDecision(input: any): string {
    // For communication routing
    if (input.priority === 'high' || input.encrypted) {
      return 'ROUTE_VIA_SECURE_CHANNEL';
    } else if (input.broadcast) {
      return 'DISTRIBUTE_TO_ALL_NODES';
    } else {
      return 'USE_OPTIMAL_ROUTING_PATH';
    }
  }
  
  private makeTaskDecision(input: any): string {
    // For task prioritization
    if (input.deadline && new Date(input.deadline) < new Date(Date.now() + 3600000)) { // 1 hour
      return 'PRIORITY_HIGH_IMMEDIATE_EXECUTION';
    } else if (input.dependencies?.length > 0) {
      return 'WAIT_FOR_DEPENDENCIES_THEN_EXECUTE';
    } else {
      return 'ADD_TO_STANDARD_QUEUE';
    }
  }
  
  private makeGenericDecision(input: any): string {
    // Generic decision making
    return 'PROCESS_ACCORDING_TO_STANDARD_PROTOCOLS';
  }
  
  public async evaluateDecision(decisionId: string, outcome: any, feedback?: string): Promise<void> {
    console.log(`📊 Evaluating decision: ${decisionId}`);
    
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) {
      console.error(`❌ Decision ${decisionId} not found`);
      return;
    }
    
    // Update decision with outcome and feedback
    decision.outcome = outcome;
    decision.feedback = feedback;
    decision.learned = true;
    
    // Create a learning record if learning is enabled
    if (this.config.learningEnabled) {
      const effectiveness = this.calculateEffectiveness(decision, outcome);
      
      const learningRecord: LearningRecord = {
        id: this.generateId(),
        scenario: JSON.stringify(decision.input),
        decision: decision.decision,
        outcome,
        timestamp: new Date(),
        effectiveness
      };
      
      this.learningRecords.push(learningRecord);
      
      // Keep only recent learning records (last 500)
      if (this.learningRecords.length > 500) {
        this.learningRecords = this.learningRecords.slice(-500);
      }
      
      // Update decision weights based on effectiveness
      this.updateWeightsFromLearning(effectiveness, decision.input, decision.decision);
    }
    
    console.log(`✅ Decision evaluation completed with effectiveness: ${this.calculateEffectiveness(decision, outcome).toFixed(2)}`);
  }
  
  private calculateEffectiveness(decision: Decision, outcome: any): number {
    // Calculate how effective the decision was (-1 to 1 scale)
    // In a real system, this would be more sophisticated
    
    // Base effectiveness on confidence and outcome
    let effectiveness = decision.confidence - 0.5; // Center around 0
    
    // Adjust based on outcome if provided
    if (outcome && typeof outcome === 'object') {
      if (outcome.success === false) {
        effectiveness -= 0.3;
      } else if (outcome.success === true) {
        effectiveness += 0.2;
      }
      
      if (outcome.performance_improvement) {
        effectiveness += outcome.performance_improvement * 0.1;
      }
      
      if (outcome.resource_saved) {
        effectiveness += 0.1;
      }
    } else if (outcome === true || outcome === 'success') {
      effectiveness += 0.2;
    } else if (outcome === false || outcome === 'failed') {
      effectiveness -= 0.3;
    }
    
    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, effectiveness));
  }
  
  private updateWeightsFromLearning(effectiveness: number, input: any, decision: string): void {
    if (!this.config.learningEnabled) return;
    
    // Determine which weight to adjust based on input
    let decisionType = 'generic';
    if (input.type) {
      decisionType = input.type;
    } else if (typeof input === 'string') {
      if (input.toLowerCase().includes('security')) {
        decisionType = 'security_response';
      } else if (input.toLowerCase().includes('update')) {
        decisionType = 'update_approval';
      } else if (input.toLowerCase().includes('resource')) {
        decisionType = 'resource_allocation';
      } else if (input.toLowerCase().includes('communicate')) {
        decisionType = 'communication_routing';
      } else if (input.toLowerCase().includes('task')) {
        decisionType = 'task_prioritization';
      }
    }
    
    // Update the weight for this decision type
    const currentWeight = this.decisionWeights.get(decisionType) || 0.5;
    const adjustment = effectiveness * this.config.feedbackLearningRate;
    const newWeight = Math.max(0.1, Math.min(1.0, currentWeight + adjustment));
    
    this.decisionWeights.set(decisionType, newWeight);
    
    console.log(`⚖️ Updated ${decisionType} weight: ${currentWeight.toFixed(2)} → ${newWeight.toFixed(2)}`);
  }
  
  private loadLearningHistory(): void {
    // Simulate loading previously learned patterns
    console.log('📚 Loading learning history...');
    
    // In a real implementation, this would load from persistent storage
    // For simulation, we'll initialize with some example data
    
    console.log('✅ Learning history loaded');
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  public getDecisionStats(): any {
    return {
      totalDecisions: this.decisions.length,
      learnedDecisions: this.decisions.filter(d => d.learned).length,
      averageConfidence: this.decisions.length > 0 
        ? this.decisions.reduce((sum, d) => sum + d.confidence, 0) / this.decisions.length 
        : 0,
      learningRecords: this.learningRecords.length,
      decisionWeights: Object.fromEntries(this.decisionWeights),
      accuracyEstimate: this.estimateAccuracy()
    };
  }
  
  private estimateAccuracy(): number {
    // Estimate overall accuracy based on learning records
    if (this.learningRecords.length === 0) {
      return 0.5; // Unknown accuracy
    }
    
    const avgEffectiveness = this.learningRecords.reduce((sum, lr) => sum + lr.effectiveness, 0) / this.learningRecords.length;
    return Math.max(0, Math.min(1, 0.5 + avgEffectiveness * 0.5)); // Convert from [-1,1] to [0,1]
  }
  
  public async trainOnScenario(scenario: any, correctDecision: string, outcome: any): Promise<void> {
    console.log(`🎯 Training on scenario: ${JSON.stringify(scenario)}`);
    
    // Make a decision on the scenario
    const decision = await this.makeDecision(scenario);
    
    // Evaluate against the known correct decision
    const simulatedOutcome = {
      success: decision.decision === correctDecision,
      expected_decision: correctDecision,
      made_decision: decision.decision
    };
    
    // Evaluate the decision
    await this.evaluateDecision(decision.id, { ...outcome, ...simulatedOutcome });
    
    console.log('✅ Training completed for scenario');
  }
}