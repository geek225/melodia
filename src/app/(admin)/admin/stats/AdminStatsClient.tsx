"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const dummyUserData = [
  { name: 'Jan', utilisateurs: 120 },
  { name: 'Fév', utilisateurs: 210 },
  { name: 'Mar', utilisateurs: 380 },
  { name: 'Avr', utilisateurs: 520 },
  { name: 'Mai', utilisateurs: 800 },
  { name: 'Juin', utilisateurs: 1100 },
];

const dummyRevenueData = [
  { name: 'Jan', revenus: 1200 },
  { name: 'Fév', revenus: 2100 },
  { name: 'Mar', revenus: 3500 },
  { name: 'Avr', revenus: 4800 },
  { name: 'Mai', revenus: 6100 },
  { name: 'Juin', revenus: 8500 },
];

export default function AdminStatsClient() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm rounded-[24px]">
          <CardHeader>
            <CardTitle>Croissance Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyUserData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="utilisateurs" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm rounded-[24px]">
          <CardHeader>
            <CardTitle>Revenus Mensuels (€)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
