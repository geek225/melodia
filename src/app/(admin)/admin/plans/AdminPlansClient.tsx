"use client";

import { useEffect, useState } from "react";
import { getAdminPlans } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AdminPlansClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await getAdminPlans();
    if (res.success && res.data) {
      setPlans(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Nom du Forfait</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Crédits inclus</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>ID Externe</TableHead>
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
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucun plan trouvé.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id} className="border-border/50">
                  <TableCell className="font-bold">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal uppercase text-xs">{plan.billing_cycle || "Unique"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-500">
                    {plan.price} {plan.price >= 1000 ? "FCFA" : "€"}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {plan.credits} Mélodies
                  </TableCell>
                  <TableCell>
                    {plan.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0"><XCircle className="w-3 h-3 mr-1" /> Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono max-w-37.5 truncate">
                    {plan.stripe_product_id || "N/A"}
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
