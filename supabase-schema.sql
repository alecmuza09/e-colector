-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA E-COLECTOR
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- ============================================
-- 1. TABLA: users (perfiles de usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'collector')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  city TEXT,
  profile_picture_url TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  public_profile BOOLEAN DEFAULT true,
  
  -- Campos específicos por rol (JSONB para flexibilidad)
  profile_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- 2. TABLA: products (materiales/productos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'MXN',
  category TEXT NOT NULL CHECK (category IN ('PET', 'Cartón', 'Vidrio', 'Metal', 'Electrónicos', 'Papel', 'HDPE', 'Otros')),
  quantity DECIMAL(10, 2),
  unit TEXT CHECK (unit IN ('kg', 'Ton')),
  location TEXT,
  municipality TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  type TEXT NOT NULL CHECK (type IN ('venta', 'donacion')) DEFAULT 'venta',
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'vendido', 'expirado', 'cancelado')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_municipality ON public.products(municipality);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Índice GIN para búsqueda de texto
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN (to_tsvector('spanish', title || ' ' || description));

-- ============================================
-- 3. TABLA: offers (ofertas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  quantity TEXT,
  message TEXT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aceptada', 'rechazada', 'cancelada')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para offers
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON public.offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

-- ============================================
-- 4. TABLA: requests (solicitudes de recolección)
-- ============================================
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  quantity TEXT,
  price TEXT,
  location TEXT,
  municipality TEXT,
  description TEXT,
  status TEXT DEFAULT 'activa' CHECK (status IN ('activa', 'completada', 'cancelada')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para requests
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_municipality ON public.requests(municipality);

-- ============================================
-- 5. TABLA: messages (mensajes entre usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON public.messages(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- ============================================
-- 6. TABLA: favorites (favoritos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

-- Índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);

-- ============================================
-- 7. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (public_profile = true OR auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Políticas para products
-- Permitir que cualquiera (incluso anónimos) pueda ver productos activos
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (status = 'activo');

-- Permitir que usuarios autenticados inserten productos
CREATE POLICY "Authenticated users can insert products" ON public.products
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
  );

-- Permitir que usuarios autenticados actualicen sus propios productos
CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
  );

-- Permitir que usuarios autenticados eliminen sus propios productos
CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
  );

-- Políticas para offers
CREATE POLICY "Users can view offers on their products or their own offers" ON public.offers
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = buyer_id) OR
    auth.uid() IN (SELECT u.auth_user_id FROM public.users u JOIN public.products p ON u.id = p.user_id WHERE p.id = product_id)
  );

CREATE POLICY "Users can create offers" ON public.offers
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = buyer_id));

CREATE POLICY "Product owners can update offers on their products" ON public.offers
  FOR UPDATE USING (
    auth.uid() IN (SELECT u.auth_user_id FROM public.users u JOIN public.products p ON u.id = p.user_id WHERE p.id = product_id)
  );

-- Políticas para requests
-- Permitir que cualquiera pueda ver solicitudes activas
CREATE POLICY "Anyone can view active requests" ON public.requests
  FOR SELECT USING (status = 'activa');

-- Permitir que usuarios autenticados gestionen sus propias solicitudes
CREATE POLICY "Users can manage own requests" ON public.requests
  FOR ALL 
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
  );

-- Políticas para messages
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = sender_id) OR
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = receiver_id)
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = sender_id));

CREATE POLICY "Users can update own received messages" ON public.messages
  FOR UPDATE USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = receiver_id));

-- Políticas para favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id));
