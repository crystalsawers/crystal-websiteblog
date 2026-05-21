import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="text-center text-[#99ffd3]">
      <h2 className="text-3xl text-[#99ffd3]">There was a problem.</h2>
      <p>We could not find the page you were looking for.</p>
      <p>
        Go back to the <Link href="/">dashboard</Link>.
      </p>
    </main>
  );
}
