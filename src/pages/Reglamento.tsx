import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from '@/components/SEOMeta';
import { Shield, Heart, AlertTriangle, FileText, Mail } from 'lucide-react';

const Reglamento = () => {
  return (
    <RDMLayout>
      <SEOMeta title="Reglamento - Normas de la Comunidad" />
      
      {/* Hero Banner */}
      <div className="relative h-64 w-full overflow-hidden">
        <img src="/images/streets-colonial.jpg" alt="Calles coloniales de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Reglamento de la Comunidad</h1>
          <p className="text-lg text-white/80">Normas y políticas para una comunidad saludable</p>
        </div>
      </div>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 hidden">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introducción */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    1. Introducción
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    El presente reglamento establece las normas de convivencia y participación 
                    en la comunidad de RDM Digital. Al utilizar nuestra plataforma, 
                    aceptas cumplir con estas políticas. Nuestro objetivo es mantener 
                    un espacio seguro, respetuoso y enriquecedor para todos los amantes 
                    de Real del Monte y su cultura.
                  </p>
                </div>
              </div>
            </section>

            {/* Normas de Publicación */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    2. Normas de Publicación en la Comunidad
                  </h2>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex gap-3">
                      <span className="text-amber-600 font-semibold">✓</span>
                      <span>
                        <strong>Sé respetuoso:</strong> Trata a todos los miembros 
                        con cortesía y respeto. No se toleran insultos ni comentarios ofensivos.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600 font-semibold">✓</span>
                      <span>
                        <strong>Contenido relevante:</strong> Las publicaciones deben 
                        estar relacionadas con Real del Monte, viajes, turismo o experiencias relacionadas.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600 font-semibold">✓</span>
                      <span>
                        <strong>Comparte experiencias reales:</strong> Solo publica 
                        contenido basado en experiencias propias o verificadas.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600 font-semibold">✓</span>
                      <span>
                        <strong>Usa lenguaje apropiado:</strong> Evita vocabulario 
                        vulgar, slurs o cualquier forma de lenguaje discriminatorio.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600 font-semibold">✓</span>
                      <span>
                        <strong>Protege tu privacidad:</strong> No compartas información 
                        personal sensible como teléfonos, direcciones o datos financieros.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contenido Prohibido */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    3. Contenido Prohibido
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Los siguientes tipos de contenido están terminantemente prohibidos 
                    y serán eliminados inmediatamente:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>Contenido violento, agresivo o que incite al odio</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>Spam, publicidad no solicitada o enlaces maliciosos</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>Información falsa o engañosa</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>Contenido sexual explícito o inapropiado</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>Actividades ilegales o que violen derechos de terceros</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>Suplantación de identidad o cuentas falsas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Carta de Derechos de la Comunidad */}
            <section className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-pink-400 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    4. Carta de Derechos y Deberes de la Comunidad
                  </h2>
                  <p className="mb-4 opacity-90 leading-relaxed">
                    RDM Digital se proclama un espacio libre de odio, discriminación y explotación. 
                    Nos regimos por los principios de la Declaración Universal de los Derechos Humanos 
                    y las leyes locales, nacionales e internacionales aplicables.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <h3 className="font-bold text-lg mb-2 text-pink-300">🚫 Cero tolerancia al odio</h3>
                      <p className="text-sm opacity-80">
                        Rechazamos categóricamente cualquier expresión de odio, racismo, clasismo, 
                        xenofobia, homofobia, transfobia, misoginia, capacitismo o cualquier forma 
                        de discriminación. No hay libertad de expresión sin responsabilidad.
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h3 className="font-bold text-lg mb-2 text-pink-300">🛡️ Protección contra la explotación</h3>
                      <p className="text-sm opacity-80">
                        Nos oponemos firmemente a toda forma de explotación: infantil, sexual, 
                        laboral, de información personal o de datos. La plataforma no tolera, 
                        aloja ni facilita ningún tipo de actividad de explotación.
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h3 className="font-bold text-lg mb-2 text-pink-300">⚖️ Cumplimiento legal</h3>
                      <p className="text-sm opacity-80">
                        Estamos en contra de cualquier actividad criminal o que constituya una 
                        violación a leyes locales, nacionales e internacionales. Esto incluye, 
                        pero no se limita a: fraude, extorsión, tráfico ilegal, lavado de dinero, 
                        piratería, apología del delito, y cualquier acto que atente contra la 
                        seguridad o integridad de las personas.
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <h3 className="font-bold text-lg mb-2 text-pink-300">🌍 Compromiso comunitario</h3>
                      <p className="text-sm opacity-80">
                        Promovemos una comunidad sana, amigable y abierta para todos. La diversidad 
                        es nuestra fortaleza. Cada miembro tiene derecho a participar sin temor a 
                        represalias, acoso o discriminación. La moderación se ejerce con equidad, 
                        transparencia y respeto al debido proceso.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Moderación */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Política de Moderación
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Nuestro equipo de moderación revisa el contenido publicado para 
                    asegurar el cumplimiento de estas normas:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li>
                      <strong>Revisión previa:</strong> Las publicaciones pueden pasar 
                      por una revisión antes de ser visibles públicamente.
                    </li>
                    <li>
                      <strong>Eliminación:</strong> El contenido que viole estas normas 
                      será eliminado sin previo aviso.
                    </li>
                    <li>
                      <strong>Suspensión:</strong> Los usuarios que reincidan pueden 
                      ser suspendidos temporal o permanentemente.
                    </li>
                    <li>
                      <strong>Apelaciones:</strong> Si consideras que tu contenido fue 
                      eliminado injustamente, puedes contactarnos.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacidad */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    6. Privacidad y Datos Personales
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Respetamos tu privacidad y protegemos tus datos personales:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li>
                      <strong>Recopilación mínima:</strong> Solo recopilamos la 
                      información necesaria para el funcionamiento de la plataforma.
                    </li>
                    <li>
                      <strong>No vendemos datos:</strong> Tu información personal 
                      nunca será vendida a terceros.
                    </li>
                    <li>
                      <strong>Control:</strong> Puedes acceder, corregir o eliminar 
                      tus datos en cualquier momento desde tu perfil.
                    </li>
                    <li>
                      <strong>Cookies:</strong> Utilizamos cookies esenciales para 
                      mejorar tu experiencia. Puedes configurarlas en tu navegador.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    7. Contacto y Reporte de Violaciones
                  </h2>
                  <p className="mb-4 opacity-90">
                    ¿Tienes preguntas sobre este reglamento o necesitas reportar 
                    una violación? Contáctanos:
                  </p>
                  <ul className="space-y-2 opacity-90">
                    <li>📧 Email: moderation@rdmdigital.mx</li>
                    <li>📞 Teléfono: +52 771 123 4567</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm">
              <p>
                Última actualización: {new Date().toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="mt-2">
                Al usar RDM Digital, aceptas este reglamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RDMLayout>
  );
};

export default Reglamento;
