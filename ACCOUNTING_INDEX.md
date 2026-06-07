# Accounting Module — Document Index & Navigation

**Project**: BtB Universe App Accounting Module  
**Version**: v1.0.0 (Design Phase)  
**Date**: 2026-06-04  
**Status**: Ready to Implement

---

## Quick Start (30 seconds)

**For decision makers**: Read ACCOUNTING_SUMMARY.md (2 pages)  
**For developers**: Read ACCOUNTING_SUMMARY.md, then ACCOUNTING_QUICK_REFERENCE.md  
**For implementation**: Use ACCOUNTING_IMPLEMENTATION_CHECKLIST.md (tick off tasks)  

---

## Document Overview

### 1. ACCOUNTING_SUMMARY.md (Executive Summary)
**2 pages | Read Time: 5 min**

Best for: Decision makers, project managers, quick overview

Contains:
- What you're getting (3 documents)
- Key features (6 modules)
- Implementation timeline
- Integration points
- Next steps

**👉 Start here if you want the 1000-foot view**

---

### 2. ACCOUNTING_MODULE_DESIGN_v1.0.0.md (Complete Specification)
**40 pages | Read Time: 45 min (skip to sections as needed)**

Best for: Full understanding, detailed reference

Contains by section:

| Section | Page | Content |
|---------|------|---------|
| 1. Database Schema | 4-15 | 8 new tables, RLS policies, indexes |
| 2. UI/UX Architecture | 15-25 | Component structure, wireframes, tabs |
| 3. Implementation Phases | 25-30 | 4-week MVP + future roadmap |
| 4. Integration Points | 30-35 | Appointments, email, Stripe (future) |
| 5. Kleinunternehmer Context | 35-38 | German tax compliance, VAT rules |
| 6. Data Flow Diagrams | 38-40 | Invoice→Income, Expense, VAT flows |
| 7. Critical File Paths | 40 | Exact directory structure |
| 8. Recommended Order | 40-41 | Week-by-week implementation order |
| 9. Effort Estimation | 41 | Hours & sizing per feature |
| 10-12. Features, Constraints, Future | 41-42 | Everything else |

**👉 Use this for detailed understanding, reference sections as needed**

---

### 3. ACCOUNTING_QUICK_REFERENCE.md (Developer Guide)
**20 pages | Read Time: 30 min (skim diagrams, read when implementing)**

Best for: Developers, architects, copy-paste reference

Contains by section:

| Section | Content |
|---------|---------|
| 1. Database Entity Relationships | ER diagram (visual) |
| 2. Component Hierarchy | Tree view of all UI components |
| 3. Data Flow: Invoice → Income | Step-by-step flow diagram |
| 4. Data Flow: Expense Recording | Step-by-step flow diagram |
| 5. VAT Calculation Flow | Decision tree for VAT logic |
| 6. Service Call Hierarchy | How services call each other |
| 7. Type Definitions (TypeScript) | Ready-to-copy interface definitions |
| 8. Default Categories (Seed Data) | SQL INSERT statements |
| 9. Feature Checklist | MVP vs Future features |
| 10. Environment Setup | Supabase commands, npm packages |
| 11. Troubleshooting | 10+ common issues & fixes |
| 12. Testing Scenarios | E2E test cases |

**👉 Use this while coding, especially for types, diagrams, and troubleshooting**

---

### 4. ACCOUNTING_IMPLEMENTATION_CHECKLIST.md (Task List)
**15 pages | Read Time: 20 min (one section per week)**

Best for: Developers doing the work, tracking progress

Contains:

| Phase | Tasks | Hours |
|-------|-------|-------|
| Phase 1 (Week 1) | Database migrations, services | 24 |
| Phase 2 (Week 2) | Income/Expense/Categories UI | 24 |
| Phase 3 (Week 3) | Reports/Settings/Export | 20 |
| Phase 4 (Week 4) | Polish, testing, deployment | 22 |
| **Total MVP** | **100+ tasks** | **~90 hours** |

Each phase has:
- Sub-task checklist (☐)
- File names to create
- Dependencies
- Testing steps
- Deployment steps

**👉 Use this to stay on track, tick off tasks as you complete them**

---

### 5. ACCOUNTING_INDEX.md (This Document)
**Navigation guide & reference map**

---

## How to Use These Documents

### Scenario 1: "I need to decide if we should build this"
1. Read: ACCOUNTING_SUMMARY.md (page 1-2)
2. Read: ACCOUNTING_MODULE_DESIGN_v1.0.0.md (Part 1: Database, Part 2: UI)
3. Decision: Yes/No + timeline

### Scenario 2: "I need to build this starting Monday"
1. Read: ACCOUNTING_SUMMARY.md (all)
2. Skim: ACCOUNTING_QUICK_REFERENCE.md (sections 1, 2, 7)
3. Print: ACCOUNTING_IMPLEMENTATION_CHECKLIST.md (Phase 1)
4. Start: Week 1 tasks

### Scenario 3: "I'm implementing Phase 2, need component structure"
1. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 2 (Component Hierarchy)
2. Go to: ACCOUNTING_MODULE_DESIGN_v1.0.0.md → Part 2 (UI/UX Architecture)
3. Go to: ACCOUNTING_IMPLEMENTATION_CHECKLIST.md → Phase 2 (Week 2)

### Scenario 4: "Debugging an issue with VAT calculation"
1. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 5 (VAT Calculation Flow)
2. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 11 (Troubleshooting)
3. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 7 (Type Definitions → vatService)

### Scenario 5: "Need to understand database schema"
1. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 1 (ER Diagram)
2. Go to: ACCOUNTING_MODULE_DESIGN_v1.0.0.md → Part 1 (Database Schema, detailed)

### Scenario 6: "What are the file paths I need to create?"
1. Go to: ACCOUNTING_MODULE_DESIGN_v1.0.0.md → Part 7 (Critical File Paths)
2. Go to: ACCOUNTING_IMPLEMENTATION_CHECKLIST.md → Phase-by-phase (file names in each task)

### Scenario 7: "Need TypeScript types for the feature I'm building"
1. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 7 (Type Definitions)
2. Copy the relevant interface
3. Paste into `src/pages/betrieb/accounting/types/accounting.ts`

### Scenario 8: "Setting up database locally for testing"
1. Go to: ACCOUNTING_QUICK_REFERENCE.md → Section 10 (Environment Setup)
2. Follow the Supabase commands
3. Insert seed data from Section 8 (Default Categories)

---

## Cross-Reference Quick Map

**"Where do I find...?"**

| Question | Document | Section |
|----------|----------|---------|
| How long is implementation? | SUMMARY | "Timeline" |
| What tables do I create? | DESIGN | Part 1 |
| What components do I build? | QUICK_REF | Section 2 |
| What's the task for Week 1? | CHECKLIST | "Phase 1: Week 1" |
| What types do I need? | QUICK_REF | Section 7 |
| How does VAT work? | QUICK_REF | Section 5 |
| What's the ER diagram? | QUICK_REF | Section 1 |
| How do services call each other? | QUICK_REF | Section 6 |
| What are default categories? | QUICK_REF | Section 8 |
| What's a common bug? | QUICK_REF | Section 11 |
| How do I test this? | QUICK_REF | Section 12 |
| What file paths do I create? | DESIGN | Part 7 |
| What are file paths (detailed)? | CHECKLIST | "Phase 1-4" |
| Is there a high-level checklist? | CHECKLIST | Start of each phase |
| How do invoices become income? | QUICK_REF | Section 3 |
| How do expenses get recorded? | QUICK_REF | Section 4 |

---

## File Locations (Bookmarks)

### Design Documents (Read)
```
/c/Users/fence/Projekte mit Claude Code/BtMM-App/
├── ACCOUNTING_SUMMARY.md                    ← START HERE
├── ACCOUNTING_MODULE_DESIGN_v1.0.0.md       ← Full spec
├── ACCOUNTING_QUICK_REFERENCE.md            ← Dev guide
├── ACCOUNTING_IMPLEMENTATION_CHECKLIST.md   ← Task list
└── ACCOUNTING_INDEX.md                      ← This file
```

### Memory (Tracking)
```
/c/Users/fence/.claude/projects/.../memory/
└── task_accounting_module.md                ← Progress tracking
```

### Implementation (Create)
```
BtMM-App/btb-app/src/pages/betrieb/accounting/
├── components/                              ← NEW (20+ components)
├── hooks/                                   ← NEW (6 hooks)
├── services/                                ← NEW (6 services)
├── utils/                                   ← NEW (4 utils)
├── types/                                   ← NEW (accounting.ts)
└── [existing tabs, enhanced]

BtMM-App/btb-app/supabase/migrations/
├── 20260604XXXXXX_create_accounting_categories.sql
├── 20260604XXXXXX_create_income_expense_tables.sql
└── 20260604XXXXXX_create_tax_tables.sql
```

---

## Timeline Summary

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **Design** | Done | Database, UI, implementation plan | ✅ Complete |
| **Phase 1** | Week 1 | Database + core services | Not started |
| **Phase 2** | Week 2 | Income/Expense/Categories UI | Not started |
| **Phase 3** | Week 3 | Reports + Settings | Not started |
| **Phase 4** | Week 4 | Testing, Polish, Deploy | Not started |
| **Phase 5+** | Future | DATEV, Templates, Workflows | Future |

**Total**: 4 weeks (MVP) + 2 weeks (Phase 5) = 6 weeks (full)

---

## Key Concepts (Glossary)

**Kleinunternehmer** (§ 19 UStG): Small business owner in Germany with < €22,000 annual revenue, no VAT filing required.

**VAT Toggle**: `accounting_settings.vat_enabled` — false = no VAT (Kleinunternehmer), true = full VAT tracking.

**Income Entry**: Financial transaction in (customer paying for service), auto-linked to invoices and appointments.

**Expense Entry**: Financial transaction out (business cost), categorized and receipt-tracked.

**Tax Period**: Accounting period (monthly/quarterly/annual), can be finalized (locked) for tax filing.

**DATEV**: German tax software format, ready for tax advisor upload (Phase 4).

**Journal Entry**: Double-entry bookkeeping record (debit/credit), DATEV-compatible (Phase 4).

**RLS** (Row-Level Security): Supabase PostgreSQL feature, ensures users only see their company's data.

---

## Quick Decision Tree

```
START HERE:
│
├─ "I just want the overview"
│  └─> Read ACCOUNTING_SUMMARY.md (2 pages, 5 min)
│
├─ "I need to decide if we build this"
│  └─> Read ACCOUNTING_SUMMARY.md + DESIGN Part 1-2 (15 min)
│
├─ "I'm the developer, start Monday"
│  └─> Read SUMMARY + QUICK_REF Sections 1,2,7 + CHECKLIST Phase 1 (30 min)
│
├─ "I'm building Phase 1 (database)"
│  └─> QUICK_REF Section 1 (ER) + DESIGN Part 1 (schema) + CHECKLIST Phase 1 (1 hour)
│
├─ "I'm building Phase 2 (UI)"
│  └─> QUICK_REF Sections 2,3,4 (flows) + DESIGN Part 2 (UI) + CHECKLIST Phase 2 (1 hour)
│
├─ "I'm building Phase 3 (reports)"
│  └─> QUICK_REF Section 6 (services) + DESIGN Part 6 (flows) + CHECKLIST Phase 3 (45 min)
│
├─ "I'm stuck on something"
│  └─> Check QUICK_REF Section 11 (Troubleshooting), then Section 12 (Testing)
│
└─ "I need to extend/modify the design"
   └─> Read full DESIGN v1.0.0.md, then update as needed
```

---

## Success Criteria (You'll Know It's Done When)

- [x] All 4 documents exist and are complete
- [ ] Database schema migrated to Supabase (Phase 1)
- [ ] User can create invoice → mark paid → see income in report (Phase 2)
- [ ] User can add expense → view report grouped by category (Phase 2)
- [ ] Monthly P&L report accurate & exportable to CSV (Phase 3)
- [ ] VAT toggle works (Kleinunternehmer mode = no VAT) (Phase 3)
- [ ] E2E test passes: appointment → invoice → payment → report (Phase 4)
- [ ] Deployed to Vercel `dev` branch (Phase 4)

---

## Document Maintenance

**Last Updated**: 2026-06-04  
**Version**: v1.0.0 (Design Phase, Ready to Implement)  
**Status**: All documents complete, no outstanding questions, ready for assignment

To update:
1. Modify the relevant document
2. Update version number (vX.Y.Z) if significant changes
3. Update "Last Updated" date
4. Note change in memory: `task_accounting_module.md`

---

## Questions?

| Question | Answer | Document |
|----------|--------|----------|
| How much does this cost? | Free — self-hosted on Supabase | SUMMARY |
| How long to build? | 4 weeks (90 hours) MVP, 6 weeks full | SUMMARY / CHECKLIST |
| Does it work for non-Kleinunternehmer? | Yes, VAT toggle enables full tracking | DESIGN Part 5 |
| Can we use an external service instead? | Not recommended — design is self-hosted for control/privacy | SUMMARY |
| Is this tax-compliant in Germany? | Yes, § 19 UStG aware, DATEV-ready | DESIGN Part 5 |
| Can I start Phase 2 before Phase 1? | No, database is foundation | CHECKLIST |
| Do we need Stripe integration for MVP? | No, manual payment recording. Phase 4: webhook support | DESIGN Part 9 |
| What if we scale beyond Kleinunternehmer? | Toggle VAT on, full tracking enabled | DESIGN Part 5 |

---

## Document Navigation (One-Click)

**To Read**:
1. ACCOUNTING_SUMMARY.md (start here, 5 min)
2. ACCOUNTING_MODULE_DESIGN_v1.0.0.md (detailed, 45 min)
3. ACCOUNTING_QUICK_REFERENCE.md (coding reference, 30 min)
4. ACCOUNTING_IMPLEMENTATION_CHECKLIST.md (task list, 20 min)

**To Reference** (while coding):
- ER Diagram: QUICK_REF Section 1
- Component Tree: QUICK_REF Section 2
- Type Definitions: QUICK_REF Section 7
- Data Flows: QUICK_REF Sections 3-5
- Troubleshooting: QUICK_REF Section 11

**To Track Progress**:
- Weekly: Update `task_accounting_module.md` in memory
- Daily: Check ACCOUNTING_IMPLEMENTATION_CHECKLIST.md (current phase)

---

## Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| v1.0.0 | 2026-06-04 | ✅ Design Complete | Initial design, ready to implement |

---

End of Index. Happy building! 🚀
