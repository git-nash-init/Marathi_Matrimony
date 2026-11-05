import { supabase } from '../lib/supabase';

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);
async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export interface AdminPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discounted_price: number | null;
  duration_days: number;
  features: unknown;
  is_active: boolean;
  sort_order: number;
  tier: 'silver' | 'diamond' | 'platinum' | null;
  active_subscribers: number;
}

export interface AdminPayment {
  id: string;
  user_id: string | null;
  gateway: string | null;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  plan_name: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_code: string | null;
  is_test: boolean;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  plan_name: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_code: string | null;
  is_test: boolean;
  state: string;
}

export const formatMoney = (amount: number, currency = 'INR', mr = false) =>
  new Intl.NumberFormat(mr ? 'mr-IN' : 'en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

export const billingService = {
  listPlans: () => call<AdminPlan[]>('admin_list_plans'),
  savePlan: (id: string | null, plan: Record<string, unknown>) => call<string>('admin_save_plan', { p_id: id, p: plan }),
  listPayments: (status: string, search: string, page: number, pageSize: number) =>
    call<{ total: number; counts: Record<string, number>; collected: number; items: AdminPayment[] }>('admin_list_payments', {
      p_status: status, p_search: search || null, p_limit: pageSize, p_offset: page * pageSize,
    }),
  listSubscriptions: (status: string, search: string, page: number, pageSize: number) =>
    call<{ total: number; counts: Record<string, number>; items: AdminSubscription[] }>('admin_list_subscriptions', {
      p_status: status, p_search: search || null, p_limit: pageSize, p_offset: page * pageSize,
    }),

  /** A simple PDF receipt. English only, because the default PDF fonts have no Marathi letters. */
  async downloadReceipt(p: AdminPayment): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const line = (label: string, value: string, y: number) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 60, y);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(value, 300), 220, y);
    };
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Sanaibandh - Payment Receipt', 60, 70);
    doc.setFontSize(11);
    let y = 110;
    if (p.is_test) {
      doc.setTextColor(180, 30, 30);
      doc.text('TEST ENTRY - NOT A REAL PAYMENT. NO MONEY WAS COLLECTED.', 60, y);
      doc.setTextColor(0, 0, 0);
      y += 30;
    }
    const rows: [string, string][] = [
      ['Receipt for', [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Member'],
      ['Member ID', p.profile_code ?? '-'],
      ['Plan', p.plan_name ?? '-'],
      // The Rupee sign is missing from the default PDF font, so the currency code is written out.
      ['Amount', `${p.currency ?? 'INR'} ${Number(p.amount).toFixed(2)}`],
      ['Status', p.status],
      ['Transaction ID', p.gateway_payment_id ?? '-'],
      ['Order ID', p.gateway_order_id ?? '-'],
      ['Payment method', p.payment_method ?? '-'],
      ['Date', new Date(p.paid_at ?? p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })],
    ];
    for (const [label, value] of rows) {
      line(label, value, y);
      y += 24;
    }
    doc.save(`receipt-${p.gateway_payment_id ?? p.id}.pdf`);
  },
};
