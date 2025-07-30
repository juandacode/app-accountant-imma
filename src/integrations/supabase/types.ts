export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      aportes_sociales: {
        Row: {
          created_at: string | null
          fecha_aporte: string
          id: number
          monto_aporte: number
          nombre_socio: string
          tipo_ingreso: string | null
        }
        Insert: {
          created_at?: string | null
          fecha_aporte: string
          id?: never
          monto_aporte: number
          nombre_socio: string
          tipo_ingreso?: string | null
        }
        Update: {
          created_at?: string | null
          fecha_aporte?: string
          id?: never
          monto_aporte?: number
          nombre_socio?: string
          tipo_ingreso?: string | null
        }
        Relationships: []
      }
      caja_general_transacciones: {
        Row: {
          descripcion: string | null
          fecha_transaccion: string | null
          id: number
          monto: number
          referencia_id: number | null
          referencia_tabla: string | null
          saldo_resultante: number | null
          tipo_transaccion: string
        }
        Insert: {
          descripcion?: string | null
          fecha_transaccion?: string | null
          id?: number
          monto: number
          referencia_id?: number | null
          referencia_tabla?: string | null
          saldo_resultante?: number | null
          tipo_transaccion: string
        }
        Update: {
          descripcion?: string | null
          fecha_transaccion?: string | null
          id?: number
          monto?: number
          referencia_id?: number | null
          referencia_tabla?: string | null
          saldo_resultante?: number | null
          tipo_transaccion?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cedula_id: string | null
          ciudad: string | null
          direccion: string | null
          id: number
          nombre_completo: string
        }
        Insert: {
          cedula_id?: string | null
          ciudad?: string | null
          direccion?: string | null
          id?: number
          nombre_completo: string
        }
        Update: {
          cedula_id?: string | null
          ciudad?: string | null
          direccion?: string | null
          id?: number
          nombre_completo?: string
        }
        Relationships: []
      }
      facturas_compra: {
        Row: {
          created_at: string | null
          descripcion_factura: string | null
          descuento: number | null
          estado: string
          fecha_emision: string
          fecha_vencimiento: string | null
          forma_pago: string
          id: number
          monto_pagado: number | null
          monto_total: number
          numero_factura: string
          proveedor_id: number | null
        }
        Insert: {
          created_at?: string | null
          descripcion_factura?: string | null
          descuento?: number | null
          estado?: string
          fecha_emision: string
          fecha_vencimiento?: string | null
          forma_pago: string
          id?: number
          monto_pagado?: number | null
          monto_total: number
          numero_factura: string
          proveedor_id?: number | null
        }
        Update: {
          created_at?: string | null
          descripcion_factura?: string | null
          descuento?: number | null
          estado?: string
          fecha_emision?: string
          fecha_vencimiento?: string | null
          forma_pago?: string
          id?: number
          monto_pagado?: number | null
          monto_total?: number
          numero_factura?: string
          proveedor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_compra_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_compra_detalles: {
        Row: {
          cantidad: number
          costo_adquisicion_unitario: number | null
          costo_unitario: number
          factura_compra_id: number | null
          id: number
          producto_id: number | null
          subtotal: number
        }
        Insert: {
          cantidad: number
          costo_adquisicion_unitario?: number | null
          costo_unitario: number
          factura_compra_id?: number | null
          id?: number
          producto_id?: number | null
          subtotal: number
        }
        Update: {
          cantidad?: number
          costo_adquisicion_unitario?: number | null
          costo_unitario?: number
          factura_compra_id?: number | null
          id?: number
          producto_id?: number | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "facturas_compra_detalles_factura_compra_id_fkey"
            columns: ["factura_compra_id"]
            isOneToOne: false
            referencedRelation: "facturas_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_compra_detalles_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_compra_tela: {
        Row: {
          created_at: string | null
          descripcion_factura: string | null
          estado: string
          fecha_emision: string
          fecha_vencimiento: string | null
          forma_pago: string
          id: number
          monto_pagado: number | null
          monto_total: number
          numero_factura: string
          proveedor_id: number | null
        }
        Insert: {
          created_at?: string | null
          descripcion_factura?: string | null
          estado?: string
          fecha_emision?: string
          fecha_vencimiento?: string | null
          forma_pago: string
          id?: number
          monto_pagado?: number | null
          monto_total?: number
          numero_factura: string
          proveedor_id?: number | null
        }
        Update: {
          created_at?: string | null
          descripcion_factura?: string | null
          estado?: string
          fecha_emision?: string
          fecha_vencimiento?: string | null
          forma_pago?: string
          id?: number
          monto_pagado?: number | null
          monto_total?: number
          numero_factura?: string
          proveedor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_compra_tela_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_compra_tela_detalles: {
        Row: {
          ancho_tela: number | null
          codigo_rollo: string
          color: string
          factura_compra_tela_id: number
          id: number
          metraje_cantidad: number
          nombre_tela: string
          notas: string | null
          precio_metro: number
          subtotal: number
        }
        Insert: {
          ancho_tela?: number | null
          codigo_rollo: string
          color: string
          factura_compra_tela_id: number
          id?: number
          metraje_cantidad: number
          nombre_tela: string
          notas?: string | null
          precio_metro: number
          subtotal: number
        }
        Update: {
          ancho_tela?: number | null
          codigo_rollo?: string
          color?: string
          factura_compra_tela_id?: number
          id?: number
          metraje_cantidad?: number
          nombre_tela?: string
          notas?: string | null
          precio_metro?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "facturas_compra_tela_detalles_factura_compra_tela_id_fkey"
            columns: ["factura_compra_tela_id"]
            isOneToOne: false
            referencedRelation: "facturas_compra_tela"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_venta: {
        Row: {
          cliente_id: number | null
          created_at: string | null
          descripcion_factura: string | null
          descuento: number | null
          estado: string
          fecha_emision: string
          fecha_vencimiento: string | null
          forma_pago: string
          id: number
          monto_pagado: number | null
          monto_total: number
          numero_factura: string
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string | null
          descripcion_factura?: string | null
          descuento?: number | null
          estado?: string
          fecha_emision: string
          fecha_vencimiento?: string | null
          forma_pago: string
          id?: number
          monto_pagado?: number | null
          monto_total: number
          numero_factura: string
        }
        Update: {
          cliente_id?: number | null
          created_at?: string | null
          descripcion_factura?: string | null
          descuento?: number | null
          estado?: string
          fecha_emision?: string
          fecha_vencimiento?: string | null
          forma_pago?: string
          id?: number
          monto_pagado?: number | null
          monto_total?: number
          numero_factura?: string
        }
        Relationships: [
          {
            foreignKeyName: "facturas_venta_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_venta_detalles: {
        Row: {
          cantidad: number
          costo_adquisicion_unitario_al_vender: number | null
          factura_venta_id: number | null
          id: number
          precio_unitario: number
          producto_id: number | null
          subtotal: number
        }
        Insert: {
          cantidad: number
          costo_adquisicion_unitario_al_vender?: number | null
          factura_venta_id?: number | null
          id?: number
          precio_unitario: number
          producto_id?: number | null
          subtotal: number
        }
        Update: {
          cantidad?: number
          costo_adquisicion_unitario_al_vender?: number | null
          factura_venta_id?: number | null
          id?: number
          precio_unitario?: number
          producto_id?: number | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "facturas_venta_detalles_factura_venta_id_fkey"
            columns: ["factura_venta_id"]
            isOneToOne: false
            referencedRelation: "facturas_venta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_venta_detalles_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos: {
        Row: {
          categoria: string
          descripcion: string
          fecha: string
          id: number
          monto: number
        }
        Insert: {
          categoria: string
          descripcion: string
          fecha: string
          id?: number
          monto: number
        }
        Update: {
          categoria?: string
          descripcion?: string
          fecha?: string
          id?: number
          monto?: number
        }
        Relationships: []
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          cantidad_anterior: number | null
          cantidad_nueva: number | null
          descripcion_movimiento: string | null
          fecha_movimiento: string | null
          id: number
          producto_id: number | null
          tipo_movimiento: string
        }
        Insert: {
          cantidad: number
          cantidad_anterior?: number | null
          cantidad_nueva?: number | null
          descripcion_movimiento?: string | null
          fecha_movimiento?: string | null
          id?: number
          producto_id?: number | null
          tipo_movimiento: string
        }
        Update: {
          cantidad?: number
          cantidad_anterior?: number | null
          cantidad_nueva?: number | null
          descripcion_movimiento?: string | null
          fecha_movimiento?: string | null
          id?: number
          producto_id?: number | null
          tipo_movimiento?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_facturas_compra_tela: {
        Row: {
          created_at: string | null
          descripcion_pago: string | null
          factura_compra_tela_id: number
          fecha_pago: string
          id: number
          monto_pago: number
        }
        Insert: {
          created_at?: string | null
          descripcion_pago?: string | null
          factura_compra_tela_id: number
          fecha_pago?: string
          id?: number
          monto_pago: number
        }
        Update: {
          created_at?: string | null
          descripcion_pago?: string | null
          factura_compra_tela_id?: number
          fecha_pago?: string
          id?: number
          monto_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagos_facturas_compra_tela_factura_compra_tela_id_fkey"
            columns: ["factura_compra_tela_id"]
            isOneToOne: false
            referencedRelation: "facturas_compra_tela"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_realizados: {
        Row: {
          created_at: string | null
          descripcion_pago: string | null
          factura_compra_id: number | null
          fecha_pago: string
          id: number
          monto_pago: number
        }
        Insert: {
          created_at?: string | null
          descripcion_pago?: string | null
          factura_compra_id?: number | null
          fecha_pago: string
          id?: number
          monto_pago: number
        }
        Update: {
          created_at?: string | null
          descripcion_pago?: string | null
          factura_compra_id?: number | null
          fecha_pago?: string
          id?: number
          monto_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagos_realizados_factura_compra_id_fkey"
            columns: ["factura_compra_id"]
            isOneToOne: false
            referencedRelation: "facturas_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_recibidos: {
        Row: {
          created_at: string | null
          descripcion_pago: string | null
          factura_venta_id: number | null
          fecha_pago: string
          id: number
          monto_pago: number
        }
        Insert: {
          created_at?: string | null
          descripcion_pago?: string | null
          factura_venta_id?: number | null
          fecha_pago: string
          id?: number
          monto_pago: number
        }
        Update: {
          created_at?: string | null
          descripcion_pago?: string | null
          factura_venta_id?: number | null
          fecha_pago?: string
          id?: number
          monto_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagos_recibidos_factura_venta_id_fkey"
            columns: ["factura_venta_id"]
            isOneToOne: false
            referencedRelation: "facturas_venta"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          cantidad_actual: number
          costo_predeterminado: number | null
          descripcion: string | null
          id: number
          nombre: string
          precio_venta_predeterminado: number | null
          sku: string
        }
        Insert: {
          cantidad_actual?: number
          costo_predeterminado?: number | null
          descripcion?: string | null
          id?: number
          nombre: string
          precio_venta_predeterminado?: number | null
          sku: string
        }
        Update: {
          cantidad_actual?: number
          costo_predeterminado?: number | null
          descripcion?: string | null
          id?: number
          nombre?: string
          precio_venta_predeterminado?: number | null
          sku?: string
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          cedula_fiscal: string | null
          ciudad: string | null
          direccion: string | null
          id: number
          nombre_proveedor: string
        }
        Insert: {
          cedula_fiscal?: string | null
          ciudad?: string | null
          direccion?: string | null
          id?: number
          nombre_proveedor: string
        }
        Update: {
          cedula_fiscal?: string | null
          ciudad?: string | null
          direccion?: string | null
          id?: number
          nombre_proveedor?: string
        }
        Relationships: []
      }
      telas_cortes: {
        Row: {
          created_at: string | null
          fecha_corte: string
          id: number
          metros_cortados: number
          observaciones: string | null
          referencia_corte: string | null
          tela_inventario_id: number
        }
        Insert: {
          created_at?: string | null
          fecha_corte?: string
          id?: number
          metros_cortados: number
          observaciones?: string | null
          referencia_corte?: string | null
          tela_inventario_id: number
        }
        Update: {
          created_at?: string | null
          fecha_corte?: string
          id?: number
          metros_cortados?: number
          observaciones?: string | null
          referencia_corte?: string | null
          tela_inventario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "telas_cortes_tela_inventario_id_fkey"
            columns: ["tela_inventario_id"]
            isOneToOne: false
            referencedRelation: "telas_inventario"
            referencedColumns: ["id"]
          },
        ]
      }
      telas_inventario: {
        Row: {
          ancho_tela: number | null
          codigo_rollo: string
          color: string
          created_at: string | null
          fecha_ingreso: string
          id: number
          metodo_pago: string | null
          metraje_saldo: number
          nombre_tela: string
          notas: string | null
          precio_metro: number | null
          proveedor_id: number | null
          total_tela: number | null
        }
        Insert: {
          ancho_tela?: number | null
          codigo_rollo: string
          color: string
          created_at?: string | null
          fecha_ingreso?: string
          id?: number
          metodo_pago?: string | null
          metraje_saldo: number
          nombre_tela: string
          notas?: string | null
          precio_metro?: number | null
          proveedor_id?: number | null
          total_tela?: number | null
        }
        Update: {
          ancho_tela?: number | null
          codigo_rollo?: string
          color?: string
          created_at?: string | null
          fecha_ingreso?: string
          id?: number
          metodo_pago?: string | null
          metraje_saldo?: number
          nombre_tela?: string
          notas?: string | null
          precio_metro?: number | null
          proveedor_id?: number | null
          total_tela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "telas_inventario_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_account_statement: {
        Args: { p_entity_type: string; p_entity_id: number }
        Returns: Json
      }
      get_financial_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_monthly_income_statement: {
        Args: { p_year: number; p_month: number }
        Returns: Json
      }
      get_next_fabric_purchase_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_invoice_number: {
        Args: { prefix: string }
        Returns: string
      }
      get_next_purchase_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_sale_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      obtener_saldo_caja_actual: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      registrar_transaccion_caja: {
        Args: {
          p_tipo_transaccion: string
          p_descripcion: string
          p_monto: number
          p_referencia_id?: number
          p_referencia_tabla?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
