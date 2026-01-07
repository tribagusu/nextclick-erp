/**
 * Project Members Feature - Domain Types
 */

export interface ProjectMember {
  project_id: string;
  employee_id: string;
  role: string | null;
  assigned_at: string;
  // Joined employee data
  employee?: {
    id: string;
    name: string;
    email: string | null;
    position: string | null;
  };
}

export interface AddProjectMemberInput {
  project_id: string;
  employee_id: string;
  role?: string | null;
}

export interface ProjectMemberListResponse {
  members: ProjectMember[];
  total: number;
}
