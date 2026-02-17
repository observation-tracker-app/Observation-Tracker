'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ObservationDetailPage({ 
  params 
}: { 
  params: { userId: string; observationId: string } 
}) {
  const router = useRouter();
  const [observation, setObservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReviseForm, setShowReviseForm] = useState(false);
  const [reviseData, setReviseData] = useState({
    revisedLocation: '',
    revisedObservation: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [revising, setRevising] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchObservation();
  }, []);

  const fetchObservation = async () => {
    try {
      const response = await fetch(`/api/observations/${params.observationId}`);
      const data = await response.json();
      setObservation(data.observation);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevising(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('senderUserId', observation.sender.userId);
      formData.append('observationId', observation.observationId);
      formData.append('revisedLocation', reviseData.revisedLocation);
      formData.append('revisedObservation', reviseData.revisedObservation);
      if (photo) formData.append('photo', photo);

      const response = await fetch('/api/observations/revise', {
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

      setMessage('Revision submitted successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setRevising(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl md:text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!observation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-semibold text-gray-600 mb-4">Observation not found</div>
          <Link href={`/${params.userId}/observations`} className="text-purple-600 hover:underline">
            ← Back to Observations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${params.userId}/observations`} className="text-gray-600 hover:text-gray-800 font-semibold text-sm md:text-base">
            ← Back to Observations
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-3 md:p-4 rounded-xl text-sm md:text-base ${
              message.includes('success') || message.includes('Copied') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Observation Header */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  Observation Details
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-gray-600 text-sm md:text-base">
                    ID: <span className="font-mono font-bold text-purple-600">{observation.observationId}</span>
                  </p>
                  <button
  onClick={() => copyToClipboard(observation.observationId)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                </div>
              </div>
              <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-semibold text-sm md:text-base ${
                observation.status === 'revised' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {observation.status}
              </span>
            </div>

            {/* Sender Info */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">Sender Information</h2>
              <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-gray-600 font-semibold text-sm md:text-base">Name:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm md:text-base break-all">{observation.sender.name}</span>
                    <button
  onClick={() => copyToClipboard(observation.sender.name)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-gray-600 font-semibold text-sm md:text-base">User ID:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-purple-600 text-sm md:text-base">{observation.sender.userId}</span>
                    <button
  onClick={() => copyToClipboard(observation.sender.userId)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-gray-600 font-semibold text-sm md:text-base">Email:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm md:text-base break-all">{observation.sender.email}</span>
                    <button
  onClick={() => copyToClipboard(observation.sender.email)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                  </div>
                </div>
              </div>
            </div>

            {/* Original Observation */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">Original Observation</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 font-semibold block mb-2 text-sm md:text-base">Location:</label>
                  <div className="p-3 md:p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 border border-gray-200">
                    <p className="flex-1 text-gray-800 text-sm md:text-base break-words">{observation.location}</p>
                    <button
  onClick={() => copyToClipboard(observation.location)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                  </div>
                </div>
                <div>
                  <label className="text-gray-600 font-semibold block mb-2 text-sm md:text-base">Observation:</label>
                  <div className="p-3 md:p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 border border-gray-200">
                    <p className="flex-1 text-gray-800 whitespace-pre-wrap text-sm md:text-base break-words">{observation.observation}</p>
                    <button
  onClick={() => copyToClipboard(observation.observation)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                  </div>
                </div>
                {observation.photoPath && (
                  <div>
                    <label className="text-gray-600 font-semibold block mb-2 text-sm md:text-base">Photo:</label>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <img 
                        src={observation.photoPath} 
                        alt="Observation" 
                        className="w-full max-w-md object-contain" 
                      />
                    </div>
                  </div>
                )}
                <div className="text-xs md:text-sm text-gray-500 pt-2">
                  <span className="font-semibold">Created:</span> {new Date(observation.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Revisions */}
            {observation.revisions && observation.revisions.length > 0 && (
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                  Revision History ({observation.revisions.length})
                </h2>
                <div className="space-y-4">
                  {observation.revisions.map((revision: any, index: number) => (
                    <div key={revision.id} className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 rounded-r-2xl overflow-hidden">
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                          <h3 className="font-bold text-gray-800 text-base md:text-lg">
                            Revision #{observation.revisions.length - index}
                          </h3>
                          <span className="text-xs md:text-sm text-gray-600 font-semibold">
                            {new Date(revision.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Reviser Info */}
                        <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg">
                          <div className="text-xs md:text-sm space-y-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <span className="text-gray-600">Revised by:</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold break-all">{revision.reviser.name}</span>
                                <button
  onClick={() => copyToClipboard(revision.reviser.name)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <span className="text-gray-600">User ID:</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-semibold text-purple-600">{revision.reviser.userId}</span>
                                <button
  onClick={() => copyToClipboard(revision.reviser.userId)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <span className="text-gray-600">Email:</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold break-all">{revision.reviser.email}</span>
                                <button
  onClick={() => copyToClipboard(revision.reviser.email)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Revised Content */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-gray-600 font-semibold text-xs md:text-sm block mb-1">Revised Location:</label>
                            <div className="p-2 md:p-3 bg-white bg-opacity-60 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <p className="flex-1 text-xs md:text-sm text-gray-800 break-words">{revision.revisedLocation}</p>
                              <button
  onClick={() => copyToClipboard(revision.revisedLocation)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                            </div>
                          </div>
                          <div>
                            <label className="text-gray-600 font-semibold text-xs md:text-sm block mb-1">Revised Observation:</label>
                            <div className="p-2 md:p-3 bg-white bg-opacity-60 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <p className="flex-1 text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words">{revision.revisedObservation}</p>
                              <button
  onClick={() => copyToClipboard(revision.revisedObservation)}
  className="group relative w-full sm:w-auto p-2 
             rounded-lg 
             bg-black 
             border border-cyan-400 
             shadow-[0_0_8px_rgba(34,211,238,0.6)] 
             hover:shadow-[0_0_18px_rgba(34,211,238,1)] 
             transition-all duration-300 
             active:scale-95 
             whitespace-nowrap"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:stroke-white transition-all duration-300"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
</button>

                            </div>
                          </div>
                          {revision.revisedPhotoPath && (
                            <div>
                              <label className="text-gray-600 font-semibold text-xs md:text-sm block mb-1">Revised Photo:</label>
                              <div className="overflow-hidden rounded-lg border border-gray-200">
                                <img 
                                  src={revision.revisedPhotoPath} 
                                  alt="Revised" 
                                  className="w-full max-w-sm object-contain" 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revise Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowReviseForm(!showReviseForm)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                {showReviseForm ? 'Cancel Revision' : 'Revise This Observation'}
              </button>
            </div>
          </div>

          {/* Revise Form */}
          {showReviseForm && (
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-gray-100">
              <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
                Submit Revision
              </h2>

              <form onSubmit={handleReviseSubmit} className="space-y-6">
                {/* Pre-filled fields (readonly) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Sender User ID (Auto-filled)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={observation.sender.userId}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 font-mono font-semibold text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observation ID (Auto-filled)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={observation.observationId}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 font-mono font-semibold text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Revised Location *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter the updated location..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none resize-none text-sm md:text-base"
                    value={reviseData.revisedLocation}
                    onChange={(e) => setReviseData({...reviseData, revisedLocation: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Revised Observation *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Enter the updated observation details..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none resize-none text-sm md:text-base"
                    value={reviseData.revisedObservation}
                    onChange={(e) => setReviseData({...reviseData, revisedObservation: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Revised Photo (Optional) 5MB (max.)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm md:text-base"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={revising}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revising ? 'Submitting Revision...' : 'Submit Revision'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
