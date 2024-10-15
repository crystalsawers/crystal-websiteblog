import Link from 'next/link';

const FeedbackButton = ({ postId }: { postId: string }) => {
  return (
    <Link href={`/feedback/${postId}`}>
      <button>Give Feedback</button>
    </Link>
  );
};

export default FeedbackButton;
