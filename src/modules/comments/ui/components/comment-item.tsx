import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CommentsGetManyOutput } from "../../type";

// CommentItemProps - Defines the props required for the CommentItem component
interface CommentItemProps {
  comment: CommentsGetManyOutput[number]; // Represents a single comment
}

// CommentItem component - Renders an individual comment with user details
export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div>
      <div className="flex gap-4">
        {/* User Avatar with link to their profile */}
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size="lg"
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* User name and timestamp */}
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.updatedAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>

          {/* Comment text */}
          <p className="text-sm">{comment.value}</p>
        </div>
      </div>
    </div>
  );
};
