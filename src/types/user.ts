// import { Municipality } from './mapTypes'; // Asumiendo que tienes este tipo definido
// FIXME: El tipo Municipality no fue encontrado. Usando string temporalmente.
// Quizás necesitemos definirlo en mapTypes.ts o usar una lista predefinida.
type Municipality = string;

// Enum para los roles de usuario
export enum UserRole {
    BUYER = 'buyer',
    SELLER = 'seller',
    COLLECTOR = 'collector',
}

// --- Campos Comunes ---
export interface CommonProfileData {
    id: string; // Identificador único del usuario
    role: UserRole;
    fullName: string; // Nombre completo o Nombre de la Empresa
    email: string; // Verificado
    phoneNumber: string;
    city: string; // Usando string temporalmente en lugar de Municipality
    profilePictureUrl?: string; // Opcional
    termsAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
    // --- Requerimientos de Perfil ---
    isVerified: boolean; // Estado de verificación (ej. email, negocio)
    publicProfile: boolean; // Si el perfil es público o privado
    // Placeholder para futuras integraciones
    // rating?: number; 
    // reviews?: Review[];
    // transactionHistory?: Transaction[];
}

// --- Perfil Específico del Comprador ---
export interface BuyerProfile extends CommonProfileData {
    role: UserRole.BUYER;
    materialCategoriesOfInterest: string[]; // Ej: ['PET', 'Cartón', 'Metal']
    purchaseVolumePreference: 'bulk' | 'small';
    purchaseFrequency: 'regular' | 'occasional';
    notificationPreferences: { // Más detalle si es necesario
        newListings: boolean;
        priceChanges: boolean;
    };
    allowDirectContact: boolean;
    businessRegistrationNumber?: string; // Opcional
}

// --- Perfil Específico del Vendedor/Generador ---
export enum LocationType {
    RESIDENTIAL = 'residential',
    COMMERCIAL = 'commercial',
    INDUSTRIAL = 'industrial',
}

export interface SellerProfile extends CommonProfileData {
    role: UserRole.SELLER;
    locationType: LocationType;
    materialTypesGenerated: string[]; // Ej: ['Plástico Mixto', 'Papel Oficina']
    generationFrequency: string; // Ej: 'Diario', 'Semanal', 'Mensual'
    preferredDisposalMethod: string; // Ej: 'Recolección programada', 'Entrega en centro'
    estimatedMonthlyVolumeKg?: number; // Opcional
    operatingHours?: string; // Ej: 'L-V 9:00-17:00'
    accessibilityInstructions?: string; // Ej: 'Entrar por puerta trasera'
    allowDirectContact: boolean;
}

// --- Perfil Específico del Recolector/Reciclador ---
export enum BusinessType {
    INDEPENDENT = 'independent',
    COMPANY = 'company',
    COLLECTION_CENTER = 'collection_center',
}

export enum ServiceOption {
    PICKUP = 'pickup',
    BUYING = 'buying', // Compra directa en sitio o centro
    PROCESSING = 'processing',
}

export interface CollectorProfile extends CommonProfileData {
    role: UserRole.COLLECTOR;
    businessType: BusinessType;
    serviceCoverageAreas: string[]; // Usando string[] temporalmente
    materialsHandled: string[]; // Ej: ['PET', 'Aluminio', 'RAEE']
    serviceOptions: ServiceOption[];
    operatingSchedule: string; // Ej: 'L-S 8:00-18:00'
    targetClientTypes: LocationType[]; // Ej: [LocationType.COMMERCIAL, LocationType.INDUSTRIAL]
    certifications?: string[]; // Ej: 'ISO 14001', 'Permiso SEMARNAT'
    vehicleType?: string; // Ej: 'Camioneta 1 Ton', 'Camión Torton'
    vehicleCapacityKg?: number;
    hasInsurance: boolean; // ¿Cuenta con seguro? (Simplificado)
    // insuranceDetails?: string; // Opcional, más detalles
}

// --- Tipo Unión para Perfil de Usuario ---
// Discriminated Union: El campo 'role' determina qué campos específicos están presentes.
export type UserProfile = BuyerProfile | SellerProfile | CollectorProfile;

// --- Tipos Adicionales (Placeholders) ---
// export interface Review { /* ... */ }
// export interface Transaction { /* ... */ }

// --- Tipo para Datos de Registro (antes de crear perfil completo) ---
// Puede ser útil tener un tipo intermedio para el formulario
// export type RegistrationData = Omit<CommonProfileData, 'id' | 'createdAt' | 'updatedAt' | 'isVerified'> & 
//    Partial<Omit<BuyerProfile, keyof CommonProfileData>> &
//    Partial<Omit<SellerProfile, keyof CommonProfileData>> &
//    Partial<Omit<CollectorProfile, keyof CommonProfileData>>; 