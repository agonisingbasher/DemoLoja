import { createClient } from '@supabase/supabase-js';

// Browser-safe publishable key only. NEVER use a service-role or secret key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://akcwdobzjffoaqyudurc.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_u_x-93mr70SErkvseee_Gw_y0AeAhye';

// Pages has no backend. Keep the demo functional until Auth credentials are configured.
export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  details?: string;
  features?: string[];
  price: number;
  original_price: number | null;
  image_url: string;
  category_id: string;
  stock: number;
  rating: number;
  featured: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
}
