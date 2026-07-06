import Link from 'next/link';


export default function NotFound() {
  return (
    <main className="text-center text-[#99ffd3]">
      <div className="text-3xl text-[#99ffd3]">There was a problem.</div>
      <br></br>
      <p>We could not find the page you were looking for.</p>
      <p>
        Go back to the <Link href="/">dashboard</Link>.
      </p>
    </main>
  );
}
