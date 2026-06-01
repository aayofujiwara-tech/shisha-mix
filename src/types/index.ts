export interface FlavorItem {
  name: string;
  brand: string;
  ratio: number;
}

export interface RecipeVisibility {
  photos: boolean;
  bowl: boolean;
  charcoal: boolean;
  packing: boolean;
  memo: boolean;
}

export interface Recipe {
  id: string;
  userId: string;
  authorName: string;
  name: string;
  flavors: FlavorItem[];
  category: string[];
  strength: 'weak' | 'medium' | 'strong';
  sweetness: 'low' | 'medium' | 'high';
  photos: string[];
  bowl?: string;
  charcoal?: string;
  packing?: string;
  memo?: string;
  isPublic: boolean;
  visibility: RecipeVisibility;
  likes: number;
  createdAt: number;
  updatedAt: number;
  isPreset?: boolean;
}

export interface InventoryFlavor {
  id: string;
  name: string;
  brand: string;
  category: string;
  status: 'full' | 'low' | 'empty';
  isCustom: boolean;
  addedAt: number;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
  recipeCount: number;
}

export interface FlavorDBItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
}

export type StrengthLabel = { weak: string; medium: string; strong: string };
export type SweetnessLabel = { low: string; medium: string; high: string };
export type StatusLabel = { full: string; low: string; empty: string };

export const CATEGORIES = ['フルーツ系', 'ミント系', 'デザート系', 'スパイス系', 'アイス系', 'ダブルアップル系'] as const;
export type Category = typeof CATEGORIES[number];

export const BRANDS = [
  'Al Fakher', 'Fumari', 'Starbuzz', 'Adalya', 'Tangiers',
  'Dozaj', 'Al Waha', 'Darkside', 'Azure', 'Nakhla',
  'Mazaya', 'Musthave', 'Element', 'その他',
] as const;
export type Brand = typeof BRANDS[number];

export const STRENGTH_LABELS: StrengthLabel = { weak: '弱', medium: '中', strong: '強' };
export const SWEETNESS_LABELS: SweetnessLabel = { low: '低', medium: '中', high: '高' };
export const STATUS_LABELS: StatusLabel = { full: 'あり', low: '残り少し', empty: 'なし' };

export type TableStatus = 'empty' | 'active' | 'warning' | 'overdue';

export interface CoalChangeRecord {
  time: number;
  memo: string;
}

export interface StoreTable {
  id: string;
  tableNumber: string;
  pipeNumber: number;
  label: string;
  status: TableStatus;
  customerCount: number;
  startTime: number;
  recipeId: string;
  recipeName: string;
  coalInterval: number;
  lastCoalChange: number;
  coalChangeCount: number;
  coalChangeHistory: CoalChangeRecord[];
  memo: string;
}
