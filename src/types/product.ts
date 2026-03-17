export interface Product {
  id: string;
  userId?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  municipality:
    | 'Monterrey'
    | 'San Nicolás de los Garza'
    | 'San Pedro Garza García'
    | 'Guadalupe'
    | 'Apodaca'
    | 'Escobedo'
    | 'Santa Catarina'
    | 'García'
    | 'General Escobedo'
    | 'Marín'
    | 'Doctor González'
    | string;
  address: string;
  category: 'PET' | 'Cartón' | 'Vidrio' | 'Metal' | 'Electrónicos' | 'Otros' | 'Papel' | 'HDPE';
  tags: string[];
  imageUrl: string;
  imageUrls?: string[];
  latitude: number;
  longitude: number;
  verified: boolean;
  type: 'venta' | 'donacion' | 'stock_recolector';
  createdAt?: string;
  status?: string;
}
