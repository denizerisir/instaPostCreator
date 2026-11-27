import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Sparkles,
  Layers,
  Feather,
  Eye,
  FileText,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DraftItem, DraftImage } from '../types';
import { apiRequest } from '../services/api';

interface CreatePostProps {
  onDraftCreated: (draft: DraftItem) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const TONE_OPTIONS = [
  {
    key: 'atelier',
    title: 'Atölye Günlüğü',
    desc: 'Samimi, içten, yaratım sürecini ve boya kokusunu hissettiren sıcak dil.',
    icon: Layers,
  },
  {
    key: 'poetic',
    title: 'Sanatsal & Şiirsel',
    desc: 'Derin, düşündürücü, renklerin felsefesini zarifçe aktaran üslup.',
    icon: Feather,
  },
  {
    key: 'gallery',
    title: 'Galeri & Sergi',
    desc: 'Küratöryel, saygın, eserin tekniğini ve prestijini öne çıkaran profesyonel dil.',
    icon: Eye,
  },
  {
    key: 'minimal',
    title: 'Minimal & Vurucu',
    desc: 'Kısa, öz, görseli konuştururken merak uyandıran sade anlatım.',
    icon: FileText,
  },
];

export const CreatePost: React.FC<CreatePostProps> = ({ onDraftCreated, showToast }) => {
  const [images, setImages] = useState<DraftImage[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('atelier');
  const [userNote, setUserNote] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File to base64 with compression if needed
  const processFile = (file: File): Promise<DraftImage> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Sadece resim dosyaları desteklenir.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Basic image compression using canvas
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            resolve({
              id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              url: compressed,
              name: file.name,
              size: compressed.length,
            });
          } else {
            resolve({
              id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              url: result,
              name: file.name,
              size: file.size,
            });
          }
        };
        img.onerror = () => resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          url: result,
          name: file.name,
          size: file.size,
        });
        img.src = result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);

    try {
      const processed = await Promise.all(filesArray.map(processFile));
      setImages((prev) => [...prev, ...processed]);
      showToast('Görseller Eklendi', `${processed.length} adet fotoğraf stüdyoya yüklendi.`, 'success');
    } catch (err: any) {
      showToast('Yükleme Hatası', err.message, 'error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleStartAnalysis = async () => {
    if (images.length === 0) {
      showToast('Görsel Gerekli', 'Lütfen en az bir adet resim veya fotoğraf yükleyin.', 'error');
      return;
    }

    setAnalyzing(true);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      // Prepare images payload for backend Gemini analysis
      const imagePayload = images.map((img) => {
        const mimeType = img.url.substring(img.url.indexOf(':') + 1, img.url.indexOf(';')) || 'image/jpeg';
        return {
          data: img.url,
          mimeType,
        };
      });

      const response = await apiRequest('/analyze', {
        method: 'POST',
        body: JSON.stringify({
          images: imagePayload,
          tone: selectedTone,
          userNote: userNote.trim() || undefined,
        }),
      });

      clearInterval(stepInterval);

      if (!response.data) {
        throw new Error('Analiz sonucu alınamadı.');
      }

      const { caption, hashtags, analysis } = response.data;

      // Construct draft item
      const newDraft: DraftItem = {
        id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images,
        caption,
        hashtags: hashtags.slice(0, 5),
        status: 'draft',
        analysis,
        tone: selectedTone,
        userNote: userNote.trim() || undefined,
      };

      // Try saving to backend drafts
      try {
        await apiRequest('/drafts', {
          method: 'POST',
          body: JSON.stringify(newDraft),
        });
      } catch (saveErr) {
        console.warn('Draft save to serverless store had error, keeping local draft:', saveErr);
      }

      // Celebrate
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#E0A96D', '#F4D19B', '#FFFFFF'],
        });
      } catch {}

      showToast('İçerik Taslağı Hazırlandı', 'Gemini görselinizi analiz etti ve 5 hashtag ile özgün açıklama oluşturdu.', 'success');
      onDraftCreated(newDraft);

      // Reset form
      setImages([]);
      setUserNote('');
    } catch (err: any) {
      clearInterval(stepInterval);
      showToast('Analiz Hatası', err.message || 'Görsel analiz edilirken bir hata oluştu.', 'error');
    } finally {
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Introduction */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Yeni İçerik Oluştur
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Eserinizin fotoğraflarını yükleyin; Gemini görseli analiz ederek stüdyonuza özel Instagram açıklaması ve tam 5 hashtag üretsin.
        </p>
      </div>

      {/* 1. Photo Upload Area */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#E0A96D]" />
            Gönderi Fotoğrafları ({images.length} yüklendi)
          </label>
          <span className="text-xs text-zinc-500">Çoklu fotoğraf desteği</span>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#E0A96D] bg-[#E0A96D]/5'
              : 'border-[#2A2A2A] hover:border-zinc-600 bg-[#1F1F1F]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2A2A2A] flex items-center justify-center text-[#E0A96D]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                Fotoğrafları buraya sürükleyin veya <span className="text-[#E0A96D] underline underline-offset-4">bilgisayardan seçin</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                JPEG, PNG, WEBP — Tek veya birden fazla eser fotoğrafı ekleyebilirsiniz
              </p>
            </div>
          </div>
        </div>

        {/* Previews Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#121212] border border-[#2A2A2A]"
              >
                <img
                  src={img.url}
                  alt={img.name || `Eser Fotoğrafı ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md"
                  title="Fotoğrafı Kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Tone and Style Selection */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl space-y-4">
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E0A96D]" />
          İçerik Dili ve Anlatım Tonu
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TONE_OPTIONS.map((tone) => {
            const Icon = tone.icon;
            const isSelected = selectedTone === tone.key;
            return (
              <button
                key={tone.key}
                type="button"
                onClick={() => setSelectedTone(tone.key)}
                className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#E0A96D] bg-[#E0A96D]/10 text-white'
                    : 'border-[#2A2A2A] bg-[#1F1F1F] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-[#E0A96D] text-zinc-950' : 'bg-[#2A2A2A] text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {tone.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {tone.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Optional Artist Notes */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E0A96D]" />
            Sanatçının Notu (İsteğe Bağlı)
          </label>
          <span className="text-xs text-zinc-500">Gemini bu detayı anlatıya dahil eder</span>
        </div>

        <input
          type="text"
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Örn: 50x70 tuval üzerine keten tohumu yağıyla çalıştım, gün batımı ışığını yakalamaya odaklandım."
          className="w-full px-4 py-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E0A96D] transition-colors"
        />
      </div>

      {/* Analysis Progress / Trigger Button */}
      {analyzing ? (
        <div className="bg-[#181818] border border-[#E0A96D]/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#E0A96D] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-white">Yapay Zekâ Görselinizi İnceliyor...</span>
            </div>
            <span className="text-xs text-[#E0A96D] font-mono">Adım {analysisStep} / 4</span>
          </div>

          <div className="w-full bg-[#121212] h-2 rounded-full overflow-hidden border border-[#2A2A2A]">
            <div
              className="bg-[#E0A96D] h-full transition-all duration-500 ease-out"
              style={{ width: `${(analysisStep / 4) * 100}%` }}
            />
          </div>

          <p className="text-xs text-zinc-400">
            {analysisStep === 1 && 'Fotoğraflar taranıyor ve renk kompozisyonu çözümleniyor...'}
            {analysisStep === 2 && 'Fırça darbeleri, doku ve sanatsal stil tespit ediliyor...'}
            {analysisStep === 3 && 'Stüdyonun kimliğine uygun özgün Instagram anlatısı yazılıyor...'}
            {analysisStep === 4 && 'Fotoğraf konusuyla doğrudan ilişkili tam 5 niş hashtag belirleniyor...'}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartAnalysis}
          disabled={images.length === 0}
          className="w-full py-4 px-6 rounded-2xl bg-[#E0A96D] hover:bg-[#F4D19B] text-zinc-950 font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#E0A96D]/15 disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>Fotoğrafları Analiz Et ve Taslak Oluştur</span>
        </button>
      )}

      {/* Notice about manual control */}
      <div className="p-4 rounded-xl bg-[#181818] border border-[#2A2A2A] flex items-start gap-3 text-xs text-zinc-400">
        <HelpCircle className="w-4 h-4 text-[#E0A96D] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-200">Önemli Güvence:</strong> Uygulama hiçbir koşulda Instagram hesabınızda otomatik paylaşım yapmaz. Yapay zekâ yalnızca içerik taslağınızı ve etiketlerinizi hazırlar. Son kontrolü her zaman siz yapar, tek tıkla kopyalayarak Instagram uygulamasında kendiniz paylaşırsınız.
        </p>
      </div>

    </div>
  );
};
