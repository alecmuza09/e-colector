import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
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
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
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
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
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

// Rutas que muestran el sidebar (solo cuando autenticado)
const SIDEBAR_ROUTES = ['/', '/explorar', '/dashboard', '/perfil', '/publicar', '/estadisticas', '/favoritos', '/mensajes', '/configuracion'];

// Rutas sin header ni sidebar (pantallas de auth)
const NO_HEADER_ROUTES = ['/login', '/registro', '/auth/callback'];

const allRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/listado/:id" element={<ListingDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Register />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/perfil" element={<Profile />} />
    <Route path="/publicar" element={<PublishListing />} />
    <Route path="/publicar/:id" element={<PublishListing />} />
    <Route path="/mensajes" element={<Mensajes />} />
    <Route path="/favoritos" element={<Favoritos />} />
    <Route path="/estadisticas" element={<Estadisticas />} />
    <Route path="/configuracion" element={<Configuracion />} />
    <Route path="/solicitud/:id" element={<SolicitudDetail />} />
    <Route path="/oferta/:id" element={<OfertaDetail />} />
    <Route path="/recolector/:id" element={<RecolectorProfile />} />
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
    <Route path="/legal/cookies" element={<CookiePolicy />} />
  </>
);

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isNoHeader = NO_HEADER_ROUTES.includes(location.pathname);
  const isInSidebarRoute = SIDEBAR_ROUTES.some(r =>
    r === '/' ? location.pathname === '/' : location.pathname.startsWith(r)
  );
  const showSidebar = isAuthenticated && isInSidebarRoute && !isNoHeader;
  const showNavbar = !isAuthenticated && !isNoHeader;

  // Pantallas de auth: sin header ni footer
  if (isNoHeader) {
    return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 flex flex-col w-full">
          <div className="flex-grow">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>{allRoutes}</Routes>
            </Suspense>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {showSidebar && <Sidebar />}
      <main className="flex-1 flex flex-col min-w-0">
        {showNavbar && <Navbar />}
        <div className="flex-grow">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>{allRoutes}</Routes>
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