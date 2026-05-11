import React from 'react';
import { CAMPAIGNS } from '../data/masterData';

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Archived: 'bg-white/10 text-white/40 border-white/10',
};

const TYPE_ICON: Record<string, string> = {
  Monthly: '📆',
  Quarterly: '📅',
  'Bi-Annually': '🗓',
  Custom: '⚙️',
};

export function CampaignsSheet() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">📅 Evaluation Campaigns</h1>
        <p className="text-white/60">Track all evaluation campaigns — from drafts to completed reviews.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CAMPAIGNS.map(campaign => (
          <div key={campaign.id} className="rounded-xl border border-white/10 bg-slate-800/40 p-5 hover:border-amber-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-3xl shrink-0">{TYPE_ICON[campaign.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-white">{campaign.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/50">
                  <span>Type: <span className="text-white/70">{campaign.type}</span></span>
                  <span>Department: <span className="text-white/70">{campaign.department}</span></span>
                  <span>Period: <span className="text-white/70">{campaign.startDate} → {campaign.endDate}</span></span>
                  <span>ID: <span className="font-mono text-amber-400/70 text-xs">{campaign.id}</span></span>
                </div>
                {campaign.notes && (
                  <p className="text-sm text-white/40 mt-1.5 italic">{campaign.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
