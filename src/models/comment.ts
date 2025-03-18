// src/models/comment.ts
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}
