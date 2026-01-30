import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

export default async function Navigation() {
  const session = await auth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/stats"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Stats
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{session?.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
