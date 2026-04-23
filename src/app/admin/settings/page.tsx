'use client';

import { useState } from 'react';
import { Save, Shield, Globe, Bell, Palette } from 'lucide-react';

export default function AdminSettingsPage() {
  const [discordBotToken, setDiscordBotToken] = useState('');
  const [discordGuildId, setDiscordGuildId] = useState('');
  const [notionApiKey, setNotionApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave(): void {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/40">Platform configuration</p>
      </div>

      {/* Discord Integration */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-white/30" />
          <h2 className="text-lg font-semibold text-white">Discord Integration</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Bot Token</label>
            <input type="password" value={discordBotToken} onChange={(e) => setDiscordBotToken(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" placeholder="Bot token..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Guild (Server) ID</label>
            <input type="text" value={discordGuildId} onChange={(e) => setDiscordGuildId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" placeholder="Server ID..." />
          </div>
        </div>
        <p className="text-xs text-white/20">
          Configure Discord bot for automatic role assignment and secure invite generation.
        </p>
      </div>

      {/* Notion Integration */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-white/30" />
          <h2 className="text-lg font-semibold text-white">Notion Integration</h2>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">API Key</label>
          <input type="password" value={notionApiKey} onChange={(e) => setNotionApiKey(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" placeholder="Notion API key..." />
        </div>
        <p className="text-xs text-white/20">
          Sync calendar events from Notion automatically.
        </p>
      </div>

      {/* Platform Info */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-white/30" />
          <h2 className="text-lg font-semibold text-white">Platform</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/30">Name</p>
            <p className="text-white">Mellow{"'"}s Hive</p>
          </div>
          <div>
            <p className="text-white/30">Theme</p>
            <p className="text-white">Black & White Premium</p>
          </div>
          <div>
            <p className="text-white/30">Auth</p>
            <p className="text-white">Discord OAuth + Admin Credentials</p>
          </div>
          <div>
            <p className="text-white/30">Payments</p>
            <p className="text-white">Razorpay (INR)</p>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
        <Save size={16} /> {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
