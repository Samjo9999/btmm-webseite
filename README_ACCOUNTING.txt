================================================================================
BtB UNIVERSE APP — ACCOUNTING MODULE DESIGN
Complete Design Package (June 4, 2026)
================================================================================

STATUS: Ready to Implement (MVP: 4 weeks, ~90 hours)

================================================================================
DESIGN DOCUMENTS (Read in this order)
================================================================================

1. ACCOUNTING_SUMMARY.md ⭐ START HERE
   └─ Executive summary for decision makers
   └─ Timeline, features, next steps
   └─ 5 min read

2. ACCOUNTING_MODULE_DESIGN_v1.0.0.md (MAIN DESIGN)
   └─ 40+ pages of complete specification
   └─ Database schema (8 new tables)
   └─ UI/UX architecture (25+ components)
   └─ Implementation phases 1-4
   └─ German tax compliance (§ 19 UStG)
   └─ 45 min read (skim as needed)

3. ACCOUNTING_QUICK_REFERENCE.md (DEVELOPER GUIDE)
   └─ 20 pages of code-ready reference
   └─ ER diagrams, component hierarchy, data flows
   └─ TypeScript type definitions (copy-paste ready)
   └─ Default categories (SQL seed data)
   └─ Troubleshooting guide
   └─ E2E test scenarios
   └─ 30 min read (reference while coding)

4. ACCOUNTING_IMPLEMENTATION_CHECKLIST.md (TASK LIST)
   └─ 100+ individual tasks
   └─ Week-by-week breakdown (4 weeks)
   └─ File names, dependencies, testing steps
   └─ Deployment checklist
   └─ 20 min read (one phase per week)

5. ACCOUNTING_INDEX.md (NAVIGATION)
   └─ Cross-reference map for all documents
   └─ File locations, quick answers
   └─ 10 min read

================================================================================
PROGRESS TRACKING
================================================================================

memory/task_accounting_module.md
└─ Overall project status
└─ Phase descriptions
└─ Success metrics
└─ Update each week

================================================================================
KEY STATS
================================================================================

Design Status:        ✅ COMPLETE
MVP Timeline:         4 weeks (90 hours)
New Database Tables:  8 tables with RLS
New Components:       25+ React components
New Services:         6 business logic services
Type Definitions:     20+ interfaces

Phase 1 (Week 1):  Database + Services (24 hours)
Phase 2 (Week 2):  Income/Expense UI (24 hours)
Phase 3 (Week 3):  Reports + Settings (20 hours)
Phase 4 (Week 4):  Testing + Deployment (22 hours)

================================================================================
KEY FEATURES (MVP)
================================================================================

Invoice Management
  ✅ Create, edit, send, track invoices
  ✅ Customer management
  ✅ Invoice templates
  ✅ PDF export
  ✅ Email integration
  ✅ Payment tracking

Expense Tracking
  ✅ Record expenses with categories
  ✅ Receipt file upload
  ✅ VAT calculation (if enabled)
  ✅ Tax deductibility flagging

Income Tracking
  ✅ Auto-sync from paid invoices
  ✅ Manual entry
  ✅ Category assignment
  ✅ Payment tracking

Reports & Export
  ✅ Profit & Loss statement
  ✅ Category summaries
  ✅ Cash flow report
  ✅ CSV export
  ✅ VAT report (if enabled)

Settings
  ✅ Invoice numbering
  ✅ VAT toggle (Kleinunternehmer-aware)
  ✅ Bank info
  ✅ Payment terms

================================================================================
GERMAN TAX COMPLIANCE
================================================================================

§ 19 UStG (Kleinunternehmer):
  • VAT toggle defaults to FALSE (no VAT)
  • Invoices show "keine Umsatzsteuer"
  • Simple P&L: Revenue - Expenses = Net Profit

Upgrade Path:
  • If revenue > €22,000, toggle VAT ON
  • Full VAT tracking enabled
  • Ready for tax advisor (DATEV format, Phase 4)

================================================================================
DATABASE SUMMARY
================================================================================

8 New Tables (with RLS):

1. accounting_categories    — Expense/income categories
2. income_entries          — All income sources with VAT
3. expense_entries         — All expenses with receipts
4. tax_periods             — Accounting periods
5. accounting_journal_entries — Double-entry records (Phase 4)
6. invoice_templates       — Reusable designs
7. accounting_settings     — Company config
8. Enhanced invoices       — Added VAT, templates, tracking

================================================================================
NEXT STEPS
================================================================================

1. Read ACCOUNTING_SUMMARY.md (5 min)
2. Review ACCOUNTING_QUICK_REFERENCE.md diagrams (10 min)
3. Decide: Start Week 1? (Now / Later)
4. If Now: Use ACCOUNTING_IMPLEMENTATION_CHECKLIST.md

First developer task:
  "Create Supabase migrations from ACCOUNTING_MODULE_DESIGN_v1.0.0 Part 1"

================================================================================
QUICK ANSWERS
================================================================================

Q: How long?                      A: 4 weeks (MVP)
Q: Cost?                          A: FREE (self-hosted Supabase)
Q: Tax-compliant in Germany?      A: YES (§ 19 UStG aware, DATEV-ready)
Q: External services?             A: NO (all in-house)
Q: Stripe integration?            A: Phase 4 (webhook support)
Q: Non-Kleinunternehmer?          A: YES (VAT toggle enables full tracking)

================================================================================
FILES LOCATION
================================================================================

/c/Users/fence/Projekte mit Claude Code/btb-app/

All 5 design documents (read these):
  ├─ ACCOUNTING_SUMMARY.md
  ├─ ACCOUNTING_MODULE_DESIGN_v1.0.0.md
  ├─ ACCOUNTING_QUICK_REFERENCE.md
  ├─ ACCOUNTING_IMPLEMENTATION_CHECKLIST.md
  └─ ACCOUNTING_INDEX.md

Progress tracking:
  └─ memory/task_accounting_module.md

================================================================================
START HERE
================================================================================

Next action:
  1. Open: ACCOUNTING_SUMMARY.md
  2. Read: 5 minutes
  3. Decide: YES (start Week 1) or LATER (defer)

If YES:
  → Go to ACCOUNTING_IMPLEMENTATION_CHECKLIST.md
  → Start Phase 1: Database migrations

If LATER:
  → Save this package
  → Update memory/task_accounting_module.md with date
  → Come back when ready

================================================================================

Ready to implement. All design complete. Let's build! 🚀
