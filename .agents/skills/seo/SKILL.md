---
name: new-seo
description: "Comprehensive blueprint and standard for the New SEO architecture (SEO Base, AEO, GEO, AIO, SXO). Use whenever designing, building, optimizing, auditing, or writing content for any modern website or landing page. Guarantees dual discovery: ranking in classic search engines (Google, Bing) and earning verified direct citations across generative AI engines (ChatGPT, Gemini, Perplexity, Claude)."
---

# New SEO Architecture — The Modern 5-Pillar System

Search is no longer a single crawler indexing keywords. Modern discovery happens across two complementary engines:
1. **Classic Crawlers** (Googlebot, Bingbot) looking for crawlability, page speed, structured data, and topical authority.
2. **Generative Answer Engines & LLMs** (ChatGPT, Gemini, Perplexity, Claude, AI Overviews) retrieving direct textual facts, entities, structured tables, and community consensus to synthesize answers.

Legacy SEO tactics (keyword stuffing, paid backlink mills, low-value programmatic content generation, ranking without conversion) trigger algorithmic penalties and cause complete invisibility in AI search results.

This skill is the non-negotiable operational standard for building websites that dominate both classic search and generative AI retrieval.

---

## The Paradigm Shift: Old SEO vs New SEO

| Dimension | Legacy SEO (Fails Today) | New SEO Architecture (Wins Today) |
|---|---|---|
| **Keywords vs Meaning** | "Stuff the keyword" (Same word repeated everywhere) | Semantic entity relationships, topical hubs, intent resolution |
| **Authority & Links** | "Buy any link" (Quantity of links over topical trust) | Verified knowledge graph presence, citations in trusted entity bases, Reddit consensus |
| **Content Production** | "Pump out pages" (Thin programmatic mass pages) | One deep, authoritative topic per page, plain-text specs, semantic tables |
| **User Journey** | "Chase page one" (Rank at all costs, then hope they stay) | Search Experience Optimization (SXO): sub-1.2s speed, immediate 2-line answers, clear CTA |

---

## The 5 Pillars & 18 Tactical Checkpoints

```
┌───────────────────────────────────────────────────────────┐
│                      NEW SEO ARCHITECTURE                 │
├─────────────┬─────────────────────────────────────────────┤
│ 1. SEO BASE │ Technical Crawlability Foundations          │
│ 2. AEO      │ Answer Engine Optimization (Snippet Cards) │
│ 3. GEO      │ Generative Engine Optimization (AI Engines) │
│ 4. AIO      │ AI Optimization & Content Structure         │
│ 5. SXO      │ Search Experience Optimization (Conversion) │
└─────────────┴─────────────────────────────────────────────┘
```

---

### Pillar 1: SEO BASE — Technical Crawlability Foundations
Every discovery pipeline starts with an accessible, error-free technical foundation. If machines cannot fetch and understand your markup within milliseconds, AI models cannot synthesize your data.

#### 1. Trusted, Crawlable Pages
- **Requirement:** Allow standard search and AI crawlers in `robots.txt`. Provide valid XML sitemaps.
- **Rule:** Never block AI user-agents unless explicitly mandated by the business.
- **Code Directive:**
```txt
# robots.txt
User-agent: Googlebot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

#### 2. Clear Internal Links
- **Requirement:** Hierarchical topic silo architecture. Every child page must link upward to its parent category, and sibling pages must cross-link contextually.
- **Rule:** Zero orphan pages. Every indexable URL must be reachable within 3 clicks from the homepage. Use descriptive anchor text instead of "click here" or "read more".

#### 3. Search Console Checks
- **Requirement:** Zero unhandled 4xx/5xx errors in Google Search Console. 100% valid Schema markup without warnings.
- **Benchmark:** Valid canonical tags on every page. Zero redirect chains.

---

### Pillar 2: AEO — Answer Engine Optimization
AEO ensures your content is selected by voice assistants, Google AI Overviews, and featured snippet boxes.

#### 4. Answer in 2 Lines
- **Requirement:** Directly under any major question heading (`<h2>` or `<h3>`), provide a concise, factual 40–60 word answer in plain language before elaborating.
- **Rule:** Do not bury the answer under marketing fluff. State the definition, price, solution, or fact immediately.
- **Example:**
```html
<h2>What is Generative Engine Optimization?</h2>
<p>
  Generative Engine Optimization (GEO) is the practice of optimizing content so AI models like ChatGPT, Gemini, and Perplexity cite your brand as an authoritative source in synthesized answers.
</p>
```

#### 5. FAQ on Key Pages
- **Requirement:** Include structured FAQ modules on high-intent service and product pages.
- **Markup Requirement:** Always pair with Schema.org `FAQPage` JSON-LD.
- **Code Blueprint:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How does the 5-pillar SEO stack improve organic traffic?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "The 5-pillar stack aligns technical crawlability with semantic structuring and entity citations, allowing pages to capture both classic Google ranks and generative AI citations."
    }
  }]
}
</script>
```

#### 6. Business Profile & Entity Data
- **Requirement:** Consistent NAP (Name, Address, Phone) across Google Business Profile, Apple Maps, Bing Places, and your website.
- **Rule:** Complete Schema.org `Organization` or `LocalBusiness` structured data linking your official social handles (`sameAs`).

---

### Pillar 3: GEO — Generative Engine Optimization
Large language models retrieve facts from trusted knowledge bases, public citations, and high-reputation domains. GEO builds your brand's presence in the vector embeddings of AI models.

#### 7. Named in ChatGPT
- **Requirement:** Establish a clear digital footprint in authoritative databases that OpenAI models crawl (Wikidata, Wikipedia citations, Crunchbase, official press releases).
- **Rule:** Maintain consistent entity naming across all publications.

#### 8. Cited by Gemini
- **Requirement:** Align with the Google Knowledge Graph. Use `sameAs` entity markup referencing Wikidata and authoritative directories.
- **Rule:** Gain contextual editorial mentions on topical industry authorities that Google crawls frequently.

#### 9. Quoted in Perplexity
- **Requirement:** Perplexity prioritizes live, fresh, factual web retrieval. Publish clear primary research, technical whitepapers, real benchmark data, and date-stamped changelogs.
- **Rule:** Provide clear bylines, author credentials, and verifiable reference citations.

#### 10. Reddit & Review Sites
- **Requirement:** Active, organic presence in community discussions (Reddit, Quora, industry subforums) and trusted review platforms (G2, Trustpilot, Capterra).
- **Why:** Modern LLMs heavily weight unvarnished user opinions and community consensus to formulate buyer recommendations.

#### 11. Track AI Mentions
- **Requirement:** Regularly test synthetic prompts across ChatGPT, Gemini, Claude, and Perplexity (e.g., *"What are the best tools for X?", "Compare provider A vs provider B"*).
- **Rule:** Log your brand's citation frequency, sentiment, and recommended positioning.

---

### Pillar 4: AIO — AI Optimization & Content Structure
LLMs and retrieval-augmented generation (RAG) systems do not read pages like humans do; they chunk text, generate vector embeddings, and search for structured data points.

#### 12. One Topic Per Page
- **Requirement:** Each page must target one specific user intent and topic cluster with deep, comprehensive coverage.
- **Rule:** Never dilute a page with 5 unrelated offers. Single intent enables high embedding relevance scores in vector databases.

#### 13. Lists & Tables
- **Requirement:** Format comparison data, feature checklists, and step-by-step procedures using semantic `<table>`, `<ul>`, and `<ol>` HTML elements.
- **Rule:** Vector parsers and LLM extraction scrapers easily ingest semantic HTML tables, significantly increasing the probability of being rendered in AI comparison answers.
- **Example:**
```html
<table class="specs-table">
  <thead>
    <tr>
      <th>Pillar</th>
      <th>Primary Metric</th>
      <th>Target Outcome</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>AEO</td>
      <td>Answer Word Count</td>
      <td>40–60 words under H2</td>
    </tr>
    <tr>
      <td>SXO</td>
      <td>Largest Contentful Paint</td>
      <td>Sub-1.2s mobile load time</td>
    </tr>
  </tbody>
</table>
```

#### 14. Prices & Specs as Text
- **Requirement:** All pricing tiers, feature lists, compatibility requirements, and technical specifications must be plain HTML text.
- **STRICT PROHIBITION:** Never put prices, technical specifications, or contact information inside images, Canva graphics, canvas elements, or client-side-only JavaScript renders.

---

### Pillar 5: SXO — Search Experience Optimization
Traffic is worthless if visitors immediately bounce. SXO ensures that once a user lands on the site from Google or an AI link, their experience converts them into customers.

#### 15. Page Matches the Search
- **Requirement:** The content above the fold must immediately confirm that the user has reached the exact answer, product, or solution they searched for.
- **Rule:** Hero headline must match the search intent (informational, transactional, or comparison) with zero clickbait deception.

#### 16. Fast, Easy on Mobile
- **Requirement:** Strict Core Web Vitals thresholds:
  - **LCP (Largest Contentful Paint):** `< 1.2s` on mobile devices.
  - **CLS (Cumulative Layout Shift):** `0.00`.
  - **INP (Interaction to Next Paint):** `< 150ms`.
  - **Touch Targets:** Minimum 48px height for all clickable buttons and form inputs.

#### 17. Reviews & Proof on Page
- **Requirement:** Surface social proof, verifiable customer reviews, client logos, and trust badges immediately adjacent to key decision points (pricing cards, CTAs, sign-up forms).
- **Rule:** Real names, real metrics, real outcomes. Never use generic or placeholder quotes.

#### 18. Clear Call to Action (CTA)
- **Requirement:** One primary conversion goal per page. 
- **Rule:** High contrast, accessible color (minimum 4.5:1 contrast ratio), active state feedback (`scale-[0.98]`), and clear value-oriented button copy (e.g., *"Run free audit"*, *"Get instant quote"*, not generic *"Submit"*).

---

## 18-Point Audit Scorecard

Use this scoring rubric to evaluate any existing or newly generated site:

| Pillar | Checkpoint | Points | Passed? |
|---|---|---|---|
| **SEO BASE** | 1. Trusted, crawlable pages (clean robots.txt, sitemaps) | 5.5% | [ ] |
| **SEO BASE** | 2. Clear internal links (zero orphan pages, silo anchors) | 5.5% | [ ] |
| **SEO BASE** | 3. Search Console checks (0 errors, valid schema, mobile ready) | 5.5% | [ ] |
| **AEO** | 4. Answer in 2 lines (concise 40–60 words under H2/H3) | 5.5% | [ ] |
| **AEO** | 5. FAQ on key pages (JSON-LD FAQPage markup included) | 5.5% | [ ] |
| **AEO** | 6. Business Profile (consistent NAP, Organization schema) | 5.5% | [ ] |
| **GEO** | 7. Named in ChatGPT (Wikidata/Crunchbase presence) | 5.5% | [ ] |
| **GEO** | 8. Cited by Gemini (Knowledge Graph entity mapping) | 5.5% | [ ] |
| **GEO** | 9. Quoted in Perplexity (fresh citations, primary data) | 5.5% | [ ] |
| **GEO** | 10. Reddit & review sites (active community discussions) | 5.5% | [ ] |
| **GEO** | 11. Track AI mentions (regular synthetic prompt audits) | 5.5% | [ ] |
| **AIO** | 12. One topic per page (deep topical authority) | 5.5% | [ ] |
| **AIO** | 13. Lists & tables (semantic `<table>` and list markup) | 5.5% | [ ] |
| **AIO** | 14. Prices & specs as text (zero text-in-image) | 5.5% | [ ] |
| **SXO** | 15. Page matches the search (exact search intent match) | 5.5% | [ ] |
| **SXO** | 16. Fast, easy on mobile (sub-1.2s LCP, zero CLS) | 5.5% | [ ] |
| **SXO** | 17. Reviews & proof on page (verified testimonials near CTAs) | 5.5% | [ ] |
| **SXO** | 18. Clear call to action (single conversion intent) | 6.5% | [ ] |

### Diagnosis Scale:
- **80% – 100%:** **Generative Search Ready.** The site satisfies algorithmic crawl rules and provides optimal vector retrieval structures for AI answer synthesis.
- **50% – 79%:** **Partial Coverage.** Technical basics exist, but the brand is largely invisible in ChatGPT, Gemini, and Perplexity answers. Urgent focus on GEO and AIO required.
- **< 50%:** **Critical AI Blindspot.** Legacy keyword-based structure. Risk of traffic decline as generative search expands.

---

## Instructions for AI Agents Building New Websites

When instructed to create, redesign, or audit any landing page or website:
1. **Always implement Schema.org JSON-LD:** Include `Organization`, `WebSite`, `FAQPage`, and relevant `Product`/`Service` schemas.
2. **Format answers concisely:** Under every primary headline, write an initial 2-line direct answer before adding supporting details.
3. **Use semantic tables:** For pricing, specifications, comparisons, and feature lists, always use clean HTML `<table>` elements with descriptive `<th>` headers.
4. **Enforce plain text:** Never hide numerical specs, prices, or key benefits inside images or unindexed canvas components.
5. **Guarantee mobile performance:** Optimize images with modern formats (SVG, WebP), eliminate layout shifts, and enforce min 48px tap targets.
