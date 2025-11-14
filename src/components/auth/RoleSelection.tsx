import React from 'react';
import { UserRole } from '../../types/user'; // Asegúrate que la ruta sea correcta

// Placeholder para iconos (podrías usar una librería como react-icons)
const BuyerIcon = () => <span>🏢</span>; // Icono para comprador
const SellerIcon = () => <span>🏭</span>; // Icono para vendedor/generador
const CollectorIcon = () => <span>🚚</span>; // Icono para recolector

interface RoleSelectionProps {
    onSelectRole: (role: UserRole) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
    const roles = [
        {
            role: UserRole.BUYER,
            title: 'Comprador de Materiales',
            description: 'Busco comprar materiales reciclables a granel o en pequeñas cantidades para mi proceso industrial o comercial.',
            icon: <BuyerIcon />,
        },
        {
            role: UserRole.SELLER,
            title: 'Vendedor / Generador de Residuos',
            description: 'Genero residuos reciclables (plástico, cartón, metal, etc.) en mi hogar, negocio o industria y busco venderlos o que los recolecten.',
            icon: <SellerIcon />,
        },
        {
            role: UserRole.COLLECTOR,
            title: 'Recolector / Empresa de Reciclaje',
            description: 'Ofrezco servicios de recolección, compra o procesamiento de materiales reciclables para particulares o empresas.',
            icon: <CollectorIcon />,
        },
    ];

    return (
        <div className="max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Elige tu rol en e-colector</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((roleInfo) => (
                    <button
                        key={roleInfo.role}
                        onClick={() => onSelectRole(roleInfo.role)}
                        className="flex flex-col items-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 bg-white text-center"
                    >
                        <div className="text-4xl mb-3">{roleInfo.icon}</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{roleInfo.title}</h3>
                        <p className="text-sm text-gray-600">{roleInfo.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RoleSelection; 