-- ==============================================================================
-- LA PAPERÍA & MULTI-TENANT FINANCIAL SAAS - SUPABASE DATABASE SCHEMA
-- Proyecto: tkulhvmfnstulbbmwdmx
-- ==============================================================================

-- 1. TABLA: EMPRESAS (COMPANIES)
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '🏢',
    industry TEXT NOT NULL,
    currency TEXT DEFAULT 'COP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: USUARIOS DE LA APLICACIÓN (APP_USERS)
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '1234',
    role TEXT NOT NULL CHECK (role IN ('admin', 'cajero')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: CATEGORÍAS DE INGRESOS Y GASTOS (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Ingreso', 'Gasto')),
    icon TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: MOVIMIENTOS Y TRANSACCIONES (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Ingreso', 'Gasto')),
    categoria TEXT NOT NULL,
    monto NUMERIC(14, 2) NOT NULL,
    metodo TEXT NOT NULL CHECK (metodo IN ('Efectivo', 'Banco')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: CUADRES Y ARQUEOS DIARIOS DE CAJA (DAILY_CLOSES)
CREATE TABLE IF NOT EXISTS public.daily_closes (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    fecha DATE NOT NULL,
    hora TEXT,
    cajero TEXT NOT NULL,
    turno TEXT NOT NULL,
    caja_esperada NUMERIC(14, 2) DEFAULT 0,
    efectivo NUMERIC(14, 2) DEFAULT 0,
    banco NUMERIC(14, 2) DEFAULT 0,
    gastos NUMERIC(14, 2) DEFAULT 0,
    nomina NUMERIC(14, 2) DEFAULT 0,
    total_calculado NUMERIC(14, 2) DEFAULT 0,
    descuadre NUMERIC(14, 2) DEFAULT 0,
    estado_cuadre TEXT NOT NULL CHECK (estado_cuadre IN ('Cuadrado', 'Sobra', 'Falta')),
    estado_revision TEXT NOT NULL CHECK (estado_revision IN ('Pendiente', 'Aprobado', 'Rechazado')),
    notas TEXT,
    desglose_billetes JSONB DEFAULT '{}'::jsonb,
    bancos_detalle JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- POLÍTICAS DE ACCESO (ROW LEVEL SECURITY / RLS)
-- Permite lectura y escritura transparente para la API pública anon de la app
-- ==============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access companies" ON public.companies;
CREATE POLICY "Public access companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access app_users" ON public.app_users;
CREATE POLICY "Public access app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access categories" ON public.categories;
CREATE POLICY "Public access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access transactions" ON public.transactions;
CREATE POLICY "Public access transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access daily_closes" ON public.daily_closes;
CREATE POLICY "Public access daily_closes" ON public.daily_closes FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- Notificaciones instantáneas al cajero y administrador en vivo
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'daily_closes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_closes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'companies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_users;
  END IF;
END $$;

-- ==============================================================================
-- DATOS INICIALES SEMILLA (SEED DATA)
-- 1. Empresas
-- ==============================================================================
INSERT INTO public.companies (id, name, emoji, industry)
VALUES 
  ('comp-paperia', 'La Papería', '🍟', 'Comidas Rápidas'),
  ('comp-cafe', 'Café Central & Bakery', '☕', 'Cafetería / Bar')
ON CONFLICT (id) DO NOTHING;

-- 2. Usuarios
INSERT INTO public.app_users (id, company_id, name, email, password, role)
VALUES
  ('usr-admin-paperia', 'comp-paperia', 'Juan Sebastián (Gerente)', 'admin@lapaperia.com', '1234', 'admin'),
  ('usr-cajero-paperia', 'comp-paperia', 'Cajero Turno Principal', 'cajero@lapaperia.com', '1234', 'cajero'),
  ('usr-admin-cafe', 'comp-cafe', 'Marcela (Administradora)', 'gerencia@cafecentral.com', '1234', 'admin'),
  ('usr-cajero-cafe', 'comp-cafe', 'Barista / Caja Turno', 'caja@cafecentral.com', '1234', 'cajero')
ON CONFLICT (id) DO NOTHING;

-- 3. Categorías La Papería
INSERT INTO public.categories (id, company_id, name, type, icon, color)
VALUES
  ('cat-ing-1', 'comp-paperia', 'Ventas Local', 'Ingreso', 'Store', '#10b981'),
  ('cat-ing-2', 'comp-paperia', 'Didi', 'Ingreso', 'Bike', '#f59e0b'),
  ('cat-ing-3', 'comp-paperia', 'Rappi / Domicilios', 'Ingreso', 'ShoppingBag', '#06b6d4'),
  ('cat-ing-4', 'comp-paperia', 'Otros Ingresos', 'Ingreso', 'PlusCircle', '#3b82f6'),
  ('cat-gst-1', 'comp-paperia', 'Papa Casteblanco', 'Gasto', 'Box', '#eab308'),
  ('cat-gst-2', 'comp-paperia', 'Carniceria', 'Gasto', 'Utensils', '#ef4444'),
  ('cat-gst-3', 'comp-paperia', 'Revuelteria', 'Gasto', 'Carrot', '#22c55e'),
  ('cat-gst-4', 'comp-paperia', 'Gaseosa', 'Gasto', 'CupSoda', '#f97316'),
  ('cat-gst-5', 'comp-paperia', 'Sueldos / Nómina', 'Gasto', 'Users', '#8b5cf6'),
  ('cat-gst-6', 'comp-paperia', 'Arriendo', 'Gasto', 'Home', '#ec4899'),
  ('cat-gst-7', 'comp-paperia', 'Servicios', 'Gasto', 'Zap', '#14b8a6'),
  ('cat-gst-8', 'comp-paperia', 'Transporte Papa', 'Gasto', 'Truck', '#64748b'),
  ('cat-gst-9', 'comp-paperia', 'Publicidad', 'Gasto', 'Megaphone', '#a855f7'),
  ('cat-gst-10', 'comp-paperia', 'Compras Diarias', 'Gasto', 'ShoppingCart', '#0284c7'),
  ('cat-gst-11', 'comp-paperia', 'Bombones y Tortas', 'Gasto', 'Cake', '#d946ef'),
  ('cat-gst-12', 'comp-paperia', 'Surtiven', 'Gasto', 'Package', '#84cc16'),
  ('cat-gst-13', 'comp-paperia', 'Ajustes Diarios', 'Gasto', 'Sliders', '#6b7280'),
  ('cat-gst-14', 'comp-paperia', 'Todo en Uno Caldas', 'Gasto', 'Layers', '#059669'),
  ('cat-gst-15', 'comp-paperia', 'Banco', 'Gasto', 'Landmark', '#475569'),
  ('cat-gst-16', 'comp-paperia', 'Parafiscales', 'Gasto', 'FileText', '#9333ea'),
  ('cat-gst-17', 'comp-paperia', 'Pramont', 'Gasto', 'Briefcase', '#0d9488'),
  ('cat-gst-18', 'comp-paperia', 'Tenedores y Desechables', 'Gasto', 'UtensilsCrossed', '#78716c'),
  ('cat-gst-19', 'comp-paperia', 'Otros', 'Gasto', 'HelpCircle', '#94a3b8')
ON CONFLICT (id) DO NOTHING;

-- 4. Transacciones La Papería (Septiembre 2026 - $26.230.400 Ingresos / $22.640.986 Gastos)
INSERT INTO public.transactions (id, company_id, fecha, descripcion, tipo, categoria, monto, metodo)
VALUES
  ('tx-ing-1', 'comp-paperia', '2026-09-15', 'Ventas mostrador en Efectivo Quincena 1', 'Ingreso', 'Ventas Local', 6000000, 'Efectivo'),
  ('tx-ing-2', 'comp-paperia', '2026-09-15', 'Ventas mostrador en Transferencia / Tarjeta Quincena 1', 'Ingreso', 'Ventas Local', 3370200, 'Banco'),
  ('tx-ing-3', 'comp-paperia', '2026-09-30', 'Ventas mostrador en Efectivo Quincena 2', 'Ingreso', 'Ventas Local', 7000000, 'Efectivo'),
  ('tx-ing-4', 'comp-paperia', '2026-09-30', 'Ventas mostrador en Transferencia / Tarjeta Quincena 2', 'Ingreso', 'Ventas Local', 8013500, 'Banco'),
  ('tx-ing-5', 'comp-paperia', '2026-09-28', 'Liquidación Didi Food Mes', 'Ingreso', 'Didi', 1846700, 'Banco'),
  
  ('tx-gst-1', 'comp-paperia', '2026-09-05', 'Compra bultos Papa Casteblanco', 'Gasto', 'Papa Casteblanco', 8289664, 'Banco'),
  ('tx-gst-2', 'comp-paperia', '2026-09-10', 'Suministro Carnicería semanal', 'Gasto', 'Carniceria', 5894122, 'Banco'),
  ('tx-gst-3', 'comp-paperia', '2026-09-30', 'Nómina quincenal empleados', 'Gasto', 'Sueldos / Nómina', 3500000, 'Banco'),
  ('tx-gst-4', 'comp-paperia', '2026-09-02', 'Arriendo local mensual', 'Gasto', 'Arriendo', 2284100, 'Banco'),
  ('tx-gst-5', 'comp-paperia', '2026-09-12', 'Pago Servicios públicos (Luz, Agua, Gas)', 'Gasto', 'Servicios', 1007600, 'Banco'),
  ('tx-gst-6', 'comp-paperia', '2026-09-18', 'Postobón y Coca-Cola pedido grande', 'Gasto', 'Gaseosa', 943550, 'Efectivo'),
  ('tx-gst-7', 'comp-paperia', '2026-09-20', 'Verduras, maduro, lechuga revueltería', 'Gasto', 'Revuelteria', 164300, 'Efectivo'),
  ('tx-gst-8', 'comp-paperia', '2026-09-14', 'Acarreo y flete de Papa', 'Gasto', 'Transporte Papa', 120000, 'Efectivo'),
  ('tx-gst-9', 'comp-paperia', '2026-09-08', 'Campaña redes sociales y publicidad', 'Gasto', 'Publicidad', 67000, 'Banco'),
  ('tx-gst-10', 'comp-paperia', '2026-09-22', 'Insumos varios (platos, uniformes, rollo factura)', 'Gasto', 'Otros', 370650, 'Efectivo')
ON CONFLICT (id) DO NOTHING;

-- 5. Cierres de Caja La Papería
INSERT INTO public.daily_closes (
  id, company_id, fecha, hora, cajero, turno, 
  caja_esperada, efectivo, banco, gastos, nomina, 
  total_calculado, descuadre, estado_cuadre, estado_revision, 
  notas, desglose_billetes, bancos_detalle
)
VALUES (
  'close-2026-09-29-1', 'comp-paperia', '2026-09-29', '22:45', 'Cajero Turno Principal', 'Noche',
  1825700, 752000, 816000, 0, 270000,
  1838000, 12300, 'Sobra', 'Aprobado',
  'Turno sin novedades. Sobrante de $12.300 COP registrado en arqueo.',
  '{"100000": 3, "50000": 6, "20000": 5, "10000": 4, "5000": 2, "2000": 1, "monedas": 0}'::jsonb,
  '[{"entidad": "Nequi", "monto": 450000}, {"entidad": "Daviplata", "monto": 216000}, {"entidad": "Datáfono Redeban", "monto": 150000}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. Categorías Café Central
INSERT INTO public.categories (id, company_id, name, type, icon, color)
VALUES
  ('cat-cafe-ing-1', 'comp-cafe', 'Ventas Barra', 'Ingreso', 'Coffee', '#10b981'),
  ('cat-cafe-ing-2', 'comp-cafe', 'Ventas Mesas', 'Ingreso', 'Users', '#3b82f6'),
  ('cat-cafe-ing-3', 'comp-cafe', 'Plataformas / Domicilios', 'Ingreso', 'ShoppingBag', '#f59e0b'),
  ('cat-cafe-gst-1', 'comp-cafe', 'Café e Insumos', 'Gasto', 'Box', '#eab308'),
  ('cat-cafe-gst-2', 'comp-cafe', 'Licores y Cervezas', 'Gasto', 'Wine', '#ef4444'),
  ('cat-cafe-gst-3', 'comp-cafe', 'Panadería y Snacks', 'Gasto', 'Cookie', '#f97316'),
  ('cat-cafe-gst-4', 'comp-cafe', 'Sueldos / Nómina', 'Gasto', 'Users', '#8b5cf6'),
  ('cat-cafe-gst-5', 'comp-cafe', 'Arriendo', 'Gasto', 'Home', '#ec4899')
ON CONFLICT (id) DO NOTHING;

-- 7. Transacciones Café Central
INSERT INTO public.transactions (id, company_id, fecha, descripcion, tipo, categoria, monto, metodo)
VALUES
  ('tx-cafe-1', 'comp-cafe', '2026-09-15', 'Ventas café de especialidad y bebidas mostrador', 'Ingreso', 'Ventas Barra', 3450000, 'Efectivo'),
  ('tx-cafe-2', 'comp-cafe', '2026-09-15', 'Consumos en mesas pagados con Tarjeta / Datáfono', 'Ingreso', 'Ventas Mesas', 4120000, 'Banco'),
  ('tx-cafe-3', 'comp-cafe', '2026-09-28', 'Liquidación Domicilios Rappi Café', 'Ingreso', 'Plataformas / Domicilios', 1250000, 'Banco'),
  ('tx-cafe-gst-1', 'comp-cafe', '2026-09-05', 'Compra bultos Café Huila Especial', 'Gasto', 'Café e Insumos', 1850000, 'Banco'),
  ('tx-cafe-gst-2', 'comp-cafe', '2026-09-12', 'Suministro Repostería y Panadería Artesanal', 'Gasto', 'Panadería y Snacks', 890000, 'Efectivo')
ON CONFLICT (id) DO NOTHING;
