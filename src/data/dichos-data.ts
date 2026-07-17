// ============================================================================
// RDM Digital OS — Dichos Personificados de Real del Monte
// 47 expresiones tradicionales del vocabulario minero realmontense
// Fuente: Archivo Histórico Municipal / quantum-system-tamv
// ============================================================================

export interface Dicho {
  id: string;
  personaje: string;
  texto: string;
  significado: string;
  jergaOriginal: string;
  categoria: DichoCategoria;
  likes: number;
}

export type DichoCategoria =
  | 'PERSONAJES'
  | 'BRINDIS'
  | 'HUMOR'
  | 'FAMILIA'
  | 'COMIDA_BEBIDA'
  | 'TRABAJO'
  | 'VIDA_COTIDIANA'
  | 'MINERIA';

export interface DichoCategoryMeta {
  id: string;
  label: string;
  icon: string;
}

export const DICHO_CATEGORIES: DichoCategoryMeta[] = [
  { id: 'all', label: 'Todos', icon: '✨' },
  { id: 'PERSONAJES', label: 'Personajes', icon: '👤' },
  { id: 'BRINDIS', label: 'Brindis', icon: '🍻' },
  { id: 'HUMOR', label: 'Humor', icon: '😂' },
  { id: 'FAMILIA', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
  { id: 'COMIDA_BEBIDA', label: 'Comida y Bebida', icon: '🍽️' },
  { id: 'TRABAJO', label: 'Trabajo', icon: '⛏️' },
  { id: 'VIDA_COTIDIANA', label: 'Vida Cotidiana', icon: '🏠' },
  { id: 'MINERIA', label: 'Minería', icon: '💎' },
];

export const DICHOS_COMPLETOS: Dicho[] = [
  { id: '1', personaje: 'Agustín Hernández', texto: 'Estás Agustín Hernández', significado: 'Estás débil', jergaOriginal: 'Estás Agustín Hernández', categoria: 'VIDA_COTIDIANA', likes: 156 },
  { id: '2', personaje: 'Alberto Rivera', texto: 'Vamos a hacer los Alberto Rivera', significado: 'Vamos a hacer los ejercicios', jergaOriginal: 'Vamos a hacer los Alberto Rivera', categoria: 'TRABAJO', likes: 89 },
  { id: '3', personaje: 'Amalia', texto: 'Andas Amalia', significado: 'Andas caliente', jergaOriginal: 'Andas Amalia', categoria: 'HUMOR', likes: 234 },
  { id: '4', personaje: 'Aurelia Melgarejo', texto: 'Ya estamos todas las Aurelia Melgarejo', significado: 'Ya estamos todas las muchachas (usado para viejitas)', jergaOriginal: 'Ya estamos todas las Aurelia Melgarejo', categoria: 'FAMILIA', likes: 178 },
  { id: '5', personaje: 'Braulia Rutas', texto: 'Ponme para mi Braulia Rutas', significado: 'Ponme para mi desayuno', jergaOriginal: 'Ponme para mi Braulia Rutas', categoria: 'COMIDA_BEBIDA', likes: 145 },
  { id: '6', personaje: 'Carmelito', texto: 'Me voy a Carmelito', significado: 'Me voy a descansar', jergaOriginal: 'Me voy a Carmelito', categoria: 'VIDA_COTIDIANA', likes: 198 },
  { id: '7', personaje: 'Cayetano Muñoz', texto: 'Te voy a poner tu Cayetano Muñoz', significado: 'Te voy a dar tu castigo', jergaOriginal: 'Te voy a poner tu Cayetano Muñoz', categoria: 'HUMOR', likes: 267 },
  { id: '8', personaje: 'Chata Reyes', texto: 'Tienes cara de Chata Reyes', significado: 'Tienes cara de tonta', jergaOriginal: 'Tienes cara de Chata Reyes', categoria: 'HUMOR', likes: 134 },
  { id: '9', personaje: 'Conchita Rivera', texto: 'No seas Conchita Rivera', significado: 'No seas chismosa', jergaOriginal: 'No seas Conchita Rivera', categoria: 'PERSONAJES', likes: 312 },
  { id: '10', personaje: 'Crescencia García', texto: 'Es como la Crescencia García', significado: 'Es muy gritona', jergaOriginal: 'Es como la Crescencia García', categoria: 'PERSONAJES', likes: 178 },
  { id: '11', personaje: 'Daniel Rivera', texto: 'No te hagas Daniel Rivera', significado: 'No te hagas tonto', jergaOriginal: 'No te hagas Daniel Rivera', categoria: 'HUMOR', likes: 289 },
  { id: '12', personaje: 'Dieguito', texto: 'No seas un Dieguito', significado: 'No seas llorón', jergaOriginal: 'No seas un Dieguito', categoria: 'FAMILIA', likes: 167 },
  { id: '13', personaje: 'Dolores Terán', texto: 'Te andan las Dolores Terán', significado: 'Te andan los espantos', jergaOriginal: 'Te andan las Dolores Terán', categoria: 'PERSONAJES', likes: 245 },
  { id: '14', personaje: 'Don Victoriano', texto: 'No te creas Don Victoriano', significado: 'No te creas importante', jergaOriginal: 'No te creas Don Victoriano', categoria: 'PERSONAJES', likes: 198 },
  { id: '15', personaje: 'Eduviges Terán', texto: 'Pareces Eduviges Terán', significado: 'Pareces vieja (arrugada)', jergaOriginal: 'Pareces Eduviges Terán', categoria: 'HUMOR', likes: 156 },
  { id: '16', personaje: 'Elena', texto: 'Te voy a mandar con tu Elena', significado: 'Te voy a mandar con tu mamá', jergaOriginal: 'Te voy a mandar con tu Elena', categoria: 'FAMILIA', likes: 187 },
  { id: '17', personaje: 'Eusebio Almaraz', texto: 'Pareces un Eusebio Almaraz', significado: 'Pareces un borracho', jergaOriginal: 'Pareces un Eusebio Almaraz', categoria: 'BRINDIS', likes: 234 },
  { id: '18', personaje: 'Federico García', texto: 'Te fuiste como Federico García', significado: 'Te fuiste sin pagar', jergaOriginal: 'Te fuiste como Federico García', categoria: 'HUMOR', likes: 267 },
  { id: '19', personaje: 'Fernando Domínguez', texto: 'Me cayó como Fernando Domínguez', significado: 'Me cayó como patada', jergaOriginal: 'Me cayó como Fernando Domínguez', categoria: 'VIDA_COTIDIANA', likes: 145 },
  { id: '20', personaje: 'Gabriel Hernández', texto: 'Echarse un Gabriel Hernández', significado: 'Echarse una cerveza', jergaOriginal: 'Echarse un Gabriel Hernández', categoria: 'BRINDIS', likes: 298 },
  { id: '21', personaje: 'Guadalupe Rivera', texto: 'Eres una Guadalupe Rivera', significado: 'Eres una chiquillada', jergaOriginal: 'Eres una Guadalupe Rivera', categoria: 'FAMILIA', likes: 134 },
  { id: '22', personaje: 'Hermenegildo', texto: 'No me vengas con tus Hermenegildo', significado: 'No me vengas con tus cuentos', jergaOriginal: 'No me vengas con tus Hermenegildo', categoria: 'PERSONAJES', likes: 198 },
  { id: '23', personaje: 'Ignacio Muñoz', texto: 'Estás como Ignacio Muñoz', significado: 'Estás loco', jergaOriginal: 'Estás como Ignacio Muñoz', categoria: 'HUMOR', likes: 312 },
  { id: '24', personaje: 'Josefina Pérez', texto: 'Eres una Josefina Pérez', significado: 'Eres muy limpia (obsesiva)', jergaOriginal: 'Eres una Josefina Pérez', categoria: 'PERSONAJES', likes: 145 },
  { id: '25', personaje: 'Juan Hernández', texto: 'Allá va Juan Hernández', significado: 'Allá va el borracho', jergaOriginal: 'Allá va Juan Hernández', categoria: 'BRINDIS', likes: 178 },
  { id: '26', personaje: 'Juanita Rivera', texto: 'No seas una Juanita Rivera', significado: 'No seas coqueta', jergaOriginal: 'No seas una Juanita Rivera', categoria: 'PERSONAJES', likes: 267 },
  { id: '27', personaje: 'Leonardo García', texto: 'Vas como Leonardo García', significado: 'Vas muy rápido', jergaOriginal: 'Vas como Leonardo García', categoria: 'VIDA_COTIDIANA', likes: 134 },
  { id: '28', personaje: 'Lola Martínez', texto: 'No me hagas una Lola Martínez', significado: 'No me hagas un escándalo', jergaOriginal: 'No me hagas una Lola Martínez', categoria: 'PERSONAJES', likes: 289 },
  { id: '29', personaje: 'Manuel Pérez', texto: 'Eres un Manuel Pérez', significado: 'Eres un flojo', jergaOriginal: 'Eres un Manuel Pérez', categoria: 'TRABAJO', likes: 198 },
  { id: '30', personaje: 'María García', texto: 'Andas como María García', significado: 'Andas de enamorada', jergaOriginal: 'Andas como María García', categoria: 'HUMOR', likes: 267 },
  { id: '31', personaje: 'Mariano Rivera', texto: 'No seas un Mariano Rivera', significado: 'No seas tacaño', jergaOriginal: 'No seas un Mariano Rivera', categoria: 'VIDA_COTIDIANA', likes: 156 },
  { id: '32', personaje: 'Maximiano', texto: 'Échate un Maximiano', significado: 'Échate un trago', jergaOriginal: 'Échate un Maximiano', categoria: 'BRINDIS', likes: 245 },
  { id: '33', personaje: 'Nicolás Tejeda', texto: 'Échate un Nicolás Tejeda', significado: 'Échate un pulque', jergaOriginal: 'Échate un Nicolás Tejeda', categoria: 'BRINDIS', likes: 134 },
  { id: '34', personaje: 'Padre Heredia', texto: 'Échale copal al santo, no le hace que...', significado: 'Hacer algo con exageración sin importar daños', jergaOriginal: 'Échale copal al santo, no le hace que...', categoria: 'PERSONAJES', likes: 178 },
  { id: '35', personaje: 'Pancho Soto', texto: 'Con todo Pancho Soto', significado: 'Con todo respeto', jergaOriginal: 'Con todo Pancho Soto', categoria: 'PERSONAJES', likes: 156 },
  { id: '36', personaje: 'Pánfilo Soto', texto: 'Vete a tu Pánfilo Soto', significado: 'Vete a tu casita', jergaOriginal: 'Vete a tu Pánfilo Soto', categoria: 'FAMILIA', likes: 289 },
  { id: '37', personaje: 'Pepe Terán', texto: 'Te pega la Pepe Terán', significado: 'Te pega la vieja (la esposa)', jergaOriginal: 'Te pega la Pepe Terán', categoria: 'FAMILIA', likes: 98 },
  { id: '38', personaje: 'Plutarco García', texto: 'Mis Plutarco García se pusieron malos', significado: 'Mis mijitos (hijos) se enfermaron', jergaOriginal: 'Mis Plutarco García se pusieron malos', categoria: 'FAMILIA', likes: 145 },
  { id: '39', personaje: 'Pompero Rivera', texto: 'Veo a puro Pompero Rivera', significado: 'Pura mula loca (gente alborotada)', jergaOriginal: 'Veo a puro Pompero Rivera', categoria: 'HUMOR', likes: 267 },
  { id: '40', personaje: 'Ramón Hernández', texto: 'Con mi Ramón Hernández', significado: 'Con mi sagrada esposa', jergaOriginal: 'Con mi Ramón Hernández', categoria: 'FAMILIA', likes: 198 },
  { id: '41', personaje: 'Ramón Razo', texto: 'Vengo de la Ramón Razo', significado: 'Vengo de la nube gris (Ciudad de México)', jergaOriginal: 'Vengo de la Ramón Razo', categoria: 'PERSONAJES', likes: 156 },
  { id: '42', personaje: 'Refugio Fragoso', texto: 'Verás como Refugio Fragoso', significado: 'Verás como no pasa nada', jergaOriginal: 'Verás como Refugio Fragoso', categoria: 'PERSONAJES', likes: 312 },
  { id: '43', personaje: 'Roberto Arista', texto: 'Llegaste Roberto Arista', significado: 'Llegaste un poquito tarde', jergaOriginal: 'Llegaste Roberto Arista', categoria: 'VIDA_COTIDIANA', likes: 87 },
  { id: '44', personaje: 'Roberto Martínez', texto: 'Vienes como Roberto Martínez', significado: 'Vienes como el diablo (enojado)', jergaOriginal: 'Vienes como Roberto Martínez', categoria: 'HUMOR', likes: 134 },
  { id: '45', personaje: 'Ruberta García', texto: 'Te traes a la Ruberta García', significado: 'Te traes a la descendencia (a la familia)', jergaOriginal: 'Te traes a la Ruberta García', categoria: 'FAMILIA', likes: 178 },
  { id: '46', personaje: 'Sergio Pérez', texto: 'Están muy Sergio Pérez', significado: 'Están muy chirris (pequeños/débiles)', jergaOriginal: 'Están muy Sergio Pérez', categoria: 'HUMOR', likes: 156 },
  { id: '47', personaje: 'Simón Guerrero', texto: 'Mi Simón Guerrero no me dejaba', significado: 'Mi fiera (esposa/pareja) no me dejaba', jergaOriginal: 'Mi Simón Guerrero no me dejaba', categoria: 'FAMILIA', likes: 289 },
];
