"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, Key, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type TrackLog = {
  id: string;
  title: string;
  style: string;
  prompt: string;
  status: string;
  audio_url: string | null;
  created_at: string;
  user_id: string;
};

type SunoData = {
  data?: {
    limit: number;
    usage: number;
    left: number;
  };
  msg?: string;
  // If the API returns something else, we try to capture it
  credits_left?: number;
} | null;

export default function AISupervisionPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total24h: 0,
    successful24h: 0,
    failed24h: 0,
    pending24h: 0
  });
  const [logs, setLogs] = useState<TrackLog[]>([]);
  const [sunoData, setSunoData] = useState<SunoData>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/suno');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.logs) setLogs(data.logs);
        if (data.sunoData) setSunoData(data.sunoData);
      }
    } catch (e) {
      console.error("Failed to fetch supervision stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Determine Credits left
  // Since sunoapi.org wrappers vary in response, we try multiple possible fields.
  let creditsLeft: number | string = "---";
  if (sunoData) {
    if (sunoData.data?.left !== undefined) creditsLeft = sunoData.data.left;
    else if (sunoData.credits_left !== undefined) creditsLeft = sunoData.credits_left;
  }

  // Calculate percentages for the progress bar
  const total = stats.total24h || 1; // Prevent div by zero
  const successPct = Math.round((stats.successful24h / total) * 100);
  const failedPct = Math.round((stats.failed24h / total) * 100);
  const pendingPct = Math.round((stats.pending24h / total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord API</h1>
          <p className="text-muted-foreground mt-1">Suivez vos activités et analysez vos performances en temps réel avec Suno.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Key className="w-4 h-4" /> Clé API
          </Button>
          <Button onClick={fetchStats} disabled={loading} className="gap-2 bg-primary hover:bg-primary/90 text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dernières 24 heures Card */}
        <div className="bg-[#111111] text-white rounded-xl p-6 border border-white/10 shadow-lg">
          <h2 className="font-bold text-lg mb-6">Dernières 24 heures</h2>
          
          <div className="space-y-6">
            {/* Success Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> Réussi
                </span>
                <span>{stats.successful24h} <span className="text-emerald-400/80">({successPct}%)</span></span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${successPct}%` }} />
              </div>
            </div>

            {/* Error Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" /> Échec
                </span>
                <span>{stats.failed24h} <span className="text-red-400/80">({failedPct}%)</span></span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${failedPct}%` }} />
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-4 h-4 border-2 border-current rounded-full opacity-50" /> Autre
                </span>
                <span>{stats.pending24h} <span className="text-gray-400">({pendingPct}%)</span></span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: `${pendingPct}%` }} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-lg mt-4">
              <span>Nombre total de requêtes</span>
              <span>{stats.total24h}</span>
            </div>
          </div>
        </div>

        {/* Credits Card */}
        <div className="bg-[#111111] text-white rounded-xl p-6 border border-white/10 shadow-lg flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h2 className="font-bold text-lg">Crédits disponibles</h2>
            <AlertCircle className="w-5 h-5 text-yellow-500/80" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="animate-pulse w-32 h-16 bg-white/10 rounded-xl" />
            ) : (
              <p className="text-6xl md:text-7xl font-black">{creditsLeft}</p>
            )}
            <p className="text-gray-400 mt-4 text-sm">
              Assurez-vous de recharger votre compte sur Suno lorsque ce solde devient faible pour éviter les interruptions de service.
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111111] text-white rounded-xl border border-white/10 shadow-lg overflow-hidden mt-8">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#161616]">
          <h2 className="font-bold text-lg">Journaux récents</h2>
          <span className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full font-medium">Aperçu des dernières actions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#1A1A1A]">
              <tr>
                <th className="px-6 py-4">Temps</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Prompt & Style</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Task ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">Chargement des journaux...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">Aucun journal trouvé dans les dernières 24h.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === 'completed' || (log.status === 'processing' && log.audio_url && !log.audio_url.startsWith('task:'));
                  const isFailed = log.status === 'failed';
                  const taskId = log.audio_url?.startsWith('task:') ? log.audio_url.replace('task:', '') : (log.audio_url ? 'terminé' : 'N/A');

                  return (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(log.created_at).toLocaleString('fr-FR', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-white/10 rounded text-xs">generate</span>
                      </td>
                      <td className="px-6 py-4 max-w-75">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold truncate text-white">{log.title}</span>
                          <span className="text-xs text-gray-400 truncate">Style: {log.style}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 truncate">{log.prompt.substring(0, 40)}...</span>
                            <button onClick={() => handleCopy(log.prompt, log.id)} className="text-gray-500 hover:text-white transition-colors">
                              {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isSuccess ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Réussi
                          </span>
                        ) : isFailed ? (
                          <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-red-500" /> Échec
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        {taskId}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
