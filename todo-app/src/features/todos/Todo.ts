export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdDate: number;
  completedDate?: number;
}