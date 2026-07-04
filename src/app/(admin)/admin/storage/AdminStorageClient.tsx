"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, Music, Image as ImageIcon, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminStorageClient() {
  const storageData = [
    { type: 'Musiques (MP3)', bucket: 'tracks', size: '0 GB', files: 0, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { type: 'Covers (Images)', bucket: 'covers', size: '0 GB', files: 0, icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { type: 'Avatars (Images)', bucket: 'avatars', size: '0 GB', files: 0, icon: ImageIcon, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { type: 'Documents & Logs', bucket: 'logs', size: '0 GB', files: 0, icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm rounded-[24px] bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-white/20">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-primary-foreground font-medium opacity-80">Stockage Total Utilisé</p>
              <p className="text-3xl font-black">0 GB</p>
              <p className="text-sm opacity-80 pt-2">Sur 100 GB alloués (0%)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold tracking-tight">Détails par Bucket Supabase</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Type de Fichier</TableHead>
              <TableHead>Bucket</TableHead>
              <TableHead>Fichiers</TableHead>
              <TableHead className="text-right">Taille Estimée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storageData.map((item) => (
              <TableRow key={item.bucket} className="border-border/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{item.bucket}</TableCell>
                <TableCell>{item.files.toLocaleString('fr-FR')}</TableCell>
                <TableCell className="text-right font-bold">{item.size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
