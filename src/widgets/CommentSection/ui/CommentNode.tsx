import { CommentWithAuthor, CommentWithAuthorTree } from '@/widgets/CommentSection/model/types';
import { useState } from 'react';
import UserAvatarMini from '@/entities/user/ui/UserAvatarMini';
import { formatDate } from '../lib/utils';
import UserLink from '@/pages/user/ui/UserLink';

export function CommentNode({
  comment,
  onReply,
}: {
  comment: CommentWithAuthorTree;
  onReply: (c: CommentWithAuthor) => void;
}) {
  const [repliesOpen, setRepliesOpen] = useState<boolean>(comment.replies.length <= 1);
  return (
    <div className={`flex flex-col gap-5 ${comment.parentId && 'ml-17'} `}>
      <div className={`flex flex-row items-start gap-6`}>
        <UserLink userId={comment.userId}>
          <UserAvatarMini
            user={comment.author}
            className={'h-12 w-12 border-none lg:h-16 lg:w-16'}
          ></UserAvatarMini>
        </UserLink>
        <div className={`flex flex-1 flex-col items-start gap-1.5`}>
          <UserLink userId={comment.userId}>
            <h3 className={'text-base leading-4.5 font-medium lg:text-xl'}>
              {comment.author.name}
            </h3>
          </UserLink>
          <p className={'text-sm leading-6 whitespace-pre-line lg:text-base'}>{comment.content}</p>
          <div className={'text-text-inverse-500 flex flex-row gap-6 text-xs lg:text-sm'}>
            <p>{formatDate(comment.createdAt)}</p>
            <button
              className={'text-text-inverse-accent font-medium hover:underline'}
              type="button"
              onClick={() => onReply(comment)}
            >
              Ответить
            </button>
          </div>
          {comment.replies.length > 1 && (
            <button
              className={'text-primary text-lg hover:underline'}
              type="button"
              onClick={() => setRepliesOpen(!repliesOpen)}
            >
              {comment.replies.length} replies
            </button>
          )}
        </div>
      </div>
      {repliesOpen && comment.replies.length > 0 && (
        <div className={`flex flex-col gap-3`}>
          {comment.replies.map((r) => (
            <CommentNode key={r.id} comment={r} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
