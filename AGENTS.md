# Instagram İçerik Stüdyosu — AGENTS.md

Bu belge, **Instagram İçerik Stüdyosu** projesinin mimarisi, kodlama standartları, güvenlik kuralları ve geliştirme yönergelerini tanımlar.

---

## 1. Proje Özeti ve Amacı
Bu uygulama, bir resim stüdyosu / sanat atölyesi için kişisel kullanıma yönelik, yapay zekâ destekli modern bir Instagram içerik stüdyosudur.
- **Kesin Kural:** Uygulama asla Instagram'a otomatik paylaşım yapmaz; hesap kullanıcı adı veya şifresi istemez.
- Yalnızca stüdyo fotoğraflarını Gemini Vision API ile analiz ederek estetik, klişelerden arındırılmış Instagram açıklama metni ve **tam olarak 5 adet** ilgili hashtag üretir.
- Son kontrolü sanatçı yapar; tek tıkla kopyalayarak Instagram uygulamasında manuel paylaşır.

---

## 2. Mimari ve Teknoloji Yığını
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Canvas-Confetti.
- **Backend / Sunucusuz Mimari:** Netlify Functions (`netlify/functions/`).
  - `/api/auth` -> `netlify/functions/auth.ts`: Sunucu tarafı kimlik doğrulama, JWT oturum yönetimi, şifre hash yardımcı aracı.
  - `/api/analyze` -> `netlify/functions/analyze.ts`: Gemini Vision ile görsel analizi ve Instagram taslağı üretimi.
  - `/api/regenerate` -> `netlify/functions/regenerate.ts`: Açıklama veya 5 hashtag'i yapay zekâyla yeniden üretme.
  - `/api/drafts` -> `netlify/functions/drafts.ts`: Netlify Blobs ve yerel önbellek destekli taslak CRUD işlemleri.
- **İstemci Depolama & Çevrimdışı Güvence:** LocalStorage & IndexedDB senkronizasyonu (sayfa yenilense veya çevrimdışı olunsa bile taslaklar ve önizlemeler kaybolmaz).

---

## 3. Güvenlik Kuralları
1. **Hassas Bilgilerin Korunması:**
   - `GEMINI_API_KEY`, `APP_USERNAME`, `APP_PASSWORD_HASH` ve `SESSION_SECRET` değişkenleri yalnızca sunucu tarafında (`process.env`) okunur.
   - API anahtarları veya şifreler asla istemci koduna aktarılmaz, tarayıcı konsoluna veya loglara yazdırılmaz.
   - `.env` ve `.env.local` dosyaları `.gitignore` ile korunur.
2. **Oturum Yönetimi:**
   - Korumalı tüm API istekleri `Authorization: Bearer <token>` başlığı ile imzalı JWT doğrulamasına tabi tutulur.
   - Şifreler `bcrypt` ile hashlenerek saklanır.
3. **HTTP Başlıkları:**
   - `netlify.toml` içerisinde `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ve `Permissions-Policy` güvenlik başlıkları tanımlıdır.

---

## 4. Tasarım Sistemi Standartları
- **Tipografi:** Manrope / Geist (Inter, Roboto vb. kullanılmaz; italik kullanılmaz).
- **Renk Paleti (Stüdyo Estetiği):**
  - Arka planlar: `#121212`, `#181818`, `#1F1F1F` (düz renkler, gradient arka plan kullanılmaz).
  - Kenarlıklar: `#2A2A2A`.
  - Vurgu: Sıcak altın ve pişmiş toprak (`#E0A96D`, `#D97706`).
- **Köşe Yuvarlama Kuralı:** `iç yarıçap = dış yarıçap - boşluk`.
- **Boşluk Skalası:** Tailwind'in standart boşluk değerleri (8px, 12px, 16px, 24px, 32px vb.).

---

## 5. Geliştirme ve Dağıtım Komutları
- Bağımlılıkları yükleme: `npm install`
- Yerel geliştirme sunucusu: `npm run dev`
- Üretim derlemesi: `npm run build`
- Netlify CLI ile yerel simülasyon: `npx netlify dev`
