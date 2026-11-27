import React, { useState } from 'react';
import {
  Shield,
  Copy,
  Check,
  Download,
  Upload,
  Palette,
  Lock,
} from 'lucide-react';
import { StudioProfile, DraftItem } from '../types';
import { storage, apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  drafts: DraftItem[];
  onImportDrafts: (drafts: DraftItem[]) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  drafts,
  onImportDrafts,
  showToast,
}) => {
  const { username, logout } = useAuth();
  const [profile, setProfile] = useState<StudioProfile>(storage.getSettings());
  const [passwordToHash, setPasswordToHash] = useState('');
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [hashingLoading, setHashingLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setSettings(profile);
    showToast('Ayarlar Kaydedildi', 'Stüdyo profil bilgileriniz başarıyla güncellendi.', 'success');
  };

  const handleGenerateHash = async () => {
    if (!passwordToHash || passwordToHash.length < 6) {
      showToast('Geçersiz Şifre', 'Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    setHashingLoading(true);
    try {
      const res = await apiRequest('/auth?action=hash-helper', {
        method: 'POST',
        body: JSON.stringify({ password: passwordToHash }),
      });

      if (res.hash) {
        setGeneratedHash(res.hash);
        showToast('Hash Üretildi', 'Bcrypt şifre hash değeri başarıyla üretildi.', 'success');
      }
    } catch (err: any) {
      showToast('Hash Hatası', err.message, 'error');
    } finally {
      setHashingLoading(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('Panoya Kopyalandı', `${keyName} değeri panoya alındı.`, 'success');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(drafts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `studyosu_taslaklar_yedek_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Yedek İndirildi', `${drafts.length} adet taslak JSON olarak bilgisayarınıza kaydedildi.`, 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportDrafts(imported);
          showToast('Yedek Yüklendi', `${imported.length} adet taslak içeri aktarıldı.`, 'success');
        } else {
          throw new Error('Geçersiz yedek dosyası formatı.');
        }
      } catch (err: any) {
        showToast('Yükleme Hatası', err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Stüdyo ve Sistem Ayarları
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Resim atölyesi kimliğinizi düzenleyin, Netlify ortam değişkenlerini yapılandırın ve verilerinizi yönetin.
        </p>
      </div>

      {/* 1. Studio Profile Settings */}
      <form onSubmit={handleSaveProfile} className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
          <Palette className="w-4 h-4 text-[#E0A96D]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Stüdyo Kimliği</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Atölye / Stüdyo Adı
            </label>
            <input
              type="text"
              value={profile.studioName}
              onChange={(e) => setProfile({ ...profile, studioName: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-xs text-white focus:outline-none focus:border-[#E0A96D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Sanatçı Adı
            </label>
            <input
              type="text"
              value={profile.artistName}
              onChange={(e) => setProfile({ ...profile, artistName: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-xs text-white focus:outline-none focus:border-[#E0A96D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Instagram Kullanıcı Adı / Profil Tanıtımı
          </label>
          <input
            type="text"
            value={profile.handle}
            onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
            placeholder="@resimstudyosu"
            className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-xs text-white focus:outline-none focus:border-[#E0A96D]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Varsayılan Paylaşım İmzası (İsteğe Bağlı)
          </label>
          <textarea
            rows={2}
            value={profile.signatureText}
            onChange={(e) => setProfile({ ...profile, signatureText: e.target.value })}
            placeholder="Gönderilerin sonuna eklenebilecek standart stüdyo mesajı..."
            className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-xs text-white focus:outline-none focus:border-[#E0A96D]"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 font-bold text-xs transition-all shadow"
        >
          Profil Bilgilerini Kaydet
        </button>
      </form>

      {/* 2. Netlify Environment Variables & Security Config */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Netlify Güvenlik ve Ortam Değişkenleri
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Tüm şifreler, kullanıcı adları ve Gemini API Key bilgileri Netlify Environment Variables üzerinde güvenle saklanır. Kod içine veya istemciye (tarayıcıya) asla aktarılmaz.
        </p>

        {/* Variables List */}
        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A] flex items-center justify-between">
            <div>
              <span className="text-[#E0A96D] font-bold">APP_USERNAME</span>
              <p className="font-sans text-[11px] text-zinc-400 mt-0.5">Giriş kullanıcı adı (Örn: admin veya adınız)</p>
            </div>
            <span className="text-emerald-400 text-[11px] font-sans font-semibold">Sunucu Tarafı</span>
          </div>

          <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A] flex items-center justify-between">
            <div>
              <span className="text-[#E0A96D] font-bold">APP_PASSWORD_HASH</span>
              <p className="font-sans text-[11px] text-zinc-400 mt-0.5">Bcrypt ile şifrelenmiş parola hash'i</p>
            </div>
            <span className="text-emerald-400 text-[11px] font-sans font-semibold">Bcrypt Güvenliği</span>
          </div>

          <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A] flex items-center justify-between">
            <div>
              <span className="text-[#E0A96D] font-bold">GEMINI_API_KEY</span>
              <p className="font-sans text-[11px] text-zinc-400 mt-0.5">Google AI Studio'dan alınan Gemini API Key</p>
            </div>
            <span className="text-emerald-400 text-[11px] font-sans font-semibold">Gizli & Korumalı</span>
          </div>

          <div className="p-3 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A] flex items-center justify-between">
            <div>
              <span className="text-[#E0A96D] font-bold">SESSION_SECRET</span>
              <p className="font-sans text-[11px] text-zinc-400 mt-0.5">Oturum JWT belirteçlerini imzalamak için gizli anahtar</p>
            </div>
            <span className="text-emerald-400 text-[11px] font-sans font-semibold">HMAC SHA-256</span>
          </div>
        </div>

        {/* Password Hash Generator Tool */}
        <div className="mt-4 p-4 rounded-xl bg-[#121212] border border-[#2A2A2A] space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#E0A96D]" />
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Şifre Hash Üretici (Netlify İçin)
            </h4>
          </div>
          <p className="text-xs text-zinc-400">
            Netlify ortam değişkenine eklemek istediğiniz şifreyi girerek doğrudan sunucu tarafında kullanılan formatta güvenli hash oluşturabilirsiniz:
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={passwordToHash}
              onChange={(e) => setPasswordToHash(e.target.value)}
              placeholder="Yeni şifrenizi yazın..."
              className="flex-1 px-3 py-2 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-xs text-white focus:outline-none focus:border-[#E0A96D]"
            />
            <button
              type="button"
              disabled={hashingLoading || !passwordToHash}
              onClick={handleGenerateHash}
              className="px-4 py-2 bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
            >
              {hashingLoading ? 'Üretiliyor...' : 'Hash Oluştur'}
            </button>
          </div>

          {generatedHash && (
            <div className="p-3 rounded-lg bg-[#1F1F1F] border border-emerald-500/30 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-emerald-300 break-all">{generatedHash}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedHash, 'APP_PASSWORD_HASH')}
                className="shrink-0 p-1.5 rounded-md bg-[#2A2A2A] text-zinc-200 hover:text-white transition-colors"
                title="Hash'i Kopyala"
              >
                {copiedKey === 'APP_PASSWORD_HASH' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Draft Backup & Export */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
          <Download className="w-4 h-4 text-[#E0A96D]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Veri Yedekleme ve Arşiv Yönetimi
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Hazırladığınız tüm Instagram taslaklarını ve fotoğrafları JSON formatında bilgisayarınıza yedekleyebilir veya önceki bir yedekten geri yükleyebilirsiniz.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-200 border border-[#2A2A2A] text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-[#E0A96D]" />
            <span>Taslakları Bilgisayara İndir ({drafts.length})</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-200 border border-[#2A2A2A] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yedekten Geri Yükle</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </div>

      {/* 4. Session details & Logout */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-200">Giriş Yapılan Kullanıcı: {username}</h4>
          <p className="text-xs text-zinc-500 mt-0.5">Oturum süreniz 7 gün geçerlidir.</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
        >
          Güvenli Çıkış Yap
        </button>
      </div>

    </div>
  );
};
