// Supabase database types for slipp-dashboard.
// Re-generate with: npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      receipts: {
        Row: {
          id:           string
          user_id:      string
          merchant_id:  string | null
          merchant:     string           // store/merchant name
          category:     string | null
          receipt_no:   string | null
          receipt_date: string           // timestamptz
          currency:     string | null
          subtotal:     number | null
          vat:          number | null    // tax amount
          total:        number
          items:        ReceiptItem[]
          meta:         Record<string, unknown> | null
          created_at:   string
          updated_at:   string | null
        }
        Insert: Omit<Database['public']['Tables']['receipts']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['receipts']['Insert']>
      }
      merchants: {
        Row: {
          id:         string
          name:       string
          category:   string
          logo_url:   string | null
          address:    string | null
          created_by: string | null
          created_at: string
          is_active:  boolean
        }
        Insert: Omit<Database['public']['Tables']['merchants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['merchants']['Insert']>
      }
      merchant_users: {
        Row: {
          id:          string
          merchant_id: string
          user_id:     string
          role:        'owner' | 'staff'
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['merchant_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['merchant_users']['Insert']>
      }
      monthly_reports: {
        Row: {
          id:           string
          merchant_id:  string
          year:         number
          month:        number
          pdf_url:      string | null
          csv_url:      string | null
          generated_at: string
        }
        Insert: Omit<Database['public']['Tables']['monthly_reports']['Row'], 'id' | 'generated_at'>
        Update: Partial<Database['public']['Tables']['monthly_reports']['Insert']>
      }
      loyalty_cards: {
        Row: {
          id:           string
          user_id:      string
          store_name:   string
          card_number:  string
          barcode_type: string | null
          logo_url:     string | null
          created_at:   string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_cards']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['loyalty_cards']['Insert']>
      }
    }
    Views: {
      admin_platform_summary: {
        Row: {
          total_users:      number
          total_receipts:   number
          total_revenue:    number
          active_merchants: number
        }
      }
      merchant_summary: {
        Row: {
          merchant_id:       string
          merchant_name:     string
          total_customers:   number
          total_transactions:number
          total_revenue:     number
          avg_transaction:   number
        }
      }
      customer_insights: {
        Row: {
          merchant_id:    string
          user_id:        string
          display_name:   string | null
          age:            number | null
          gender:         string | null
          visit_count:    number
          lifetime_spend: number
          avg_spend:      number
          last_visit:     string
        }
      }
    }
    Functions: {
      hourly_transaction_counts: {
        Args:    { p_merchant_id: string }
        Returns: { hour: number; transaction_count: number; total_revenue: number }[]
      }
      dow_transaction_counts: {
        Args:    { p_merchant_id: string }
        Returns: { day_of_week: number; transaction_count: number; total_revenue: number }[]
      }
      top_items: {
        Args:    { p_merchant_id: string; p_limit?: number }
        Returns: { item_name: string; total_quantity: number; total_revenue: number }[]
      }
      monthly_revenue: {
        Args:    { p_merchant_id: string }
        Returns: { year: number; month: number; transaction_count: number; total_revenue: number }[]
      }
      platform_monthly_revenue: {
        Args:    Record<string, never>
        Returns: { year: number; month: number; transaction_count: number; total_revenue: number }[]
      }
    }
  }
}

export interface ReceiptItem {
  name:     string
  price:    number
  quantity: number
}

export type Receipt       = Database['public']['Tables']['receipts']['Row']
export type Merchant      = Database['public']['Tables']['merchants']['Row']
export type MerchantUser  = Database['public']['Tables']['merchant_users']['Row']
export type MonthlyReport = Database['public']['Tables']['monthly_reports']['Row']
