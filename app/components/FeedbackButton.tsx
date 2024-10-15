import Link from 'next/link';

const FeedbackButton = () => {
  return (
    <Link href="/feedback">
      <button>Give Feedback</button>
    </Link>
  );
};

export default FeedbackButton;
