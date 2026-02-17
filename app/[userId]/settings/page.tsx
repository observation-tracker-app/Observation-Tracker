'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [showNotebook, setShowNotebook] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContact, setNewContact] = useState({ name: '', userId: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchContacts();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me');
      const data = await response.json();
      setUser(data.user);
      setName(data.user.name);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/users/notebook');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const updateName = async () => {
    if (!name.trim()) {
      setMessage('Name cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setMessage('Name updated successfully!');
        await fetchUserData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      setMessage('Error updating name');
    } finally {
      setUpdating(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name.trim() || !newContact.userId.trim()) {
      setMessage('Please fill in both name and user ID');
      return;
    }

    try {
      const response = await fetch('/api/users/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });

      const data = await response.json();

      if (response.ok) {
        setNewContact({ name: '', userId: '' });
        await fetchContacts();
        setMessage('Contact added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      setMessage('Error adding contact');
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/users/notebook?id=${id}`, { 
        method: 'DELETE' 
      });

      if (response.ok) {
        await fetchContacts();
        setMessage('Contact deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      setMessage('Error deleting contact');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${params.userId}`} className="text-gray-600 hover:text-gray-800 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 md:mb-8">
            Settings
          </h1>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 md:p-4 rounded-xl text-sm md:text-base ${
              message.includes('success') || message.includes('Copied') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* User Info */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Profile Information</h2>
            <div className="space-y-4">
              {/* User ID */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-semibold text-sm md:text-base">User ID:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-purple-600 text-base md:text-lg break-all">{user.userId}</span>
                  <button
  onClick={() => copyToClipboard(user.userId)}
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
              
              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3 border-b border-gray-200">
                <span className="text-gray-600 font-semibold text-sm md:text-base">Email:</span>
                <span className="font-semibold text-gray-800 text-sm md:text-base break-all">{user.email}</span>
              </div>
              
              {/* Name */}
              <div className="flex flex-col gap-3 py-3">
                <span className="text-gray-600 font-semibold text-sm md:text-base">Name:</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-sm md:text-base"
                  />
                  <button
                    onClick={updateName}
                    disabled={updating}
                    className="w-full sm:w-auto px-4 py-2.5 md:px-6 md:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all disabled:opacity-50 text-sm md:text-base whitespace-nowrap"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Profile Photo */}
              {user.profilePhoto && (
                <div className="py-3">
                  <span className="text-gray-600 font-semibold block mb-3 text-sm md:text-base">Profile Photo:</span>
                  <img 
                    src={user.profilePhoto} 
                    alt="Profile" 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg border-4 border-purple-200" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Personal Notebook */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Personal Notebook</h2>
              <button
                onClick={() => setShowNotebook(!showNotebook)}
                className="w-full sm:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold transition-all shadow-lg text-sm md:text-base"
              >
                {showNotebook ? 'Hide' : 'Show'} Notebook
              </button>
            </div>

            {showNotebook && (
              <div className="space-y-6">
                {/* Add New Contact */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 rounded-2xl border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Add New Contact</h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-sm md:text-base"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="USER ID"
                        maxLength={6}
                        value={newContact.userId}
                        onChange={(e) => setNewContact({...newContact, userId: e.target.value.toUpperCase()})}
                        className="flex-1 px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg uppercase font-mono focus:ring-2 focus:ring-purple-600 outline-none text-sm md:text-base"
                      />
                      <button
                        onClick={addContact}
                        className="px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all text-sm md:text-base whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contacts List */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Saved Contacts ({contacts.length})</h3>
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm md:text-base">
                      No contacts saved yet. Add your first contact above!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.map((contact) => (
                        <div 
                          key={contact.id} 
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="break-all">
                            <span className="font-semibold text-gray-800 text-sm md:text-lg block sm:inline">{contact.name}</span>
                            <span className="ml-0 sm:ml-4 font-mono text-purple-600 font-bold text-sm md:text-base block sm:inline mt-1 sm:mt-0">{contact.contactUserId}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
  onClick={() => copyToClipboard(user.userId)}
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

                            <button
                              onClick={() => deleteContact(contact.id)}
                              className="flex-1 sm:flex-none px-3 py-2 md:px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
