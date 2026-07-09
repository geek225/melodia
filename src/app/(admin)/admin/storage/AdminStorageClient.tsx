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

import { useEffect, useState } from "react";
import { getAdminStorageStats } from "./actions";

export default function AdminStorageClient() {
  const [loading, setLoading] = useState(true);
  const [storageData, setStorageData] = useState([
    { type: 'Musiques (MP3)', bucket: 'tracks', size: '0 MB', sizeBytes: 0, files: 0, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { type: 'Covers (Images)', bucket: 'covers', size: '0 MB', sizeBytes: 0, files: 0, icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { type: 'Avatars (Images)', bucket: 'avatars', size: '0 MB', sizeBytes: 0, files: 0, icon: ImageIcon, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { type: 'Documents & Logs', bucket: 'logs', size: '0 MB', sizeBytes: 0, files: 0, icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    { type: 'Voix (Audio)', bucket: 'voices', size: '0 MB', sizeBytes: 0, files: 0, icon: Music, color: 'text-green-500', bg: 'bg-green-500/10' },
    { type: 'Pochettes Perso', bucket: 'music_covers', size: '0 MB', sizeBytes: 0, files: 0, icon: ImageIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]);

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const fetchStorageStats = async () => {
    setLoading(true);
    const res = await getAdminStorageStats();
    if (res.success && res.data) {
      setStorageData(prev => prev.map(item => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stat = res.data.find((s: any) => s.bucket === item.bucket);
        if (stat) {
          const mbSize = stat.sizeBytes / (1024 * 1024);
          let displaySize = `${mbSize.toFixed(2)} MB`;
          if (mbSize > 1024) displaySize = `${(mbSize / 1024).toFixed(2)} GB`;
          
          return { ...item, files: stat.files, size: displaySize, sizeBytes: stat.sizeBytes };
        }
        return item;
      }));
    }
    setLoading(false);
  };

  const totalBytes = storageData.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const totalMB = totalBytes / (1024 * 1024);
  const totalGB = totalMB / 1024;
  const displayTotal = totalGB > 1 ? `${totalGB.toFixed(2)} GB` : `${totalMB.toFixed(2)} MB`;
  const percentUsed = ((totalGB / 100) * 100).toFixed(2);


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
              <p className="text-3xl font-black">{loading ? '...' : displayTotal}</p>
              <p className="text-sm opacity-80 pt-2">Sur 100 GB alloués ({loading ? '...' : percentUsed}%)</p>
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
