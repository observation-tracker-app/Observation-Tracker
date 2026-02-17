'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviseObservationPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    senderUserId: '',
    observationId: '',
    revisedLocation: '',
    revisedObservation: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('senderUserId', formData.senderUserId.toUpperCase());
      data.append('observationId', formData.observationId.toUpperCase());
      data.append('revisedLocation', formData.revisedLocation);
      data.append('revisedObservation', formData.revisedObservation);
      if (photo) data.append('photo', photo);

      const response = await fetch('/api/observations/revise', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to revise observation');
      }

      setSuccess('Observation revised successfully!');
      setTimeout(() => router.push(`/${params.userId}/observations`), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${params.userId}`} className="text-gray-600 hover:text-gray-800 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
              Revise Observation
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Original Sender User ID
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="ABCD12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none uppercase font-mono"
                  value={formData.senderUserId}
                  onChange={(e) => setFormData({...formData, senderUserId: e.target.value.toUpperCase()})}
                />
                <p className="text-xs text-gray-500 mt-1">The user ID of the person who created the original observation</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observation ID
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="XYZ789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none uppercase font-mono"
                  value={formData.observationId}
                  onChange={(e) => setFormData({...formData, observationId: e.target.value.toUpperCase()})}
                />
                <p className="text-xs text-gray-500 mt-1">The unique ID of the observation you want to revise</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Revised Location
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter the updated location..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
                  value={formData.revisedLocation}
                  onChange={(e) => setFormData({...formData, revisedLocation: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Revised Observation
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Enter the updated observation details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
                  value={formData.revisedObservation}
                  onChange={(e) => setFormData({...formData, revisedObservation: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Revised Photo/File (Optional) 5MB (max.)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-1">Upload a new photo if you want to replace the original</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting Revision...' : 'Submit Revision'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
