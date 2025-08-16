import { Context } from 'hono';
import { Env } from '../types';
import { 
  FlagListSuccessResponse, 
  FlagCreateRequest, 
  FlagCreateSuccessResponse,
  FlagGetSuccessResponse,
  FlagUpdateRequest,
  FlagUpdateSuccessResponse,
  FlagDeleteSuccessResponse
} from '../api';
import { HttpError, ErrorCode } from '../http-error';
import { FlagService } from '../../core/flag-service';

import { FlagStorage } from '../../core/flag-service';
import { Flag } from '../../core/flag';

// Get flag service from context (injected by middleware)
function getFlagService(c: Context<{ Bindings: Env }>): FlagService {
  // Create service directly from storage binding
  if (!c.env.STORAGE) {
    throw new Error('STORAGE binding not available');
  }

  const storageId = c.env.STORAGE.idFromName('default');
  const durableObjectStub = c.env.STORAGE.get(storageId);
  
  const flagStorage: FlagStorage = {
    async list(): Promise<Flag[]> {
      const response = await durableObjectStub.fetch('http://internal/list');
      return response.json() as Promise<Flag[]>;
    },
    async get(id: string): Promise<Flag | null> {
      const response = await durableObjectStub.fetch(`http://internal/get/${id}`);
      if (response.status === 404) return null;
      return response.json() as Promise<Flag>;
    },
    async put(id: string, flag: Flag): Promise<void> {
      await durableObjectStub.fetch(`http://internal/put/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flag)
      });
    },
    async delete(id: string): Promise<void> {
      await durableObjectStub.fetch(`http://internal/delete/${id}`, {
        method: 'DELETE'
      });
    }
  };
  
  return new FlagService(flagStorage);
}

export async function listFlags(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const flagService = getFlagService(c);
    const flags = await flagService.getAllFlags();
    const response: FlagListSuccessResponse = {
      success: true,
      data: flags,
    };
    return c.json(response);
  } catch (error) {
    console.error('List flags error:', error);
    const httpError = HttpError.from(error instanceof Error ? error : new Error('Unknown error'));
    const errorResponse = { success: false as const, error: httpError.error };
    return c.json(errorResponse, 500);
  }
}

export async function createFlag(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const flagService = getFlagService(c);
    const body = await c.req.json() as FlagCreateRequest;
    const flag = await flagService.createFlag(
      body.key,
      body.name,
      body.description,
      body.enabled
    );
    const response: FlagCreateSuccessResponse = {
      success: true,
      data: flag,
    };
    return c.json(response, 201);
  } catch (error) {
    console.error('Create flag error:', error);
    const httpError = HttpError.from(error instanceof Error ? error : new Error('Unknown error'));
    const errorResponse = { success: false as const, error: httpError.error };
    
    if (httpError.status === 400) {
      return c.json(errorResponse, 400);
    } else if (httpError.status === 409) {
      return c.json(errorResponse, 409);
    } else {
      return c.json(errorResponse, 500);
    }
  }
}

export async function getFlag(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const flagService = getFlagService(c);
    const id = c.req.param('id');
    if (!id) {
      const errorResponse = { 
        success: false as const, 
        error: { code: ErrorCode.InvalidRequest, message: 'Flag ID is required' }
      };
      return c.json(errorResponse, 400);
    }

    const flag = await flagService.getFlag(id);
    const response: FlagGetSuccessResponse = {
      success: true,
      data: flag,
    };
    return c.json(response);
  } catch (error) {
    console.error('Get flag error:', error);
    const httpError = HttpError.from(error instanceof Error ? error : new Error('Unknown error'));
    const errorResponse = { success: false as const, error: httpError.error };
    
    if (httpError.status === 404) {
      return c.json(errorResponse, 404);
    } else {
      return c.json(errorResponse, 500);
    }
  }
}

export async function updateFlag(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const flagService = getFlagService(c);
    const id = c.req.param('id');
    if (!id) {
      const errorResponse = { 
        success: false as const, 
        error: { code: ErrorCode.InvalidRequest, message: 'Flag ID is required' }
      };
      return c.json(errorResponse, 400);
    }

    const body = await c.req.json() as Omit<FlagUpdateRequest, 'id'>;
    const flag = await flagService.updateFlag(id, body);
    const response: FlagUpdateSuccessResponse = {
      success: true,
      data: flag,
    };
    return c.json(response);
  } catch (error) {
    console.error('Update flag error:', error);
    const httpError = HttpError.from(error instanceof Error ? error : new Error('Unknown error'));
    const errorResponse = { success: false as const, error: httpError.error };
    
    if (httpError.status === 400) {
      return c.json(errorResponse, 400);
    } else if (httpError.status === 404) {
      return c.json(errorResponse, 404);
    } else if (httpError.status === 409) {
      return c.json(errorResponse, 409);
    } else {
      return c.json(errorResponse, 500);
    }
  }
}

export async function deleteFlag(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const flagService = getFlagService(c);
    const id = c.req.param('id');
    if (!id) {
      const errorResponse = { 
        success: false as const, 
        error: { code: ErrorCode.InvalidRequest, message: 'Flag ID is required' }
      };
      return c.json(errorResponse, 400);
    }

    await flagService.deleteFlag(id);
    const response: FlagDeleteSuccessResponse = {
      success: true,
      data: null,
    };
    return c.json(response);
  } catch (error) {
    console.error('Delete flag error:', error);
    const httpError = HttpError.from(error instanceof Error ? error : new Error('Unknown error'));
    const errorResponse = { success: false as const, error: httpError.error };
    
    if (httpError.status === 404) {
      return c.json(errorResponse, 404);
    } else {
      return c.json(errorResponse, 500);
    }
  }
}