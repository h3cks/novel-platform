import { User } from '../auth/types';

export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED';

export interface Report {
  id: number;
  reporterId: number;
  reporter: User;
  targetType: string; // 'NOVEL', 'COMMENT', 'USER'
  targetId: number;
  reason: string;
  detail: string | null;
  createdAt: string;
  status: ReportStatus;
  moderatorId: number | null;
  moderatorComment: string | null;
  actionTaken: string | null;
  actionTakenNote: string | null;
}

export interface UpdateReportDTO {
  status: ReportStatus;
  moderatorComment?: string;
  actionTaken?: string;
}