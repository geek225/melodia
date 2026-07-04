"use client";

import { useEffect, useState } from "react";
import { getAdminTransactions } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPaymentsClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await getAdminTransactions();
    if (res.success && res.data) {
      setTransactions(res.data);
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter((t) => 
    (t.reference || t.stripe_session_id || "").toLowerCase().includes(search.toLowerCase()) || 
    t.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par email ou session..." 
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
              <TableHead>Montant</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Référence</TableHead>
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
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucun paiement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-border/50">
                  <TableCell className="font-bold text-emerald-500">
                    {tx.amount} {tx.currency || "FCFA"}
                  </TableCell>
                  <TableCell>{tx.profiles?.email || "Inconnu"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal uppercase text-xs">{tx.type || "Abonnement"}</Badge>
                  </TableCell>
                  <TableCell>
                    {tx.status === 'success' || tx.status === 'completed' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Payé</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0"><XCircle className="w-3 h-3 mr-1" /> Échoué</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(tx.created_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono max-w-37.5 truncate">
                    {tx.reference || tx.stripe_session_id || "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
