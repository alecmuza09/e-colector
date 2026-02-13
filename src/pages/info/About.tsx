import React from 'react';
import {
  History,
  Target,
  Eye,
  Zap,
  Users,
  Leaf,
  ArrowRightCircle,
  Shield,
  BarChart3,
  Sparkles,
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">
            Acerca de e-Colector
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
            Conectando oferta y demanda de materiales reciclables de forma transparente y trazable.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Nuestra Historia */}
        <section className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <History className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Nuestra Historia
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-emerald-100 dark:border-emerald-800/50 space-y-5">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              e-Colector nació en <strong className="text-emerald-700 dark:text-emerald-400">2020</strong> a partir de una pregunta muy simple:
            </p>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 italic border-l-4 border-emerald-500 pl-4">
              ¿Por qué seguimos tratando los residuos reciclables como basura cuando en realidad son materia prima con valor?
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-800 dark:text-gray-200">Gabriel Carranza</strong> identificó una desconexión clara en el mercado: por un lado, empresas y personas generando materiales reciclables sin canales eficientes para comercializarlos; por otro, compradores y recicladores buscando suministro constante y confiable.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Así surgió e-Colector: una plataforma digital diseñada para conectar oferta y demanda de materiales reciclables de forma <span className="text-emerald-600 dark:text-emerald-400 font-medium">transparente</span>, <span className="text-emerald-600 dark:text-emerald-400 font-medium">eficiente</span> y <span className="text-emerald-600 dark:text-emerald-400 font-medium">trazable</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Desde entonces, hemos evolucionado hacia un marketplace especializado que profesionaliza el intercambio de residuos valorizables, reduciendo fricción operativa y aumentando el impacto ambiental positivo.
            </p>
          </div>
        </section>

        {/* Misión y Visión - Cards lado a lado */}
        <section className="mb-16 grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-emerald-100 dark:border-emerald-800/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/40">
                <Target className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Misión
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Facilitar la transición hacia una economía circular mediante un mercado digital eficiente, transparente y accesible para materiales reciclables, permitiendo que empresas e individuos transformen sus residuos en oportunidades de valor.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-emerald-100 dark:border-emerald-800/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <Eye className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Visión
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Convertirnos en la plataforma de referencia para la comercialización y gestión inteligente de materiales reciclables en Latinoamérica y el mundo, impulsando innovación tecnológica y promoviendo una cultura de responsabilidad ambiental en toda la cadena de valor.
            </p>
          </div>
        </section>

        {/* Qué Hacemos */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Qué Hacemos
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 shrink-0">
                <ArrowRightCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-0.5">
                Conectamos generadores de residuos reciclables con compradores y recicladores verificados.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 shrink-0">
                <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-0.5">
                Facilitamos transacciones seguras y trazables.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 shrink-0">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-0.5">
                Digitalizamos procesos tradicionalmente informales del sector.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40 shrink-0">
                <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-0.5">
                Generamos datos que permiten medir impacto ambiental y eficiencia operativa.
              </p>
            </div>
          </div>
        </section>

        {/* Nuestro Equipo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Nuestro Equipo
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 md:p-8 border border-emerald-200 dark:border-emerald-800/50">
            <div className="absolute top-4 right-4 opacity-20">
              <Sparkles className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
              Somos un equipo multidisciplinario con experiencia en tecnología, sostenibilidad, logística y desarrollo de negocios.
            </p>
            <p className="text-gray-700 dark:text-gray-200 font-medium mt-4 relative z-10">
              Nos une una convicción clara: la economía circular no es una tendencia, es una necesidad estructural. Y la tecnología es el habilitador clave para escalarla.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
