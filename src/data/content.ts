// Unified content derived from the 7 absorbed sub-platforms (RDM Digital OS,
// Turismo Digital, Hub Unite, Atlas, Twin, etc.). All copy curated for the
// final LTOS Territorial release.

export const TIMELINE = [
  { year: "Siglo XVI", event: "Comienza la explotación de vetas argentíferas en la región Pachuca · Real del Monte." },
  { year: "1766", event: "Una de las huelgas mineras más tempranas del continente americano se registra en Real del Monte." },
  { year: "1824", event: "Llegan los mineros de Cornwall: intercambio tecnológico, futbol, paste y cementerio inglés." },
  { year: "S. XIX", event: "El paste se vuelve identidad gastronómica local; nacen las casas mineras de cantera." },
  { year: "1906", event: "Declive de los ciclos mineros tradicionales y transición a una nueva economía regional." },
  { year: "2004", event: "Mineral del Monte es reconocido como Pueblo Mágico por su patrimonio histórico." },
  { year: "2017", event: "La Comarca Minera se integra al programa de Geoparques Mundiales de la UNESCO." },
  { year: "2026", event: "Despliegue del Sistema Operativo Territorial LTOS · TAMV MD-X4 sobre el territorio." },
];

export const DISHES = [
  { name: "Paste Tradicional · El Portal", desc: "Herencia cornish con papa, carne y cebolla.", price: "$20" },
  { name: "Paste de Mole · Casa Minera", desc: "Fusión hidalguense con mole y masa dorada.", price: "$24" },
  { name: "Paste Dulce de Piña · Kiko's", desc: "Relleno de piña caramelizada con canela.", price: "$25" },
  { name: "Paste de Frijol · Artesanal", desc: "Versión popular de barrio, horneada al momento.", price: "$22" },
  { name: "Café de Olla", desc: "Con piloncillo, canela y clavo en barro.", price: "$25" },
  { name: "Barbacoa de Borrego", desc: "Cocida en horno de tierra toda la noche.", price: "$120" },
  { name: "Pulque Curado", desc: "De avena, piñón o tuna, tradición milenaria.", price: "$40" },
  { name: "Truchas El Bosque", desc: "Truchas a la plancha con hierbas de la sierra.", price: "$180" },
];

export const ADVENTURES = [
  { title: "Tirolesa El Chico", desc: "Vuelo sobre el bosque de oyameles del Parque Nacional.", level: "Intermedio", duration: "2 h" },
  { title: "Rappel Peñas Cargadas", desc: "Descenso técnico sobre formaciones de basalto.", level: "Avanzado", duration: "4 h" },
  { title: "Senderismo Cerro de las Navajas", desc: "Ruta arqueológica de obsidiana prehispánica.", level: "Principiante", duration: "3 h" },
  { title: "Bicicleta de Montaña Mineral Chico", desc: "Circuito XC con miradores de bosque mesófilo.", level: "Intermedio", duration: "3 h" },
  { title: "Espeleología Mina La Acosta", desc: "Visita guiada por tiros y socavones del siglo XIX.", level: "Principiante", duration: "1.5 h" },
  { title: "Camping Las Ventanas", desc: "Pernocta bajo formaciones rocosas con cielo estrellado.", level: "Intermedio", duration: "12 h" },
];

export const CULTURE = [
  { title: "Festival Internacional del Paste", subtitle: "Octubre · cada año", desc: "Gastronomía, música y demostraciones cornish-mexicanas." },
  { title: "Museo de Sitio Mina La Acosta", subtitle: "Patrimonio industrial", desc: "Maquinaria, tiros y memoria minera viva." },
  { title: "Panteón Inglés", subtitle: "1851 · ladera oeste", desc: "Único panteón británico de México, orientado hacia Cornwall." },
  { title: "Casa Grande / Hacienda de Beneficio", subtitle: "Arquitectura de cantera", desc: "Núcleo administrativo del antiguo poder minero." },
  { title: "Capilla del Señor de Zelontla", subtitle: "Devoción local", desc: "Procesión anual del barrio alto, herencia colonial." },
];

export const ROUTES_ITEMS = [
  { code: "R-01", name: "Ruta del Paste", duration: "4 h", stops: 6, desc: "Recorrido por hornos artesanales, casa Kiko's y El Portal." },
  { code: "R-02", name: "Ruta Cornish", duration: "5 h", stops: 7, desc: "Panteón Inglés, casas victorianas y campo de futbol original." },
  { code: "R-03", name: "Ruta Minera Soberana", duration: "6 h", stops: 8, desc: "Mina La Acosta, Dolores y socavones de Real del Monte." },
  { code: "R-04", name: "Ruta Mística Otomí", duration: "3 h", stops: 5, desc: "Capillas, leyendas y sitios sagrados de la comarca." },
  { code: "R-05", name: "Ruta del Bosque Mágico", duration: "7 h", stops: 9, desc: "El Chico, Las Monjas, Peñas Cargadas y mirador del Cuervo." },
];

export const EVENTS = [
  { date: "2026-07-12", title: "Asamblea Heptafederada · TAMV", place: "Casa de Cultura", tag: "Gobernanza" },
  { date: "2026-08-04", title: "Hackatón Civilizatorio Realito AI", place: "DevHub LTOS", tag: "Tecnología" },
  { date: "2026-10-15", title: "XV Festival Internacional del Paste", place: "Plaza Principal", tag: "Gastronomía" },
  { date: "2026-11-02", title: "Vigilia del Panteón Inglés", place: "Panteón Inglés", tag: "Cultura" },
  { date: "2026-12-12", title: "Encendido del Árbol Soberano", place: "Jardín Hidalgo", tag: "Comunidad" },
];

export const MERCHANTS = [
  { name: "Pastes El Portal", category: "Gastronomía", tier: "Patrimonial", since: 1949 },
  { name: "Casa Minera", category: "Restaurante", tier: "Premium", since: 1998 },
  { name: "Café Real", category: "Café · Repostería", tier: "Estándar", since: 2007 },
  { name: "Hotel Real del Monte", category: "Hospedaje", tier: "Premium", since: 1962 },
  { name: "Tierra Adentro Tours", category: "Aventura", tier: "Patrimonial", since: 2014 },
  { name: "Mercado Hidalgo", category: "Artesanías", tier: "Patrimonial", since: 1888 },
  { name: "Bicis Mineral Chico", category: "Aventura", tier: "Estándar", since: 2019 },
  { name: "Pulquería La Veta", category: "Bebida tradicional", tier: "Estándar", since: 2011 },
];

export const TRANSPORT = [
  { route: "Pachuca → Real del Monte", mode: "Combi", time: "25 min", cost: "$25", freq: "cada 10 min" },
  { route: "CDMX → Real del Monte", mode: "Shuttle LTOS", time: "2 h 15", cost: "$420", freq: "viernes a domingo" },
  { route: "Real del Monte → Mineral del Chico", mode: "Taxi colectivo", time: "35 min", cost: "$60", freq: "cada 30 min" },
  { route: "Centro → Mina La Acosta", mode: "Caminata guiada", time: "20 min", cost: "Gratis", freq: "diaria" },
  { route: "Pachuca CAAT → Real del Monte", mode: "Autobús ADO", time: "45 min", cost: "$60", freq: "cada hora" },
];

export const DICHOS = [
  { personaje: "Don Felipe", texto: "Más vale chango conocido que mono por conocer.", significado: "Mejor lo seguro que lo incierto.", categoria: "VIDA_COTIDIANA" },
  { personaje: "Tía Rosa", texto: "El que no enseña, no vende; y el que no pide, no comulga.", significado: "Hay que mostrarse y atreverse.", categoria: "TRABAJO" },
  { personaje: "El Minero Viejo", texto: "Donde hubo lumbre, cenizas quedan… y a veces, plata.", significado: "Las viejas heridas siguen dando frutos.", categoria: "MINERIA" },
  { personaje: "Doña Cleotilde", texto: "Pa' los pastes, manos frías; pa' el amor, manos calientes.", significado: "Cada tarea pide su temperamento.", categoria: "COMIDA_BEBIDA" },
  { personaje: "Compadre Chuy", texto: "Brindo por los que ya no están y por los que todavía se aguantan.", significado: "Brindis minero universal.", categoria: "BRINDIS" },
  { personaje: "Niña Lupita", texto: "El que se ríe primero, se ríe mejor… y se ríe en cornish.", significado: "Humor heredado de los ingleses.", categoria: "HUMOR" },
  { personaje: "Abuelo Manuel", texto: "La familia es la veta más rica de esta sierra.", significado: "Lo más valioso son los tuyos.", categoria: "FAMILIA" },
  { personaje: "Don Pancho", texto: "El que se mete a la mina con miedo, sale con la sombra cambiada.", significado: "El miedo se queda abajo.", categoria: "PERSONAJES" },
];

export const DICHO_CATS = [
  { id: "all", label: "Todos", icon: "✨" },
  { id: "PERSONAJES", label: "Personajes", icon: "👤" },
  { id: "BRINDIS", label: "Brindis", icon: "🥂" },
  { id: "HUMOR", label: "Humor", icon: "🎭" },
  { id: "FAMILIA", label: "Familia", icon: "👥" },
  { id: "COMIDA_BEBIDA", label: "Comida y Bebida", icon: "🍷" },
  { id: "TRABAJO", label: "Trabajo", icon: "⚙️" },
  { id: "VIDA_COTIDIANA", label: "Vida Cotidiana", icon: "🏛️" },
  { id: "MINERIA", label: "Minería", icon: "💎" },
];
