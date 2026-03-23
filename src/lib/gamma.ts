export const gammaPrompt = `
Crea un tráiler cinematográfico AAA hiperrealista para la plataforma turística "RDM DIGITAL".

ESCENA 1 — APERTURA DRAMÁTICA:
Vista aérea en dron cinematográfico sobre montañas frías cubiertas de densos bosques de pinos verdes en Real del Monte, Hidalgo. La escena está envuelta en una neblina espesa y en movimiento.

La cámara avanza lentamente (slow push-in), con una sensación de misterio y grandeza. La luz es tenue, con tonos azules y verdes profundos. Se escucha viento suave, ecos naturales y música orquestal creciente.

La neblina comienza a disiparse de forma progresiva revelando el paisaje montañoso.

ESCENA 2 — REVELACIÓN:
La cámara desciende y atraviesa el bosque. Los rayos de luz atraviesan los árboles.

Gradualmente aparece Real del Monte, el pueblo mágico más alto de México.

Se revelan:
- Calles empedradas
- Casas con techos rojos
- Arquitectura minera inglesa
- Iglesia icónica entre la niebla

ESCENA 3 — TRANSICIÓN DIGITAL:
El entorno real se transforma en una interfaz futurista.

Surge un mapa interactivo en 3D con puntos luminosos conectando:
- Cultura
- Gastronomía
- Historia
- Negocios locales

Animaciones tipo HUD, partículas, líneas de conexión.

ESCENA 4 — PLATAFORMA:
Texto en pantalla:
"RDM DIGITAL"
"Explora. Conecta. Descubre."

Se muestran:
- Navegación interactiva
- Filtros por experiencia
- IA recomendando rutas

ESCENA FINAL:
Vista aérea final alejándose del pueblo mientras la niebla vuelve parcialmente.

Logo RDM DIGITAL aparece con brillo sutil.

Estilo visual: Unreal Engine 5, hiperrealismo, iluminación volumétrica, partículas, cinematic depth of field.
`;

export async function fetchAIRecommendations(userMood: string): Promise<string[]> {
  const responses: Record<string, string[]> = {
    aventura: ["Mina La Dificultad", "Sendero del Hiloche"],
    romantico: ["Mirador Peña del Zumate", "Centro histórico"],
    familiar: ["Museo del Paste", "Plaza principal"],
    tranquilo: ["Bosques de pino", "Cafeterías locales"],
  };

  return new Promise((resolve) => {
    setTimeout(() => resolve(responses[userMood] || responses.tranquilo), 800);
  });
}
