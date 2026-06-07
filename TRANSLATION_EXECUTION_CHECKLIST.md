# Translation Execution Checklist

**Project:** BtMM Document Translation to 11 Languages  
**Status:** Phase 1 Complete | Ready for Phase 2  
**Date:** 2026-06-04

---

## PRE-EXECUTION VERIFICATION

### System Setup
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pip available (`pip --version`)
- [ ] API key obtained from Anthropic Claude
- [ ] API key set: `export ANTHROPIC_API_KEY="sk-ant-..."`
- [ ] Internet connection available

### Dependencies Installation
```bash
pip install pdfplumber anthropic
```
- [ ] pdfplumber installed successfully
- [ ] anthropic SDK installed successfully
- [ ] Verify: `python -c "import pdfplumber; import anthropic; print('OK')"`

### Project Structure Verification
- [ ] Original documents in: `/Dokumente,Umgebung/Dokumente/` ✓
- [ ] German copies in: `/Dokumente,Umgebung/_Translations/DE/` (14 PDFs) ✓
- [ ] Language folders created: `/Dokumente,Umgebung/_Translations/{EN,FR,ES,PT,ZH,JA,HI,AR,RU,BN}/` ✓
- [ ] Translation script: `/translate_documents.py` ✓
- [ ] Documentation files created ✓

### Resource Availability
- [ ] Minimum 2 GB RAM available
- [ ] Minimum 500 MB free disk space
- [ ] Sufficient Claude API quota ($50-150 budget available)
- [ ] No network restrictions affecting API calls

---

## DOCUMENTATION REVIEW

Before executing, review these files in order:

1. **TRANSLATION_SUMMARY.md** (15 KB, 537 lines)
   - [ ] Read executive summary
   - [ ] Understand architecture decisions
   - [ ] Review timeline and costs
   - [ ] Understand language-specific considerations
   
2. **TRANSLATION_IMPLEMENTATION.md** (12 KB, 417 lines)
   - [ ] Review quick start section
   - [ ] Understand translation workflow
   - [ ] Note language-specific formatting rules
   - [ ] Review QA checklist
   - [ ] Understand file naming convention

3. **TRANSLATION_PLAN.md** (5 KB, 176 lines)
   - [ ] Review document inventory
   - [ ] Understand translation strategy
   - [ ] Note implementation notes per language

4. **INDEX.md** (8 KB, 300 lines)
   - [ ] Review user navigation guide
   - [ ] Understand folder structure
   - [ ] Note recommended reading order

---

## PHASE 2: ENGLISH TRANSLATION EXECUTION

### Step 1: Script Preparation
```bash
cd "/c/Users/fence/Projekte mit Claude Code/BtMM-App"
```
- [ ] Navigate to BtMM-App directory
- [ ] Verify `translate_documents.py` exists and is executable
- [ ] Review script permissions: `ls -l translate_documents.py`

### Step 2: Environment Setup
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```
- [ ] API key exported in current shell session
- [ ] Verify: `echo $ANTHROPIC_API_KEY` shows partial key
- [ ] Note: Key will be lost when shell closes (set permanently in ~/.bashrc if needed)

### Step 3: Test Run (Optional - Recommended)
Before running full translation, test with single document:

```bash
python -c "
from translate_documents import DocumentTranslator
translator = DocumentTranslator('/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations')
# Test extraction
text = translator.extract_pdf_text('/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations/DE/BtB_Einfuehrung_v2_2_0.pdf')
print(f'Extracted {len(text)} characters')
print('First 200 chars:', text[:200])
"
```
- [ ] Text extraction works (should show character count > 0)
- [ ] First 200 characters display correctly
- [ ] No errors in output

### Step 4: Execute Full Translation

**Option A: Batch Translation (All Documents)**
```bash
python translate_documents.py
```
- [ ] Script starts successfully
- [ ] Displays "BtMM Document Translation System" header
- [ ] Checks dependencies (should show: pdfplumber OK, anthropic OK)
- [ ] Begins processing TIER 1 documents
- [ ] Progress displayed for each document
- [ ] Translation reports generated

**Option B: Test with Single Language First**
Modify `translate_documents.py` to test EN only (recommended):
- [ ] Edit line with `target_languages` to: `["EN"]` only
- [ ] Run script
- [ ] Review 1-2 translations manually
- [ ] Check output in `_Translations/EN/`
- [ ] Restore to all languages when satisfied

### Step 5: Monitor Execution
During execution, watch for:
- [ ] No Python errors (should see "•" or "✓" prefixes)
- [ ] Processing logs appear for each document
- [ ] Translations complete without hanging (5-10 seconds per language)
- [ ] Index.md auto-updated
- [ ] TRANSLATION_REPORT.json generated

**Estimated Duration:**
- English (1 language): ~2-3 hours
- All 10 target languages: ~20-25 hours (can batch)

---

## POST-EXECUTION VERIFICATION

### Step 1: Check Output Files
```bash
ls -la "/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations/EN/"
```
- [ ] Folder contains translation files
- [ ] File count matches documents (14+ files)
- [ ] Files named with `_EN.txt` suffix
- [ ] Example: `BtB_Einfuehrung_v2_2_0_EN.txt`

### Step 2: Verify Translation Quality
```bash
head -50 "/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations/EN/BtB_Einfuehrung_v2_2_0_EN.txt"
```
- [ ] Text appears in English (not German)
- [ ] Reads naturally and professionally
- [ ] Brand name "Back to Balance" preserved
- [ ] No untranslated German words visible
- [ ] Formatting/structure maintained

### Step 3: Review Translation Report
```bash
cat "/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations/TRANSLATION_REPORT.json"
```
- [ ] Report file generated successfully
- [ ] Shows completion status
- [ ] Success/failed counts reasonable
- [ ] Log entries present for each document

### Step 4: Check Index Update
```bash
cat "/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations/INDEX.md"
```
- [ ] INDEX.md exists
- [ ] Status table updated
- [ ] Language status reflects translations (EN marked as "In Progress" or "Completed")

---

## PDF CONVERSION WORKFLOW

### Step 1: Convert Translated Text to PDF

For each language (start with EN):

1. **Open Original PDF**
   - Location: `_Translations/DE/BtB_Einfuehrung_v2_2_0.pdf`
   - Tool: Adobe Acrobat, Affinity Designer, or LibreOffice Draw

2. **Load Translated Text**
   - Open: `_Translations/EN/BtB_Einfuehrung_v2_2_0_EN.txt` in text editor
   - Copy all content

3. **Replace Text in PDF**
   - Use PDF editor's find/replace or text layer editing
   - Replace German text with English translation
   - Maintain original formatting and layout
   - Keep images, logos, and design intact

4. **Save as New PDF**
   - Filename: `BtB_Einfuehrung_v2_2_0_EN.pdf`
   - Location: `_Translations/EN/`
   - Format: PDF (standard, not PDF/A)
   - Verify save successful

5. **Verify Output**
   - Open PDF in reader
   - Check text displays correctly
   - Verify formatting maintained
   - Test: Run through PDF search (should be searchable)

### Step 2: Quality Assurance

For each converted PDF:

- [ ] Text reads naturally in target language
- [ ] No formatting issues (page breaks, spacing)
- [ ] Images display correctly
- [ ] File size reasonable (~100-300 KB)
- [ ] PDF is searchable (not image-based)
- [ ] Special characters render correctly (if applicable)
- [ ] Hyperlinks still work (if present)
- [ ] Margins and spacing preserved

### Step 3: Organize Translations

After PDF conversion:

```bash
# Verify structure
ls -la _Translations/EN/  # Should show .pdf files, not .txt
ls -la _Translations/FR/  # Ready for French translation
```

- [ ] All `.txt` files converted to `.pdf`
- [ ] File naming consistent (`_EN.pdf`, `_FR.pdf`, etc.)
- [ ] All language folders organized
- [ ] Original `.txt` files can be archived or deleted

---

## ADDITIONAL LANGUAGE EXECUTION (Phases 3-5)

### Phase 3: Romance Languages (FR, ES, PT)
After Phase 2 English is complete and verified:

**Preparation:**
- [ ] Review TRANSLATION_PLAN.md for language-specific notes
- [ ] Update API key if needed
- [ ] Check API quota remaining

**Execution:**
```bash
# Modify translate_documents.py to run FR, ES, PT only
# Or run multiple times with different language lists
python translate_documents.py  # For FR, ES, PT
```

**Timeline:** 6 hours (2 hours per language)

**Special Notes:**
- French: 15-20% longer, maintain formal tone
- Spanish: Use formal register (usted), European standard
- Portuguese: Brazilian variant (PT-BR) recommended

### Phase 4: Asian Languages (ZH, JA, HI)
After Phase 3 complete:

**Execution:**
```bash
python translate_documents.py  # For ZH, JA, HI
```

**Timeline:** 6 hours (2 hours per language)

**Special Considerations:**
- Chinese: 20-30% more space needed, simplified hanzi
- Japanese: 50-60% more vertical space, hiragana/kanji mix
- Hindi: Devanagari script, RTL layout handling
- Test RTL rendering before final PDF conversion

### Phase 5: Other Languages (AR, RU, BN)
After Phase 4 complete:

**Execution:**
```bash
python translate_documents.py  # For AR, RU, BN
```

**Timeline:** 3-4 hours (1 hour per language)

**Special Considerations:**
- Arabic: Full RTL support, Standard Fusha form
- Russian: 10-15% longer, Cyrillic encoding
- Bengali: RTL, special script characters
- Critical: Test PDF rendering before deployment

---

## FINAL DEPLOYMENT

### Step 1: Complete QA

- [ ] All 140 PDFs created (14 documents × 10 languages)
- [ ] All PDFs tested in PDF reader
- [ ] Random spot-checks in each language passed
- [ ] Terminology consistent across documents
- [ ] Brand names preserved correctly
- [ ] Legal documents reviewed for accuracy

### Step 2: Create Download Packages

```bash
cd "/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations"

# Option 1: Per-language zip files
zip -r BtMM_Documents_EN.zip EN/
zip -r BtMM_Documents_FR.zip FR/
# ...etc for all 10 languages

# Option 2: Per-document zip files
zip BtMM_Einfuehrung_AllLanguages.zip */BtB_Einfuehrung*
# ...etc for all documents
```

- [ ] Zip files created successfully
- [ ] File size reasonable (100-500 MB per zip)
- [ ] Test: Extract and verify structure

### Step 3: Create User Guide

```bash
# README file in _Translations/ root
cat > README.txt << 'EOF'
BtMM Multilingual Document Repository
======================================

11 Languages Available: DE, EN, FR, ES, PT, ZH, JA, HI, AR, RU, BN

How to Download:
1. Choose your language folder (e.g., EN/)
2. Download PDF documents you need
3. Open in any PDF reader

All documents translated with care to maintain meaning and format.
For more information, see INDEX.md in each language folder.

Created: 2026-06-04
EOF
```

- [ ] README.txt created
- [ ] INDEX.md accessible in each language folder
- [ ] User instructions clear and simple

### Step 4: Deploy to Distribution

- [ ] Upload to document repository/server
- [ ] Verify all files accessible
- [ ] Test download links
- [ ] Share URL with stakeholders

### Step 5: Create Final Report

```bash
cat > TRANSLATION_FINAL_REPORT.md << 'EOF'
# BtMM Multilingual Translation - Final Report

## Project Summary
- Status: COMPLETE
- Date: 2026-06-04
- Documents: 14 core PDFs
- Languages: 11 (DE + 10 target)
- Total Translations: 140 PDFs

## Quality Metrics
- All PDFs tested and verified
- Terminology consistent across languages
- Brand preservation: 100%
- Special character support: Verified
- RTL language support: Tested

## Language Coverage
- European: 4 languages (DE, EN, FR, ES, PT)
- Asian: 3 languages (ZH, JA, HI)
- Other: 4 languages (AR, RU, BN)
- Total Reach: 2.8+ billion speakers

## Timeline
- Planning: 3 hours
- Translation: 20 hours
- PDF Conversion: 5 hours
- QA: 2 hours
- Total: 30 hours

## Cost
- API Calls: $80
- Labor: 30 hours
- Total: ~$130

---

Status: READY FOR DISTRIBUTION
EOF
```

- [ ] Final report created
- [ ] Report documents all metrics
- [ ] Report saved in `_Translations/` root

---

## TROUBLESHOOTING

### Common Issues & Solutions

**Issue: "APIError: 401 Unauthorized"**
- Solution: Check API key is correct and has quota
- Action: `echo $ANTHROPIC_API_KEY` to verify
- Fix: `export ANTHROPIC_API_KEY="correct-key"`

**Issue: "pdfplumber not found"**
- Solution: Install dependency
- Action: `pip install pdfplumber`

**Issue: "UTF-8 encoding errors"**
- Solution: Ensure terminal encoding is UTF-8
- Action: `export LANG=en_US.UTF-8`

**Issue: "PDF text not extracted"**
- Solution: Some PDFs may be scanned images
- Action: Use OCR tool first (Tesseract, Adobe)
- Fallback: Manually re-type content

**Issue: "Translation quality poor for specific language"**
- Solution: Adjust system prompt in translate_documents.py
- Action: Edit LANGUAGE_PROMPTS section for that language

**Issue: "Script hangs or times out"**
- Solution: API rate limiting or network issue
- Action: Retry later or check API status
- Workaround: Run smaller batches (fewer languages)

---

## SUCCESS CRITERIA

### Phase 1: Complete ✓
- [x] Audit completed
- [x] Structure created
- [x] Scripts ready
- [x] Documentation written

### Phase 2: English (IN PROGRESS)
- [ ] 14 PDFs translated
- [ ] All text files reviewed
- [ ] PDFs converted
- [ ] Quality verified
- **Target: 1-2 days**

### Phase 3: Other Languages (PENDING)
- [ ] All 10 additional languages translated
- [ ] All PDFs converted
- [ ] Complete QA passed
- [ ] Ready for deployment
- **Target: 1 week total**

---

## Next Steps

1. **Today/Tomorrow:** Run translate_documents.py for English (Phase 2)
2. **Review:** Examine first few translations manually
3. **Convert:** Start PDF conversion for English documents
4. **Iterate:** Run translations for remaining languages in batches
5. **Deploy:** Upload final PDFs to distribution point

---

## Contact & Support

- Implementation Guide: `TRANSLATION_IMPLEMENTATION.md`
- Planning Details: `TRANSLATION_PLAN.md`
- Project Summary: `TRANSLATION_SUMMARY.md`
- User Guide: `_Translations/INDEX.md`

---

**Created:** 2026-06-04  
**Status:** Phase 1 Complete | Ready for Phase 2  
**Last Updated:** 2026-06-04
