import { ChartData, Node, Link } from 'keylines';

/**
 * entity -> shipment -> fa-ship
 * catalogType -> S -> P -> D
 * entityType -> unknown
 * shipment -> fa-truck
 * organization -> fa-sitemap
 * assets -> fa-boxes
 */

export type EntityType = 'Asset' | 'Shipment' | 'Organization';

const entityIcons = {
  Asset: 'fa-boxes',
  Shipment: 'fa-truck',
  Organization: 'fa-sitemap',
  default: 'fa-question',
};
const entityThemes = {
  Asset: {
    iconColour: 'rgb(206,181,85)',
    countryBgColour: 'rgba(235,234,224,0.8)',
    regionOCColour: 'rgba(246,247,237,0.8)',
  },
  Shipment: {
    iconColour: 'rgb(0,172,52)',
    countryBgColour: 'rgba(223,236,225,0.8)',
    regionOCColour: 'rgba(236,248,237,0.8)',
  },
  Organization: {
    iconColour: 'rgb(235,78,93)',
    countryBgColour: 'rgba(237,225,224,0.8)',
    regionOCColour: 'rgba(249,237,236,0.8)',
  },
  'South East': {
    iconColour: 'rgb(156,77,132)',
    countryBgColour: 'rgba(237,223,235,0.8)',
    regionOCColour: 'rgba(250,235,247,0.8)',
  },
  Africa: {
    iconColour: 'rgb(0,104,145)',
    countryBgColour: 'rgba(223,232,236,0.8)',
    regionOCColour: 'rgba(235,245,248,0.8)',
  },
  default: {
    iconColour: 'rgb(146,148,184)',
    countryBgColour: 'rgb(240,240,248)',
    regionOCColour: 'rgba(240,240,248,0.8)',
  },
};

export function getEntityTheme(entity: EntityType) {
  if (!entity || !entityThemes[entity]) return entityThemes.default;

  return entityThemes[entity];
}

export function getEntityIcon(entity: EntityType) {
  if (!entity || !entityIcons[entity]) return entityIcons.default;

  return entityIcons[entity];
}

const organizations = [
  {
    id: 'O1',
    name: 'Org 1',
  },
  {
    id: 'O2',
    name: 'Org 2',
  },
];

export function getOrgnizationRegion(organizationId: string) {
  if (!organizationId) return null;

  const organization = organizations.find((org) => org.id == organizationId);
  if (!organization) return null;

  return organization.name;
}

const nodes: Node[] = [
  {
    type: 'node',
    id: 'A1',
    t: 'Asset 1',
    d: {
      shipment: ['S1'],
      organization: 'O1',
      entity: 'Asset',
    },
    x: 0,
    y: 0,
  },
  {
    type: 'node',
    id: 'A2',
    t: 'Asset 2',
    d: {
      shipment: ['S1'],
      organization: 'O1',
      entity: 'Asset',
    },
    x: 0,
    y: 0,
  },
  {
    type: 'node',
    id: 'S1',
    t: 'S-Ship 1',
    d: {
      assets: ['A1', 'A2'],
      organization: 'O1',
      entity: 'Shipment',
    },
    x: 0,
    y: 0,
  },
  {
    type: 'node',
    id: 'S2',
    t: 'S-Ship 2',
    d: {
      assets: [],
      organization: 'O2',
      entity: 'Shipment',
    },
    x: 0,
    y: 0,
  },
  //   {
  //     type: 'node',
  //     id: 'O1',
  //     t: 'Org 1',
  //     d: {
  //       assets: ['A1', 'A2'],
  //       shipments: ['S1'],
  //       entity: 'Organization',
  //     },
  //     x: 0,
  //     y: 0,
  //   },

  //   {
  //     type: 'node',
  //     id: 'O2',
  //     t: 'Org 2',
  //     d: {
  //       assets: [],
  //       shipments: ['S2'],
  //       entity: 'Organization',
  //     },
  //     x: 0,
  //     y: 0,
  //   },
];
const links: Link[] = [
  {
    id1: 'A1',
    id2: 'S1',
    id: 'A1/p/S1',
    c: '#696969',
    type: 'link',
  },
  {
    id1: 'A1',
    id2: 'O1',
    id: 'A1/p/O1',
    c: '#696969',
    type: 'link',
  },
  {
    id1: 'A2',
    id2: 'S1',
    id: 'A2/p/S1',
    c: '#696969',
    type: 'link',
  },
  {
    id1: 'A2',
    id2: 'O1',
    id: 'A2/p/O1',
    c: '#696969',
    type: 'link',
  },
  //   {
  //     id1: 'S2',
  //     id2: 'O2',
  //     id: 'S2/p/O2',
  //     c: '#696969',
  //     type: 'link',
  //   },
  //   {
  //     id1: 'S1',
  //     id2: 'O1',
  //     id: 'S1/p/O1',
  //     c: '#696969',
  //     type: 'link',
  //   },
];
export const shipmentData: ChartData = {
  type: 'LinkChart',
  items: [...nodes, ...links],
};

function generateLinks() {
  const links: Link[] = [
    {
      id1: 'A1',
      id2: 'S1',
      id: 'A1/p/S1',
      c: '#696969',
      type: 'link',
    },
    {
      id1: 'A1',
      id2: 'O1',
      id: 'A1/p/O1',
      c: '#696969',
      type: 'link',
    },
    {
      id1: 'A2',
      id2: 'S1',
      id: 'A2/p/S1',
      c: '#696969',
      type: 'link',
    },
    {
      id1: 'A2',
      id2: 'O1',
      id: 'A2/p/O1',
      c: '#696969',
      type: 'link',
    },
    {
      id1: 'S2',
      id2: 'O2',
      id: 'S2/p/O2',
      c: '#696969',
      type: 'link',
    },
  ];
}
