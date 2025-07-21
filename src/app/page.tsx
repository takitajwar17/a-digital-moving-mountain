import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">This is the landing page</h1>
        <Link 
          href="/display" 
          className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Go to Display
        </Link>
      </div>
    </div>
  );
}