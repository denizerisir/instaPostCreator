# 🎨 Instagram İçerik Stüdyosu

Bir resim stüdyosu ve sanat atölyesi için özel olarak tasarlanmış, **Google Gemini Yapay Zekâsı** destekli, kişisel Instagram içerik üretim ve taslak yönetim web uygulaması.

---

## 🌟 Öne Çıkan Özellikler

1. **Güvenli Kullanıcı Girişi:**
   - Netlify Environment Variables ile sunucu tarafı kimlik doğrulama.
   - Bcrypt şifre hash desteği ve JWT tabanlı güvenli oturum yönetimi.
   - Hassas bilgilerin (API anahtarları, şifreler) istemciye asla sızmaması.

2. **Görsel Analizi & Yapay Zekâ İçerik Üretimi (Gemini API):**
   - Eser fotoğraflarını çoklu yükleme (Drag & Drop).
   - Eserin konusu, renk paleti, fırça/doku stili ve atmosferinin analizi.
   - Klişelerden uzak, samimi, sanatsal kimliği yansıtan özgün Instagram açıklamaları.
   - Konuyla doğrudan alakalı **tam olarak 5 adet** niş hashtag.

3. **4 Farklı Stüdyo Anlatım Dili:**
   - *Atölye Günlüğü:* Samimi, yaratım sürecini ve boya kokusunu hissettiren sıcak dil.
   - *Sanatsal & Şiirsel:* Derin, renklerin ve formların felsefesini aktaran zarif üslup.
   - *Galeri & Sergi:* Küratöryel, prestijli ve teknik detayları vurgulayan dil.
   - *Minimal & Vurucu:* Sade, öz ve görseli konuşturan anlatım.

4. **Taslak İnceleme, Düzenleme ve Hızlı Kopyalama:**
   - Açıklama metnini ve hashtagleri manuel düzenleyebilme.
   - Tek tıkla yapay zekâdan açıklamayı veya hashtagleri bağımsız olarak yeniden üretebilme.
   - 3 Hızlı Kopyalama Seçeneği:
     - 📋 *Açıklamayı Kopyala*
     - 🏷️ *Hashtagleri Kopyala*
     - 🚀 *Açıklama + Hashtagleri Birlikte Kopyala*

5. **Güvenli ve Manuel Kontrol İlkesi:**
   - Uygulama asla Instagram hesabınıza otomatik paylaşım yapmaz.
   - Instagram şifresi istenmez. İçerikleri kontrol edip Instagram uygulamasından siz paylaşırsınız.

6. **Netlify Hazır Sunucusuz Mimari:**
   - Netlify Functions (`/netlify/functions/auth.ts`, `analyze.ts`, `regenerate.ts`, `drafts.ts`).
   - Netlify Blobs desteği ve yerel tarayıcı senkronizasyonu.
   - Dahili Şifre Hash Üretici (Ayarlar sekmesinde).

---

## ⚙️ Kurulum ve Ortam Değişkenleri

### 1. Yerel Çalıştırma
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### 2. Netlify Üzerinde Yapılandırma
Netlify panelinde **Site configuration > Environment variables** bölümüne şu değişkenleri ekleyin:

| Değişken Adı | Açıklama | Örnek Değer |
|---|---|---|
| `APP_USERNAME` | Giriş yapacak kullanıcı adı | `admin` |
| `APP_PASSWORD_HASH` | Bcrypt formatında şifre hash'i | *(Uygulamanın Ayarlar sekmesindeki araçla üretebilirsiniz)* |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Anahtarı | `AIzaSy...` |
| `SESSION_SECRET` | Oturum JWT imzası için gizli rastgele metin | `en_az_32_karakterlik_guvenli_anahtar` |

> **İpucu:** İlk kurulumda Netlify değişkenleri henüz girilmemişse, geliştirme kolaylığı için varsayılan kullanıcı adı: `admin`, şifre: `studio2026` olarak çalışır. Ayarlar sekmesinden dilediğiniz şifrenin hash'ini tek tıkla üretebilirsiniz.

---

## 🛠️ Proje Mimarisi

```
├── .agents/                    # Agent kuralları ve beceriler
├── netlify/
│   └── functions/              # Sunucu tarafı Netlify Functions
│       ├── utils/
│       │   ├── auth.ts         # JWT ve Bcrypt doğrulama
│       │   └── gemini.ts       # Gemini 2.5 Flash Vision entegrasyonu
│       ├── auth.ts             # Giriş ve hash üretici API
│       ├── analyze.ts          # Fotoğraf analizi ve taslak API
│       ├── regenerate.ts       # Yeniden üretim API
│       └── drafts.ts           # Taslak CRUD & Blobs API
├── src/
│   ├── components/             # React UI bileşenleri
│   │   ├── CreatePost.tsx      # Fotoğraf yükleme ve analiz
│   │   ├── Dashboard.tsx       # Ana stüdyo paneli
│   │   ├── DraftCard.tsx       # Taslak kartı ve hızlı kopyalama
│   │   ├── DraftEditorModal.tsx# Detaylı düzenleme ve yenileme
│   │   ├── DraftsList.tsx      # Taslak arşivi ve filtreleme
│   │   ├── LoginScreen.tsx     # Güvenli giriş ekranı
│   │   ├── Navbar.tsx          # Üst navigasyon çubuğu
│   │   ├── SettingsView.tsx    # Stüdyo kimliği & hash üretici
│   │   └── Toast.tsx           # Bildirim kutuları
│   ├── context/
│   │   └── AuthContext.tsx     # Kimlik doğrulama oturum yönetimi
│   ├── services/
│   │   └── api.ts              # API istemcisi ve yerel depolama
│   ├── types/
│   │   └── index.ts            # TypeScript veri modelleri
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── netlify.toml                # Netlify derleme ve yönlendirme ayarları
├── .env.example                # Örnek ortam değişkenleri
└── package.json
```

---

## 🎨 Tasarım Standartları
- Manrope / Geist tipografi ölçeği.
- Düz karanlık stüdyo tonları (`#121212`, `#181818`, `#1F1F1F`, `#2A2A2A`).
- Sanatsal sıcak altın vurgular (`#E0A96D`).
- Responsive, fotoğraf odaklı minimalist tasarım.
