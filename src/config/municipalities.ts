// ============================================
// CONFIGURACIÓN DE MUNICIPIOS DEL ÁREA METROPOLITANA DE MONTERREY (AMM)
// ============================================

export interface Municipality {
  name: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  commonAddresses: string[];
}

export const MUNICIPALITIES: Municipality[] = [
  {
    name: 'Monterrey',
    latMin: 25.64,
    latMax: 25.72,
    lonMin: -100.37,
    lonMax: -100.28,
    commonAddresses: ['Centro', 'Barrio Antiguo', 'Macroplaza', 'Fundidora', 'Reforma', 'Cerro de la Silla', 'Acero', 'Independencia']
  },
  {
    name: 'San Nicolás de los Garza',
    latMin: 25.71,
    latMax: 25.77,
    lonMin: -100.32,
    lonMax: -100.25,
    commonAddresses: ['Zona Industrial', 'Centro', 'Barrio Nuevo', 'Zona Comercial', 'Independencia']
  },
  {
    name: 'San Pedro Garza García',
    latMin: 25.63,
    latMax: 25.68,
    lonMin: -100.40,
    lonMax: -100.32,
    commonAddresses: ['Del Valle', 'Aguamarca', 'Residencial', 'Centro', 'Santa Maria']
  },
  {
    name: 'Guadalupe',
    latMin: 25.66,
    latMax: 25.73,
    lonMin: -100.28,
    lonMax: -100.22,
    commonAddresses: ['Linda Vista', 'Centro', 'Zona Industrial', 'Tecnológico', 'Zona Este', 'Santa María']
  },
  {
    name: 'Apodaca',
    latMin: 25.75,
    latMax: 25.82,
    lonMin: -100.25,
    lonMax: -100.15,
    commonAddresses: ['Parque Industrial Stiva', 'Centro', 'Zona Este', 'Poniente', 'Industrial']
  },
  {
    name: 'Escobedo',
    latMin: 25.78,
    latMax: 25.84,
    lonMin: -100.35,
    lonMax: -100.28,
    commonAddresses: ['Centro', 'Rinconada', 'Lomas', 'Parque Industrial', 'La Floresta']
  },
  {
    name: 'Santa Catarina',
    latMin: 25.64,
    latMax: 25.70,
    lonMin: -100.48,
    lonMax: -100.42,
    commonAddresses: ['La Fama', 'Centro', 'Barrio Nuevo', 'Poniente', 'Zona Industrial']
  },
  {
    name: 'García',
    latMin: 25.62,
    latMax: 25.68,
    lonMin: -100.50,
    lonMax: -100.44,
    commonAddresses: ['Centro', 'Zona Comercial', 'Residencial', 'Zona Industrial']
  },
  {
    name: 'General Escobedo',
    latMin: 25.80,
    latMax: 25.86,
    lonMin: -100.35,
    lonMax: -100.28,
    commonAddresses: ['Centro', 'Zona Industrial', 'Poniente', 'Noreste']
  },
  {
    name: 'Marín',
    latMin: 25.66,
    latMax: 25.72,
    lonMin: -100.22,
    lonMax: -100.16,
    commonAddresses: ['Centro', 'Zona Comercial', 'Residencial', 'Industrial']
  },
  {
    name: 'Doctor González',
    latMin: 25.71,
    latMax: 25.78,
    lonMin: -100.40,
    lonMax: -100.34,
    commonAddresses: ['Centro', 'Residencial', 'Zona Comercial', 'Industrial']
  }
];

// Función auxiliar para obtener un municipio por nombre
export const getMunicipalityByName = (name: string): Municipality | undefined => {
  return MUNICIPALITIES.find(m => m.name === name);
};

// Función para obtener coordenadas aleatorias dentro de un municipio
export const getRandomCoordinates = (municipality: Municipality): { latitude: number; longitude: number } => {
  const randomCoordinate = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  return {
    latitude: randomCoordinate(municipality.latMin, municipality.latMax),
    longitude: randomCoordinate(municipality.lonMin, municipality.lonMax)
  };
};

// Lista de nombres de municipios para usar en selects
export const MUNICIPALITY_NAMES = MUNICIPALITIES.map(m => m.name);
