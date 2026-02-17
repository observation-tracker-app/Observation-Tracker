import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardPage({ params }: { params: { userId: string } }) {
  const user = await getCurrentUser();

  if (!user || user.userId !== params.userId) {
    redirect('/login');
  }

  const handleLogout = async () => {
    'use server';
    const { cookies } = await import('next/headers');
    cookies().delete('userId');
    redirect('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Observation Tracker
          </h1>
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-600">Your User ID: <span className="font-mono font-semibold text-purple-600">{user.userId}</span></p>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* New Observation */}
            <Link
              href={`/${user.userId}/new-observation`}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-3xl mr-4 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">New Observation</h3>
                  <p className="text-gray-600">Create a new observation</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Document and share observations with recipients
              </p>
            </Link>

            {/* Revise Observation */}
            <Link
              href={`/${user.userId}/revise-observation`}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl mr-4 group-hover:scale-110 transition-transform">
                  🔄
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Revise Observation</h3>
                  <p className="text-gray-600">Update existing observations</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Revise and update observation details
              </p>
            </Link>

            {/* Observations */}
            <Link
              href={`/${user.userId}/observations`}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-3xl mr-4 group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Observations</h3>
                  <p className="text-gray-600">View all observations</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Browse and filter your observations
              </p>
            </Link>

            {/* Settings */}
            <Link
              href={`/${user.userId}/settings`}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-3xl mr-4 group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Settings</h3>
                  <p className="text-gray-600">Manage your account</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Update profile and personal notebook
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
