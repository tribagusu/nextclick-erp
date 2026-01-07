/**
 * Database types for Next Click ERP V2
 * 
 * These types are manually defined to match the Supabase schema.
 * TODO: Generate automatically with `supabase gen types typescript`
 */

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';
export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type CommunicationMode = 'email' | 'call' | 'meeting';

// =============================================================================
// BASE TYPES (match database schema exactly)
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  status: EmployeeStatus;
  salary: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  project_name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  total_budget: number;
  amount_paid: number;
  payment_terms: string | null;
  last_payment_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectEmployee {
  project_id: string;
  employee_id: string;
  assigned_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  milestone: string;
  description: string | null;
  due_date: string | null;
  completion_date: string | null;
  status: MilestoneStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MilestoneEmployee {
  milestone_id: string;
  employee_id: string;
  assigned_at: string;
}

export interface CommunicationLog {
  id: string;
  client_id: string;
  project_id: string | null;
  date: string;
  mode: CommunicationMode;
  summary: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =============================================================================
// DATABASE TYPE (Supabase schema structure)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Client, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'total_budget' | 'amount_paid'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          total_budget?: number;
          amount_paid?: number;
        };
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      project_employees: {
        Row: ProjectEmployee;
        Insert: Omit<ProjectEmployee, 'assigned_at'> & {
          assigned_at?: string;
        };
        Update: Partial<ProjectEmployee>;
      };
      project_milestones: {
        Row: ProjectMilestone;
        Insert: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProjectMilestone, 'id' | 'created_at'>>;
      };
      milestone_employees: {
        Row: MilestoneEmployee;
        Insert: Omit<MilestoneEmployee, 'assigned_at'> & {
          assigned_at?: string;
        };
        Update: Partial<MilestoneEmployee>;
      };
      communication_logs: {
        Row: CommunicationLog;
        Insert: Omit<CommunicationLog, 'id' | 'created_at' | 'updated_at' | 'date' | 'follow_up_required'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          date?: string;
          follow_up_required?: boolean;
        };
        Update: Partial<Omit<CommunicationLog, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      user_role: UserRole;
      employee_status: EmployeeStatus;
      project_status: ProjectStatus;
      project_priority: ProjectPriority;
      milestone_status: MilestoneStatus;
      communication_mode: CommunicationMode;
    };
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type TableName = keyof Database['public']['Tables'];

export type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Soft delete aware types (excludes deleted records)
export type ActiveRow<T extends TableName> = Omit<Row<T>, 'deleted_at'> & {
  deleted_at: null;
};
