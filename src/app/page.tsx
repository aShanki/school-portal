import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">

      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to Our School Portal
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Access grades, assignments, and stay connected with our online school management system.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Teacher Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">For Teachers</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Manage student grades</li>
                <li>• Track attendance</li>
                <li>• Create assignments</li>
                <li>• Generate reports</li>
              </ul>
            </div>

            {/* Student Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">For Students</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• View grades</li>
                <li>• Submit assignments</li>
                <li>• Check attendance</li>
                <li>• Message teachers</li>
              </ul>
            </div>

            {/* Parent Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">For Parents</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Monitor progress</li>
                <li>• View report cards</li>
                <li>• Track attendance</li>
                <li>• Communicate with staff</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-600">
          <p>© 2024 School Name. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}