
import { createClient } from
  'https://esm.sh/@supabase/supabase-js@2';

// 1. Supabase 專案 URL
const SUPABASE_URL = 'https://dbthxugosgcipwxhcujx.supabase.co';

// 2. Supabase Publishable Key
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NsbnISui5fdS5aKOkgEJWA_YT_UR7gn';

// 3. 建立 Supabase 連線
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// 4. 測試連線
console.log('Supabase client initialized');
