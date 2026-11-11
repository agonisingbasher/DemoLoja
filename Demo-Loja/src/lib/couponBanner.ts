export type CouponBanner = {
  eyebrow:string;
  title:string;
  highlight:string;
  description:string;
  imageUrl:string;
};
export const defaultCouponBanner: CouponBanner = {
  eyebrow:'CENTRAL DE CUPONS · TECHSTORE',
  title:'Seu próximo upgrade merece',
  highlight:'mais desconto.',
  description:'Explore nossos cupons demonstrativos para consoles, periféricos e componentes de PC. Escolha, copie e aplique no checkout da TechStore.',
  imageUrl:''
};
export const couponBannerKey='techstore_coupon_banner_v2';
