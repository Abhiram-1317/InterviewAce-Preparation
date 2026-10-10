import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function HistoryView() {
  const navigate = useNavigate();
  const { sessionsHistory, toggleArchiveSession, showToast } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showSampleEntries, setShowSampleEntries] = useState(true);

  const filteredSessions = useMemo(() => {
    return sessionsHistory.filter((s) => {
      // Sample filter
      if (!showSampleEntries && s.isSample) return false;

      // Status filter
      if (statusFilter === 'Completed' && s.status !== 'Completed') return false;
      if (statusFilter === 'In-Progress' && s.status !== 'In-Progress') return false;
      if (statusFilter === 'Archived' && !s.isArchived) return false;
      if (statusFilter !== 'Archived' && s.isArchived) return false;

      // Search box filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCompany = s.company.toLowerCase().includes(query);
        const matchesRole = s.role.toLowerCase().includes(query);
        if (!matchesCompany && !matchesRole) return false;
      }

      return true;
    });
  }, [sessionsHistory, searchQuery, statusFilter, showSampleEntries]);

  return (
    <div className="content-container pt-11 pb-24 space-y-6">
      <div className="border-b border-[#e7e5e1] pb-4">
        <h2 className="h2-title text-[#111111]">Practice history</h2>
        <p className="text-[14px] text-[#6b6b6b] mt-0.5">
          Review all prior practice runs, inspect score reports, and manage archived sessions.
        </p>
      </div>

      {/* Controls: Search, Status filters, and Show sample entries checkbox */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company or role..."
            className="spec-input max-w-sm text-[13px]"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Completed', 'In-Progress', 'Archived'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? 'btn-primary py-1 px-3 text-[13px]' : 'btn-secondary py-1 px-3 text-[13px]'}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-[13px] text-[#6b6b6b] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSampleEntries}
            onChange={(e) => setShowSampleEntries(e.target.checked)}
            className="accent-[#111111] rounded"
          />
          <span>Show sample entries (Stripe, Databricks, Snowflake, Meta)</span>
        </label>
      </div>

      {/* One card with session rows */}
      <div className="spec-card p-0 divide-y divide-[#e7e5e1] overflow-hidden">
        {filteredSessions.map((session) => (
          <div key={session.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf9f6]/50 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-[#111111]">{session.company}</span>
                <span className={`chip text-[11px] ${session.status === 'Completed' ? 'chip-strong' : ''}`}>
                  {session.status}
                </span>
                {session.isSample && <span className="chip text-[11px]">Sample</span>}
              </div>
              <p className="text-[13px] text-[#6b6b6b]">
                {session.role} · {session.date} · {session.mode}
              </p>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <span className="font-serif text-[22px] font-medium text-[#111111]">
                {session.score}%
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/reports')}
                  className="btn-secondary py-1 px-2.5 text-[12px]"
                >
                  View report
                </button>

                {!session.isSample && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleArchiveSession(session.id);
                      showToast(session.isArchived ? 'Session restored' : 'Session archived');
                    }}
                    className="btn-ghost text-[12px] p-1"
                  >
                    {session.isArchived ? 'Restore' : 'Archive'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="p-12 text-center text-[14px] text-[#6b6b6b]">
            No sessions match your search or filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
