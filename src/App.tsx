import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
// Eliminar importaciones estáticas de páginas que serán cargadas con lazy
// import Home from './pages/Home';
// import ListingDetail from './pages/ListingDetail';
// import Login from './pages/Login';
// ... (eliminar el resto)

// Importar componentes de página dinámicamente
const Home = lazy(() => import('./pages/Home'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const About = lazy(() => import('./pages/info/About'));
const Blog = lazy(() => import('./pages/info/Blog'));
const BlogPostPage = lazy(() => import('./pages/info/BlogPostPage'));
const Pricing = lazy(() => import('./pages/info/Pricing'));
const Contact = lazy(() => import('./pages/info/Contact'));
const Guides = lazy(() => import('./pages/resources/Guides'));
const GuideDetailPage = lazy(() => import('./pages/resources/GuideDetailPage'));
const HelpCenter = lazy(() => import('./pages/resources/HelpCenter'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const ExploreMap = lazy(() => import('./pages/ExploreMap'));
const PublishListing = lazy(() => import('./pages/PublishListing'));
const SolicitudDetail = lazy(() => import('./pages/details/SolicitudDetail'));
const OfertaDetail = lazy(() => import('./pages/details/OfertaDetail'));
const RecolectorProfile = lazy(() => import('./pages/profile/RecolectorProfile'));
const Mensajes = lazy(() => import('./pages/Mensajes'));
const Favoritos = lazy(() => import('./pages/Favoritos'));
const Estadisticas = lazy(() => import('./pages/Estadisticas'));
const Configuracion = lazy(() => import('./pages/Configuracion'));

// Componente simple de carga
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
    <p className="text-gray-500 text-lg">Cargando...</p>
    {/* Podrías añadir un spinner aquí */}
  </div>
);

// Rutas que SI necesitan sidebar
const SIDEBAR_ROUTES = ['/explorar', '/dashboard', '/perfil', '/publicar', '/estadisticas', '/favoritos', '/mensajes', '/'];

// Rutas que NO deben mostrar sidebar
const NO_SIDEBAR_ROUTES = ['/login', '/registro'];

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // No mostrar sidebar en login y registro
  if (NO_SIDEBAR_ROUTES.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 flex flex-col w-full">
          <div className="flex-grow">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </main>
      </div>
    );
  }
  
  // Mostrar sidebar en todas las rutas, pero en "/" solo si está autenticado
  const shouldShowSidebar = location.pathname === '/' 
    ? isAuthenticated 
    : SIDEBAR_ROUTES.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Solo en rutas específicas */}
      {shouldShowSidebar && <Sidebar />}
      
      <main className="flex-1 flex flex-col">
        <div className="flex-grow">
            {/* Envolver Routes con Suspense */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Rutas Principales */}
                <Route path="/" element={<Home />} />
                <Route path="/listado/:id" element={<ListingDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                
                {/* Rutas Protegidas (requieren login) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/publicar" element={<PublishListing />} />
                <Route path="/mensajes" element={<Mensajes />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
                <Route path="/configuracion" element={<Configuracion />} />
                
                {/* Rutas de Detalles */}
                <Route path="/solicitud/:id" element={<SolicitudDetail />} />
                <Route path="/oferta/:id" element={<OfertaDetail />} />
                <Route path="/recolector/:id" element={<RecolectorProfile />} /> 

                {/* Rutas Públicas */}
                <Route path="/explorar" element={<ExploreMap />} /> 
                <Route path="/acerca-de" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:postId" element={<BlogPostPage />} />
                <Route path="/precios" element={<Pricing />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/recursos/guias" element={<Guides />} />
                <Route path="/recursos/guias/:guideId" element={<GuideDetailPage />} />
                <Route path="/recursos/centro-ayuda" element={<HelpCenter />} />
                <Route path="/legal/privacidad" element={<PrivacyPolicy />} />
                <Route path="/legal/terminos" element={<TermsOfService />} />
              </Routes>
            </Suspense>
        </div>
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;