# Accounting Module — Quick Reference & Diagrams

---

## 1. Database Entity Relationships

```
┌─────────────────────┐
│ accounting_settings │ (1 per company)
│ - invoice_format    │
│ - vat_enabled       │
│ - vat_rates         │
│ - bank_account      │
└──────────┬──────────┘
           │
      company_id
           │
    ┌──────┴─────────────────────────┬──────────────────────┐
    │                                 │                      │
    v                                 v                      v
┌──────────────────┐     ┌────────────────────────┐  ┌─────────────────┐
│ accounting_      │     │ expense_entries        │  │ income_entries  │
│ categories       │     │ - description          │  │ - description   │
│ - name           │     │ - amount (gross)       │  │ - amount (gross)│
│ - type           │     │ - category_id ──────┐  │  │ - category_id ──┤
│ - tax_category   │     │ - receipt_url         │  │  │ - invoice_id ───┤
│ - icon, color    │     │ - vat_applicable      │  │  │ - appointment_id│
└──────────────────┘     │ - tax_deductible      │  │  │ - vat_applicable│
                         │ - payment_method      │  │  │ - payment_method│
                         │ - status              │  │  │ - status        │
                         │ - approved_by         │  │  │ - net/gross/vat │
                         │ - created_at          │  │  │ - created_at    │
                         └────────────────────────┘  └─────────────────┘
                                 │                           │
                                 │                           │
                                 v                           v
                         ┌─────────────────┐      ┌────────────────────┐
                         │ tax_periods     │      │ invoices (enhanced)│
                         │ - start_date    │      │ - invoice_number   │
                         │ - end_date      │      │ - customer_id      │
                         │ - total_income  │      │ - template_id      │
                         │ - total_expense │      │ - status           │
                         │ - vat_in/out    │      │ - sent_date        │
                         │ - net_profit    │      │ - payment_status   │
                         │ - status        │      │ - vat_rate         │
                         │ - finalized_at  │      │ - amount_paid      │
                         └─────────────────┘      │ - payment_due_date │
                                                  │ - document_url     │
                                                  └────────────────────┘
                                                           │
                                                           │
                                                  ┌────────┴───────────┐
                                                  │                    │
                                                  v                    v
                                       ┌────────────────────┐  ┌──────────────────┐
                                       │ invoice_items      │  │ invoice_templates│
                                       │ - description      │  │ - name           │
                                       │ - quantity         │  │ - header_text    │
                                       │ - unit_price       │  │ - footer_text    │
                                       │ - total            │  │ - logo_url       │
                                       │ - service_id       │  │ - is_default     │
                                       └────────────────────┘  └──────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │ accounting_journal_entries (DATEV-ready, Phase 4)               │
    │ - entry_date, reference_type, reference_id                     │
    │ - debit_account, credit_account, debit_amount, credit_amount   │
    │ (Links all financial transactions for auditing)                │
    └─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy

```
AccountingPage (main tab router)
│
├── TabsList (navigation)
│   ├── Dashboard
│   ├── Invoices
│   ├── Expenses
│   ├── Income (NEW)
│   ├── Reports (NEW)
│   ├── Categories (NEW)
│   ├── Settings (NEW)
│   └── [existing tabs]
│
└── TabsContent (tab panels)
    │
    ├── DashboardTab (enhanced)
    │   ├── MonthlyKPICards
    │   │   ├── RevenueCard
    │   │   ├── ExpenseCard
    │   │   ├── ProfitCard
    │   │   └── OpenInvoicesCard
    │   ├── MonthlyProfitChart (recharts)
    │   ├── TopCategoriesPie
    │   ├── InvoiceStatusFunnel
    │   └── QuickActionButtons
    │
    ├── InvoicesTab (enhanced)
    │   ├── InvoiceList
    │   │   ├── DataTable with filters
    │   │   │   ├── status filter
    │   │   │   ├── date range picker
    │   │   │   └── search box
    │   │   ├── BulkActions
    │   │   └── Row actions (edit, view, send, pay, pdf, delete)
    │   ├── InvoiceForm
    │   │   ├── CustomerSelector
    │   │   ├── TemplateSelector
    │   │   ├── LineItemEditor
    │   │   │   └── ServiceSelector (optional, from appointment)
    │   │   ├── VATCalculator
    │   │   ├── PaymentTermsInput
    │   │   └── AttachmentUpload
    │   └── InvoicePreviewPanel
    │       ├── PDF preview
    │       ├── EmailComposer
    │       └── SendButton
    │
    ├── ExpensesTab (enhanced)
    │   ├── ExpenseList
    │   │   ├── DataTable with filters
    │   │   │   ├── category filter
    │   │   │   ├── date range picker
    │   │   │   ├── tax-deductible filter
    │   │   │   └── search box
    │   │   ├── BulkActions (approve, delete, export)
    │   │   └── Row actions (edit, view, approve, delete)
    │   └── ExpenseForm (NEW/Enhanced)
    │       ├── DescriptionInput
    │       ├── AmountInput
    │       ├── DatePicker
    │       ├── CategorySelector (NEW)
    │       ├── VATCalculator (NEW)
    │       ├── ReceiptUpload (NEW)
    │       │   ├── DragDropZone
    │       │   ├── FilePreview
    │       │   └── RemoveButton
    │       ├── TaxDeductibleCheckbox
    │       ├── PaymentMethodInput
    │       ├── VendorNameInput
    │       └── NotesInput
    │
    ├── IncomeTab (NEW)
    │   ├── IncomeList
    │   │   ├── DataTable with filters
    │   │   │   ├── type filter (appointment, invoice, manual, etc.)
    │   │   │   ├── date range picker
    │   │   │   ├── category filter
    │   │   │   └── search box
    │   │   ├── BulkActions (delete, export)
    │   │   └── Row actions (view, link, delete)
    │   ├── AddManualIncomeForm (optional)
    │   │   ├── DescriptionInput
    │   │   ├── AmountInput
    │   │   ├── DatePicker
    │   │   ├── CategorySelector
    │   │   ├── PaymentMethodInput
    │   │   └── InvoiceLinkSelector
    │   └── EmptyStateIncomeCard
    │
    ├── ReportsTab (NEW)
    │   ├── ReportTypeSelector (dropdown)
    │   ├── PeriodSelector (month/quarter/year)
    │   ├── DateRangePicker
    │   ├── ExportButtons (PDF, CSV, DATEV)
    │   │
    │   └── ReportRenderer (shows one of:)
    │       │
    │       ├── ProfitLossReport
    │       │   ├── Gross Revenue
    │       │   ├── COGS
    │       │   ├── Gross Margin
    │       │   ├── Operating Expenses
    │       │   ├── Net Profit
    │       │   └── YoY Comparison
    │       │
    │       ├── IncomeSummary
    │       │   ├── ByCategory (table + pie)
    │       │   ├── ByMonth (line chart)
    │       │   └── ByPaymentMethod
    │       │
    │       ├── ExpenseSummary
    │       │   ├── ByCategory (table + pie)
    │       │   ├── ByMonth (line chart)
    │       │   └── TaxDeductible vs NonDeductible
    │       │
    │       ├── VATReport (if vat_enabled)
    │       │   ├── Output VAT (sales tax)
    │       │   ├── Input VAT (expense tax)
    │       │   ├── VAT Payment Due
    │       │   └── German Format
    │       │
    │       └── CashFlowReport
    │           ├── Monthly cash in/out
    │           └── Balance trend
    │
    ├── CategoriesTab (NEW)
    │   ├── CategoryList
    │   │   ├── ExpenseCategories section
    │   │   ├── IncomeCategories section
    │   │   ├── Filter by active/archived
    │   │   └── Row actions (edit, delete/archive)
    │   │
    │   ├── CreateCategoryForm
    │   │   ├── NameInput
    │   │   ├── TypeSelector (expense/income/both)
    │   │   ├── TaxCategorySelector
    │   │   ├── TaxDeductibleCheckbox
    │   │   ├── ColorPicker
    │   │   ├── IconSelector
    │   │   └── SaveButton
    │   │
    │   └── EditCategoryForm (modal)
    │
    └── SettingsTab (NEW)
        ├── InvoiceSettingsSection
        │   ├── InvoiceNumberFormat (template editor)
        │   ├── NextNumberPreview
        │   └── InvoicePrefixInput
        │
        ├── VATSettingsSection (NEW)
        │   ├── VATToggle
        │   ├── StandardRateInput (shown if enabled)
        │   ├── ReducedRateInput (shown if enabled)
        │   └── KleinunternehmerInfo (helper text)
        │
        ├── BankAccountSection
        │   ├── IBANInput
        │   ├── BICInput
        │   └── AccountHolderInput
        │
        ├── PaymentTermsSection
        │   ├── DefaultDaysInput
        │   └── DefaultPaymentMethodDropdown
        │
        ├── FiscalYearSection
        │   ├── StartMonthSelector
        │   └── EndMonthSelector
        │
        ├── CurrencySection (EUR, read-only for MVP)
        │
        └── SaveButton
```

---

## 3. Data Flow: Invoice → Income

```
┌─ User creates Invoice
│
├─ Invoice created in DB (status = "draft")
│  └─ No income_entry yet
│
├─ User sends invoice (status = "sent")
│  └─ sent_date = now(), sent_to_email = customer@example.com
│
├─ User marks paid
│  ├─ Update invoice: status = "paid", payment_date = now()
│  │
│  ├─ Auto-create income_entry:
│  │  ├─ description = "Invoice INV-202401001"
│  │  ├─ amount = invoice.total
│  │  ├─ date = today
│  │  ├─ type = "invoice"
│  │  ├─ invoice_id = invoice.id (link)
│  │  ├─ customer_id = invoice.customer_id
│  │  ├─ payment_method = method (from UI)
│  │  ├─ status = "recorded"
│  │  ├─ gross_amount = invoice.total
│  │  ├─ vat_applicable = company.vat_enabled
│  │  ├─ vat_rate = company.vat_rate (or invoice.vat_rate if override)
│  │  └─ net_amount = (auto-calculated)
│  │
│  ├─ Auto-create payment_record (existing):
│  │  ├─ type = "income"
│  │  ├─ amount = invoice.total
│  │  ├─ reference_type = "invoice"
│  │  ├─ reference_id = invoice.id
│  │  └─ date = today
│  │
│  └─ Auto-create journal_entry (if Phase 4):
│     ├─ debit_account = "1000" (cash)
│     ├─ credit_account = "4000" (income)
│     ├─ debit_amount = invoice.total
│     └─ credit_amount = invoice.total
│
└─ Reports now show:
   ├─ Revenue increased (from income_entries)
   ├─ Paid invoices count increased
   └─ Monthly P&L includes this income
```

---

## 4. Data Flow: Expense Recording

```
┌─ User adds Expense
│
├─ Expense form fields:
│  ├─ description (required)
│  ├─ amount / gross_amount (required)
│  ├─ category_id (required)
│  ├─ date (required, default today)
│  ├─ vendor_name (optional)
│  ├─ vat_applicable (toggle, depends on company.vat_enabled)
│  ├─ vat_rate (auto-set from category or use default)
│  ├─ receipt_url (file upload)
│  ├─ tax_deductible (checkbox, default true)
│  ├─ payment_method
│  └─ status (default "draft")
│
├─ On Save:
│  ├─ Insert into expense_entries table
│  │  └─ net_amount, vat_amount auto-calculated
│  │
│  ├─ Auto-create payment_record:
│  │  ├─ type = "expense"
│  │  ├─ amount = gross_amount
│  │  ├─ reference_type = "expense"
│  │  ├─ reference_id = expense.id
│  │  └─ date = expense.date
│  │
│  └─ Auto-create journal_entry (if Phase 4):
│     ├─ debit_account = "7000" (expense category, e.g., supplies)
│     ├─ credit_account = "1200" (cash/bank)
│     ├─ debit_amount = gross_amount
│     └─ credit_amount = gross_amount
│
└─ Reports now show:
   ├─ Expenses increased
   ├─ By category breakdown updated
   └─ Monthly P&L adjusted (net profit decreased)
```

---

## 5. VAT Calculation Flow

```
┌─ Check company.vat_enabled (accounting_settings)
│
├─ If FALSE (Kleinunternehmer, § 19 UStG):
│  ├─ No VAT fields shown in UI
│  ├─ All amounts treated as gross (final price)
│  ├─ no "Input VAT" or "Output VAT" tracking
│  └─ Reports never include VAT section
│
└─ If TRUE (Normal business):
   │
   ├─ On Invoice:
   │  ├─ Standard rate: 19% (default)
   │  ├─ Reduced rate: 7% (for specific items)
   │  │
   │  ├─ User enters: subtotal_net
   │  ├─ System calculates:
   │  │  ├─ vat_amount = subtotal_net * (vat_rate / 100)
   │  │  ├─ total_gross = subtotal_net + vat_amount
   │  │  └─ Invoice shows: Net, VAT, Gross
   │  │
   │  └─ On paid:
   │     └─ income_entry captures:
   │        ├─ gross_amount = total
   │        ├─ vat_applicable = true
   │        ├─ vat_rate = 19%
   │        ├─ net_amount = gross / (1 + 0.19)
   │        └─ vat_amount = auto-calculated
   │
   ├─ On Expense:
   │  ├─ User enters: receipt gross_amount
   │  ├─ System calculates:
   │  │  ├─ net_amount = gross_amount / (1 + vat_rate/100)
   │  │  └─ vat_amount = auto-calculated
   │  │
   │  └─ expense_entry captures:
   │     ├─ gross_amount (from receipt)
   │     ├─ vat_applicable = true
   │     ├─ vat_rate = 19% (or custom)
   │     ├─ net_amount = auto
   │     └─ vat_amount = auto
   │
   └─ On Tax Period Finalize:
      ├─ SUM(invoice net amounts) = Total sales revenue
      ├─ SUM(invoice vat amounts) = Output VAT (Umsatzsteuer) — to pay
      ├─ SUM(expense vat amounts) = Input VAT (Vorsteuer) — to recover
      ├─ net_vat = Output - Input
      │  ├─ If > 0: User owes VAT to Finanzamt
      │  └─ If < 0: Finanzamt owes user (rare)
      │
      └─ Tax period record stores all:
         ├─ total_vat_in (input VAT)
         ├─ total_vat_out (output VAT)
         └─ net_vat_payment (due or refund)
```

---

## 6. Service Call Hierarchy

```
React Component
│
├── useAccounting() / useIncome() / useExpenses() / etc.
│   (Hooks manage state + call services)
│
└── Services (in src/pages/betrieb/accounting/services/)
    │
    ├── incomeService.ts
    │  ├── fetchIncomeEntries()
    │  ├── createIncomeEntry()
    │  ├── updateIncomeEntry()
    │  ├── sumIncomeByCategory()
    │  ├── sumIncomeByMonth()
    │  └── autoCreateFromInvoice()
    │
    ├── expenseService.ts
    │  ├── fetchExpenseEntries()
    │  ├── createExpenseEntry()
    │  ├── updateExpenseEntry()
    │  ├── sumExpenseByCategory()
    │  └── sumExpenseByMonth()
    │
    ├── invoiceService.ts
    │  ├── fetchInvoices()
    │  ├── createInvoice()
    │  ├── markInvoicePaid()
    │  │  └─ (triggers incomeService.autoCreateFromInvoice())
    │  └── generateInvoiceNumber()
    │
    ├── reportService.ts
    │  ├── generateProfitLoss()
    │  │  ├─ (calls incomeService.sumIncomeByMonth())
    │  │  ├─ (calls expenseService.sumExpenseByMonth())
    │  │  └─ (calculates net = income - expense)
    │  ├── generateIncomeSummary()
    │  ├── generateExpenseSummary()
    │  ├── generateVATReport() ← calls vatService
    │  └── generateCashFlow()
    │
    ├── vatService.ts
    │  ├── calculateNetFromGross()
    │  ├── calculateGrossFromNet()
    │  ├── sumInputVAT()
    │  ├── sumOutputVAT()
    │  └── calculateVATPayment()
    │
    ├── categoryService.ts
    │  ├── fetchCategories()
    │  ├── createCategory()
    │  └── initializeDefaultCategories()
    │
    ├── settingsService.ts
    │  ├── fetchSettings()
    │  └── updateSettings()
    │
    └── exportService.ts
       ├── exportToCSV()
       ├── exportInvoiceToPDF()
       └── exportProfitLossPDF()
```

---

## 7. Type Definitions (TypeScript)

```typescript
// src/pages/betrieb/accounting/types/accounting.ts

export type IncomeType = 'appointment' | 'service' | 'product_sale' | 'refund' | 'other';
export type ExpenseType = 'draft' | 'recorded' | 'verified' | 'approved';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'check' | 'online' | 'invoice';

export interface AccountingCategory {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description?: string;
  category_type: 'expense' | 'income' | 'both';
  tax_category?: string;
  is_tax_deductible: boolean;
  tax_rate_override?: number;
  is_active: boolean;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeEntry {
  id: string;
  company_id: string;
  description: string;
  amount: number;
  date: string;
  income_type: IncomeType;
  appointment_id?: string;
  customer_id?: string;
  invoice_id?: string;
  category_id?: string;
  payment_method: PaymentMethod;
  vat_applicable: boolean;
  vat_rate: number;
  gross_amount: number;
  net_amount: number;
  vat_amount: number;
  status: 'pending' | 'recorded' | 'verified';
  notes?: string;
  receipt_url?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseEntry {
  id: string;
  company_id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  vendor_name?: string;
  vat_applicable: boolean;
  vat_rate: number;
  gross_amount: number;
  net_amount: number;
  vat_amount: number;
  tax_deductible: boolean;
  payment_method: PaymentMethod;
  invoice_number?: string;
  reference_id?: string;
  receipt_url?: string;
  receipt_file_name?: string;
  receipt_uploaded_at?: string;
  status: ExpenseType;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxPeriod {
  id: string;
  company_id: string;
  period_type: 'monthly' | 'quarterly' | 'annual';
  start_date: string;
  end_date: string;
  status: 'open' | 'finalized' | 'submitted';
  total_income: number;
  total_expenses: number;
  total_vat_in: number;
  total_vat_out: number;
  net_vat_payment: number;
  gross_profit: number;
  total_deductible_expenses: number;
  net_profit: number;
  finalized_at?: string;
  finalized_by?: string;
  submitted_at?: string;
  submission_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingSettings {
  id: string;
  company_id: string;
  invoice_number_format: string;
  invoice_number_counter: number;
  invoice_prefix: string;
  vat_enabled: boolean;
  vat_rate_standard: number;
  vat_rate_reduced: number;
  fiscal_year_start: number;
  fiscal_year_end: number;
  bank_account_iban?: string;
  bank_account_bic?: string;
  bank_account_name?: string;
  default_payment_terms_days: number;
  default_payment_method: PaymentMethod;
  decimal_places: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ProfitLossReport {
  period: { start_date: string; end_date: string };
  gross_revenue: number;
  total_expenses: number;
  net_profit: number;
  comparison?: {
    previous_period_profit: number;
    growth_percentage: number;
  };
  breakdown: {
    expenses_by_category: Record<string, number>;
    income_by_category: Record<string, number>;
  };
}

export interface VATReport {
  period: { start_date: string; end_date: string };
  output_vat: number;  // Umsatzsteuer (from invoices)
  input_vat: number;   // Vorsteuer (from expenses)
  net_vat_payment: number;  // Amount owed or refunded
  transactions: Array<{
    date: string;
    type: 'sale' | 'expense';
    description: string;
    net_amount: number;
    vat_amount: number;
  }>;
}
```

---

## 8. Default Categories (Seed Data)

```sql
-- Expenses
INSERT INTO accounting_categories (company_id, name, slug, category_type, is_tax_deductible, icon) VALUES
('company-id', 'Rent', 'rent', 'expense', true, 'building'),
('company-id', 'Utilities', 'utilities', 'expense', true, 'zap'),
('company-id', 'Supplies', 'supplies', 'expense', true, 'package'),
('company-id', 'Travel', 'travel', 'expense', true, 'car'),
('company-id', 'Equipment', 'equipment', 'expense', true, 'tool'),
('company-id', 'Software Licenses', 'software', 'expense', true, 'code'),
('company-id', 'Professional Services', 'professional', 'expense', true, 'briefcase'),
('company-id', 'Meals & Entertainment', 'meals', 'expense', true, 'utensils'),
('company-id', 'Training', 'training', 'expense', true, 'book'),
('company-id', 'Marketing', 'marketing', 'expense', true, 'megaphone'),
('company-id', 'Insurance', 'insurance', 'expense', true, 'shield'),
('company-id', 'Taxes & Licenses', 'taxes', 'expense', true, 'file-text'),
('company-id', 'Bank Fees', 'bank_fees', 'expense', true, 'credit-card'),
('company-id', 'Other', 'other_expense', 'expense', true, 'help-circle');

-- Income
INSERT INTO accounting_categories (company_id, name, slug, category_type, is_tax_deductible, icon) VALUES
('company-id', 'Service Revenue', 'service_revenue', 'income', false, 'briefcase'),
('company-id', 'Product Sales', 'product_sales', 'income', false, 'shopping-cart'),
('company-id', 'Consulting', 'consulting', 'income', false, 'user'),
('company-id', 'Other Income', 'other_income', 'income', false, 'help-circle');
```

---

## 9. Quick Feature Checklist

### MVP Must-Have
- [x] Create/edit/delete invoices
- [x] Create/edit/delete expenses
- [x] Track income (auto + manual)
- [x] Monthly P&L report
- [x] VAT toggle (Kleinunternehmer mode)
- [x] CSV export
- [x] Categories
- [x] Settings (invoice format, VAT, bank info)

### MVP Should-Have
- [x] Receipt upload for expenses
- [x] Email invoice (existing system)
- [x] Invoice templating
- [x] Income reconciliation (appointment → income entry)
- [x] Bulk operations

### Can Defer to Phase 2+
- [ ] DATEV export
- [ ] Approval workflows
- [ ] Invoice reminders (scheduled)
- [ ] Stripe webhook integration
- [ ] Recurring invoices
- [ ] Bank import
- [ ] Multi-currency
- [ ] Profit forecast

---

## 10. Environment Setup (One-Time)

### Supabase
```bash
# Link project
npx supabase link --project-ref xcngmshjuqoucdlgikao

# Create migrations locally
npx supabase migration new create_accounting_tables

# Test locally
npx supabase db push

# Production deploy
npx supabase db push --linked
```

### Dependencies (if needed)
```bash
npm install recharts jspdf html2canvas

# Types
npm install --save-dev @types/jspdf
```

### File Storage (Supabase)
```sql
-- Enable bucket for receipts (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policy
CREATE POLICY "Users can upload receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE is_active = true)
);
```

---

## 11. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| VAT toggle not showing | `accounting_settings.vat_enabled` not fetched | Fetch settings on mount, re-render on change |
| Income entry not created | `markInvoicePaid()` not calling `autoCreateFromInvoice()` | Add call to incomeService in invoiceService |
| Report shows zero profit | `income_entries` not linked to invoices | Check `markInvoicePaid()` is creating entries |
| Receipt upload fails | File too large or wrong format | Validate file size (< 10MB), accept PDF/JPG/PNG |
| VAT calculation wrong | Rounding error in net/gross/vat | Always round to 2 decimal places, test edge cases |
| Kategories not filtering | Filter SQL has wrong WHERE clause | Check `category_type` field value |
| Kleinunternehmer still shows VAT | Toggle cached in component state | Re-fetch settings, not from state |

---

## 12. Testing Scenarios

### E2E: Invoice → Income
1. Create appointment (done elsewhere)
2. Create invoice linked to appointment
3. Fill in amount (should = service cost)
4. Mark invoice as paid
5. Check income_entries table: should have new entry
6. Check P&L report: revenue should increase

### E2E: Expense with VAT
1. Enable VAT in settings (toggle ON)
2. Add expense with amount 119 (includes 19% VAT)
3. System should show: net 100, VAT 19, gross 119
4. Check expense_entries: net_amount = 100, vat_amount = 19
5. Finalize tax period
6. Check tax_periods: total_vat_in = 19

### E2E: Kleinunternehmer Mode
1. Create company, VAT toggle defaults OFF
2. Create invoice for amount 100
3. Invoice should show "no VAT" notice
4. Create expense for amount 100
5. No VAT fields should appear
6. P&L report should NOT include VAT section

---

End of Quick Reference. See ACCOUNTING_MODULE_DESIGN_v1.0.0.md for full design.
