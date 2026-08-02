import { Router } from "express";
import authRouter from "./auth.js";
import businessesRouter from "./businesses.js";
import donationsRouter from "./donations.js";
import weatherRouter from "./weather.js";
import recommendationsRouter from "./recommendations.js";
import aiRouter from "./ai.js";
import digitalTwinsRouter from "./digital-twins.js";
import contentRouter from "./content.js";
import realitoRouter from "./realito.js";
import auditRouter from "./audit.js";
import xrRouter from "./xr.js";
import economyRouter from "./economy.js";
import protocolsRouter from "./protocols.js";
import streamsRouter from "./streams.js";
import socialRouter from "./social.js";
import profilesRouter from "./profiles.js";
import usersRouter from "./users.js";
import placesRouter from "./places.js";
import merchantsRouter from "./merchants.js";
import twinsRouter from "./twins.js";
import experienceRouter from "./experience.js";
import systemRouter from "./system.js";
import rdmxStatusRouter from "./rdmx-status.js";
import geolocationRouter from "./geolocation.js";
import tamvRouter from "./tamv.js";
import tamvThesisRouter from "./tamv-thesis.js";
import tenochtitlanRouter from "./tenochtitlan.js";
import dgRouter from "../data-gateway/routes/dg.js";
import { listApiRouteMounts as selectRouteMountMetadata, type ApiRouteMount } from "./registry.js";

const apiRouteMounts: ApiRouteMount[] = [
  { path: "/auth", router: authRouter, layer: "L5", domain: "identity" },
  { path: "/businesses", router: businessesRouter, layer: "L5", domain: "commerce" },
  { path: "/donations", router: donationsRouter, layer: "L5", domain: "commerce" },
  { path: "/weather", router: weatherRouter, layer: "L5", domain: "territory" },
  { path: "/recommendations", router: recommendationsRouter, layer: "L5", domain: "territory" },
  { path: "/ai", router: aiRouter, layer: "L2", domain: "decisioning" },
  { path: "/digital-twins", router: digitalTwinsRouter, layer: "L4", domain: "xr-twins" },
  { path: "/content", router: contentRouter, layer: "L6", domain: "shell-content" },
  { path: "/realito", router: realitoRouter, layer: "L6", domain: "assistant" },
  { path: "/users", router: usersRouter, layer: "L5", domain: "identity" },
  { path: "/profiles", router: profilesRouter, layer: "L5", domain: "identity" },
  { path: "/social", router: socialRouter, layer: "L5", domain: "social" },
  { path: "/streams", router: streamsRouter, layer: "L5", domain: "social-streaming" },
  { path: "/protocols", router: protocolsRouter, layer: "L2", domain: "protocols" },
  { path: "/economy", router: economyRouter, layer: "L5", domain: "economy" },
  { path: "/xr", router: xrRouter, layer: "L4", domain: "xr" },
  { path: "/audit", router: auditRouter, layer: "L3", domain: "guardian-audit" },
  { path: "/places", router: placesRouter, layer: "L5", domain: "territory" },
  { path: "/merchants", router: merchantsRouter, layer: "L5", domain: "commerce" },
  { path: "/twins", router: twinsRouter, layer: "L4", domain: "xr-twins" },
  { path: "/experience", router: experienceRouter, layer: "L6", domain: "territorial-experience" },
  { path: "/", router: systemRouter, layer: "L3", domain: "system-governance" },
  { path: "/rdmx", router: rdmxStatusRouter, layer: "L3", domain: "system-status" },
  { path: "/geolocation", router: geolocationRouter, layer: "L5", domain: "territory" },
  { path: "/tamv", router: tamvRouter, layer: "L0", domain: "doctrine-governance" },
  { path: "/tamv", router: tamvThesisRouter, layer: "L0", domain: "doctrine-thesis" },
  {
    path: "/tenochtitlan",
    router: tenochtitlanRouter,
    layer: "L4",
    domain: "xr-civilizational-map",
  },
  { path: "/dg", router: dgRouter, layer: "L1", domain: "data-gateway" },
];

const apiRouter = Router();

apiRouteMounts.forEach(({ path, router }) => apiRouter.use(path, router));

export function listApiRouteMounts() {
  return selectRouteMountMetadata(apiRouteMounts);
}

export default apiRouter;
