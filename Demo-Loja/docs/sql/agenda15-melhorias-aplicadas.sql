-- TECHSTORE — AGENDA 15
-- Registro didatico das melhorias APLICADAS ao banco ativo em 15/11/2026.
-- ATENCAO: nao reexecutar em banco ja migrado (ADD CONSTRAINT nao e idempotente).
-- Em ambiente anterior a migracao, auditar orfaos e dados invalidos previamente.

ALTER TABLE public.customer_favorites ADD CONSTRAINT customer_favorites_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.store_products(id) ON DELETE CASCADE;

ALTER TABLE public.store_reviews ADD CONSTRAINT store_reviews_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.store_products(id) ON DELETE CASCADE;

ALTER TABLE public.store_products
  ADD CONSTRAINT store_products_rating_range_chk CHECK (rating >= 0 AND rating <= 5),
  ADD CONSTRAINT store_products_original_price_nonnegative_chk CHECK (original_price IS NULL OR original_price >= 0),
  ADD CONSTRAINT store_products_features_array_chk CHECK (jsonb_typeof(features) = 'array');

ALTER TABLE public.store_coupons
  ADD CONSTRAINT store_coupons_minimum_nonnegative_chk CHECK (minimum_amount >= 0),
  ADD CONSTRAINT store_coupons_max_discount_nonnegative_chk CHECK (max_discount IS NULL OR max_discount >= 0),
  ADD CONSTRAINT store_coupons_date_order_chk CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at <= ends_at);

ALTER TABLE public.customer_orders
  ADD CONSTRAINT customer_orders_discount_nonnegative_chk CHECK (discount >= 0),
  ADD CONSTRAINT customer_orders_shipping_nonnegative_chk CHECK (shipping >= 0);

ALTER TABLE public.store_categories
  ADD CONSTRAINT store_categories_position_nonnegative_chk CHECK (position >= 0);

CREATE INDEX IF NOT EXISTS customer_favorites_product_idx ON public.customer_favorites(product_id);
CREATE INDEX IF NOT EXISTS customer_order_items_product_idx ON public.customer_order_items(product_id);
CREATE INDEX IF NOT EXISTS store_products_active_category_idx ON public.store_products(category_id, price) WHERE active = true;
CREATE INDEX IF NOT EXISTS store_products_featured_idx ON public.store_products(created_at DESC) WHERE featured = true AND active = true;
CREATE INDEX IF NOT EXISTS store_coupons_category_idx ON public.store_coupons(category_id);
