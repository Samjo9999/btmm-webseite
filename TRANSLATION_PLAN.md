# Document Translation Plan - 11 Languages

## Project: BtMM-App Dokumente,Umgebung

**Target Languages:** DE, EN, ZH, ES, HI, AR, BN, PT, RU, JA, FR (11 total)

**Current Status:** Audit Complete | Structure: Ready | Translation: Pending

---

## Document Inventory

### TIER 1: Customer-Facing Core (5 documents)
- [ ] BtB_Einfuehrung_v2_2_0.pdf
- [ ] BtB_Konzept_v17_3_2.pdf
- [ ] BtB_Gemeinschaftskultur_v1_1_0.pdf
- [ ] BtB_Handwerk_Ergaenzung_v1_1_0.pdf
- [ ] BtB_Was_wir_saehen_v1_2_0.pdf

### TIER 2: Legal & Organizational (3 documents)
- [ ] BackToBalance_Satzung_v2_2_0.pdf
- [ ] BtB_Steuer_Briefing_v2_1_1.pdf
- [ ] BtB_Aufruf_Beteiligung_v2_0_0.pdf

### TIER 3: Operational (4 documents)
- [ ] BtB_Ideen_Horizont_v2_1_0.pdf
- [ ] BtB_Wirtschaften_Anleitung_v1_3_1.pdf
- [ ] BtB_Einladung_Gruendung_v1_1_0.pdf
- [ ] BtB_Handwerk_Zulassungen_Detail_v1_1_0.pdf

### TIER 4: Brand Materials (2 documents)
- [ ] BtB Flyer Druck 05.2024 (148 × 105 mm).pdf
- [ ] btb_color_palette.pdf

### IMAGES & GRAPHICS (10 files)
- [ ] Behandlung Kopf.jpg
- [ ] Design ohne Titel (1).png
- [ ] Design ohne Titel (2).png
- [ ] Design ohne Titel.png
- [ ] Logo Back to Balance Transparent.png
- [ ] Video_Skript_BtB_App.md (text translation)
- [ ] Brief_Registergericht_Paysera.md (text translation)
- [ ] Screenshots (4)
- [ ] treepose Silhouette (graphic, no text)

---

## Folder Structure

```
Dokumente,Umgebung/
├── _Translations/
│   ├── DE/  (original - reference)
│   ├── EN/
│   ├── ZH/  (Simplified Chinese)
│   ├── ES/  (Spanish)
│   ├── HI/  (Hindi)
│   ├── AR/  (Arabic)
│   ├── BN/  (Bengali)
│   ├── PT/  (Portuguese)
│   ├── RU/  (Russian)
│   ├── JA/  (Japanese)
│   └── FR/  (French)
├── [original folders - unchanged]
```

**Naming Convention:**
- `BtB_Einfuehrung_DE.pdf` → `BtB_Einfuehrung_EN.pdf`, `BtB_Einfuehrung_FR.pdf`, etc.
- Maintains version numbers: `BtB_Einfuehrung_v2_2_0_EN.pdf`

---

## Translation Strategy

### PDFs (15 files)
1. Extract text using OCR/PDF parsing
2. Translate content maintaining formatting
3. Re-export as PDF with translated text
4. Preserve images, logos, branding
5. Tools: Python (pypdf, pptranslate) + Claude API

### Images with Text (3-5 files)
1. Extract visible text overlays
2. Translate text
3. Create new image with translated text OR add as separate text file
4. For logo/graphics-only: copy as-is (no translation needed)

### Markdown Files (3 files)
1. Direct text translation
2. Preserve markdown formatting
3. Update internal links if needed

---

## Translation Process

### Phase 1: German Reference (DE)
- Copy all original PDFs to `_Translations/DE/`
- Create reference catalog with keys/sections

### Phase 2: English (EN) - Priority 1
- TIER 1 documents first (5 PDFs)
- Then TIER 2 (3 PDFs)
- Quality check: native speaker review

### Phase 3: Remaining Languages
- **Romance Languages:** FR, ES, PT
- **Asian Languages:** ZH, JA, HI
- **Others:** AR, RU, BN
- Batch process: 2 languages per run

### Phase 4: Quality Assurance
- Terminology consistency checks
- Brand name preservation (Back to Balance → keep English in some contexts)
- Legal document verification

---

## Implementation Notes

### Language-Specific Considerations

**English (EN):** Keep brand name "Back to Balance" vs "BtB"

**Chinese (ZH):** Simplified Mandarin, may need 20-30% more space for same content

**Spanish (ES):** Formal/informal tone - recommend formal for official documents

**Hindi (HI):** RTL text, special characters, dates format (DD/MM/YYYY)

**Arabic (AR):** RTL language, text directionality affects layout

**Portuguese (PT):** BR Portuguese vs EU Portuguese - recommend BR (larger market)

**Russian (RU):** Longer text generally, special characters

**Japanese (JA):** Consider hiragana/kanji balance, 50-60% more vertical space

**Bengali (BN):** RTL, special script, dates

**French (FR):** 15-20% longer than German, maintain formal tone

---

## Estimated Timeline

- **Phase 1 (German Reference):** 2 hours
- **Phase 2 (English):** 8 hours (TIER 1+2)
- **Phase 3 (Other Languages):** 12-15 hours (batched)
- **Phase 4 (QA):** 3-4 hours
- **Total: ~25-30 hours automated + validation**

---

## Success Criteria

- [ ] All 14 core PDFs translated to 11 languages (154 PDFs total)
- [ ] All images with text adapted
- [ ] Markdown files translated
- [ ] Consistent terminology across all languages
- [ ] Brand identity preserved
- [ ] File naming convention consistent
- [ ] Download structure clear for users
- [ ] Legal documents reviewed for accuracy

---

## Notes for Implementation

1. Use Claude API for high-quality translations (better context awareness than basic APIs)
2. Preserve PDF structure and formatting
3. Consider domain-specific terminology (corpo terms, BtB concepts)
4. For legal documents: use professional translator validation
5. Test with actual PDF readers to verify layouts
6. Create index/guide page explaining language organization

