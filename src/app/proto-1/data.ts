import { ChartData, Node, Link, Chart } from 'keylines';
import { Entites, EntityIcons, EntityThemes } from '../@types/chart.types';
import { entityIcons, entityThemes } from '../@types/chart.init';

/**
 * entity -> shipment -> fa-ship
 * catalogType -> S -> P -> D
 * entityType -> unknown
 * shipment -> fa-truck
 * organization -> fa-sitemap-0987654321
 * assets -> fa-boxes
 */

/**
 * Shipment
 *  - Shipment Catalogs [std, parcel, ]
 *
 *
 * Combines
 *  - status
 *  - excursion
 *  - catalogTypes
 *
 *
 * Organization -> Shipments -> Assets
 *                           -> Origin / Destination
 *
 */
/**
 * Graph will support following functionalities
 * ? NOTE: either we are performing grouping / filtering we should show the nodes with respective to the organazation & shipments
 ** - Grouping
 *?  - While grouping all the nodes should be collapsed & while double click it will reveals be neighbours
 ** - Filtering
 ** - Searching?
 ** - Collapse / Expand
 *?  - While double click on node if its expanded need to collapse / vice-versa
 *
 *
 *
 * ? [ ] Combine By default with Organization
 * ? [ ] Reveal Org -> Shipments
 */

export function getEntityTheme(entity: Entites) {
  if (!entity || !entityThemes[entity]) return entityThemes.default;

  return entityThemes[entity];
}

export function getEntityIcon(entity: Entites) {
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
  {
    id: 'O3',
    name: 'Org 3',
  },
];

export function getOrgnizationRegion(organizationId: string) {
  if (!organizationId) return null;

  const organization = organizations.find((org) => org.id == organizationId);
  if (!organization) return null;

  return organization.name;
}

const nodes1: Node[] = [
  {
    type: 'node',
    id: 'A1',
    t: 'Asset 1',
    d: {
      shipment: ['S1', 'S2'],
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
      entity: 'Asset',
    },
    x: 0,
    y: 0,
  },
  {
    type: 'node',
    id: 'A3',
    t: 'Asset 3',
    d: {
      shipment: ['S2', 'S3'],
      entity: 'Asset',
    },
    x: 0,
    y: 0,
  },
  {
    type: 'node',
    id: 'A4',
    t: 'Asset 4',
    d: {
      shipment: ['S3'],
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
      assets: ['A1', 'A3'],
      organization: 'O1',
      entity: 'Shipment',
    },
    x: 0,
    y: 0,
  },

  {
    type: 'node',
    id: 'S3',
    t: 'S-Ship 3',
    d: {
      assets: ['A4', 'A3'],
      organization: 'O1',
      entity: 'Shipment',
    },
    x: 0,
    y: 0,
  },

  {
    type: 'node',
    id: 'O1',
    t: 'Org 1',
    d: {
      shipments: ['S1', 'S2', 'S3'],
      entity: 'Organization',
      organization: ['O1'],
    },
    x: 0,
    y: 0,
  },

  {
    type: 'node',
    id: 'R1',
    t: 'Route 1',
    d: {
      shipments: ['S1'],
      entity: 'Route',
    },
    x: 0,
    y: 0,
  },
  {
    type: 'node',
    id: 'R2',
    t: 'Route 2',
    d: {
      shipments: ['S2', 'S3'],
      entity: 'Route',
    },
    x: 0,
    y: 0,
  },
];

const nodes: Node[] = [
  {
    type: 'node',
    id: 'MDC',
    t: 'Main DC',
    d: {
      entity: 'DC',
    },
    x: 0,
    y: 0,
  },
];
const links: Link[] = generateLinks();
export const shipmentData: ChartData = {
  type: 'LinkChart',
  items: [...nodes, ...links],
};

function generateLinks() {
  const links: Link[] = [];

  // Create a map for quick node lookup by ID
  const nodeMap = new Map();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
  });

  // Use a Set to track unique links
  const uniqueLinks = new Set();

  // Generate links based on relationships
  nodes.forEach((node) => {
    const { id, d } = node;

    const addLink = (source: string, target: string) => {
      // Ensure consistent ordering of source and target
      const [s, t] = source < target ? [source, target] : [target, source];
      const key = `${s}/p/${t}`;

      // Add to the set if not already present
      if (!uniqueLinks.has(key)) {
        uniqueLinks.add(key);
        links.push({
          a1: true,
          a2: true,
          id1: s,
          id2: t,
          id: key,
          c: '#696969',
          type: 'link',
        });
      }
    };

    if (d.entity === 'Asset') {
      // Assets link to Shipments
      (d.shipment || []).forEach((shipmentId: string) => {
        if (nodeMap.has(shipmentId)) {
          addLink(id, shipmentId);
        }
      });
    }

    if (d.entity === 'Shipment') {
      // Shipments link to Assets
      (d.assets || []).forEach((assetId: string) => {
        if (nodeMap.has(assetId)) {
          addLink(id, assetId);
        }
      });

      // Shipments link to Organizations
      if (nodeMap.has(d.organization)) {
        addLink(id, d.organization);
      }
    }

    if (d.entity === 'Organization') {
      // Organizations link to Shipments
      (d.shipments || []).forEach((shipmentId: string) => {
        if (nodeMap.has(shipmentId)) {
          addLink(id, shipmentId);
        }
      });
    }

    if (d.entity === 'Route') {
      // Routes link to Shipments
      (d.shipments || []).forEach((shipmentId: string) => {
        if (nodeMap.has(shipmentId)) {
          addLink(id, shipmentId);
        }
      });
    }
  });

  return links;
}
