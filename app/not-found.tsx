import Link from 'next/link';
import MobileContainer from "@/components/MobileContainer";

export default function NotFound() {
    return (
        <MobileContainer>
            <div className="flex flex-col items-center justify-center h-screen text-center px-6">
                <h2 className="text-3xl font-bold mb-2">Oops!</h2>
                <p className="mb-6 text-gray-500">We can&apos;t find that page.</p>
                <Link href="/" className="bg-black text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-gray-800 transition">
                    Return Home
                </Link>
            </div>
        </MobileContainer>
    );
}
