"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Mail, Lock, Bell, Palette, Shield, Save, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";

const AVATAR_OPTIONS = [
  { id: "male", emoji: "👨🏾‍🎤", label: "Homme" },
  { id: "female", emoji: "👩🏾‍🎤", label: "Femme" },
  { id: "male2", emoji: "🧑🏿‍🎤", label: "Artiste" },
  { id: "female2", emoji: "👩🏽‍🎤", label: "Artiste 2" },
  { id: "robot", emoji: "🤖", label: "IA" },
  { id: "star", emoji: "⭐", label: "Star" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    bio: "",
    avatar_gender: "male",
    new_password: "",
    notif_email: true,
    notif_push: true,
    language: "fr",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      const supabase = createClient();

      // Try getUser first, fall back to getSession for email
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      const currentUser = user || session?.user;
      if (!currentUser) {
        setError("Impossible de charger le profil. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      setUserId(currentUser.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, avatar_gender")
        .eq("id", currentUser.id)
        .single();

      setForm((f) => ({
        ...f,
        full_name: profile?.full_name || "",
        email: currentUser.email || session?.user?.email || "",
        bio: profile?.bio || "",
        avatar_gender: profile?.avatar_gender || "male",
      }));
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    setError("");

    const supabase = createClient();

    const updatePayload: Record<string, string> = {
      full_name: form.full_name.trim(),
      bio: form.bio.trim(),
      avatar_gender: form.avatar_gender,
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId);

    if (updateError) {
      setError(`Erreur: ${updateError.message}`);
      setSaving(false);
      return;
    }

    if (form.new_password && form.new_password.length >= 6) {
      const { error: pwError } = await supabase.auth.updateUser({ password: form.new_password });
      if (pwError) {
        setError(`Mot de passe: ${pwError.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Préférences", icon: Palette },
  ];

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === form.avatar_gender);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gère ton profil et tes préférences.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-white text-gray-600 border border-gray-200 hover:border-purple-400 hover:text-purple-600"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8 space-y-6">

          {/* ─── PROFILE TAB ─── */}
          {activeTab === "profile" && (
            <>
              {/* Current avatar display */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-purple-500 to-[#FF6B00] flex items-center justify-center text-5xl shadow-lg select-none">
                  {currentAvatar?.emoji || "👨🏾‍🎤"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{form.full_name || "Mon compte"}</h3>
                  <p className="text-sm text-gray-400">{form.email}</p>
                  <span className="mt-1 inline-block text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                    Artiste Melodia
                  </span>
                </div>
              </div>

              {/* Avatar picker */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Choisis ton avatar</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, avatar_gender: opt.id })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all hover:scale-105 ${
                        form.avatar_gender === opt.id
                          ? "border-purple-500 bg-purple-50 shadow-md shadow-purple-500/10"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-[10px] font-medium text-gray-500">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" /> Nom complet
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                    placeholder="Ton nom d'artiste"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-500" /> Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Bio <span className="text-gray-400 font-normal">(optionnelle)</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all resize-none"
                    placeholder="Quelques mots sur toi... ton style musical, ce qui t'inspire..."
                  />
                  <p className="text-xs text-gray-400 text-right">{form.bio.length}/200</p>
                </div>
              </div>
            </>
          )}

          {/* ─── SECURITY TAB ─── */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-sm text-blue-700">Pour changer ton mot de passe, remplis le champ ci-dessous et clique sur Sauvegarder.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" /> Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-gray-600">Niveau de sécurité :</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        form.new_password.length >= i * 3
                          ? form.new_password.length >= 10 ? "bg-green-400" : "bg-yellow-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {form.new_password.length === 0 ? "Aucun mot de passe saisi" :
                   form.new_password.length < 6 ? "Trop court (min. 6)" :
                   form.new_password.length < 10 ? "Correct" : "Fort ✓"}
                </p>
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS TAB ─── */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              {[
                { key: "notif_email", label: "Notifications par email", desc: "Reçois un email quand ta musique est prête" },
                { key: "notif_push", label: "Notifications in-app", desc: "Alertes dans l'application" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, [n.key]: !(form[n.key as keyof typeof form] as boolean) })}
                    className={`w-12 h-6 rounded-full transition-all duration-200 relative shrink-0 ${
                      form[n.key as keyof typeof form] ? "bg-purple-500" : "bg-gray-200"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      form[n.key as keyof typeof form] ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ─── PREFERENCES TAB ─── */}
          {activeTab === "preferences" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-500" /> Langue de l&apos;interface
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 bg-white"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-semibold text-sm text-red-700 mb-1">Zone dangereuse</p>
                <p className="text-xs text-red-500 mb-3">La suppression de compte est irréversible et définitive.</p>
                <button className="text-xs text-red-600 font-semibold border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* ─── SAVE BUTTON ─── */}
          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-linear-to-r from-purple-500 to-[#FF6B00] text-white font-semibold text-sm hover:scale-105 transition-transform shadow-lg shadow-purple-500/20 disabled:opacity-60 disabled:scale-100"
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Sauvegardé !</>
              ) : saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Sauvegarde...</>
              ) : (
                <><Save className="w-4 h-4" /> Sauvegarder</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
