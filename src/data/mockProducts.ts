export interface Product {
  id: string;
  userId?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  municipality: 'Monterrey' | 'San Nicolás de los Garza' | 'San Pedro Garza García' | 'Guadalupe' | 'Apodaca' | 'Escobedo' | 'Santa Catarina' | 'García' | 'General Escobedo' | 'Marín' | 'Doctor González';
  address: string;
  category: 'PET' | 'Cartón' | 'Vidrio' | 'Metal' | 'Electrónicos' | 'Otros' | 'Papel' | 'HDPE';
  tags: string[];
  imageUrl: string;
  imageUrls?: string[];
  latitude: number;
  longitude: number;
  verified: boolean;
  type: 'venta' | 'donacion';
  createdAt?: string;
  status?: string;
}

// Datos de municipios del ÁREA METROPOLITANA DE MONTERREY (AMM) con rangos de coordenadas precisos
const municipios = {
  'Monterrey': { latMin: 25.64, latMax: 25.72, lonMin: -100.37, lonMax: -100.28 },
  'San Nicolás de los Garza': { latMin: 25.71, latMax: 25.77, lonMin: -100.32, lonMax: -100.25 },
  'San Pedro Garza García': { latMin: 25.63, latMax: 25.68, lonMin: -100.40, lonMax: -100.32 },
  'Guadalupe': { latMin: 25.66, latMax: 25.73, lonMin: -100.28, lonMax: -100.22 },
  'Apodaca': { latMin: 25.75, latMax: 25.82, lonMin: -100.25, lonMax: -100.15 },
  'Escobedo': { latMin: 25.78, latMax: 25.84, lonMin: -100.35, lonMax: -100.28 },
  'Santa Catarina': { latMin: 25.64, latMax: 25.70, lonMin: -100.48, lonMax: -100.42 },
  'García': { latMin: 25.62, latMax: 25.68, lonMin: -100.50, lonMax: -100.44 },
  'General Escobedo': { latMin: 25.80, latMax: 25.86, lonMin: -100.35, lonMax: -100.28 },
  'Marín': { latMin: 25.66, latMax: 25.72, lonMin: -100.22, lonMax: -100.16 },
  'Doctor González': { latMin: 25.71, latMax: 25.78, lonMin: -100.40, lonMax: -100.34 }
};

// Información de productos
const productTemplates = {
  'PET': [
    { emoji: '🧴', titles: ['Botellas PET Cristal', 'PET Azul Bebidas', 'PET Verde', 'PET Transparente', 'Chatarra PET Mixta', 'PET Pellets', 'Botellas de Agua', 'PET Compactado'] },
  ],
  'Cartón': [
    { emoji: '📦', titles: ['Cartón Corrugado OCC', 'Cajas de Cartón', 'Cartón Blanco', 'Cartón Ondulado', 'Paca de Cartón', 'Cartulina', 'Cartón Mixto'] },
  ],
  'Vidrio': [
    { emoji: '🍾', titles: ['Vidrio Transparente', 'Botellas Verdes', 'Vidrio Ámbar', 'Vidrio Roto', 'Vidrio Molido', 'Frascos de Vidrio', 'Vidrio de Laboratorio'] },
  ],
  'Metal': [
    { emoji: '🥫', titles: ['Latas de Aluminio', 'Hierro Viejo', 'Cobre Puro', 'Acero Chatarra', 'Latas Variadas', 'Tuberías Metal', 'Virutas de Acero', 'Aluminio Compactado'] },
  ],
  'Electrónicos': [
    { emoji: '💻', titles: ['Chatarra Electrónica', 'Monitores CRT', 'Cables de Computadora', 'Transformadores', 'Baterías Usadas', 'Celulares Antiguos', 'Placas Madre', 'Fuentes de Poder'] },
  ],
  'Papel': [
    { emoji: '📂', titles: ['Archivo Muerto', 'Periódicos Viejos', 'Bolsas de Papel', 'Papel Mixto', 'Cartulina Blanca', 'Papel Blanco de Oficina'] },
  ],
  'HDPE': [
    { emoji: '🧼', titles: ['HDPE Soplado', 'HDPE Natural Blanco', 'HDPE Mixto', 'Plástico HDPE Reciclado', 'Botellas HDPE'] },
  ],
  'Otros': [
    { emoji: '♻️', titles: ['Mezcla Plásticos', 'Maderas de Demolición', 'Espuma Empaque', 'Telas y Textiles', 'Neumáticos Viejos'] },
  ]
};

// Función auxiliar para generar coordenadas aleatorias dentro de un rango
function randomCoordinate(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Función para generar descripción basada en categoría
function getDescription(category: string, weight: number): string {
  const descriptions: Record<string, string[]> = {
    'PET': [
      'Material limpio y compactado listo para procesamiento inmediato.',
      'Clasificado por colores, sin contaminación ni residuos.',
      'Excelente calidad para reciclaje directo en plantas de transformación.',
      'Disponible para retiro inmediato con transporte propio.',
      'Certificado y listo para uso industrial.'
    ],
    'Cartón': [
      'Cartón seco sin manchas, perfecto para reutilización industrial.',
      'Pacas compactadas, disponibles en diferentes cantidades.',
      'Material de excelente calidad para plantas de reproceso.',
      'Limpio y clasificado, listo para procesamiento.',
      'Ideal para uso directo o reciclaje especializado.'
    ],
    'Vidrio': [
      'Vidrio limpio y clasificado por color.',
      'Sin residuos químicos, listo para fundición o reutilización.',
      'Ideal para plantas de reproceso de vidrio.',
      'Material de alta calidad sin contaminación.',
      'Disponible para retiro con transporte especializado.'
    ],
    'Metal': [
      'Chatarra de metal clasificada y lista para procesamiento.',
      'Material con alto valor de mercado para reciclaje.',
      'Limpio y sin contaminación, certificado para uso industrial.',
      'Excelente para plantas de fundición y recuperación.',
      'Disponible en lotes grandes a precios especiales.'
    ],
    'Electrónicos': [
      'Electrónica para reciclaje especializado con retiro disponible.',
      'Componentes organizados por tipo, listos para procesamiento.',
      'Material valioso para recuperación de metales preciosos.',
      'Almacenado adecuadamente, sin daños por exposición.',
      'Reciclaje certificado y seguro.'
    ],
    'Papel': [
      'Papel seco y clasificado listo para reproceso.',
      'Material limpio sin grapas ni elementos contaminantes.',
      'Ideal para plantas de reprocesado de papel.',
      'Clasificado por tipo, disponible en diferentes cantidades.',
      'Perfecto para uso directo o reciclaje especializado.'
    ],
    'HDPE': [
      'HDPE limpio y clasificado por color.',
      'Material de excelente calidad para extrusión y moldeo.',
      'Sin contaminación, certificado para uso industrial.',
      'Disponible en diferentes formas según necesidad.',
      'Ideal para plantas de procesamiento de plástico.'
    ],
    'Otros': [
      'Material mixto listo para procesamiento especializado.',
      'Disponible para retiro con transporte propio.',
      'Clasificado según tipo, perfecto para recicladores especializados.',
      'Almacenado en condiciones óptimas para preservar calidad.',
      'Certificado y disponible para compra inmediata.'
    ]
  };
  return descriptions[category]?.[Math.floor(Math.random() * descriptions[category].length)] || 'Material de excelente calidad listo para procesamiento.';
}

// Función para generar precio aleatorio según categoría
function getRandomPrice(category: string): number {
  const priceRanges: Record<string, [number, number]> = {
    'PET': [5, 25],
    'Cartón': [1, 5],
    'Vidrio': [0.5, 5],
    'Metal': [8, 50],
    'Electrónicos': [0, 20],
    'Papel': [0.5, 3],
    'HDPE': [4, 10],
    'Otros': [1, 10]
  };
  const [min, max] = priceRanges[category] || [1, 10];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Generar productos aleatorios SOLO en el Área Metropolitana de Monterrey
function generateProducts(): Product[] {
  const products: Product[] = [];
  let productId = 1;

  const categories: Array<'PET' | 'Cartón' | 'Vidrio' | 'Metal' | 'Electrónicos' | 'Papel' | 'HDPE' | 'Otros'> = ['PET', 'Cartón', 'Vidrio', 'Metal', 'Electrónicos', 'Papel', 'HDPE', 'Otros'];
  const municipiosList = Object.keys(municipios) as Array<keyof typeof municipios>;
  const weights = [50, 100, 80, 20, 70, 80, 40, 60];

  // Generar múltiples productos por categoría (11 por categoría = 88 totales)
  for (const category of categories) {
    const productsPerCategory = 11;
    
    for (let i = 0; i < productsPerCategory; i++) {
      // Seleccionar municipio aleatorio del AMM
      const municipio = municipiosList[Math.floor(Math.random() * municipiosList.length)];
      const munData = municipios[municipio];

      // Generar coordenadas aleatorias dentro del municipio
      const latitude = randomCoordinate(munData.latMin, munData.latMax);
      const longitude = randomCoordinate(munData.lonMin, munData.lonMax);

      // Seleccionar título aleatorio de la categoría
      const titles = productTemplates[category][0].titles;
      const baseTitle = titles[Math.floor(Math.random() * titles.length)];
      const weight = weights[Math.floor(Math.random() * weights.length)];
      
      const title = `${productTemplates[category][0].emoji} ${baseTitle} (${weight}kg)`;
      const price = Math.random() > 0.15 ? getRandomPrice(category) : 0; // 15% donaciones
      const verified = Math.random() > 0.4; // 60% verificados

      // Direcciones por municipio del AMM
      const addresses: Record<string, string[]> = {
        'Monterrey': ['Centro', 'Barrio Antiguo', 'Macroplaza', 'Fundidora', 'Reforma', 'Cerro de la Silla', 'Acero', 'Independencia'],
        'San Nicolás de los Garza': ['Zona Industrial', 'Centro', 'Barrio Nuevo', 'Zona Comercial', 'Independencia'],
        'San Pedro Garza García': ['Del Valle', 'Aguamarca', 'Residencial', 'Centro', 'Santa Maria'],
        'Guadalupe': ['Linda Vista', 'Centro', 'Zona Industrial', 'Tecnológico', 'Zona Este', 'Santa María'],
        'Apodaca': ['Parque Industrial Stiva', 'Centro', 'Zona Este', 'Poniente', 'Industrial'],
        'Escobedo': ['Centro', 'Rinconada', 'Lomas', 'Parque Industrial', 'La Floresta'],
        'Santa Catarina': ['La Fama', 'Centro', 'Barrio Nuevo', 'Poniente', 'Zona Industrial'],
        'García': ['Centro', 'Zona Comercial', 'Residencial', 'Zona Industrial'],
        'General Escobedo': ['Centro', 'Zona Industrial', 'Poniente', 'Noreste'],
        'Marín': ['Centro', 'Zona Comercial', 'Residencial', 'Industrial'],
        'Doctor González': ['Centro', 'Residencial', 'Zona Comercial', 'Industrial']
      };

      const addressOptions = addresses[municipio] || ['Centro'];
      const addressArea = addressOptions[Math.floor(Math.random() * addressOptions.length)];

      products.push({
        id: `mty-prod-${String(productId).padStart(3, '0')}`,
        title,
        description: getDescription(category, weight),
        price,
        currency: 'MXN',
        location: `📍 ${municipio}, ${addressArea}`,
        municipality: municipio,
        address: `Avenida Comercial ${Math.floor(Math.random() * 1000)}, ${addressArea}, ${municipio}, N.L.`,
        category,
        tags: [category.toLowerCase(), 'reciclaje', 'compra', 'venta'],
        imageUrl: `https://placehold.co/400x300/${getCategoryColor(category).bg}/${getCategoryColor(category).text}?text=${encodeURIComponent(baseTitle)}\n(${weight}kg)`,
        latitude,
        longitude,
        verified,
        type: price === 0 ? 'donacion' : 'venta'
      });

      productId++;
    }
  }

  return products;
}

// Función auxiliar para obtener colores por categoría
function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    'PET': { bg: 'EBF4FF', text: '3B82F6' },
    'Cartón': { bg: 'FEF3C7', text: 'CA8A04' },
    'Vidrio': { bg: 'D1FAE5', text: '10B981' },
    'Metal': { bg: 'FEE2E2', text: 'EF4444' },
    'Electrónicos': { bg: 'F3E8FF', text: '9333EA' },
    'Papel': { bg: 'F3F4F6', text: '4B5563' },
    'HDPE': { bg: 'E0F2FE', text: '0284C7' },
    'Otros': { bg: 'F3F4F6', text: '9333EA' }
  };
  return colors[category] || { bg: 'F3F4F6', text: '9333EA' };
}

export const mockProducts: Product[] = generateProducts();
