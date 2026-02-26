import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, UserCheck, Users, Trash2 } from 'lucide-react';
import supabase from '../../lib/supabase.js';
import { deleteUser } from '../../lib/api.js';

const ROLES = ['admin', 'club_exec', 'student'];
const ROLE_LABELS = { admin: 'Admin', club_exec: 'Vendor', student: 'User' };

export default function AdminUsersPanel() {
  const [users, setUsers]   = useState([]);
  const [clubs, setClubs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(null); // user id being saved

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [usersRes, clubsRes] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, role, club_id, is_exec_approved, created_at, clubs(name)')
        .order('created_at', { ascending: false }),
      supabase.from('clubs').select('id, name').order('name'),
    ]);
    if (usersRes.error) setError(usersRes.error.message);
    else setUsers(usersRes.data ?? []);
    if (clubsRes.error) setError(clubsRes.error.message);
    else setClubs(clubsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id, patch) => {
    setSaving(id);
    setError('');
    const { error: err } = await supabase.from('users').update(patch).eq('id', id);
    if (err) setError(err.message);
    else setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
    setSaving(null);
  };

  const approveExec = (id) => update(id, { is_exec_approved: true, role: 'club_exec' });
  const revokeExec  = (id) => update(id, { is_exec_approved: false });
  const setRole = (id, role) => {
    const patch = { role };
    // Auto-approve admins; auto-revoke students
    if (role === 'admin') patch.is_exec_approved = true;
    if (role === 'student') patch.is_exec_approved = false;
    update(id, patch);
  };
  const setClub     = (id, club_id) => update(id, { club_id: club_id || null });

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Permanently delete user ${email ?? id}? This cannot be undone.`)) return;
    setSaving(id);
    setError('');
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''} in system</p>
        <button onClick={load} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Email', 'Role', 'Organization', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">Loading users…</td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No users yet. Users appear here after their first sign-in.</p>
                  </td>
                </tr>
              )}
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50/70 ${saving === u.id ? 'opacity-60' : ''}`}>
                  {/* Email */}
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-800 text-sm">{u.email ?? '—'}</div>
                    <div className="font-mono text-xs text-gray-400 mt-0.5" title={u.id}>{u.id.slice(0, 8)}…</div>
                  </td>

                  {/* Role dropdown */}
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={e => setRole(u.id, e.target.value)}
                      disabled={saving === u.id}
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                    </select>
                  </td>

                  {/* Club dropdown */}
                  <td className="px-5 py-3.5">
                    <select
                      value={u.club_id ?? ''}
                      onChange={e => setClub(u.id, e.target.value)}
                      disabled={saving === u.id}
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white max-w-[150px]"
                    >
                      <option value="">— No organization —</option>
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>

                  {/* Exec approved */}
                  <td className="px-5 py-3.5">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Approved
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.is_exec_approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.is_exec_approved ? 'Approved' : 'Not approved'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {u.role === 'club_exec' && !u.is_exec_approved && (
                        <button
                          onClick={() => approveExec(u.id)}
                          disabled={saving === u.id}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md hover:bg-green-100 disabled:opacity-50 transition-colors"
                        >
                          <UserCheck className="w-3 h-3" />
                          Approve
                        </button>
                      )}
                      {u.is_exec_approved && (
                        <button
                          onClick={() => revokeExec(u.id)}
                          disabled={saving === u.id}
                          className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-100 disabled:opacity-50 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={saving === u.id}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                        title="Delete user permanently"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
