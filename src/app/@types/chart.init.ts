import { EntityIcons, EntityThemes } from './chart.types';

export const entityIcons: EntityIcons = {
  Asset: 'fa-boxes',
  Shipment: 'fa-truck',
  Organization: 'fa-sitemap',
  Route: 'fa-route',
  Status: 'fa-question',
  DC: 'fa-warehouse',
  Plant: 'fa-industry',
  Road: 'fa-truck-moving',
  Plane: 'fa-plane',
  default: 'fa-question',
};
export const entityThemes: EntityThemes = {
  Asset: {
    iconColour: 'rgb(206,181,85)',
    countryBgColour: 'rgba(235,234,224,0.8)',
    regionOCColour: 'rgba(246,247,237,0.8)',
  },
  Shipment: {
    iconColour: 'rgb(156,77,132)',
    countryBgColour: 'rgba(237,223,235,0.8)',
    regionOCColour: 'rgba(250,235,247,0.8)',
  },
  Organization: {
    iconColour: 'rgb(235,78,93)',
    countryBgColour: 'rgba(237,225,224,0.8)',
    regionOCColour: 'rgba(249,237,236,0.8)',
  },
  Route: {
    iconColour: 'rgb(156,77,132)',
    countryBgColour: 'rgba(237,223,235,0.8)',
    regionOCColour: 'rgba(250,235,247,0.8)',
  },
  Status: {
    iconColour: 'rgb(0,104,145)',
    countryBgColour: 'rgba(223,232,236,0.8)',
    regionOCColour: 'rgba(235,245,248,0.8)',
  },
  DC: {
    iconColour: 'rgb(206,181,85)',
    countryBgColour: 'rgba(235,234,224,0.8)',
    regionOCColour: 'rgba(246,247,237,0.8)',
  },
  Plant: {
    iconColour: 'rgb(0,172,52)',
    countryBgColour: 'rgba(223,236,225,0.8)',
    regionOCColour: 'rgba(236,248,237,0.8)',
  },
  Road: {
    iconColour: 'rgb(156,77,132)',
    countryBgColour: 'rgba(237,223,235,0.8)',
    regionOCColour: 'rgba(250,235,247,0.8)',
  },
  Plane: {
    iconColour: 'rgb(235,78,93)',
    countryBgColour: 'rgba(237,225,224,0.8)',
    regionOCColour: 'rgba(249,237,236,0.8)',
  },
  default: {
    iconColour: 'rgb(146,148,184)',
    countryBgColour: 'rgb(240,240,248)',
    regionOCColour: 'rgba(240,240,248,0.8)',
  },
};
