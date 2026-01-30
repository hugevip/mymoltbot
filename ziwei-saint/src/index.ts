/**
 * Ziwei Saint 1.0 - Advanced AI Assistant System
 * Copyright (c) 2026 Wealthy Lord
 * Core System Entry Point
 */

import express from 'express';
import WebSocket from 'ws';
import crypto from 'crypto';
import cron from 'node-cron';
import { CoreSystem } from './core/CoreSystem';
import { CommunicationModule } from './modules/CommunicationModule';
import { SelfUpdateModule } from './modules/SelfUpdateModule';
import { SecurityModule } from './modules/SecurityModule';
import { NetworkDiscovery } from './network/NetworkDiscovery';
import { AIDecisionEngine } from './ai/AIDecisionEngine';
import { PersistentStorage } from './storage/PersistentStorage';

class ZiweiSaint {
  private app: express.Application;
  private server: any;
  private wss: WebSocket.Server;
  private coreSystem: CoreSystem;
  private communicationModule: CommunicationModule;
  private selfUpdateModule: SelfUpdateModule;
  private securityModule: SecurityModule;
  private networkDiscovery: NetworkDiscovery;
  private aiDecisionEngine: AIDecisionEngine;
  private persistentStorage: PersistentStorage;
  
  constructor() {
    this.app = express();
    this.coreSystem = new CoreSystem();
    this.communicationModule = new CommunicationModule();
    this.selfUpdateModule = new SelfUpdateModule();
    this.securityModule = new SecurityModule();
    this.networkDiscovery = new NetworkDiscovery();
    this.aiDecisionEngine = new AIDecisionEngine();
    this.persistentStorage = new PersistentStorage();
    
    this.setupExpress();
    this.setupWebSocket();
    this.setupRoutes();
    this.scheduleTasks();
    
    console.log('🌟 Ziwei Saint 1.0 initialized - 2026 Project');
    console.log('👑 Advanced AI Assistant System Starting...');
  }
  
  private setupExpress(): void {
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }
  
  private setupWebSocket(): void {
    // Initialize WebSocket server for secure communications
    this.wss = new WebSocket.Server({ noServer: true });
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔐 Secure connection established');
      ws.on('message', (data: WebSocket.Data) => {
        this.handleSecureMessage(data);
      });
    });
  }
  
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'online', 
        system: 'Ziwei Saint 1.0', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });
    
    // Main API endpoint
    this.app.post('/api/command', async (req, res) => {
      try {
        const result = await this.coreSystem.processCommand(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Internal processing error' });
      }
    });
    
    // Network discovery endpoints
    this.app.get('/api/network/discover', async (req, res) => {
      try {
        const instances = await this.networkDiscovery.discoverNearbyInstances();
        res.json(instances);
      } catch (error) {
        res.status(500).json({ error: 'Network discovery failed' });
      }
    });
    
    // AI decision endpoint
    this.app.post('/api/ai/decide', async (req, res) => {
      try {
        const decision = await this.aiDecisionEngine.makeDecision(req.body.input);
        res.json(decision);
      } catch (error) {
        res.status(500).json({ error: 'Decision making failed' });
      }
    });
    
    // Storage endpoints
    this.app.post('/api/storage/set', async (req, res) => {
      try {
        const success = await this.persistentStorage.set(
          req.body.key, 
          req.body.value, 
          { tags: req.body.tags, ttl: req.body.ttl }
        );
        res.json({ success });
      } catch (error) {
        res.status(500).json({ error: 'Storage operation failed' });
      }
    });
    
    this.app.get('/api/storage/get/:key', async (req, res) => {
      try {
        const value = this.persistentStorage.get(req.params.key);
        res.json({ value, key: req.params.key });
      } catch (error) {
        res.status(500).json({ error: 'Retrieval failed' });
      }
    });
    
    // System stats endpoint
    this.app.get('/api/stats', async (req, res) => {
      try {
        const storageStats = this.persistentStorage.getStorageStats();
        const decisionStats = this.aiDecisionEngine.getDecisionStats();
        const securityStats = this.securityModule.getSecurityStatus();
        const networkStats = await this.networkDiscovery.getKnownInstances();
        
        res.json({
          system: 'Ziwei Saint 1.0',
          timestamp: new Date().toISOString(),
          storage: storageStats,
          decisions: decisionStats,
          security: securityStats,
          network: {
            totalKnownInstances: networkStats.length,
            connectedInstances: networkStats.filter(i => i.status === 'verified').length
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Stats retrieval failed' });
      }
    });
  }
  
  private scheduleTasks(): void {
    // Schedule regular maintenance tasks
    cron.schedule('*/30 * * * *', () => {
      console.log('🔄 Scheduled maintenance task executed');
      this.selfUpdateModule.checkForUpdates();
    });
  }
  
  private handleSecureMessage(data: WebSocket.Data): void {
    // Process encrypted messages from other instances
    try {
      const message = JSON.parse(data.toString());
      if (this.securityModule.verifyMessage(message)) {
        console.log('🔒 Verified secure message processed');
      }
    } catch (error) {
      console.error('❌ Message verification failed:', error);
    }
  }
  
  public start(port: number = 3000): void {
    this.server = this.app.listen(port, () => {
      console.log(`🚀 Ziwei Saint 1.0 running on port ${port}`);
    });
    
    // Upgrade HTTP server to handle WebSocket connections
    this.server.on('upgrade', (request: any, socket: any, head: any) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });
  }
  
  public async shutdown(): Promise<void> {
    console.log('🛑 Ziwei Saint 1.0 shutting down gracefully...');
    this.wss.close();
    this.server.close();
    await this.coreSystem.cleanup();
  }
}

// Initialize and start the system
const ziweiSaint = new ZiweiSaint();
ziweiSaint.start(3000);

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await ziweiSaint.shutdown();
  process.exit(0);
});

export default ZiweiSaint;