import type { FlavorDBItem } from '../types'

export const flavorDB: FlavorDBItem[] = [
  // ===== Al Fakher =====
  { id: 'af-watermelon', name: 'ウォーターメロン', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-grape', name: 'グレープ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-mint', name: 'ミント', brand: 'Al Fakher', category: 'ミント系' },
  { id: 'af-spearmint', name: 'スペアミント', brand: 'Al Fakher', category: 'ミント系' },
  { id: 'af-double-apple', name: 'ダブルアップル', brand: 'Al Fakher', category: 'ダブルアップル系' },
  { id: 'af-blueberry', name: 'ブルーベリー', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-peach', name: 'ピーチ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-lemon', name: 'レモン', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-mango', name: 'マンゴー', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-strawberry', name: 'ストロベリー', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-vanilla', name: 'バニラ', brand: 'Al Fakher', category: 'デザート系' },
  { id: 'af-rose', name: 'ローズ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-orange', name: 'オレンジ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-coconut', name: 'ココナッツ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-pineapple', name: 'パイナップル', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-melon', name: 'メロン', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-kiwi', name: 'キウイ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-cherry', name: 'チェリー', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-mint-lemon', name: 'ミントレモン', brand: 'Al Fakher', category: 'ミント系' },
  { id: 'af-mint-tea', name: 'ミントティー', brand: 'Al Fakher', category: 'ミント系' },
  { id: 'af-gum', name: 'ガム', brand: 'Al Fakher', category: 'デザート系' },
  { id: 'af-cinnamon', name: 'シナモン', brand: 'Al Fakher', category: 'スパイス系' },
  { id: 'af-apricot', name: 'アプリコット', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-honey', name: 'ハニー', brand: 'Al Fakher', category: 'デザート系' },
  { id: 'af-coffee', name: 'コーヒー', brand: 'Al Fakher', category: 'デザート系' },
  { id: 'af-green-tea', name: 'グリーンティー', brand: 'Al Fakher', category: 'スパイス系' },
  { id: 'af-lychee', name: 'ライチ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-grapefruit', name: 'グレープフルーツ', brand: 'Al Fakher', category: 'フルーツ系' },
  { id: 'af-watermelon2', name: 'スイカ', brand: 'Al Fakher', category: 'フルーツ系' },

  // ===== Fumari =====
  { id: 'fm-strawberry', name: 'ストロベリー', brand: 'Fumari', category: 'フルーツ系' },
  { id: 'fm-melon', name: 'メロン', brand: 'Fumari', category: 'フルーツ系' },
  { id: 'fm-watermelon', name: 'スイカ', brand: 'Fumari', category: 'フルーツ系' },
  { id: 'fm-raspberry', name: 'ラズベリー', brand: 'Fumari', category: 'フルーツ系' },
  { id: 'fm-mint', name: 'ミント', brand: 'Fumari', category: 'ミント系' },
  { id: 'fm-chocolate', name: 'チョコレート', brand: 'Fumari', category: 'デザート系' },
  { id: 'fm-cotton-candy', name: 'コットンキャンディ', brand: 'Fumari', category: 'デザート系' },
  { id: 'fm-blueberry-muffin', name: 'ブルーベリーマフィン', brand: 'Fumari', category: 'デザート系' },
  { id: 'fm-jasmine', name: 'ジャスミン', brand: 'Fumari', category: 'スパイス系' },
  { id: 'fm-lavender', name: 'ラベンダー', brand: 'Fumari', category: 'スパイス系' },
  { id: 'fm-mojito', name: 'モヒート', brand: 'Fumari', category: 'スパイス系' },
  { id: 'fm-ambrosia', name: 'アンブロシア', brand: 'Fumari', category: 'フルーツ系' },
  { id: 'fm-mandarin', name: 'マンダリンゼスト', brand: 'Fumari', category: 'フルーツ系' },

  // ===== Starbuzz =====
  { id: 'sb-blue-mist', name: 'ブルーミスト', brand: 'Starbuzz', category: 'ミント系' },
  { id: 'sb-pirates-cave', name: "パイレーツケーブ", brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-code-69', name: 'Code 69', brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-white-gummi-bear', name: 'White Gummi Bear', brand: 'Starbuzz', category: 'デザート系' },
  { id: 'sb-island-breeze', name: 'Island Breeze', brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-blueberry', name: 'ブルーベリー', brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-cherry', name: 'チェリー', brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-caramel', name: 'キャラメル', brand: 'Starbuzz', category: 'デザート系' },
  { id: 'sb-cola', name: 'コーラ', brand: 'Starbuzz', category: 'スパイス系' },
  { id: 'sb-passion-fruit', name: 'パッションフルーツ', brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-cardamom', name: 'カルダモン', brand: 'Starbuzz', category: 'スパイス系' },
  { id: 'sb-melon', name: 'メロン', brand: 'Starbuzz', category: 'フルーツ系' },
  { id: 'sb-pink', name: 'ピンク', brand: 'Starbuzz', category: 'フルーツ系' },

  // ===== Adalya =====
  { id: 'ad-love-66', name: 'Love 66', brand: 'Adalya', category: 'フルーツ系' },
  { id: 'ad-ice-peach', name: 'アイスピーチ', brand: 'Adalya', category: 'アイス系' },
  { id: 'ad-watermelon-mint', name: 'ウォーターメロンミント', brand: 'Adalya', category: 'アイス系' },
  { id: 'ad-ice-lychee', name: 'アイスライチ', brand: 'Adalya', category: 'アイス系' },
  { id: 'ad-spice-mango', name: 'スパイスマンゴー', brand: 'Adalya', category: 'スパイス系' },
  { id: 'ad-ice-orange', name: 'アイスオレンジ', brand: 'Adalya', category: 'アイス系' },
  { id: 'ad-blackberry', name: 'ブラックベリー', brand: 'Adalya', category: 'フルーツ系' },
  { id: 'ad-miami', name: 'マイアミ', brand: 'Adalya', category: 'フルーツ系' },
  { id: 'ad-blueberry-mint', name: 'ブルーベリーミント', brand: 'Adalya', category: 'フルーツ系' },
  { id: 'ad-orange', name: 'オレンジ', brand: 'Adalya', category: 'フルーツ系' },
  { id: 'ad-energy', name: 'エナジードリンク', brand: 'Adalya', category: 'スパイス系' },
  { id: 'ad-sultan', name: 'スルタン', brand: 'Adalya', category: 'フルーツ系' },

  // ===== Dozaj =====
  { id: 'dz-ice-watermelon', name: 'アイスウォーターメロン', brand: 'Dozaj', category: 'アイス系' },
  { id: 'dz-karpuz', name: 'スイカ', brand: 'Dozaj', category: 'フルーツ系' },
  { id: 'dz-limon', name: 'レモン', brand: 'Dozaj', category: 'フルーツ系' },
  { id: 'dz-nane', name: 'ミント', brand: 'Dozaj', category: 'ミント系' },
  { id: 'dz-kavun', name: 'メロン', brand: 'Dozaj', category: 'フルーツ系' },
  { id: 'dz-ice-grape', name: 'アイスグレープ', brand: 'Dozaj', category: 'アイス系' },
  { id: 'dz-ice-mint', name: 'アイスミント', brand: 'Dozaj', category: 'アイス系' },
  { id: 'dz-lychee', name: 'ライチ', brand: 'Dozaj', category: 'フルーツ系' },

  // ===== Tangiers =====
  { id: 'tg-cane-mint', name: 'ケインミント', brand: 'Tangiers', category: 'ミント系' },
  { id: 'tg-horchata', name: 'Horchata', brand: 'Tangiers', category: 'デザート系' },
  { id: 'tg-watermelon', name: 'ウォーターメロン', brand: 'Tangiers', category: 'フルーツ系' },
  { id: 'tg-static-starfire', name: 'Static Starfire', brand: 'Tangiers', category: 'フルーツ系' },
  { id: 'tg-m-cherries', name: 'M-Cherries', brand: 'Tangiers', category: 'フルーツ系' },
  { id: 'tg-kashmiri-chai', name: 'カシミリチャイ', brand: 'Tangiers', category: 'スパイス系' },
  { id: 'tg-cream', name: 'クリーム', brand: 'Tangiers', category: 'デザート系' },

  // ===== Al Waha =====
  { id: 'aw-pan-rasna', name: 'パンラズナ', brand: 'Al Waha', category: 'スパイス系' },

  // ===== Nakhla =====
  { id: 'nk-blueberry', name: 'ブルーベリー', brand: 'Nakhla', category: 'フルーツ系' },
  { id: 'nk-double-apple', name: 'ダブルアップル', brand: 'Nakhla', category: 'ダブルアップル系' },
  { id: 'nk-watermelon', name: 'ウォーターメロン', brand: 'Nakhla', category: 'フルーツ系' },
  { id: 'nk-mango', name: 'マンゴー', brand: 'Nakhla', category: 'フルーツ系' },

  // ===== Azure =====
  { id: 'az-ice-mint', name: 'アイスミント', brand: 'Azure', category: 'アイス系' },
  { id: 'az-melon-ice', name: 'メロンアイス', brand: 'Azure', category: 'アイス系' },
  { id: 'az-blueberry', name: 'ブルーベリー', brand: 'Azure', category: 'フルーツ系' },

  // ===== Musthave =====
  { id: 'mh-guava', name: 'グアバ', brand: 'Musthave', category: 'フルーツ系' },
  { id: 'mh-mango', name: 'マンゴー', brand: 'Musthave', category: 'フルーツ系' },
  { id: 'mh-passion', name: 'パッションフルーツ', brand: 'Musthave', category: 'フルーツ系' },

  // ===== Darkside =====
  { id: 'ds-double-apple', name: 'ダブルアップル', brand: 'Darkside', category: 'ダブルアップル系' },
  { id: 'ds-shot-cola', name: 'ショットコーラ', brand: 'Darkside', category: 'スパイス系' },
  { id: 'ds-berry', name: 'ベリー', brand: 'Darkside', category: 'フルーツ系' },

  // ===== Mazaya =====
  { id: 'mz-double-apple', name: 'ダブルアップル', brand: 'Mazaya', category: 'ダブルアップル系' },
  { id: 'mz-mint', name: 'ミント', brand: 'Mazaya', category: 'ミント系' },
  { id: 'mz-grape', name: 'グレープ', brand: 'Mazaya', category: 'フルーツ系' },

  // ===== Element =====
  { id: 'el-watermelon', name: 'ウォーターメロン', brand: 'Element', category: 'フルーツ系' },
  { id: 'el-mint', name: 'ミント', brand: 'Element', category: 'ミント系' },
  { id: 'el-mango', name: 'マンゴー', brand: 'Element', category: 'フルーツ系' },
]
