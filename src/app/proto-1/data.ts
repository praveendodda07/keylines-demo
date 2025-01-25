import { Entites } from '../@types/chart.types';
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
