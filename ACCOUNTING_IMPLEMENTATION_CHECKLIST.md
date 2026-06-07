# Accounting Module — Implementation Checklist

**Start Date**: [To be filled]  
**Target Completion**: 4 weeks (MVP)  
**Status**: Ready to Implement

---

## Phase 1: Database Foundation (Week 1)

### Migrations & Schema

- [ ] Create `20260604XXXXXX_create_accounting_categories.sql`
  - [ ] `accounting_categories` table
  - [ ] RLS policies
  - [ ] Indexes
  
- [ ] Create `20260604XXXXXX_create_income_expense_tables.sql`
  - [ ] `income_entries` table (with VAT calculations)
  - [ ] `expense_entries` table (with VAT calculations)
  - [ ] RLS policies
  - [ ] Indexes for company_id, date, category
  
- [ ] Create `20260604XXXXXX_create_tax_tables.sql`
  - [ ] `tax_periods` table
  - [ ] `accounting_journal_entries` table
  - [ ] `invoice_templates` table
  - [ ] `accounting_settings` table
  - [ ] RLS policies on all
  
- [ ] Enhance existing tables
  - [ ] Add columns to `invoices` (template_id, vat_rate, sent_date, payment_status, etc.)
  - [ ] Verify `customers` has required fields
  - [ ] Add indexes on invoices(payment_status, payment_due_date)

- [ ] Run migrations & verify schema
  - [ ] All tables created in Supabase
  - [ ] RLS policies active
  - [ ] Indexes created
  - [ ] Run schema validation query

### TypeScript Types

- [ ] Create `src/pages/betrieb/accounting/types/accounting.ts`
  - [ ] `AccountingCategory` type
  - [ ] `IncomeEntry` type
  - [ ] `ExpenseEntry` type
  - [ ] `TaxPeriod` type
  - [ ] `AccountingSettings` type
  - [ ] `InvoiceTemplate` type
  - [ ] Extend `Invoice` type with new fields

---

## Phase 2: Core Services (Week 1-2)

### Income Service

- [ ] Create `src/pages/betrieb/accounting/services/incomeService.ts`
  - [ ] `fetchIncomeEntries(companyId, filters)`
  - [ ] `createIncomeEntry(entry)`
  - [ ] `updateIncomeEntry(id, updates)`
  - [ ] `deleteIncomeEntry(id)`
  - [ ] `sumIncomeByCategory(companyId, period)`
  - [ ] `sumIncomeByMonth(companyId, year)`
  - [ ] `autoCreateFromInvoice(invoiceId)` — when invoice marked paid
  - [ ] Error handling & validation

### Expense Service

- [ ] Create `src/pages/betrieb/accounting/services/expenseService.ts`
  - [ ] `fetchExpenseEntries(companyId, filters)`
  - [ ] `createExpenseEntry(entry)`
  - [ ] `updateExpenseEntry(id, updates)`
  - [ ] `deleteExpenseEntry(id)`
  - [ ] `sumExpenseByCategory(companyId, period)`
  - [ ] `sumExpenseByMonth(companyId, year)`
  - [ ] `approveExpense(id, approvedBy)` — optional workflow
  - [ ] Error handling & validation

### Invoice Service (Enhance)

- [ ] Enhance `src/pages/betrieb/accounting/services/invoiceService.ts`
  - [ ] `fetchInvoices(companyId, filters)` — add payment_status filter
  - [ ] `createInvoice(invoice, items)`
  - [ ] `updateInvoice(id, updates)`
  - [ ] `markInvoicePaid(invoiceId, method)` — trigger income entry creation
  - [ ] `generateInvoiceNumber(companyId)` — use accounting_settings format
  - [ ] `sendInvoiceByEmail(invoiceId, email)` — integration with email service
  - [ ] `getInvoicesPastDue(companyId)` — for dunning
  - [ ] Error handling & validation

### Category Service

- [ ] Create `src/pages/betrieb/accounting/services/categoryService.ts`
  - [ ] `fetchCategories(companyId, type)` — type: 'expense' | 'income' | 'both'
  - [ ] `createCategory(category)`
  - [ ] `updateCategory(id, updates)`
  - [ ] `deleteCategory(id)` — check for usage first
  - [ ] `getDefaultCategories()` — seed data
  - [ ] Error handling & validation

### Report Service

- [ ] Create `src/pages/betrieb/accounting/services/reportService.ts`
  - [ ] `generateProfitLoss(companyId, startDate, endDate)` — core report
  - [ ] `generateIncomeSummary(companyId, period)`
  - [ ] `generateExpenseSummary(companyId, period)`
  - [ ] `generateCashFlow(companyId, year)`
  - [ ] `generateVATReport(companyId, period)` — if vat_enabled
  - [ ] `generateDATEVExport(companyId, period)` — phase 4
  - [ ] Error handling & data validation

### VAT Service

- [ ] Create `src/pages/betrieb/accounting/services/vatService.ts`
  - [ ] `calculateNetFromGross(grossAmount, vatRate)`
  - [ ] `calculateGrossFromNet(netAmount, vatRate)`
  - [ ] `calculateVATAmount(netAmount, vatRate)`
  - [ ] `sumInputVAT(companyId, period)` — VAT on expenses
  - [ ] `sumOutputVAT(companyId, period)` — VAT on income
  - [ ] `calculateVATPayment(companyId, period)` — VAT due/refund
  - [ ] Error handling & precision (2 decimal places)

### Settings Service

- [ ] Create `src/pages/betrieb/accounting/services/settingsService.ts`
  - [ ] `fetchSettings(companyId)`
  - [ ] `updateSettings(companyId, settings)`
  - [ ] `initializeDefaultSettings(companyId)` — on first use
  - [ ] Error handling & validation

---

## Phase 2: Hooks (Week 2)

### Income Hook

- [ ] Create `src/pages/betrieb/accounting/hooks/useIncome.ts`
  - [ ] `useIncome(companyId, filters)` — fetch + manage
  - [ ] Return: `{ incomeEntries, loading, error, addIncome, updateIncome, deleteIncome }`
  - [ ] Real-time updates if using Supabase listeners

### Expense Hook

- [ ] Create `src/pages/betrieb/accounting/hooks/useExpenses.ts`
  - [ ] `useExpenses(companyId, filters)` — fetch + manage
  - [ ] Return: `{ expenses, loading, error, addExpense, updateExpense, deleteExpense }`
  - [ ] Real-time updates

### Tax Period Hook

- [ ] Create `src/pages/betrieb/accounting/hooks/useTaxPeriod.ts`
  - [ ] `useTaxPeriod(companyId)` — fetch current/open period
  - [ ] `createTaxPeriod(startDate, endDate, type)`
  - [ ] `finalizePeriod(periodId)` — lock entries
  - [ ] Return: `{ periods, currentPeriod, createPeriod, finalizePeriod }`

### Invoice Templates Hook

- [ ] Create `src/pages/betrieb/accounting/hooks/useInvoiceTemplates.ts`
  - [ ] `useInvoiceTemplates(companyId)`
  - [ ] Return: `{ templates, loading, createTemplate, updateTemplate, deleteTemplate }`

### VAT Calculation Hook

- [ ] Create `src/pages/betrieb/accounting/hooks/useVATCalculation.ts`
  - [ ] `useVATCalculation(grossAmount, vatRate, vatEnabled)`
  - [ ] Real-time calculation as user types
  - [ ] Return: `{ net, vat, gross }`

---

## Phase 3: UI Components — Basic (Week 2-3)

### New Tabs

- [ ] Create `src/pages/betrieb/accounting/IncomeTab.tsx`
  - [ ] Income list with filters
  - [ ] Add manual income form
  - [ ] Link to invoices
  - [ ] Delete entry (with confirmation)
  - [ ] Export to CSV

- [ ] Create `src/pages/betrieb/accounting/CategoriesTab.tsx`
  - [ ] Category list (income + expense)
  - [ ] Create category form
  - [ ] Edit category
  - [ ] Delete category (show warning if in use)
  - [ ] Archive/activate

- [ ] Enhance `src/pages/betrieb/accounting/ExpensesTab.tsx`
  - [ ] Add category selector to form
  - [ ] Add VAT toggle + rate field
  - [ ] Add receipt file upload (drag-drop)
  - [ ] Add tax-deductible checkbox
  - [ ] Display receipt filename, link to preview
  - [ ] Bulk actions: mark approved, delete, export

- [ ] Enhance `DashboardTab.tsx`
  - [ ] KPI cards: monthly revenue, expenses, net profit
  - [ ] YTD summary
  - [ ] Open invoices (count + total)
  - [ ] Charts: income vs expense (12 months), top categories (pie)
  - [ ] Quick actions: new invoice, add expense

### Sub-Components

- [ ] Create `src/pages/betrieb/accounting/components/CategorySelector.tsx`
  - [ ] Dropdown with existing categories
  - [ ] Inline "create new" option
  - [ ] Icon + color display

- [ ] Create `src/pages/betrieb/accounting/components/VATCalculator.tsx`
  - [ ] Input: gross/net amount
  - [ ] Display: calculated net/gross/vat
  - [ ] Real-time calculation
  - [ ] Only visible if vat_enabled

- [ ] Create `src/pages/betrieb/accounting/components/MonthlyProfitChart.tsx`
  - [ ] Line chart: revenue, expenses, profit over 12 months
  - [ ] Use recharts or similar
  - [ ] Responsive

- [ ] Create `src/pages/betrieb/accounting/components/ReceiptUpload.tsx`
  - [ ] Drag-drop file upload
  - [ ] File preview (PDF, image)
  - [ ] Progress indicator
  - [ ] Delete uploaded file

- [ ] Create `src/pages/betrieb/accounting/components/EmptyStateIncome.tsx`
  - [ ] Message: "No income tracked yet"
  - [ ] Button: "Add manual income" or "Link appointments"

- [ ] Create `src/pages/betrieb/accounting/components/EmptyStateExpenses.tsx`
  - [ ] Message: "No expenses recorded"
  - [ ] Button: "Add first expense"

---

## Phase 3: Reports Tab (Week 3)

- [ ] Create `src/pages/betrieb/accounting/ReportsTab.tsx`
  - [ ] Report type selector (dropdown)
  - [ ] Period selector (month/quarter/year)
  - [ ] Date range picker
  - [ ] Render selected report
  - [ ] Export buttons (PDF, CSV, DATEV)

- [ ] Create `src/pages/betrieb/accounting/components/ProfitLossReport.tsx`
  - [ ] Fetch data from reportService.generateProfitLoss()
  - [ ] Display: gross revenue, expenses, gross margin, net profit
  - [ ] Show previous period comparison
  - [ ] German format
  - [ ] Print-friendly layout

- [ ] Create `src/pages/betrieb/accounting/components/IncomeReportSummary.tsx`
  - [ ] Breakdown by category (table + pie chart)
  - [ ] Sum by month
  - [ ] Payment method breakdown

- [ ] Create `src/pages/betrieb/accounting/components/ExpenseReportSummary.tsx`
  - [ ] Breakdown by category (table + pie chart)
  - [ ] Sum by month
  - [ ] Tax deductible vs. non-deductible

- [ ] Create `src/pages/betrieb/accounting/components/VATReport.tsx` (if vat_enabled)
  - [ ] Output VAT (sales tax collected)
  - [ ] Input VAT (tax paid on expenses)
  - [ ] VAT payment due or refund
  - [ ] German format (Umsatzsteuer-Voranmeldung)
  - [ ] Only show if accounting_settings.vat_enabled = true

---

## Phase 3: Settings Tab (Week 3)

- [ ] Create `src/pages/betrieb/accounting/SettingsTab.tsx`
  - [ ] Fetch current settings
  - [ ] Form sections:
    - [ ] Invoice settings (format, prefix, next number preview)
    - [ ] VAT settings (enable/disable, rates)
    - [ ] Bank account (IBAN, BIC, name)
    - [ ] Payment terms (default days, method)
    - [ ] Fiscal year (start month)
  - [ ] Save button with confirmation
  - [ ] Reset to defaults button

- [ ] Create `src/pages/betrieb/accounting/components/InvoiceNumberPreview.tsx`
  - [ ] Display format template
  - [ ] Show example next number
  - [ ] Format editor (optional)

- [ ] Create `src/pages/betrieb/accounting/components/VATSettingsPanel.tsx`
  - [ ] Toggle: vat_enabled
  - [ ] If true, show rate inputs
  - [ ] Standard rate (default 19%)
  - [ ] Reduced rate (default 7%)
  - [ ] Helper text about Kleinunternehmer

---

## Phase 4: Polish & Export (Week 4)

### Export Functionality

- [ ] Create `src/pages/betrieb/accounting/services/exportService.ts`
  - [ ] `exportToCSV(data, filename)` — generic CSV export
  - [ ] `exportInvoiceToPDF(invoice, template)` — enhanced
  - [ ] `exportProfitLossPDF(report)` — P&L as PDF
  - [ ] `exportToDATEV(journalEntries, period)` — phase 4 (optional for MVP)

- [ ] Add export buttons to:
  - [ ] IncomeTab: export visible entries to CSV
  - [ ] ExpensesTab: export visible entries to CSV
  - [ ] ReportsTab: export report to PDF, CSV, DATEV
  - [ ] InvoicesTab: export invoice to PDF

### Utilities

- [ ] Create `src/pages/betrieb/accounting/utils/invoiceNumbering.ts`
  - [ ] `generateNextInvoiceNumber(format, counter)` — parse template, increment
  - [ ] `parseInvoiceNumberFormat(format, serial)` — reverse lookup

- [ ] Create `src/pages/betrieb/accounting/utils/dateFormatting.ts`
  - [ ] `formatGermanDate(date)` — DD.MM.YYYY
  - [ ] `formatGermanCurrency(amount)` — "1.234,56 €"

- [ ] Create `src/pages/betrieb/accounting/utils/vatCalculations.ts`
  - [ ] All VAT math (exported from vatService for reuse)

- [ ] Create `src/pages/betrieb/accounting/utils/pdfGeneration.ts`
  - [ ] Invoice PDF template + rendering
  - [ ] Use jsPDF or similar
  - [ ] Include company logo, branding colors

### Documentation & UX

- [ ] Update `src/components/GuidedTours.tsx`
  - [ ] Add tour for "Accounting Module"
  - [ ] Steps: create invoice, add expense, view reports, settings
  - [ ] Tooltips on new buttons

- [ ] Update `src/components/AppHelper.tsx`
  - [ ] Add help topics for accounting
  - [ ] FAQs: "How do I track expenses?", "What's VAT?", etc.

- [ ] Create in-app help modals
  - [ ] Invoice help (keyboard shortcuts, payment terms)
  - [ ] Expense help (categories, tax deductibility)
  - [ ] Report help (period selection, export)

### Testing

- [ ] Create `src/__tests__/accounting.test.ts`
  - [ ] Test: create invoice → mark paid → income entry created
  - [ ] Test: add expense → VAT calculated correctly
  - [ ] Test: monthly P&L calculation
  - [ ] Test: Kleinunternehmer mode (no VAT)
  - [ ] Test: invoice number generation

- [ ] E2E scenarios
  - [ ] Full workflow: appointment → invoice → payment → report
  - [ ] Bulk operations: delete multiple entries
  - [ ] Export to CSV/PDF

- [ ] Edge cases
  - [ ] Expense without category
  - [ ] Income from non-invoiced appointment
  - [ ] VAT toggle mid-period (rollback/recalc)

---

## Deployment Checklist

- [ ] Code review (self-review for style, types, error handling)
- [ ] Supabase migration deployment
  - [ ] Test locally with `npx supabase db push`
  - [ ] Verify RLS policies in Supabase console
  - [ ] Test with demo user
- [ ] React build (`npm run build`)
  - [ ] Check bundle size (accounting components)
  - [ ] No console errors
  - [ ] TypeScript strict mode passes
- [ ] Push to `dev` branch
  - [ ] Create PR with description
  - [ ] Link to this design doc
  - [ ] Request review
- [ ] Vercel preview deploy
  - [ ] Manual smoke testing
  - [ ] Check mobile responsiveness
- [ ] Merge to `dev` (user merges to `master` later)

---

## Post-MVP Enhancements

- [ ] Phase 4: Journal entries & DATEV export
- [ ] Phase 5: Invoice templates (custom branding)
- [ ] Phase 5: Approval workflows (for team)
- [ ] Phase 6: Stripe webhook integration
- [ ] Phase 7: Recurring invoices
- [ ] Future: Bank import, OCR receipts, profit forecast

---

## Notes & Known Issues

- **VAT Complexity**: Germany has 7%, 16%, 19% rates. MVP uses standard 19%, 7% (reduced). Implement full ruleset later.
- **Invoice PDF**: Use existing template system if available; otherwise, create new one.
- **Receipt Storage**: Currently file upload only. Production: integrate with Supabase Storage (handle file size limits).
- **Kleinunternehmer Edge Case**: If user switches from non-VAT to VAT mid-year, old invoices need recalculation. For MVP, assume static setting.
- **Approval Workflows**: Optional for MVP. Can be added in Phase 5.

---

## Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Database + Services | Schema migrated, core services functional |
| 2 | Income/Expense UI + Hooks | Income/Expenses tabs, categories working |
| 3 | Reports + Settings | Reports tab functional, settings saved |
| 4 | Polish + Testing | E2E tests pass, export works, ready to ship |

**Total**: ~90 dev hours over 4 weeks (assuming ~20-25 hrs/week)

---

## Success Criteria (MVP Complete)

- [x] All database tables created & RLS policies active
- [x] User can create, edit, delete invoices, expenses, income entries
- [x] Monthly P&L report calculates correctly
- [x] VAT toggle works (Kleinunternehmer mode)
- [x] CSV export of data
- [x] Receipt upload for expenses
- [x] Categories customizable
- [x] E2E: invoice → mark paid → income entry created → appears in report
- [x] No TypeScript errors
- [x] Mobile responsive
- [x] Guided tour + help documentation
- [x] Deployed to Vercel (`dev` branch)
