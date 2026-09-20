'use server';

import { withAuth } from '@/shared/lib/auth';
import { createComment } from '@/entities/comments/api/db';
import { CreateCommentInput } from '@/entities/comments/model/types';
import { Comment } from '@/entities/comments/model/types';
import { mapDbCommentToComment } from '@/entities/comments/model/mappers';
import { CreateCommentSchema } from '@/entities/comments/model/schemas';
import { ActionResult } from '@/shared/model';
import { createCommentPreview } from '@/entities/comments/utils';
import { tryCreateActivityEvent } from '@/entities/activity/api/queries';

export async function createCommentAction(
  input: CreateCommentInput,
): Promise<ActionResult<Comment>> {
  const parsed = CreateCommentSchema.safeParse(input);

  if (!parsed.success) {
    console.error(parsed.error);

    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const session = await withAuth();

  if (session.status === 'unauthenticated') {
    return {
      success: false,
      error: 'UNAUTHENTICATED',
    };
  }

  try {
    const dbComment = await createComment({
      ...parsed.data,
      userId: session.payload.userId,
    });

    const comment = mapDbCommentToComment(dbComment);

    await tryCreateActivityEvent({
      eventType: 'subject.commented',
      actorId: session.payload.userId,
      subject: {
        id: comment.entityId,
        type: comment.entityType,
      },
      metadata: {
        commentId: comment.id,
        commentPreview: createCommentPreview(comment.content),

        ...(comment.parentId && {
          parentCommentId: comment.parentId,
        }),
      },
    });

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    console.error('Failed to create comment', error);

    return {
      success: false,
      error: 'DB_ERROR',
    };
  }
}
