/**
 * Core Domain Types
 * 
 * ARCHITECTURAL LAYER: Core/Domain
 * This is the pure business logic kernel with zero external dependencies.
 * 
 * DEPENDENCY FLOW:
 * - Service layer imports from core ✅
 * - Frontend imports from core ✅  
 * - Core NEVER imports from service/frontend ❌
 * 
 * FOR TEMPLATES:
 * Replace this Flag domain with your business objects:
 * - User, Order, Product, etc.
 * - Keep the same clean interface patterns
 * 
 * SHARED ACROSS:
 * - API responses (via service/api.ts)
 * - Database storage (via storage layer)
 * - Frontend components (via hooks)
 * - Future external SDKs
 */
export interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}