export interface FeedbackResponse {
  id: number;
  eventId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
