import { supabase, Product, Category } from '../lib/supabase';
const requireClient=()=>{
  if (!supabase) throw new Error('Backend Supabase não configurado para este serviço.');
  return supabase;
};


export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await requireClient()
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
};

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await requireClient()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await requireClient()
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data || [];
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const { data, error } = await requireClient()
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
};
