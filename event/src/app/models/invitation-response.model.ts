/*export interface InvitationResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  invitedUserId: number;
  invitedUserFullName: string;
  organizerFullName: string;
  status: string;
  sentAt: string;       
  respondedAt?: string | null; 
  message?: string;            
}
*/

export interface PlanningStep {
  time: string;
  label: string;
  icon: string;
}

export interface InvitationResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  invitedUserId: number;
  invitedUserEmail?: string;
  invitedUserFullName: string;
  organizerFullName: string;
  status: string;
  sentAt: string;
  respondedAt?: string | null;
  message?: string;

  // Champs supplémentaires
  posterUrl?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  planning?: PlanningStep[];
}
