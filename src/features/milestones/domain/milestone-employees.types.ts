/**
 * Milestone Employees Feature - Types
 */

export interface MilestoneEmployee {
  milestone_id: string;
  employee_id: string;
  assigned_at: string;
  // Joined employee data
  employee?: {
    id: string;
    name: string;
    email: string | null;
    position: string | null;
  };
}

export interface MilestoneEmployeeListResponse {
  employees: MilestoneEmployee[];
  total: number;
}
