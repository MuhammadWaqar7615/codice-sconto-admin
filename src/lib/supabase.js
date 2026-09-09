import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function deleteFromSupabase(bucket, path) {
  if (!path || !supabase) return;
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`Error deleting ${path} from ${bucket}:`, error);
    }
  } catch (err) {
    console.error(`Exception deleting ${path} from ${bucket}:`, err);
  }
}

export default supabase;

