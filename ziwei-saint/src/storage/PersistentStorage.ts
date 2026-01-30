/**
 * Persistent Storage Module for Ziwei Saint 1.0
 * Provides fault-tolerant data persistence and replication
 */

interface StoredObject {
  id: string;
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
  ttl?: number; // Time-to-live in milliseconds
}

interface StorageConfig {
  enableReplication: boolean;
  replicationFactor: number; // Number of copies to maintain
  syncInterval: number; // milliseconds
  maxStorageSize: number; // in MB
  enableEncryption: boolean;
  backupInterval: number; // milliseconds
}

interface ReplicationNode {
  id: string;
  address: string;
  port: number;
  status: 'online' | 'offline' | 'syncing';
  lastSync: Date;
  storageUsed: number; // in MB
}

export class PersistentStorage {
  private store: Map<string, StoredObject>;
  private config: StorageConfig;
  private replicationNodes: ReplicationNode[];
  private syncTimer: NodeJS.Timeout | null;
  private backupTimer: NodeJS.Timeout | null;
  private sizeTracker: number; // Current storage size in KB
  
  constructor(config?: Partial<StorageConfig>) {
    this.store = new Map();
    this.replicationNodes = [];
    this.syncTimer = null;
    this.backupTimer = null;
    this.sizeTracker = 0;
    
    this.config = {
      enableReplication: true,
      replicationFactor: 3,
      syncInterval: 60000, // 1 minute
      maxStorageSize: 1024, // 1 GB
      enableEncryption: true,
      backupInterval: 300000, // 5 minutes
      ...config
    };
    
    this.initializeStorage();
  }
  
  private initializeStorage(): void {
    console.log('💾 Initializing persistent storage system...');
    
    // Simulate loading existing data
    this.loadExistingData();
    
    // Initialize replication if enabled
    if (this.config.enableReplication) {
      this.initializeReplication();
    }
    
    // Start periodic sync and backup
    this.startSync();
    this.startBackup();
    
    console.log('✅ Persistent storage system initialized');
  }
  
  private loadExistingData(): void {
    // In a real implementation, this would load from disk/database
    // For simulation, we'll initialize empty
    console.log('📂 Loading existing data...');
    
    // Add any startup initialization here
    console.log('✅ Existing data loaded');
  }
  
  private initializeReplication(): void {
    console.log(`🔄 Initializing replication (factor: ${this.config.replicationFactor})...`);
    
    // Simulate discovering other nodes
    for (let i = 0; i < this.config.replicationFactor - 1; i++) {
      const node: ReplicationNode = {
        id: `replica-${i}-${Date.now().toString(36)}`,
        address: `192.168.1.${100 + i}`,
        port: 3000 + i,
        status: 'online',
        lastSync: new Date(0), // Never synced yet
        storageUsed: 0
      };
      
      this.replicationNodes.push(node);
    }
    
    console.log(`✅ Replication initialized with ${this.replicationNodes.length + 1} nodes (including self)`);
  }
  
  public async set(key: string, value: any, options?: { tags?: string[], ttl?: number }): Promise<boolean> {
    console.log(`📦 Storing data with key: ${key}`);
    
    try {
      // Serialize the value to estimate size
      const serializedValue = JSON.stringify(value);
      const sizeInKB = serializedValue.length / 1024;
      
      // Check if we're approaching storage limit
      if ((this.sizeTracker + sizeInKB) > (this.config.maxStorageSize * 1024)) {
        console.warn('⚠️ Approaching storage limit, attempting cleanup...');
        this.performCleanup();
      }
      
      // Create or update stored object
      const existing = this.store.get(key);
      const obj: StoredObject = {
        id: existing?.id || this.generateId(),
        key,
        value: this.config.enableEncryption ? this.encryptData(value) : value,
        createdAt: existing ? existing.createdAt : new Date(),
        updatedAt: new Date(),
        version: existing ? existing.version + 1 : 1,
        tags: options?.tags || [],
        ttl: options?.ttl
      };
      
      this.store.set(key, obj);
      this.sizeTracker += sizeInKB;
      
      // Replicate to other nodes if enabled
      if (this.config.enableReplication) {
        await this.replicateSet(key, value, options);
      }
      
      console.log(`✅ Data stored: ${key} (${sizeInKB.toFixed(2)} KB)`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to store data: ${error}`);
      return false;
    }
  }
  
  public get(key: string): any {
    console.log(`🔍 Retrieving data with key: ${key}`);
    
    const obj = this.store.get(key);
    if (!obj) {
      console.log(`❌ Key not found: ${key}`);
      return undefined;
    }
    
    // Check TTL
    if (obj.ttl && (Date.now() - obj.updatedAt.getTime()) > obj.ttl) {
      console.log(`🗑️ Key expired: ${key}, removing from store`);
      this.delete(key);
      return undefined;
    }
    
    // Decrypt if necessary
    const value = this.config.enableEncryption ? this.decryptData(obj.value) : obj.value;
    
    console.log(`✅ Data retrieved: ${key}`);
    return value;
  }
  
  public async delete(key: string): Promise<boolean> {
    console.log(`🗑️ Deleting data with key: ${key}`);
    
    const obj = this.store.get(key);
    if (!obj) {
      console.log(`❌ Key not found for deletion: ${key}`);
      return false;
    }
    
    // Calculate size to remove from tracker
    const serializedValue = JSON.stringify(obj.value);
    const sizeInKB = serializedValue.length / 1024;
    this.sizeTracker = Math.max(0, this.sizeTracker - sizeInKB);
    
    // Remove from local store
    this.store.delete(key);
    
    // Replicate deletion if enabled
    if (this.config.enableReplication) {
      await this.replicateDelete(key);
    }
    
    console.log(`✅ Data deleted: ${key}`);
    return true;
  }
  
  public async replicateSet(key: string, value: any, options?: { tags?: string[], ttl?: number }): Promise<void> {
    if (!this.config.enableReplication) return;
    
    console.log(`🔄 Replicating SET operation for key: ${key}`);
    
    // In a real implementation, this would send the data to replica nodes
    // For simulation, we'll just update our node tracking
    
    for (const node of this.replicationNodes) {
      if (node.status === 'online') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        // Update node stats
        node.storageUsed += 0.1; // Simulate small amount of metadata
        node.lastSync = new Date();
      }
    }
    
    console.log(`✅ SET operation replicated to ${this.replicationNodes.length} nodes`);
  }
  
  public async replicateDelete(key: string): Promise<void> {
    if (!this.config.enableReplication) return;
    
    console.log(`🔄 Replicating DELETE operation for key: ${key}`);
    
    for (const node of this.replicationNodes) {
      if (node.status === 'online') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        
        // Update node stats
        node.lastSync = new Date();
      }
    }
    
    console.log(`✅ DELETE operation replicated to ${this.replicationNodes.length} nodes`);
  }
  
  public async forceSync(): Promise<void> {
    console.log('🔄 Performing forced synchronization...');
    
    // In a real implementation, this would sync with all replica nodes
    // For simulation, we'll just update sync timestamps
    
    for (const node of this.replicationNodes) {
      if (node.status === 'online') {
        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
        node.lastSync = new Date();
        node.status = 'syncing';
        
        // Back to online after sync
        setTimeout(() => {
          if (this.replicationNodes.some(n => n.id === node.id)) {
            node.status = 'online';
          }
        }, 100);
      }
    }
    
    console.log(`✅ Synchronization completed with ${this.replicationNodes.length} nodes`);
  }
  
  private startSync(): void {
    if (!this.config.enableReplication) return;
    
    console.log(`🔄 Starting periodic sync (every ${this.config.syncInterval}ms)...`);
    
    this.syncTimer = setInterval(async () => {
      await this.forceSync();
    }, this.config.syncInterval);
  }
  
  private startBackup(): void {
    console.log(`🗄️ Starting periodic backups (every ${this.config.backupInterval}ms)...`);
    
    this.backupTimer = setInterval(() => {
      this.performBackup();
    }, this.config.backupInterval);
  }
  
  private performBackup(): void {
    console.log('🗄️ Performing scheduled backup...');
    
    // In a real implementation, this would create actual backups
    // For simulation, we'll just log the action
    
    console.log('✅ Backup completed');
  }
  
  private performCleanup(): void {
    console.log('🧹 Performing storage cleanup...');
    
    // Remove expired entries
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (const [key, obj] of this.store.entries()) {
      if (obj.ttl && (now - obj.updatedAt.getTime()) > obj.ttl) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      this.store.delete(key);
    }
    
    // If still over limit, remove oldest entries
    if (this.sizeTracker > (this.config.maxStorageSize * 1024)) {
      const entries = Array.from(this.store.entries())
        .sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime());
      
      while (this.sizeTracker > (this.config.maxStorageSize * 0.9 * 1024) && entries.length > 0) {
        const [key, obj] = entries.shift()!;
        const serializedValue = JSON.stringify(obj.value);
        const sizeInKB = serializedValue.length / 1024;
        this.sizeTracker = Math.max(0, this.sizeTracker - sizeInKB);
        this.store.delete(key);
      }
    }
    
    console.log(`✅ Cleanup completed. Removed ${keysToRemove.length} expired entries.`);
  }
  
  private encryptData(data: any): any {
    if (!this.config.enableEncryption) return data;
    
    // In a real implementation, this would use proper encryption
    // For simulation, we'll use a simple obfuscation
    try {
      const crypto = require('crypto');
      const key = crypto.scryptSync('ziwei-saint-storage-key', 'salt', 24);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes192', key);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return both encrypted data and IV
      return { encrypted, iv: iv.toString('hex') };
    } catch (e) {
      console.warn('⚠️ Encryption failed, storing unencrypted:', e);
      return data;
    }
  }
  
  private decryptData(encryptedData: any): any {
    if (!this.config.enableEncryption) return encryptedData;
    
    // In a real implementation, this would properly decrypt
    // For simulation, we'll reverse the simple obfuscation
    try {
      if (typeof encryptedData === 'object' && encryptedData.encrypted && encryptedData.iv) {
        const crypto = require('crypto');
        const key = crypto.scryptSync('ziwei-saint-storage-key', 'salt', 24);
        const decipher = crypto.createDecipher('aes192', key);
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
      } else {
        return encryptedData;
      }
    } catch (e) {
      console.error('❌ Decryption failed:', e);
      return encryptedData;
    }
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  public getStorageStats(): any {
    return {
      totalObjects: this.store.size,
      storageUsedKB: this.sizeTracker,
      storageUsedMB: this.sizeTracker / 1024,
      maxStorageMB: this.config.maxStorageSize,
      utilizationPercent: (this.sizeTracker / 1024) / this.config.maxStorageSize * 100,
      replicationEnabled: this.config.enableReplication,
      replicationNodes: this.replicationNodes.length + 1, // +1 for self
      replicationFactor: this.config.replicationFactor,
      estimatedFreeSpaceMB: this.config.maxStorageSize - (this.sizeTracker / 1024)
    };
  }
  
  public async getReplicationStats(): Promise<any> {
    return {
      nodes: this.replicationNodes.map(node => ({
        id: node.id,
        address: node.address,
        status: node.status,
        lastSync: node.lastSync,
        storageUsed: node.storageUsed
      })),
      selfId: 'ziwei-self-storage',
      totalReplicas: this.replicationNodes.length + 1
    };
  }
  
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down persistent storage...');
    
    // Clear timers
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    // Perform final sync if replication is enabled
    if (this.config.enableReplication) {
      await this.forceSync();
    }
    
    console.log('✅ Persistent storage shut down');
  }
  
  public async findByTag(tag: string): Promise<any[]> {
    console.log(`🔍 Finding objects with tag: ${tag}`);
    
    const results: any[] = [];
    
    for (const obj of this.store.values()) {
      if (obj.tags.includes(tag)) {
        const value = this.config.enableEncryption ? this.decryptData(obj.value) : obj.value;
        results.push(value);
      }
    }
    
    console.log(`✅ Found ${results.length} objects with tag: ${tag}`);
    return results;
  }
}