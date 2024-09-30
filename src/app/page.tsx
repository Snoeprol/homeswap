import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, HomeIcon, SearchIcon, KeyIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Swap Homes, Create Memories
          </h1>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Experience new places like a local. HouseSwap connects you with homeowners worldwide for unforgettable exchanges.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            <Link href="/auth" className="inline-flex items-center">
              Start Your Journey
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: HomeIcon, title: "List Your Home", description: "Share your space and set your preferences for the perfect exchange." },
              { icon: SearchIcon, title: "Discover & Connect", description: "Browse homes worldwide and connect with potential swap partners." },
              { icon: KeyIcon, title: "Swap & Experience", description: "Finalize details, exchange keys, and immerse yourself in a new locale." }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-xl">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-full p-4 mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">Featured Homes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow-lg transition-all hover:shadow-xl">
                <Image 
                  src={`/placeholder.svg?height=300&width=400&text=Home+${i}`}
                  alt={`Featured Home ${i}`} 
                  width={400} 
                  height={300} 
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Charming Retreat in Location {i}</h3>
                  <p className="text-gray-600 mb-4">Immerse yourself in local culture and comfort in this beautiful property.</p>
                  <Button variant="outline" className="w-full text-orange-500 border-orange-500 hover:bg-orange-50">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center mb-20 bg-white rounded-xl shadow-lg p-10">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">Join our community of home swappers and unlock a world of unique travel experiences.</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            <Link href="/auth" className="inline-flex items-center">
              Get Started Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </div>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About HouseSwap</h3>
              <p className="text-gray-400">Connecting homeowners worldwide for unforgettable travel experiences.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/browse" className="text-gray-400 hover:text-white transition-colors">Browse Homes</Link></li>
                <li><Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Login / Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/safety" className="text-gray-400 hover:text-white transition-colors">Safety Guide</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} HouseSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}