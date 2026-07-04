"use client";

import { useEffect, useState } from "react";
import { getAdminReviews } from "./actions";
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
import { Star, CheckCircle, XCircle } from "lucide-react";

export default function AdminReviewsClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await getAdminReviews();
    if (res.success && res.data) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Note</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucun avis client pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id} className="border-border/50">
                  <TableCell>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-bold">{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>{review.profiles?.email || "Inconnu"}</TableCell>
                  <TableCell className="max-w-75 truncate text-sm">
                    {review.comment || <span className="text-muted-foreground italic">Aucun commentaire</span>}
                  </TableCell>
                  <TableCell>
                    {review.status === 'approved' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 shadow-none border-0">Approuvé</Badge>
                    ) : review.status === 'rejected' ? (
                      <Badge className="bg-red-500/10 text-red-500 shadow-none border-0">Rejeté</Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500 shadow-none border-0">En attente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"><CheckCircle className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50"><XCircle className="w-4 h-4" /></Button>
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
