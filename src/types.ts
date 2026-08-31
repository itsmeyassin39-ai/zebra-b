export type BagCategory = 'backpacks' | 'travel' | 'crossbody' | 'clutches' | 'accessories';

export interface ProductColor {
  name: string;
  hex: string;
  previewUrl: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  stockCount: number;
  images: {
    main: string;
    hover: string;
    detail?: string;
    lifestyle?: string;
  };
  colors: ProductColor[];
  description: string;
  details?: string[];
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight: string;
  material: string;
  lining: string;
  hardware: string;
  strapDrop: string;
  features: string[];
  zebraAccentStyle: string;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  product: Product;
  selectedColor: ProductColor;
  selectedHardware: string;
  personalizedMonogram?: string;
  quantity: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  tagline: string;
  itemCount: number;
  image: string;
  badge?: string;
}

export interface LookbookLook {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  modelImage: string;
  productIds: string[];
  quote: string;
  styleAdvice: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  productPurchased: string;
  verified: boolean;
  avatarUrl?: string;
  role?: string;
  company?: string;
}

export interface InstagramPost {
  id: string;
  handle: string;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
  productTaggedName: string;
  productTaggedPrice: number;
  productId: string;
}

export type Currency = 'DH' | 'USD' | 'EUR';

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  paymentMethod: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  hardware: string;
  monogram?: string;
}

export type OrderStatus = 'nouvelle' | 'en_cours' | 'expediee' | 'livree';

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discountPercent: number;
  shipping: number;
  total: number;
  currency: string;
  giftNote?: string;
  status: OrderStatus;
  createdAt?: string;
}
