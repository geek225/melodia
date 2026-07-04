"use client";

import { useEffect, useState } from "react";
import { getAdminLogs } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ServerCrash, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminLogsClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getAdminLogs();
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => 
    log.endpoint?.toLowerCase().includes(search.toLowerCase()) || 
    log.error_message?.toLowerCase().includes(search.toLowerCase()) ||
    log.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher (endpoint, erreur, email)..." 
            className="pl-9 rounded-xl bg-background border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Statut</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucun journal (log) trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const isError = log.status_code >= 400;
                return (
                  <TableRow key={log.id} className="border-border/50">
                    <TableCell>
                      {isError ? (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0 font-mono">
                          <ServerCrash className="w-3 h-3 mr-1" /> {log.status_code}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0 font-mono">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {log.status_code}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs uppercase">{log.method || 'GET'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-50 truncate">
                      {log.endpoint}
                    </TableCell>
                    <TableCell>{log.profiles?.email || "Système"}</TableCell>
                    <TableCell className="max-w-62.5 truncate">
                      {log.error_message ? (
                        <span className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{log.error_message}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Succès</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
