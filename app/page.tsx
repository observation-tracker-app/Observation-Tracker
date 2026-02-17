import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Observation Tracker
            </h1>
            <p className="text-xl text-gray-600">
              Track, manage, and collaborate on observations with ease
            </p>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                Welcome to Observation Tracker
              </h2>
              <p className="text-gray-600 text-lg">
                A powerful platform for creating, tracking, and revising observations with real-time notifications
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Create Observations</h3>
                <p className="text-sm text-gray-600">Document and share observations with your team</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-4xl mb-3">🔄</div>
                <h3 className="font-semibold text-gray-800 mb-2">Revise & Update</h3>
                <p className="text-sm text-gray-600">Keep observations current with revision tracking</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100">
                <div className="text-4xl mb-3">📧</div>
                <h3 className="font-semibold text-gray-800 mb-2">Email Notifications</h3>
                <p className="text-sm text-gray-600">Stay informed with automatic email updates</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-6">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600 transform hover:-translate-y-1 transition-all duration-200"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">✨ Key Features</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unique 6-digit user IDs for easy identification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Multi-recipient observation sharing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Photo attachments support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Comprehensive revision history</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🔒 Secure & Reliable</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Secure authentication system</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Real-time email notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Personal notebook for contacts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Advanced filtering and sorting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
