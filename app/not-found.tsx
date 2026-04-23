import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-green-400">
      
      <h1 className="text-7xl font-extrabold tracking-widest text-green-500">
        404
      </h1>

      <p className="mt-4 text-lg text-green-300">
        Page not found
      </p>

      <div className="mt-6 h-0.5 w-32 bg-green-700 rounded-full" />

      <p className="mt-6 text-sm text-green-500 opacity-80">
        The page you're looking for doesn't exist or was moved.
      </p>

      <Link
        href="/"
        className="mt-8 px-6 py-2 border border-green-500 rounded-lg 
                   hover:bg-green-600 hover:text-black transition-all duration-300"
      >
        Go Home
      </Link>

      {/* subtle glow effect */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#064e3b_0%,black_70%)]" />
    </div>
  );
}