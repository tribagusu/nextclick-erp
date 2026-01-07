/**
 * Employee Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from '../employee.service';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
  },
};

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService(mockSupabase as never);
  });

  describe('createEmployee', () => {
    it('should create an employee with valid data', async () => {
      const mockEmployee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@company.com',
        phone: null,
        position: 'Developer',
        department: 'Engineering',
        status: 'active',
        salary: 75000,
        hire_date: '2024-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: null,
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockEmployee, error: null }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await service.createEmployee({
        name: 'John Doe',
        email: 'john@company.com',
        position: 'Developer',
        department: 'Engineering',
        status: 'active',
        salary: '75000',
      });

      expect(result.success).toBe(true);
      expect(result.employee).toBeDefined();
      expect(result.employee?.name).toBe('John Doe');
    });

    it('should return error for invalid data', async () => {
      const result = await service.createEmployee({
        name: '', // Invalid - empty name
        email: 'john@company.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for short name', async () => {
      const result = await service.createEmployee({
        name: 'J', // Invalid - too short
        email: 'john@company.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('2 characters');
    });
  });

});

