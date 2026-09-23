import { z } from 'zod';

export const CommentEntityTypeSchema = z.enum(['film', 'book', 'game']);

export const CreateCommentSchema = z.object({
  content: z.string().min(2).max(5000),

  entityType: CommentEntityTypeSchema,
  entityId: z.string().uuid(),

  parentId: z.string().uuid().nullable().optional(),
});
