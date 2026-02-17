'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Observation {
  id: string;
  observationId: string;
  status: string;
  createdAt: string;
  sender: {
    userId: string;
    name: string;
  };
}

export default function ObservationsPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObservations();
  }, [filter, sort]);

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const filterParam = filter !== 'all' ? `&filter=${filter}` : '';
      const response = await fetch(`/api/observations/list?sort=${sort}${filterParam}`);
      const data = await response.json();
      setObservations(data.observations || []);
    } catch (error) {
      console.error('Error fetching observations:', error);
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            Observations
          </h1>

          {/* Filters - Side by Side */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-gray-800"
                >
                  <option value="all">All</option>
                  <option value="unrevised">Unrevised</option>
                  <option value="revised">Revised</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by Date</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-gray-800"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observations List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : observations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No observations found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Observation ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Sender ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((obs) => (
                    <tr
                      key={obs.id}
                      onClick={() => router.push(`/${params.userId}/observations/${obs.observationId}`)}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-gray-800">{obs.observationId}</td>
                      <td className="px-6 py-4 font-mono text-gray-800">{obs.sender.userId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          obs.status === 'revised' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {obs.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(obs.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
