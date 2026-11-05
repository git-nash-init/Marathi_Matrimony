import { supabase } from '../lib/supabase';

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);
async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export type TicketCategory = 'contact' | 'complaint' | 'feedback';

export interface TicketMessage {
  id: string;
  sender: 'admin' | 'member';
  body: string;
  created_at: string;
}

export interface TicketRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  category: TicketCategory;
  priority: boolean;
  created_at: string;
  user_id: string | null;
  assigned_to_me: boolean | null;
  assigned: boolean;
  replies: number;
}

export interface TicketDetail extends Omit<TicketRow, 'assigned' | 'replies'> {
  admin_notes: string | null;
  messages: TicketMessage[];
}

export interface MyTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  category: TicketCategory;
  created_at: string;
  messages: TicketMessage[];
}

export const supportService = {
  list: (status: string, category: string, search: string, page: number, pageSize: number) =>
    call<{ total: number; counts: Record<string, number>; items: TicketRow[] }>('admin_list_tickets', {
      p_status: status, p_category: category, p_search: search || null, p_limit: pageSize, p_offset: page * pageSize,
    }),
  get: (id: string) => call<TicketDetail>('admin_get_ticket', { p_id: id }),
  reply: (id: string, body: string) => call<boolean>('admin_reply_ticket', { p_id: id, p_body: body }),
  update: (id: string, change: { status?: string; assign?: 'me' | 'nobody'; notes?: string }) =>
    call<boolean>('admin_update_ticket', { p_id: id, p_status: change.status ?? null, p_assign: change.assign ?? null, p_notes: change.notes ?? null }),

  myTickets: () => call<MyTicket[]>('get_my_tickets'),
  async replyMine(id: string, body: string): Promise<void> {
    const result = await call<{ success: boolean; error?: string }>('reply_my_ticket', { p_id: id, p_body: body });
    if (!result.success) throw new Error(result.error || 'Your message could not be sent.');
  },
};
