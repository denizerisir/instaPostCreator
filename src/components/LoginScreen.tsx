import React, { useState } from 'react';
import { Palette, Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

interface LoginScreenProps {
  onSuccessToast?: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevHint, setShowDevHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/auth', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (data.token) {
        login(data.token, data.user?.username || username);
      } else {
        throw new Error('Giriş başarısız oldu.');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle Studio Glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E0A96D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center shadow-xl mb-4 group transition-transform hover:scale-105">
            <Palette className="w-8 h-8 text-[#E0A96D]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            İçerik Stüdyosu
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs text-balance">
            Resim stüdyonuz için yapay zekâ destekli Instagram içerik üretim ve taslak atölyesi.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <span className="font-semibold shrink-0">Hata:</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E0A96D] focus:ring-1 focus:ring-[#E0A96D] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E0A96D] focus:ring-1 focus:ring-[#E0A96D] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E0A96D]/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Doğrulanıyor...</span>
                </div>
              ) : (
                <>
                  <span>Stüdyoya Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Security & Config Information */}
          <div className="mt-6 pt-5 border-t border-[#2A2A2A] text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Netlify Functions & Sunucu Tarafı Güvenlik</span>
            </div>

            <button
              type="button"
              onClick={() => setShowDevHint(!showDevHint)}
              className="text-xs text-zinc-500 hover:text-[#E0A96D] transition-colors mt-2 underline underline-offset-4"
            >
              {showDevHint ? 'Kurulum bilgisini gizle' : 'Geliştirici / Giriş İpucu'}
            </button>

            {showDevHint && (
              <div className="mt-3 p-3 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A] text-left text-xs text-zinc-400 space-y-1.5">
                <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E0A96D]" />
                  Netlify Ortam Değişkenleri:
                </p>
                <p>Netlify'da henüz şifre tanımlanmadıysa varsayılan geliştirme bilgileri:</p>
                <div className="font-mono text-[11px] bg-[#121212] p-2 rounded border border-[#2A2A2A] text-zinc-300">
                  <div>Kullanıcı: <span className="text-[#E0A96D]">admin</span></div>
                  <div>Şifre: <span className="text-[#E0A96D]">studio2026</span></div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Kendi şifrenizi belirledikten sonra Ayarlar sekmesindeki hash aracıyla Netlify'a ekleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          Kişisel Resim Atölyesi İçerik Yönetimi &copy; 2026
        </p>
      </div>
    </div>
  );
};
