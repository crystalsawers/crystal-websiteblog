import Link from 'next/link';

// Change text back to #99ffd3 next week

export default function NotFound() {
  return (
    <main className="text-center text-[#d1ff00]">
      <div className="text-3xl text-[#d1ff00]">There was a problem.</div>
      <br></br>
      <p>We could not find the page you were looking for.</p>
      <p>
        Go back to the <Link href="/">dashboard</Link>.
      </p>
    </main>
  );
}
