"use client";

import { useEffect, useState } from "react";
import { getAdminCampaigns } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Edit3, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminMarketingClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await getAdminCampaigns();
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      <Card className="border-border/50 shadow-sm rounded-[24px]">
        <CardHeader>
          <CardTitle>Nouvelle Campagne Emailing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sujet de l&apos;email</label>
            <Input placeholder="Ex: Nouveautés sur Melodia AI..." className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contenu de l&apos;email</label>
            <textarea 
              className="flex min-h-30 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Rédigez votre message ici..."
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button className="rounded-xl gap-2">
              <Send className="w-4 h-4" />
              Envoyer la campagne (Brouillon)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold tracking-tight">Historique des Campagnes</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Destinataires</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Aucune campagne existante.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((camp) => (
                <TableRow key={camp.id} className="border-border/50">
                  <TableCell className="font-medium">{camp.subject}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(camp.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{camp.sent_count} envois</TableCell>
                  <TableCell>
                    {camp.status === 'sent' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0">Envoyé</Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 shadow-none border-0">Brouillon</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon"><Edit3 className="w-4 h-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
