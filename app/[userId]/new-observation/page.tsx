'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewObservationPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [recipients, setRecipients] = useState(['']);
  const [location, setLocation] = useState('');
  const [observation, setObservation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value.toUpperCase();
    setRecipients(newRecipients);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('recipients', JSON.stringify(recipients.filter(r => r.trim())));
      formData.append('location', location);
      formData.append('observation', observation);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/observations/create', {
        method: 'POST',
        body: formData,
      });

      let result;
try {
  result = await response.json();
} catch {
  throw new Error('Something went wrong. Please try again');
}

if (!response.ok) {
  throw new Error(result.error || 'Failed to create observation');
}

      setSuccess(`Observation created successfully! ID: ${result.observationId}`);
      setTimeout(() => {
        router.push(`/${params.userId}`);
      }, 2000);
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
          <Link href={`/${params.userId}`} className="text-gray-600 hover:text-gray-800">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Create New Observation
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
              {/* Recipients */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Any other IDs except:-
                  <br />
                  1&#41; subratahaldia@yahoo.co.in
                  <br />
                  2&#41; akmaji@tmilltd.com
                </label>
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="USER ID (6 characters)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none uppercase font-mono"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                    />
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecipient(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRecipient}
                  className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold"
                >
                  + Add Recipient
                </button>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <textarea
                  id="location"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Observation */}
              <div>
                <label htmlFor="observation" className="block text-sm font-semibold text-gray-700 mb-2">
                  Observation
                </label>
                <textarea
                  id="observation"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label htmlFor="photo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo/File (Optional) 5MB (max.)
                </label>
                <input
                  type="file"
                  required={true}
                  id="photo"
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Observation...' : 'Submit Observation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
