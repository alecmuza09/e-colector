# 🔨 GUÍA DE IMPLEMENTACIÓN - Mejoras e-colector

## 📚 Tabla de Contenidos

1. Ejemplos de código por feature
2. Componentes listos para copiar
3. Integraciones recomendadas
4. Best practices

---

# FASE 1: QUICK WINS - EJEMPLOS DE CÓDIGO

## 1.1 Notificaciones Flotantes (Toast System)

### Instalación
```bash
npm install sonner
# o
npm install react-toastify
```

### Componente Toast Global
```typescript
// src/components/Toast.tsx
import { Toaster } from 'sonner';

export function ToastContainer() {
  return (
    <Toaster 
      position="top-right"
      theme="light"
      richColors
    />
  );
}

// En App.tsx
<ToastContainer />
```

### Uso en toda la app
```typescript
// Importar en cualquier componente
import { toast } from 'sonner';

// Usar
toast.success('Material guardado como favorito');
toast.error('Error al publicar');
toast.loading('Buscando materiales...');
```

---

## 1.2 Filtros Avanzados

### Componente Mejorado
```typescript
// src/components/AdvancedFilters.tsx
import React, { useState } from 'react';
import { Slider, Select, Toggle } from '@/components/ui';

export function AdvancedFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    type: 'todos',
    distance: 50,
    onlyVerified: false,
    sortBy: 'relevancia'
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      {/* Rango de Precio */}
      <div>
        <label className="font-semibold text-gray-700">Precio</label>
        <Slider
          min={0}
          max={500}
          step={10}
          value={filters.priceRange}
          onChange={(val) => handleChange('priceRange', val)}
        />
        <span className="text-sm text-gray-500">
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </span>
      </div>

      {/* Tipo de Transacción */}
      <div>
        <label className="font-semibold text-gray-700">Tipo</label>
        <Select 
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'venta', label: '💰 Venta' },
            { value: 'donacion', label: '🎁 Donación' }
          ]}
          value={filters.type}
          onChange={(val) => handleChange('type', val)}
        />
      </div>

      {/* Distancia */}
      <div>
        <label className="font-semibold text-gray-700">Distancia Máxima</label>
        <Slider
          min={1}
          max={100}
          value={[filters.distance]}
          onChange={(val) => handleChange('distance', val[0])}
        />
        <span className="text-sm text-gray-500">{filters.distance} km</span>
      </div>

      {/* Solo Verificados */}
      <div className="flex items-center justify-between">
        <label className="font-semibold text-gray-700">Solo Verificados</label>
        <Toggle
          checked={filters.onlyVerified}
          onChange={(val) => handleChange('onlyVerified', val)}
        />
      </div>

      {/* Ordenamiento */}
      <div>
        <label className="font-semibold text-gray-700">Ordenar por</label>
        <Select 
          options={[
            { value: 'relevancia', label: 'Relevancia' },
            { value: 'precio-asc', label: 'Precio: Menor a Mayor' },
            { value: 'precio-desc', label: 'Precio: Mayor a Menor' },
            { value: 'fecha', label: 'Más Recientes' }
          ]}
          value={filters.sortBy}
          onChange={(val) => handleChange('sortBy', val)}
        />
      </div>

      {/* Botón Reset */}
      <button
        onClick={() => {
          const defaults = {
            priceRange: [0, 100],
            type: 'todos',
            distance: 50,
            onlyVerified: false,
            sortBy: 'relevancia'
          };
          setFilters(defaults);
          onFilterChange(defaults);
        }}
        className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg"
      >
        ✕ Limpiar Filtros
      </button>
    </div>
  );
}
```

---

## 1.3 Sistema de Favoritos

### Hook Personalizado
```typescript
// src/hooks/useFavorites.ts
import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Cargar favoritos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Guardar favoritos
  const saveFavorites = (fav: Set<string>) => {
    localStorage.setItem('favorites', JSON.stringify(Array.from(fav)));
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (productId: string) => favorites.has(productId);

  return { favorites, toggleFavorite, isFavorite };
}
```

### Uso en Componentes
```typescript
// En ProductCard.tsx
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react';

export function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      {/* Imagen con botón favorito */}
      <div className="relative">
        <img src={product.imageUrl} alt={product.title} />
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            favorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5" fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      {/* ... resto del card ... */}
    </div>
  );
}
```

---

# FASE 2: CORE FEATURES

## 2.1 Chat Básico

### Componente Chat
```typescript
// src/components/Chat/ChatWindow.tsx
import { useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'currentUser',
      content: text,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // TODO: Enviar a backend
  };

  return (
    <div className="h-[500px] flex flex-col bg-gray-50 rounded-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.isOwn
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className={`text-xs mt-1 block ${
                msg.isOwn ? 'text-emerald-100' : 'text-gray-600'
              }`}>
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') sendMessage(input);
          }}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={() => sendMessage(input)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

---

## 2.2 Sistema de Reputación

### Componente de Calificación
```typescript
// src/components/RatingStars.tsx
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function RatingStars({ 
  rating, 
  count, 
  interactive = false, 
  onRate 
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={!interactive}
            className={`transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            <Star 
              className="w-5 h-5" 
              fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)} ({count} reseñas)
      </span>
    </div>
  );
}
```

---

# FASE 3: ADVANCED FEATURES

## 3.1 Alertas Automáticas

### Sistema de Alertas
```typescript
// src/services/alertService.ts
interface Alert {
  id: string;
  userId: string;
  categories: string[];
  location: string;
  maxDistance: number;
  priceRange: [number, number];
  frequency: 'diaria' | 'semanal' | 'inmediata';
  enabled: boolean;
}

export class AlertService {
  static async createAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    // POST /api/alerts
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    return response.json();
  }

  static async getAlerts(userId: string): Promise<Alert[]> {
    // GET /api/alerts?userId=...
    const response = await fetch(`/api/alerts?userId=${userId}`);
    return response.json();
  }

  static async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    // PATCH /api/alerts/:id
    const response = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  static async deleteAlert(id: string): Promise<void> {
    // DELETE /api/alerts/:id
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
  }
}
```

### Componente de Configuración
```typescript
// src/components/AlertSettings.tsx
import { useState } from 'react';
import { AlertService } from '@/services/alertService';
import { toast } from 'sonner';

export function AlertSettings() {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    categories: [],
    location: '',
    maxDistance: 50,
    priceRange: [0, 500],
    frequency: 'diaria'
  });

  const handleCreateAlert = async () => {
    try {
      const alert = await AlertService.createAlert(newAlert);
      setAlerts([...alerts, alert]);
      toast.success('Alerta creada correctamente');
      setNewAlert({
        categories: [],
        location: '',
        maxDistance: 50,
        priceRange: [0, 500],
        frequency: 'diaria'
      });
    } catch (error) {
      toast.error('Error al crear la alerta');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mis Alertas</h2>

      {/* Crear Nueva Alerta */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-semibold">Nueva Alerta</h3>
        
        {/* Seleccionar Categorías */}
        <div>
          <label>Categorías de Interés</label>
          {/* Checkboxes para cada categoría */}
        </div>

        {/* Ubicación */}
        <div>
          <label>Ubicación Principal</label>
          <input 
            type="text" 
            placeholder="Ej: Monterrey"
            value={newAlert.location}
            onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
          />
        </div>

        {/* Distancia */}
        <div>
          <label>Radio de Búsqueda (km)</label>
          <input 
            type="range" 
            min="1" 
            max="100"
            value={newAlert.maxDistance}
            onChange={(e) => setNewAlert({...newAlert, maxDistance: parseInt(e.target.value)})}
          />
          <span>{newAlert.maxDistance} km</span>
        </div>

        {/* Frecuencia */}
        <div>
          <label>Frecuencia de Notificaciones</label>
          <select 
            value={newAlert.frequency}
            onChange={(e) => setNewAlert({...newAlert, frequency: e.target.value})}
          >
            <option value="inmediata">Inmediata</option>
            <option value="diaria">Diaria</option>
            <option value="semanal">Semanal</option>
          </select>
        </div>

        <button
          onClick={handleCreateAlert}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
        >
          Crear Alerta
        </button>
      </div>

      {/* Lista de Alertas Activas */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{alert.categories.join(', ')}</h4>
              <button
                onClick={() => AlertService.deleteAlert(alert.id)}
                className="text-red-600 hover:text-red-700"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600">📍 {alert.location} - {alert.maxDistance} km</p>
            <p className="text-sm text-gray-600">🔔 {alert.frequency}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# FASE 4: ENTERPRISE

## 4.1 API REST Básica

### Estructura Backend (Node.js + Express)
```typescript
// src/server/routes/api.ts
import express from 'express';
import { MaterialController } from '@/controllers/MaterialController';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

// Public endpoints
router.get('/materials', MaterialController.search);
router.get('/materials/:id', MaterialController.getById);

// Protected endpoints
router.use(authMiddleware);

router.post('/materials', MaterialController.create);
router.patch('/materials/:id', MaterialController.update);
router.delete('/materials/:id', MaterialController.delete);

// Alerts
router.get('/alerts', MaterialController.getAlerts);
router.post('/alerts', MaterialController.createAlert);

// Chat
router.get('/conversations', MaterialController.getConversations);
router.post('/messages', MaterialController.sendMessage);

// Ratings
router.get('/ratings/:userId', MaterialController.getRatings);
router.post('/ratings', MaterialController.createRating);

export default router;
```

### Documentación API (Swagger)
```typescript
// Instalar: npm install swagger-jsdoc swagger-ui-express

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Buscar materiales
 *     parameters:
 *       - name: category
 *         in: query
 *         type: string
 *       - name: location
 *         in: query
 *         type: string
 *       - name: priceMin
 *         in: query
 *         type: number
 *     responses:
 *       200:
 *         description: Lista de materiales
 */
```

---

# 🚀 PRÓXIMOS PASOS

## Esta Semana
1. [ ] Implementar notificaciones (Toast)
2. [ ] Agregar filtros avanzados
3. [ ] Sistema de favoritos

## Próximas 2 Semanas
4. [ ] Mejoras visuales (banners)
5. [ ] Onboarding interactivo
6. [ ] Perfil de usuario mejorado

## Próximas 4-6 Semanas
7. [ ] Autenticación completa
8. [ ] Chat básico
9. [ ] Sistema de reputación

---

**Documentación**: 2025-11-13  
**Versión**: 1.0  
**Estado**: 📋 Guía Implementación

