export enum Entites {
  ASSET = 'Asset',
  SHIPMENT = 'Shipment',
  ORGANIZATION = 'Organization',
  ROUTE = 'Route',
  STATUS = 'Status',
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
