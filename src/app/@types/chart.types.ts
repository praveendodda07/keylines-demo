import { ChartAllEventProps, ChartEventHandlers } from 'keylines';

export enum Entites {
  ASSET = 'Asset',
  SHIPMENT = 'Shipment',
  ORGANIZATION = 'Organization',
  ROUTE = 'Route',
  STATUS = 'Status',
  DC = 'DC',
  Plant = 'Plant',
}

export interface EntityTheme {
  iconColour: string;
  countryBgColour: string;
  regionOCColour: string;
}

export type EntityThemes = Record<Entites, EntityTheme> & {
  default: EntityTheme;
};

export type EntityIcons = Record<Entites, string> & {
  default: string;
};

export interface ChartEvents {
  name: keyof ChartEventHandlers;
  args: ChartAllEventProps;
}

export interface NodeTooltip {
  id: string | null;
  element?: HTMLElement | null;
}
