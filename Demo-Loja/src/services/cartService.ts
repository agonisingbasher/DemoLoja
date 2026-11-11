import { supabase, CartItem } from '../lib/supabase';

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};
const requireClient=()=>{
  if (!supabase) throw new Error('Backend Supabase não configurado para este serviço.');
  return supabase;
};


export const getCartItems = async (): Promise<CartItem[]> => {
  const sessionId = getSessionId();

  const { data, error } = await requireClient()
    .from('cart_items')
    .select('*, products(*)')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  return data || [];
};

export const addToCart = async (productId: string): Promise<boolean> => {
  const sessionId = getSessionId();

  const { data: existingItem } = await requireClient()
    .from('cart_items')
    .select('*')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existingItem) {
    const { error } = await requireClient()
      .from('cart_items')
      .update({ quantity: existingItem.quantity + 1 })
      .eq('id', existingItem.id);

    if (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  } else {
    const { error } = await requireClient()
      .from('cart_items')
      .insert({ session_id: sessionId, product_id: productId, quantity: 1 });

    if (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  return true;
};

export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const { error } = await requireClient()
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating cart item quantity:', error);
    return false;
  }

  return true;
};

export const removeFromCart = async (itemId: string): Promise<boolean> => {
  const { error } = await requireClient()
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error removing from cart:', error);
    return false;
  }

  return true;
};

export const clearCart = async (): Promise<boolean> => {
  const sessionId = getSessionId();

  const { error } = await requireClient()
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error clearing cart:', error);
    return false;
  }

  return true;
};
