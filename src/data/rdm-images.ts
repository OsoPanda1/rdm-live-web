/**
 * Central image registry for RDM Digital
 * All generated images are imported here for reuse across the platform
 */

import aerialPueblo from "@/assets/rdm-aerial-pueblo.jpg";
import pastesTraditional from "@/assets/rdm-pastes-traditional.jpg";
import minaEntrance from "@/assets/rdm-mina-entrance.jpg";
import panteonIngles from "@/assets/rdm-panteon-ingles.jpg";
import callesColoridas from "@/assets/rdm-calles-coloridas.jpg";
import penasCargadas from "@/assets/rdm-penas-cargadas.jpg";
import bosqueNiebla from "@/assets/rdm-bosque-niebla.jpg";
import plazaPrincipal from "@/assets/rdm-plaza-principal.jpg";
import diaMuertos from "@/assets/rdm-dia-muertos.jpg";
import miradorSunset from "@/assets/rdm-mirador-sunset.jpg";
import artesaniasPlata from "@/assets/rdm-artesanias-plata.jpg";
import festivalPaste from "@/assets/rdm-festival-paste.jpg";
import callejonRomantico from "@/assets/rdm-callejon-romantico.jpg";
import hospedajeCabana from "@/assets/rdm-hospedaje-cabana.jpg";
import cafeMontana from "@/assets/rdm-cafe-montaña.jpg";
import casaInglesa from "@/assets/rdm-casa-inglesa.jpg";

export const RDM_IMAGES = {
  aerialPueblo,
  pastesTraditional,
  minaEntrance,
  panteonIngles,
  callesColoridas,
  penasCargadas,
  bosqueNiebla,
  plazaPrincipal,
  diaMuertos,
  miradorSunset,
  artesaniasPlata,
  festivalPaste,
  callejonRomantico,
  hospedajeCabana,
  cafeMontana,
  casaInglesa,
} as const;

/** Image-key lookup for events and sections */
export const IMAGE_MAP: Record<string, string> = {
  "rdm-aerial-pueblo": aerialPueblo,
  "rdm-pastes-traditional": pastesTraditional,
  "rdm-mina-entrance": minaEntrance,
  "rdm-panteon-ingles": panteonIngles,
  "rdm-calles-coloridas": callesColoridas,
  "rdm-penas-cargadas": penasCargadas,
  "rdm-bosque-niebla": bosqueNiebla,
  "rdm-plaza-principal": plazaPrincipal,
  "rdm-dia-muertos": diaMuertos,
  "rdm-mirador-sunset": miradorSunset,
  "rdm-artesanias-plata": artesaniasPlata,
  "rdm-festival-paste": festivalPaste,
  "rdm-callejon-romantico": callejonRomantico,
  "rdm-hospedaje-cabana": hospedajeCabana,
  "rdm-cafe-montaña": cafeMontana,
  "rdm-casa-inglesa": casaInglesa,
};

/** Gallery sections for Index photo strips */
export const GALLERY_SECTIONS = {
  hero: [aerialPueblo, miradorSunset],
  historia: [minaEntrance, panteonIngles, casaInglesa],
  gastronomia: [pastesTraditional, cafeMontana, festivalPaste],
  naturaleza: [penasCargadas, bosqueNiebla, miradorSunset],
  cultura: [callesColoridas, plazaPrincipal, diaMuertos, callejonRomantico],
  hospedaje: [hospedajeCabana, casaInglesa],
  artesanias: [artesaniasPlata],
};
