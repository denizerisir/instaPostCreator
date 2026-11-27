import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ImageInput {
  data: string; // Base64 data without prefix or with prefix
  mimeType: string;
}

export interface AnalysisResult {
  caption: string;
  hashtags: string[];
  analysis: {
    subject: string;
    mood: string;
    colors: string[];
    style: string;
    story: string;
  };
}

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ortam değişkeni yapılandırılmamış. Lütfen Netlify panelinden ekleyin.');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Tone descriptions for the art studio
export const TONE_PROMPTS: Record<string, string> = {
  atelier: 'Atölye Günlüğü: Samimi, sıcacık, sanatçının yaratım sürecini, fırça izlerini, emek ve boya kokusunu hissettiren içten bir dil.',
  poetic: 'Sanatsal & Şiirsel: Derin, düşündürücü, renklerin ve formların yarattığı duyguyu felsefi ve zarif bir anlatımla aktaran dil.',
  gallery: 'Galeri & Sergi: Küratöryel, profesyonel, prestijli, eserin tekniğini, ışık-gölge dengesini ve sanatsal değerini vurgulayan dil.',
  minimal: 'Minimal & Vurucu: Kısa, öz, görselin kendisini konuştururken izleyicide merak ve estetik hayranlık uyandıran sade bir dil.',
};

export async function analyzeArtwork(images: ImageInput[], toneKey: string = 'atelier', userNote?: string): Promise<AnalysisResult> {
  const genAI = getGeminiClient();

  // Try gemini-2.5-flash first, fall back to gemini-1.5-flash
  const modelNames = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError: unknown = null;

  const toneGuidance = TONE_PROMPTS[toneKey] || TONE_PROMPTS.atelier;

  const systemInstructions = `Sen profesyonel bir resim stüdyosu ve sanat atölyesinin Instagram küratörüsün.
Görevin, atölyeden yüklenen eser veya çalışma fotoğraflarını derinlemesine inceleyerek Instagram için özgün, yüksek etkileşimli ve estetik içerik hazırlamaktır.

ÖNEMLİ KURALLAR:
1. Kesinlikle klişe, robotik ve yapay zekâ kokan ifadeler KULLANMA (Örn: "Büyüleneceksiniz", "Tuvaller konuştu", "Sanatın büyülü dünyası", "Gözlerinizi alamayacaksınız" gibi bayat cümleler YASAKTIR).
2. Doğal, samimi, saygın ve bir sanatçının veya butik resim atölyesinin ağzından yazılmış gibi konuş.
3. Fotoğraftaki renk paleti, fırça darbeleri, doku, kompozisyon, ışık ve hissettirdiği atmosferi görselden doğru tespit et.
4. İletişim Tonu: ${toneGuidance}
${userNote ? `Sanatçının Özel Notu / Yönergesi: "${userNote}"` : ''}

ÇIKTI FORMATI:
Sadece ve sadece aşağıdaki JSON formatında geçerli bir JSON çıktısı üret. Başka hiçbir açıklama, markdown kodu veya selamlama yazma.

{
  "analysis": {
    "subject": "Eserin veya fotoğrafın ana konusu (1-2 cümle)",
    "mood": "Eserin yaydığı duygu ve atmosfer (1-2 cümle)",
    "colors": ["Belirgin Renk 1", "Belirgin Renk 2", "Belirgin Renk 3", "Belirgin Renk 4"],
    "style": "Sanatsal stil, teknik ve doku incelemesi (örn: Tuval üzeri yağlıboya, impasto dokular, sıcak toprak tonları vb.)",
    "story": "Eserin anlatmak istediği hikâye ve derinlik (2-3 cümle)"
  },
  "caption": "Instagram için hazırlanmış, okunabilirliği yüksek, paragraflara bölünmüş, sanatseverle bağ kuran açıklama metni. Klişesiz ve seçilen tona tam uyumlu olmalı.",
  "hashtags": [
    "#etiket1",
    "#etiket2",
    "#etiket3",
    "#etiket4",
    "#etiket5"
  ]
}

DİKKAT: "hashtags" dizisinde TAM OLARAK 5 ADET hashtag bulunmalıdır. Ne 4, ne 6, kesinlikle 5 adet olmalıdır. Hashtagler konuyla doğrudan alakalı, spam olmayan, Türkçe ve gerektiğinde sanatsal İngilizce terimler içermelidir (Örn: #resimstudyosu, #yagliboyatablo, #artatelier vb.).`;

  // Prepare image parts for Gemini API
  const imageParts = images.map((img) => {
    // Strip data:image/...;base64, prefix if present
    const base64Data = img.data.includes(';base64,') ? img.data.split(';base64,')[1] : img.data;
    return {
      inlineData: {
        data: base64Data,
        mimeType: img.mimeType || 'image/jpeg',
      },
    };
  });

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent([systemInstructions, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      const parsed = parseGeminiJson(text);
      if (parsed) {
        // Ensure hashtags count is exactly 5
        let hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
        hashtags = hashtags.map((tag: string) => (tag.startsWith('#') ? tag : `#${tag.trim()}`)).filter(Boolean);

        if (hashtags.length > 5) {
          hashtags = hashtags.slice(0, 5);
        } else while (hashtags.length < 5) {
          const defaults = ['#resimstudyosu', '#sanatatölyesi', '#tablo', '#özgünresim', '#artstudio'];
          const candidate = defaults[hashtags.length] || '#art';
          if (!hashtags.includes(candidate)) {
            hashtags.push(candidate);
          } else {
            hashtags.push(`#sanat${hashtags.length + 1}`);
          }
        }

        return {
          caption: parsed.caption || '',
          hashtags,
          analysis: {
            subject: parsed.analysis?.subject || 'Resim stüdyosu çalışması',
            mood: parsed.analysis?.mood || 'Dingin ve yaratıcı',
            colors: Array.isArray(parsed.analysis?.colors) ? parsed.analysis.colors : ['Toprak Tonları', 'Doğal Işık'],
            style: parsed.analysis?.style || 'Görsel sanat eseri',
            story: parsed.analysis?.story || 'Tuval üzerine işlenen özgün bir görsel anlatı.',
          },
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} failed or unavailable, trying next...`, (err as Error)?.message);
    }
  }

  throw new Error(`Gemini analiz işlemi tamamlanamadı: ${(lastError as Error)?.message || 'Bilinmeyen hata'}`);
}

export async function regenerateContent(params: {
  type: 'caption' | 'hashtags';
  currentAnalysis?: AnalysisResult['analysis'];
  currentCaption?: string;
  toneKey?: string;
  userGuidance?: string;
}): Promise<{ caption?: string; hashtags?: string[] }> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.75,
      responseMimeType: 'application/json',
    },
  });

  const toneGuidance = TONE_PROMPTS[params.toneKey || 'atelier'] || TONE_PROMPTS.atelier;

  if (params.type === 'caption') {
    const prompt = `Sen bir resim stüdyosunun Instagram yazarısın.
Daha önce yapılan sanat analizi ve mevcut bağlam:
- Konu: ${params.currentAnalysis?.subject || 'Resim çalışması'}
- Atmosfer: ${params.currentAnalysis?.mood || 'Sanatsal'}
- Renkler: ${params.currentAnalysis?.colors?.join(', ') || 'Doğal tonlar'}
- Stil/Doku: ${params.currentAnalysis?.style || 'Tuval üzerine çalışma'}
- Sanatçının Özel İsteği: "${params.userGuidance || 'Daha etkileyici ve taze bir bakış açısıyla yeniden yaz.'}"
- İletişim Tonu: ${toneGuidance}

Klişe, abartılı ve yapay zekâ tabirlerinden (büyüleneceksiniz, göz alıcı vb.) tamamen uzak, samimi, resim stüdyosunun ruhunu yansıtan yeni bir Instagram açıklama metni hazırla.
Sadece şu JSON çıktısını ver:
{
  "caption": "Yeni hazırlanan açıklama metni"
}`;

    const res = await model.generateContent(prompt);
    const parsed = parseGeminiJson(res.response.text());
    return { caption: parsed?.caption || 'Yeni açıklama oluşturuldu.' };
  } else {
    const prompt = `Sen bir resim stüdyosu için Instagram hashtag uzmanısın.
Eser bağlamı:
- Konu: ${params.currentAnalysis?.subject || 'Resim çalışması'}
- Stil: ${params.currentAnalysis?.style || 'Sanat eseri'}
- Açıklama: ${params.currentCaption || ''}
- İstenen Özel Yönlendirme: "${params.userGuidance || 'Daha niş ve hedef kitleye odaklı 5 hashtag oluştur.'}"

GÖREV:
Fotoğraf ve stüdyoyla son derece alakalı TAM OLARAK 5 ADET hashtag üret.
Genel spam etiketlerden kaçın (#love, #instagood YASAKTIR). Sanata, tabloya, resim tekniğine ve atölyeye odaklan.
Sadece şu JSON çıktısını ver:
{
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

    const res = await model.generateContent(prompt);
    const parsed = parseGeminiJson(res.response.text());
    let hashtags = Array.isArray(parsed?.hashtags) ? parsed.hashtags : [];
    hashtags = hashtags.map((t: string) => (t.startsWith('#') ? t : `#${t.trim()}`)).filter(Boolean).slice(0, 5);
    while (hashtags.length < 5) {
      hashtags.push(`#sanat${hashtags.length + 1}`);
    }
    return { hashtags };
  }
}

function parseGeminiJson(rawText: string): any {
  try {
    return JSON.parse(rawText);
  } catch {
    // Clean code fences if any
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Try to find the outermost JSON object
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(cleaned.substring(start, end + 1));
      }
      return null;
    }
  }
}
