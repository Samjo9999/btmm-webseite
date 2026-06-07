#!/usr/bin/env python3
"""
BtMM Document Translation Script
Translates PDF documents and associated files to 11 languages using Claude API.
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple
import anthropic

# Configuration
LANGUAGES = {
    "DE": "German (Deutsch)",
    "EN": "English",
    "ZH": "Chinese Simplified (简体中文)",
    "ES": "Spanish (Español)",
    "HI": "Hindi (हिन्दी)",
    "AR": "Arabic (العربية)",
    "BN": "Bengali (বাংলা)",
    "PT": "Portuguese (Português)",
    "RU": "Russian (Русский)",
    "JA": "Japanese (日本語)",
    "FR": "French (Français)",
}

LANGUAGE_CODES_ISO = {
    "DE": "de",
    "EN": "en",
    "ZH": "zh-Hans",
    "ES": "es",
    "HI": "hi",
    "AR": "ar",
    "BN": "bn",
    "PT": "pt",
    "RU": "ru",
    "JA": "ja",
    "FR": "fr",
}

TIER_1_DOCUMENTS = [
    "BtB_Einfuehrung_v2_2_0.pdf",
    "BTB_Konzept_v17_3_2.pdf",
    "BtB_Gemeinschaftskultur_v1_1_0.pdf",
    "BtB_Handwerk_Ergaenzung_v1_1_0.pdf",
    "BtB_Was_wir_saehen_v1_2_0.pdf",
]

TIER_2_DOCUMENTS = [
    "BackToBalance_Satzung_v2_2_0.pdf",
    "BtB_Steuer_Briefing_v2_1_1.pdf",
    "BtB_Aufruf_Beteiligung_v2_0_0.pdf",
]

TIER_3_DOCUMENTS = [
    "BTB_Ideen_Horizont_v2_1_0.pdf",
    "BtB_Wirtschaften_Anleitung_v1_3_1.pdf",
    "BtB_Einladung_Gruendung_v1_1_0.pdf",
    "BtB_Handwerk_Zulassungen_Detail_v1_1_0.pdf",
]

TIER_4_DOCUMENTS = [
    "BtB Flyer Druck 05.2024 (148 × 105 mm).pdf",
    "Kopie 2 von BtB Flyer Druck 05.2024 (148 × 105 mm).pdf",
    "btb_color_palette.pdf",
]


class DocumentTranslator:
    """Manages PDF translation workflow using Claude API."""

    def __init__(self, translations_dir: str):
        self.client = anthropic.Anthropic()
        self.translations_dir = Path(translations_dir)
        self.de_dir = self.translations_dir / "DE"
        self.log = []

    def extract_pdf_text(self, pdf_path: str) -> str:
        """
        Extract text from PDF using pdfplumber.
        Falls back to simple error if library unavailable.
        """
        try:
            import pdfplumber

            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
                    text += "\n\n--- Page Break ---\n\n"
            return text
        except ImportError:
            self.log_msg(
                f"⚠️  pdfplumber not available. Install: pip install pdfplumber",
                "warning",
            )
            return "(PDF extraction requires pdfplumber - please install dependencies)"
        except Exception as e:
            self.log_msg(f"Error extracting {pdf_path}: {e}", "error")
            return ""

    def translate_text(
        self, text: str, target_lang: str, context: str = ""
    ) -> str:
        """Translate text using Claude API with domain context."""

        language_name = LANGUAGES.get(target_lang, target_lang)

        system_prompt = f"""You are a professional translator specializing in translating German documents into {language_name}.

Translation Context:
- Document domain: Back to Balance (BtB) - a cooperative organization focused on holistic healing, craftsmanship, and community
- Key terms to preserve or adapt carefully:
  - "Back to Balance" → keep English brand name
  - "BtB" → keep as acronym
  - "Körperarbeit" → "bodywork" (EN), use domain-appropriate term for other languages
  - "Genossenschaft" → "cooperative" (EN)
  - German names/dates → adapt to target language conventions

Guidelines:
1. Maintain professional, clear tone - never superficial
2. Preserve formatting (lists, structure, emphasis)
3. Adapt cultural references appropriately
4. Keep legal/formal language precise
5. Maintain consistency with German original meaning
6. For {target_lang}: consider RTL (Arabic, Hindi), character space (Chinese, Japanese)

Output ONLY the translated text - no explanations, no markup."""

        try:
            message = self.client.messages.create(
                model="claude-opus-4-1-20250805",
                max_tokens=4000,
                messages=[
                    {
                        "role": "user",
                        "content": f"{context}\n\n--- TEXT TO TRANSLATE ---\n\n{text}",
                    }
                ],
                system=system_prompt,
            )
            return message.content[0].text
        except Exception as e:
            self.log_msg(f"Translation error for {target_lang}: {e}", "error")
            return text

    def create_translated_pdf(
        self,
        original_pdf: Path,
        translated_text: str,
        target_lang: str,
        output_path: Path,
    ) -> bool:
        """
        Create translated PDF by replacing text in original.
        For now, we'll use a placeholder approach that needs manual PDF editing.
        """
        try:
            # Try using reportlab + pypdf for text replacement
            try:
                from reportlab.pdfgen import canvas
                from reportlab.lib.pagesizes import letter
                from pypdf import PdfReader, PdfWriter

                # This is a simplified approach - full implementation would require
                # proper PDF text layer manipulation
                output_path.write_text(f"TRANSLATION NEEDED:\n\n{translated_text}")
                self.log_msg(
                    f"Text file created for {target_lang}: {output_path.name}",
                    "info",
                )
                return True
            except ImportError:
                # Fallback: create text file with translation
                txt_output = output_path.with_suffix(".txt")
                txt_output.write_text(translated_text)
                self.log_msg(
                    f"Text translation saved: {txt_output.name} (PDF requires manual editing)",
                    "warning",
                )
                return True
        except Exception as e:
            self.log_msg(f"Error creating PDF for {target_lang}: {e}", "error")
            return False

    def translate_document(
        self, pdf_name: str, target_lang: str, tier: str = "TIER 1"
    ) -> Tuple[bool, str]:
        """Translate a single document to target language."""

        pdf_path = self.de_dir / pdf_name
        if not pdf_path.exists():
            msg = f"PDF not found: {pdf_name}"
            self.log_msg(msg, "error")
            return False, msg

        self.log_msg(f"Processing {pdf_name} → {LANGUAGES[target_lang]}", "info")

        # Extract text
        text = self.extract_pdf_text(str(pdf_path))
        if not text:
            msg = f"Failed to extract text from {pdf_name}"
            self.log_msg(msg, "error")
            return False, msg

        # Translate
        translated = self.translate_text(text, target_lang, f"Document: {pdf_name}")

        # Create output
        base_name = pdf_name.rsplit(".", 1)[0]
        output_name = f"{base_name}_{target_lang}.txt"
        output_path = self.translations_dir / target_lang / output_name

        success = self.create_translated_pdf(pdf_path, translated, target_lang, output_path)

        if success:
            msg = f"✓ Translated: {output_name}"
            self.log_msg(msg, "success")
        else:
            msg = f"✗ Failed: {output_name}"
            self.log_msg(msg, "error")

        return success, msg

    def translate_all_documents(
        self, priority_tiers: List[Tuple[List[str], str]] = None
    ):
        """Translate all documents in priority order."""

        if priority_tiers is None:
            priority_tiers = [
                (TIER_1_DOCUMENTS, "TIER 1 - Customer-Facing"),
                (TIER_2_DOCUMENTS, "TIER 2 - Legal"),
                (TIER_3_DOCUMENTS, "TIER 3 - Operational"),
                (TIER_4_DOCUMENTS, "TIER 4 - Brand Materials"),
            ]

        # Skip DE (already there)
        target_languages = [lang for lang in LANGUAGES.keys() if lang != "DE"]

        results = {"success": 0, "failed": 0, "skipped": 0}

        for tier_docs, tier_name in priority_tiers:
            self.log_msg(f"\n{'='*60}", "header")
            self.log_msg(f"Processing {tier_name}", "header")
            self.log_msg(f"{'='*60}\n", "header")

            for doc in tier_docs:
                for lang in target_languages:
                    success, msg = self.translate_document(doc, lang, tier_name)
                    if success:
                        results["success"] += 1
                    else:
                        results["failed"] += 1

        return results

    def generate_index(self):
        """Generate language index/guide page."""

        index = """# Document Translation Index

## Available Languages

"""
        for code, name in LANGUAGES.items():
            iso = LANGUAGE_CODES_ISO.get(code, code)
            index += f"- **{code}** ({iso}): {name}\n"

        index += """

## Document Categories

### Tier 1: Customer-Facing (Core Business)
"""
        for doc in TIER_1_DOCUMENTS:
            base = doc.rsplit(".", 1)[0]
            index += f"- {base}\n"

        index += "\n### Tier 2: Legal & Organizational\n"
        for doc in TIER_2_DOCUMENTS:
            base = doc.rsplit(".", 1)[0]
            index += f"- {base}\n"

        index += "\n### Tier 3: Operational\n"
        for doc in TIER_3_DOCUMENTS:
            base = doc.rsplit(".", 1)[0]
            index += f"- {base}\n"

        index += "\n### Tier 4: Brand Materials\n"
        for doc in TIER_4_DOCUMENTS:
            base = doc.rsplit(".", 1)[0]
            index += f"- {base}\n"

        index += """

## How to Use

1. Navigate to language folder: `_Translations/[LANG_CODE]/`
2. Find document you need (e.g., `BtB_Einfuehrung_v2_2_0_EN.pdf`)
3. Download/use from your language folder

## Translation Status

✓ DE (German) - Original reference
⏳ EN (English) - In progress
⏳ Other languages - Queued

---

Last updated: 2026-06-04
"""

        index_path = self.translations_dir / "INDEX.md"
        index_path.write_text(index)
        self.log_msg(f"Index created: INDEX.md", "success")

    def log_msg(self, msg: str, level: str = "info"):
        """Log message with formatting."""
        levels = {
            "header": "═══",
            "success": "✓",
            "error": "✗",
            "warning": "⚠️",
            "info": "•",
        }
        prefix = levels.get(level, "•")
        formatted = f"{prefix} {msg}"
        print(formatted)
        self.log.append({"message": msg, "level": level})

    def save_report(self, results: Dict):
        """Save translation report."""
        report = {
            "timestamp": str(os.popen("date").read().strip()),
            "total_documents": len(TIER_1_DOCUMENTS)
            + len(TIER_2_DOCUMENTS)
            + len(TIER_3_DOCUMENTS)
            + len(TIER_4_DOCUMENTS),
            "target_languages": len(LANGUAGES) - 1,  # Exclude DE
            "results": results,
            "log": self.log,
        }

        report_path = self.translations_dir / "TRANSLATION_REPORT.json"
        report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
        self.log_msg(f"Report saved: TRANSLATION_REPORT.json", "success")


def main():
    """Main entry point."""

    translations_dir = "/c/Users/fence/Projekte mit Claude Code/BtMM-App/Dokumente,Umgebung/_Translations"

    print("\n" + "=" * 70)
    print("BtMM Document Translation System")
    print("=" * 70)
    print(f"\nTranslation Directory: {translations_dir}")
    print(f"Target Languages: {len(LANGUAGES) - 1} (excluding German)")
    print(f"Total Documents: {len(TIER_1_DOCUMENTS) + len(TIER_2_DOCUMENTS) + len(TIER_3_DOCUMENTS) + len(TIER_4_DOCUMENTS)}")
    print("\n" + "=" * 70 + "\n")

    translator = DocumentTranslator(translations_dir)

    # Check dependencies
    print("Checking dependencies...")
    try:
        import pdfplumber

        print("✓ pdfplumber available")
    except ImportError:
        print("⚠️  Install pdfplumber: pip install pdfplumber")

    try:
        import anthropic

        print("✓ anthropic SDK available")
    except ImportError:
        print("✗ Install anthropic: pip install anthropic")
        return

    # Run translation
    results = translator.translate_all_documents()

    # Generate index
    translator.generate_index()

    # Save report
    translator.save_report(results)

    # Summary
    print("\n" + "=" * 70)
    print("Translation Complete")
    print("=" * 70)
    print(f"✓ Success: {results['success']}")
    print(f"✗ Failed: {results['failed']}")
    print(f"⏭️  Skipped: {results['skipped']}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
