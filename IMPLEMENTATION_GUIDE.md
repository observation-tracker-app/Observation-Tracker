# Complete Implementation Guide

## Remaining Files to Create

### 1. Revise Observation Page
**File: `app/[userId]/revise-observation/page.tsx`**

```typescript
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
      setTimeout(() => router.push(`/${params.userId}`), 2000);
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none uppercase font-mono"
                  value={formData.senderUserId}
                  onChange={(e) => setFormData({...formData, senderUserId: e.target.value.toUpperCase()})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observation ID
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none uppercase font-mono"
                  value={formData.observationId}
                  onChange={(e) => setFormData({...formData, observationId: e.target.value.toUpperCase()})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Revised Location
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none resize-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none resize-none"
                  value={formData.revisedObservation}
                  onChange={(e) => setFormData({...formData, revisedObservation: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Revised Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
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
```

### 2. Revise Observation API
**File: `app/api/observations/revise/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendRevisionEmails, sendInvalidRevisionEmail } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const senderUserId = (formData.get('senderUserId') as string).toUpperCase();
    const observationId = (formData.get('observationId') as string).toUpperCase();
    const revisedLocation = formData.get('revisedLocation') as string;
    const revisedObservation = formData.get('revisedObservation') as string;
    const photoFile = formData.get('photo') as File | null;

    // Find the observation
    const observation = await prisma.observation.findUnique({
      where: { observationId },
      include: { sender: true },
    });

    if (!observation) {
      await sendInvalidRevisionEmail(user.email, observationId, senderUserId);
      return NextResponse.json(
        { error: 'Invalid observation ID or sender ID' },
        { status: 400 }
      );
    }

    // Verify sender user ID matches
    if (observation.sender.userId !== senderUserId) {
      await sendInvalidRevisionEmail(user.email, observationId, senderUserId);
      return NextResponse.json(
        { error: 'Sender ID does not match observation' },
        { status: 400 }
      );
    }

    // Handle photo upload
    let photoPath: string | undefined;
    if (photoFile) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}
      const fileName = `${Date.now()}-${photoFile.name}`;
      await writeFile(join(uploadDir, fileName), buffer);
      photoPath = `/uploads/${fileName}`;
    }

    // Create revision
    await prisma.revision.create({
      data: {
        observationId: observation.id,
        reviserId: user.id,
        revisedLocation,
        revisedObservation,
        revisedPhotoPath: photoPath,
      },
    });

    // Update observation status
    await prisma.observation.update({
      where: { id: observation.id },
      data: { status: 'revised' },
    });

    // Send emails
    await sendRevisionEmails(
      observation.sender.email,
      observation.sender.name,
      observation.sender.userId,
      user.email,
      user.name,
      user.userId,
      observationId,
      observation.location,
      observation.observation,
      revisedLocation,
      revisedObservation,
      observation.photoPath ? join(process.cwd(), 'public', observation.photoPath) : undefined,
      photoPath ? join(process.cwd(), 'public', photoPath) : undefined
    );

    return NextResponse.json({ message: 'Revision created successfully' });
  } catch (error) {
    console.error('Error revising observation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. Observations List API
**File: `app/api/observations/list/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'revised' or 'unrevised'
    const sort = searchParams.get('sort') || 'desc'; // 'asc' or 'desc'

    const observations = await prisma.observation.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { recipients: { some: { recipientId: user.id } } }
        ],
        ...(filter && { status: filter })
      },
      include: {
        sender: true,
        revisions: {
          include: { reviser: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
    });

    return NextResponse.json({ observations });
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 4. Observations List Page
**File: `app/[userId]/observations/page.tsx`**

```typescript
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
          <Link href={`/${params.userId}`} className="text-gray-600 hover:text-gray-800">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            Observations
          </h1>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              >
                <option value="all">All</option>
                <option value="unrevised">Unrevised</option>
                <option value="revised">Revised</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by Date</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Observations List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : observations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No observations found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Observation ID</th>
                    <th className="px-6 py-4 text-left">Sender ID</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((obs) => (
                    <tr
                      key={obs.id}
                      onClick={() => router.push(`/${params.userId}/observations/${obs.observationId}`)}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-semibold">{obs.observationId}</td>
                      <td className="px-6 py-4 font-mono">{obs.sender.userId}</td>
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
```

### 5. Settings Page
**File: `app/[userId]/settings/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SettingsPage({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [showNotebook, setShowNotebook] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContact, setNewContact] = useState({ name: '', userId: '' });

  useEffect(() => {
    fetchUserData();
    fetchContacts();
  }, []);

  const fetchUserData = async () => {
    const response = await fetch('/api/users/me');
    const data = await response.json();
    setUser(data.user);
    setName(data.user.name);
  };

  const fetchContacts = async () => {
    const response = await fetch('/api/users/notebook');
    const data = await response.json();
    setContacts(data.contacts || []);
  };

  const updateName = async () => {
    await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    await fetchUserData();
  };

  const addContact = async () => {
    await fetch('/api/users/notebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact),
    });
    setNewContact({ name: '', userId: '' });
    await fetchContacts();
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/users/notebook?id=${id}`, { method: 'DELETE' });
    await fetchContacts();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${params.userId}`} className="text-gray-600 hover:text-gray-800">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            Settings
          </h1>

          {/* User Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">User ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-600">{user.userId}</span>
                  <button
                    onClick={() => copyToClipboard(user.userId)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <button
                    onClick={updateName}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Notebook */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Personal Notebook</h2>
              <button
                onClick={() => setShowNotebook(!showNotebook)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {showNotebook ? 'Hide' : 'Show'}
              </button>
            </div>

            {showNotebook && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="User ID"
                    maxLength={6}
                    value={newContact.userId}
                    onChange={(e) => setNewContact({...newContact, userId: e.target.value.toUpperCase()})}
                    className="w-32 px-4 py-2 border rounded-lg uppercase font-mono"
                  />
                  <button
                    onClick={addContact}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-semibold">{contact.name}</span>
                        <span className="ml-4 font-mono text-purple-600">{contact.contactUserId}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(contact.contactUserId)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Additional API Routes

### User API Routes
Create these files:

1. `app/api/users/me/route.ts` - Get current user
2. `app/api/users/update/route.ts` - Update user name
3. `app/api/users/notebook/route.ts` - CRUD for personal notebook

See README.md for implementation examples.

## Final Setup Steps

1. Install dependencies: `npm install`
2. Set up `.env` file with Gmail credentials
3. Initialize database: `npx prisma generate && npx prisma db push`
4. Create `public/uploads/` directory
5. Run development server: `npm run dev`

All files follow the same styling patterns and architecture established in the main files.
