# Document Translation Implementation Guide

**Status:** Ready for Execution
**Date:** 2026-06-04
**Scope:** 14 core PDFs + supporting materials → 11 languages

---

## Quick Start

### Prerequisites
```bash
pip install pdfplumber anthropic
```

### Run Translation
```bash
cd "/c/Users/fence/Projekte mit Claude Code/BtMM-App"
python translate_documents.py
```

---

## What's Been Completed

### ✓ Phase 1: Audit & Structure

**Document Inventory (28 files total)**
- 15 core PDFs (14 main + 1 flyer)
- 1 color palette PDF
- 10 images (JPG, PNG)
- 3 markdown files

**Folder Structure Created**
```
Dokumente,Umgebung/
├── _Translations/
│   ├── DE/  (14 German originals copied ✓)
│   ├── EN/  (empty, ready for translations)
│   ├── ZH/  (empty, ready for translations)
│   ├── ES/  (empty, ready for translations)
│   ├── HI/  (empty, ready for translations)
│   ├── AR/  (empty, ready for translations)
│   ├── BN/  (empty, ready for translations)
│   ├── PT/  (empty, ready for translations)
│   ├── RU/  (empty, ready for translations)
│   ├── JA/  (empty, ready for translations)
│   └── FR/  (empty, ready for translations)
├── [original folders - unchanged]
```

**Files Prepared**
1. TRANSLATION_PLAN.md - Comprehensive planning document
2. translate_documents.py - Automated translation script
3. TRANSLATION_IMPLEMENTATION.md - This file

---

## How the Translation Works

### Automated Process (Python Script)

1. **PDF Text Extraction**
   - Uses `pdfplumber` to extract all text from German PDFs
   - Preserves structure and formatting info

2. **Claude API Translation**
   - Sends extracted text to Claude Opus 4.1
   - System prompt ensures:
     - Professional domain-aware translation
     - Brand name preservation (Back to Balance/BtB)
     - Terminology consistency
     - Cultural/linguistic adaptation for RTL languages
     - Proper capitalization and formatting

3. **Output Generation**
   - Creates translated text files (initially as .txt)
   - Names follow convention: `BtB_Einfuehrung_v2_2_0_EN.txt`
   - Organized by language folder

4. **Reporting**
   - Generates TRANSLATION_REPORT.json with results
   - Maintains detailed log of all operations
   - Creates INDEX.md for user navigation

### Manual Post-Processing (Required)

For production PDFs, you'll need to:

1. **Inspect Translations**
   - Review each .txt file for accuracy
   - Check terminology consistency
   - Verify formatting preservation

2. **Create Final PDFs**
   - Use PDF editor (Adobe, Affinity Designer, etc.)
   - Replace German text with translated text
   - Maintain original layout and design
   - Ensure branding is preserved

3. **Quality Check**
   - Test PDF display in readers
   - Verify special characters (Arabic, Chinese, Hindi)
   - Check page breaks and formatting

---

## Document Priority & Timeline

### Phase 2: English (EN) - NEXT
**Target: 8 hours**

Tier 1 - Customer-Facing (HIGHEST PRIORITY)
- [ ] BtB_Einfuehrung_v2_2_0_EN.txt → PDF
- [ ] BTB_Konzept_v17_3_2_EN.txt → PDF
- [ ] BtB_Gemeinschaftskultur_v1_1_0_EN.txt → PDF
- [ ] BtB_Handwerk_Ergaenzung_v1_1_0_EN.txt → PDF
- [ ] BtB_Was_wir_saehen_v1_2_0_EN.txt → PDF

Tier 2 - Legal (HIGH PRIORITY)
- [ ] BackToBalance_Satzung_v2_2_0_EN.txt → PDF
- [ ] BtB_Steuer_Briefing_v2_1_1_EN.txt → PDF
- [ ] BtB_Aufruf_Beteiligung_v2_0_0_EN.txt → PDF

### Phase 3: Romance Languages
**Target: 6 hours**

- French (FR): 15-20% longer text, formal tone
- Spanish (ES): Use formal register (usted)
- Portuguese (PT): Brazilian Portuguese variant

### Phase 4: Asian Languages
**Target: 6 hours**

- Chinese (ZH): Simplified Mandarin, may need 20-30% more space
- Japanese (JA): Consider hiragana/kanji, needs 50-60% more vertical space
- Hindi (HI): RTL text, special Devanagari script

### Phase 5: Other Languages
**Target: 3-4 hours**

- Arabic (AR): RTL directionality, Quranic vs. standard register
- Russian (RU): Generally 10% longer, Cyrillic
- Bengali (BN): RTL, special Bengali script

---

## Language-Specific Notes

### English (EN)
- Keep "Back to Balance" brand name (not translated)
- Use "BtB" as acronym consistently
- "Körperarbeit" → "bodywork" or "physical bodywork"
- "Genossenschaft" → "cooperative"
- Formal but accessible tone
- American English spelling (favorite, organize, etc.)

### German (DE)
- Reference original files in `_Translations/DE/`
- Maintain as source of truth

### French (FR)
- Formal address (vous)
- Generally 15-20% longer than German
- Hyphenated compound words common
- Maintain French spacing rules (space before punctuation)

### Spanish (ES)
- Formal register (usted) for official documents
- Consider Latin American (ES-MX) or European (ES-ES)
- Recommendation: ES (European) for consistency

### Portuguese (PT)
- Brazilian Portuguese (PT-BR) recommended (larger market)
- Differs from European Portuguese (PT-PT) in verb forms
- Key: não (no), você (you - informal)

### Chinese (ZH)
- Simplified Chinese (Hanzi) recommended for accessibility
- Back to Balance → 回归平衡 (return to balance)
- May require 20-30% more vertical/horizontal space
- No spaces between words - careful with layout

### Japanese (JA)
- Mixture of hiragana, katakana, kanji
- Back to Balance → バランスへの回帰 (katakana for foreign brand + kanji)
- Formal (敬語) for official documents
- Vertical text reading possible (not needed here)
- 50-60% more vertical space than German

### Hindi (HI)
- Devanagari script (left-to-right, unlike Arabic)
- Honorifics important (आप - formal, तुम - informal)
- Dates: DD/MM/YYYY format
- Currency: ₹ (Indian Rupee symbol)
- Legal terms need careful translation

### Arabic (AR)
- Right-to-left (RTL) - affects entire layout
- Formal Standard Arabic (Fusha) recommended
- No gender-neutral option - must choose form
- Diacritics (tashkeel) optional but important for clarity
- PDF text flow reversal needed

### Bengali (BN)
- RTL script, special Bengali characters
- Official/formal tone (aapni - you formal)
- Dates: DD/MM/YYYY
- Currency: ৳ (Taka)
- Limited Latin character fallback

### Russian (RU)
- Cyrillic script, 10-15% longer text than German
- Formal (вы) vs. informal (ты) - use formal for documents
- Legal terminology: особенное значение (special importance)
- PDF encoding: UTF-8 required

---

## File Naming Convention

**Original German:**
```
BtB_Einfuehrung_v2_2_0.pdf
```

**Translations:**
```
BtB_Einfuehrung_v2_2_0_EN.txt  (English translation)
BtB_Einfuehrung_v2_2_0_FR.txt  (French translation)
BtB_Einfuehrung_v2_2_0_ZH.txt  (Chinese translation)
...etc
```

**After PDF conversion:**
```
BtB_Einfuehrung_v2_2_0_EN.pdf
BtB_Einfuehrung_v2_2_0_FR.pdf
BtB_Einfuehrung_v2_2_0_ZH.pdf
...etc
```

---

## Image Translation Strategy

### Images with Text (Tier Priority)

**High Priority**
- Design ohne Titel (1-3).png (design mockups - may contain text)
- Video_Skript_BtB_App.md (already text - direct translation)

**Medium Priority**
- Screenshots (4568, 4571, 4572) - if they contain UI text, translate

**Low Priority (Graphics-only)**
- Logo Back to Balance Transparent.png (no text, copy as-is)
- treepose Silhouette schwarz (graphic, no text)
- Behandlung Kopf.jpg (photo, possibly no text)

### Text File Translations

**Markdown Files (Direct Translation)**
1. Video_Skript_BtB_App.md → Video_Skript_BtB_App_EN.md, etc.
2. Brief_Registergericht_Paysera.md → Brief_Registergericht_Paysera_EN.md, etc.

---

## Quality Assurance Checklist

### For Each Translated Document

- [ ] Text extracts correctly (no OCR errors)
- [ ] Translation reads naturally in target language
- [ ] Brand names preserved (Back to Balance, BtB)
- [ ] Numbers/dates formatted for locale
- [ ] Special characters display correctly (Arabic, Chinese, Hindi)
- [ ] Terminology consistent with other documents
- [ ] No untranslated German words remain
- [ ] Legal/formal tone maintained
- [ ] Cultural adaptations appropriate
- [ ] PDF layout test (if PDF-converted)

### Terminology Consistency

**Core Terms (maintain across all languages)**
- Back to Balance → [specific term per language, but keep English brand]
- BtB → keep as acronym
- Genossenschaft → cooperative (EN), coopérative (FR), etc.
- Körperarbeit → bodywork (EN), travail corporel (FR), etc.

**Create term glossary**
```
German          English         French          Spanish
─────────────────────────────────────────────────────
Körperarbeit    bodywork        travail corporel   trabajo corporal
Genossenschaft  cooperative     coopérative        cooperativa
Handwerk        crafts/trades   artisanat          artesanía
Unterstützung   support         soutien            apoyo
```

---

## Execution Steps

### Step 1: Install Dependencies
```bash
pip install pdfplumber anthropic
```

### Step 2: Set Claude API Key
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

### Step 3: Run Translator Script
```bash
cd "/c/Users/fence/Projekte mit Claude Code/BtMM-App"
python translate_documents.py
```

### Step 4: Review Generated Translations
```bash
# Check output in _Translations/EN/ folder
ls _Translations/EN/
# Review first translation
cat _Translations/EN/BtB_Einfuehrung_v2_2_0_EN.txt
```

### Step 5: Convert to PDFs
For each language folder (EN, FR, ZH, ES, etc.):
1. Open original PDF (from DE folder)
2. Replace text with translated version
3. Save as `_EN.pdf`, `_FR.pdf`, etc.
4. Test in PDF reader

### Step 6: Organize & Deploy
```bash
# Create download-ready structure
cp _Translations/*/BtB_*.pdf ./download_ready/
# Create language packs
cd download_ready
zip -r BtB_Documents_EN.zip EN/
zip -r BtB_Documents_FR.zip FR/
# ...etc
```

---

## Expected Outcomes

### After Running Script
- 140 translation files generated (14 docs × 10 languages)
- TRANSLATION_REPORT.json created with full log
- INDEX.md for navigation
- Ready for PDF conversion

### After Manual PDF Conversion
- 140 production-ready PDFs
- Consistent naming and organization
- All 11 languages available
- Professional formatting maintained

### Downloadable Artifacts
- Individual PDFs per language
- Language packs (all documents in one language)
- Complete translation bundle
- Glossary/terminology guide

---

## API Cost Estimation

**Claude API Pricing** (approximate)
- 14 documents × 10 languages = 140 translations
- Average document: 3,000-5,000 tokens per language
- Cost: ~$50-80 for complete translation suite

---

## Next Steps

1. **Install dependencies** → `pip install pdfplumber anthropic`
2. **Set API key** → `export ANTHROPIC_API_KEY="..."`
3. **Run script** → `python translate_documents.py`
4. **Review outputs** → Check `_Translations/EN/` first
5. **Convert to PDFs** → Use PDF editor to format translated text
6. **Quality check** → Verify each language folder
7. **Deploy** → Upload to download server or document repository

---

## Support Resources

### Language-Specific Terminologies
- German-English: ISO 639-1 language codes
- RTL Languages: Arabic, Hebrew patterns
- CJK: Chinese, Japanese character handling
- Devanagari: Hindi, Sanskrit script

### PDF Tools
- Adobe Acrobat DC (professional PDF editing)
- Affinity Designer (design-focused)
- LibreOffice Draw (free alternative)
- Ghostscript (command-line PDF manipulation)

### Validation
- MultiLing Online Dictionary (terminology)
- Google Translate (quick verification)
- Reverso Context (usage patterns)
- DeepL (professional translation reference)

---

**Created:** 2026-06-04
**Last Updated:** 2026-06-04
**Status:** Ready for Execution
