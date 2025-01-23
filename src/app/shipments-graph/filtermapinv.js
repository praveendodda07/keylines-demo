//
//     Copyright © 2011-2020 Cambridge Intelligence Limited.
//     All rights reserved.
//
//     Sample Code
//!    Filter geo-coded data to see hidden connections.

//import data from './filtermap-data.js';

let chart;
let filterInProgress = false;
let refilter = false;
let minFlightVolume = 0;

const checkboxNodeList = document.getElementsByClassName('secondaryCheckBoxFilter');
const shipmentCheckboxNodeList = document.getElementsByClassName('secondaryCheckBoxFilterShipment');

const selectAllButton = document.getElementById('selectAll');
const selectNoneButton = document.getElementById('selectNone');
const selectInvertButton = document.getElementById('selectInvert');

const dtCheckboxNodeList = document.getElementsByClassName('dtCheckbox');
const mapOn = document.getElementById('mapOn');
const mapOff = document.getElementById('mapOff');

var mapMode =  true;
mapOn.onclick = function () {  mapMode =  true; };
mapOff.onclick = function () {  mapMode =  false; filterChart();  };


let tooltipShowing = false;
function closeTooltip() {
  const tooltip = $('#tooltip');
  if (tooltipShowing) {
    // hide tooltip if open
    tooltipShowing = false;
    tooltip.fadeOut();
  }
}

function showTooltip() {
  const tooltip = $('#tooltip');
  if (tooltipShowing) {
    // hide tooltip on previous node
    tooltip.hide();
  }
  tooltipShowing = true;
  tooltip.fadeIn();
}
// Fill the tooltip
function nodeTooltip(id) {
	// id is null for the background
	if (id) {
		const item = chart.getItem(id);
		var coordinates = chart.viewCoordinates(item.x, item.y);
		var x = coordinates.x + 8;
		var y = coordinates.y;
		if (item.type === 'node') {
			// Create the HTML code that is going to fill the tooltip
			const templateHtml = document.getElementById('tt_html').innerHTML;

			// craete  properties for tooltip
			var propertis = "";
			for (var key in item.d) {
				//  console.log("User " + checked[key] + " is #" + key); 
				var prop = ' <tr>  <td  style="width:30%;word-wrap: "break-word" ><strong>' + key + ' </strong> </td>  <td style="overflow-wrap: anywhere;width:70%">' + item.d[key] + '</td> </tr> ';
				propertis = propertis.concat(prop);
			}

			const html = templateHtml.replace(/{{label}}/, item.t)
				.replace(/{{modified_by}}/, item.d.modified_by)
				.replace(/{{name}}/, item.d.name)
				.replace(/{{tbody}}/, propertis)
			// Add it to the DOM
			document.getElementById('tooltip-container').innerHTML = html;
			// Position it
			const tooltip = $('#tooltip');
			const top = y - (tooltip.height() / 2) + 68;
			tooltip.css('left', x).css('top', top);
			showTooltip(x, y);
		} else if (item.type === 'link' && (item.clfEntityType === 'Incident' || item.clfEntityType === 'ShipmentStatusEdge' || item.clfEntityType === 'LocationEdge')) {
			// Create the HTML code that is going to fill the tooltip && item.entityProps.hasOwnProperty('value')
			const templateHtml = document.getElementById('tt_html').innerHTML;
			// craete  properties for tooltip
			var propertis = "";

			const nodeItem1 = chart.getItem(item.id1);
			const nodeItem2 = chart.getItem(item.id2);

			var coordinates1 = chart.viewCoordinates(nodeItem1.x, nodeItem1.y);
			var coordinates2 = chart.viewCoordinates(nodeItem2.x, nodeItem2.y);

			x = (coordinates1.x + coordinates2.x) / 2;
			y = (coordinates1.y + coordinates2.y) / 2
			var prop = ' <tr>  <td  style="width:30%;word-wrap: "break-word" ><strong> Value </strong> </td>  <td style="overflow-wrap: anywhere;width:70%"> <strong> Time </strong></td> </tr> ';
			propertis = propertis.concat(prop);
			for (var key in item.entityProps.value) {
				var prop = ' <tr>  <td  style="width:30%;word-wrap: "break-word" >' + item.entityProps.value[key] + '</td>  <td style="overflow-wrap: anywhere;width:70%">' + JSON.stringify(EpochToDate(key / 1000)).substring(1, 20) + '</td> </tr> ';
				propertis = propertis.concat(prop);
			}
			
			if(item.clfEntityType === 'LocationEdge'){
				propertis = "";
				var prop = ' <tr>  <td  style="width:30%;word-wrap: "break-word" ><strong> Value </strong> </td>  <td style="overflow-wrap: anywhere;width:70%"> <strong> Time </strong></td> </tr> ';
				propertis = propertis.concat(prop);
				var locationHistory =  JSON.stringify(item.entityProps.value).substring(2, JSON.stringify(item.entityProps.value).length-2);
				var nameArr = locationHistory.split(',');
				for (var key in nameArr){
					var data =  nameArr[key].split('=');
					var prop = ' <tr>  <td  style="width:30%;word-wrap: "break-word" >' + data[1] + '</td>  <td style="overflow-wrap: anywhere;width:70%">' +  JSON.stringify(EpochToDate(data[0]/1000)).substring(1, 20)  + '</td> </tr> ';
					propertis = propertis.concat(prop);
				}
			}

			const html = templateHtml.replace(/{{label}}/, item.clfEntityType)
				.replace(/{{modified_by}}/, '')
				.replace(/{{name}}/, 'link Details')
				.replace(/{{tbody}}/, propertis)
			// Add it to the DOM
			document.getElementById('tooltip-container').innerHTML = html;
			// Position it
			const tooltip = $('#tooltip');
			const top = y - (tooltip.height() / 2) + 88;
			tooltip.css('left', x).css('top', top);
			showTooltip(x, y);
		} else {
			closeTooltip();
		}
	} else {
		closeTooltip();
	}
}

async function filterChart() {
  const checked = getCheckboxStatuses(checkboxNodeList);

  let checkedIds = [];
  var selected =  false;
    for (var key in checked) {
	  //  console.log("User " + checked[key] + " is #" + key); 
	    if(checked[key]){
	    	checkedIds.push(key);
			selected =  true;				    		
	    }
	}
	
	await chart.combo().uncombine(currentCombos, { animate: false, select: false });
    currentCombos = [];  //chart.filter(item => ( checked[item.id1] || selecteditems.includes(item.id1) &&  !mapMode ), { type: 'link' })
	

	if(!selected){
		checkDTShow();
		return;
	}
  
  
  chart.filter(item => ( checked[item.id2]  &&  !mapMode ), { type: 'link' })
    .then(() => {
      filterInProgress = false;
      if (refilter) {
        filterChart();
      } else if (!chart.map().isShown()) {
        chart.layout();
      }
    });
}

function onSelectionChange() {
  const selectedItems = chart.selection();
 /*
 if (selectedItems.length > 0 && fgSelectCheckbox.checked) {
    const neighbours = chart.graph().neighbours(selectedItems);
    const idsToForeground = selectedItems.concat(neighbours.links);
    // foreground only links which will automatically foreground nodes at end of those links
    chart.foreground(item => idsToForeground.includes(item.id), { type: 'link' });
  } else {
    // foreground everything
    chart.foreground(() => true);
  }*/
}

async function filterShipmentChart() {
   	await uncombineAll();

	var selectedItems = chart.selection(); 
	if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'CollectionCenter' || node[key].d.type == 'ManufacturingFactory'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}
    selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
		
	var orginShipemntList = shipmentForAnalysis.filter(item => (item.d.hasOwnProperty('destinationId') && item.d.hasOwnProperty('orginId')) && (selectedItems.includes(item.d.orginId) || selectedItems.includes(item.d.destinationId))); 
		
	var selectedShipment = [];
	
	const checkboxNodeList = document.getElementsByClassName('secondaryCheckBoxFilterShipment');	
	var selectedShipmentState = getDomainCheckboxStatuses(checkboxNodeList);
	if(selectedShipmentState.length != 0){
		for(var key in selectedShipmentState){
			  Array.prototype.push.apply(selectedShipment, orginShipemntList
																	.filter(item => item.d.hasOwnProperty('status') && selectedShipmentState[key].equalsIgnoreCase(item.d.status)));
		}
		var selectedShipmentId = selectedShipment.map(officer => officer.id);
		const distNeighbours = chart.graph().neighbours(selectedShipmentId, { direction: 'any', all: true ,hops: 1});  				
		chart.show(selectedShipmentId, { animate: false });						
		chart.show(distNeighbours.nodes, { animate: false });
		runLayout();
	}else{
		checkDTShow();
		return;
	}
}

function updateAirlineCheckboxes(updateFn) {
  const elementList = Array.from(checkboxNodeList);
  elementList.forEach(updateFn);
}

function addEventListeners() {

  selectAllButton.addEventListener('click', () => {
    updateAirlineCheckboxes((checkbox) => {
      checkbox.checked = true;
    });
    filterChart();
  });

  selectNoneButton.addEventListener('click', () => {
    updateAirlineCheckboxes((checkbox) => {
      checkbox.checked = false;
    });
    filterChart();
  });

  Array.from(checkboxNodeList).forEach((checkbox) => {
    checkbox.addEventListener('change', filterChart);
  });

   Array.from(shipmentCheckboxNodeList).forEach((checkbox) => {
    checkbox.addEventListener('change', filterShipmentChart);
  });


 mapOn.addEventListener('click',  async function() { 	 
	   var reducedLocationNode = populatedData.map(obj => ({ ...obj, e: '.4' }))
	   chart.merge(reducedLocationNode);
	   await chart.map().show();
	   mapBaseLayer();
	   applyMapStyling();
  });

  mapOff.addEventListener('click',function() {
	   chart.map().hide(); 	  
	   const mapNodeStyle = {
						
						  e: 1,						  
						  g: [],
						};
	   var reducedLocationNode = populatedData.map(obj => ({ ...obj,g:[]}))
	   chart.merge(reducedLocationNode);
		runLayout();	   
  });
}

// Enable/Disable filters, used on transition start.
function disableUiControls(disabledVal) {
  updateAirlineCheckboxes((checkbox) => { checkbox.disabled = disabledVal; });
  flightVolumeSlider.disabled = disabledVal;
  selectAllButton.disabled = disabledVal;
  selectNoneButton.disabled = disabledVal;
  selectInvertButton.disabled = disabledVal;
  fgSelectCheckbox.disabled = disabledVal;
}

function mapModeChange(type) {
  // Disable UI on map transition start and enable it on end
  if (type === 'showstart' || type === 'hidestart') {
    mapOn.classList.toggle('active');
    mapOff.classList.toggle('active');
    disableUiControls(true);
  } else if (type === 'showend' || type === 'hideend') {
    disableUiControls(false);
  }
}

async function applyMapStyling(glyph = true) {
	const mapNodeStyle = {
						
						  e: 0.6,						  
						  glyph: null,
						};
  const props = [];
  // Styling of nodes in map mode.
  chart.each({ type: 'node' }, (item) => {
      props.push(Object.assign({}, mapNodeStyle, {
        id: item.id, 
		g: applyGlyph(item,glyph),
		fi: {
				c: getIconColor(item),
				t: getIconByKind(item),
			},
		 c:'',	
      })); 
  });

  chart.animateProperties(props, { time: 250 });
}

function applyGlyph(item,flag) {
	if(!flag){
		return [];
	}
	if(item.d.hasOwnProperty('Pharmaceuticals:Quantity') ){
		var glyph = {
					e: 2,
					c: 'rgb(255, 0, 0)',         // the glyph fill colour
					p: 'ne',                     // glyph in NE corner
					t: item.d['Pharmaceuticals:Quantity']                       // the glyph text	
				}
	
		return [glyph];
	}
	if(item.d.hasOwnProperty('Plasma:Quantity') ){
		var glyph = {
					e: 2,
					c: 'rgb(255, 0, 0)',         // the glyph fill colour
					p: 'ne',                     // glyph in NE corner
					t: item.d['Plasma:Quantity']                       // the glyph text	
				}
	
		return [glyph];
	}
	
	return [];
}

function getIconByKind(item) {
  var kind = item.clfEntityType;	
  if(item.clfEntityType == 'Shipment'){
	  kind = item.d.mode;
  }	
  var icon = defaultStyle.kindIcons[kind];
  if(icon ==  null){
	  icon ='fa-circle';
  }
  console.log(kind +  '  -  ' + icon);
  return KeyLines.getFontIcon(icon);
}

function getIconColor(item) {
	  var kind = item.clfEntityType;	
	  if(item.clfEntityType == 'Shipment'){
		  kind = item.d.mode;
	  }	
	  var icon = defaultStyle.nodeColours[kind];
	  if(icon ==  null){
		 return item.c;
	  }
	  //console.log(kind +  '  -  ' + icon);
	  return icon;
}


const defaultStyle = {
  nodeColours: {
	Shipment: '#A42768',
    Air: '#A42768',
    Terrsetial: '#A674BA',
    InMarketNode: '#1F78B4',
    ManufacturingFactory: '#FF2F3F',
    HeadQuarters: '#FF2F3F',
    vehicle: '#7FCB68',
    CollectionCenter: '#006B5F',
    damage: '#FF8615',
    suspiciousGarage: '#DC143C',
  },
  iconColour: '#FFFFFF',
  labelColour: undefined,
  linkColours: {
    normalConnection: '#BEBEBE',
    normalDistance: '#00008B',
    suspiciousConnection: '#DC143C',
  },
  fontSize: 15,
  linkWidth: 3,
  kindIcons: {
    person: 'fa-user',
    telephone: 'fa-phone',
    CollectionCenter: 'fa-home',
    policy: 'fa-file-contract',
    Container: 'fa-box',
    Terrstial: 'fa-shipping-fast',
    garage: 'fa-wrench',
    Air: 'fa-plane',
    Terrsetial: 'fa-shipping-fast',
    Airport: 'fa-plane',
	Location:'fa-map-marker',
	InMarketNode:'fa-map-marker',
	HeadQuarters:'fa-map-marker',
	HeadQuarter:'fa-map-marker',
	ManufacturingFactory:'fa-industry',
	DistributionCenter:'fa-industry',
  },
  transparentColour: '#912626',
};



//Changes the base map layer
function mapBaseLayer() {
  const leafletMap = chart.map().leafletMap();
  let basemap = L.esri.basemapLayer('Topographic');
  basemap.addTo(leafletMap);
}

 const southwest = L.latLng(-19,-65);
 const northeast = L.latLng(80, -30);
const mapOptions = {
	    animate: true,
	    time: 800,
	    tiles: null, // Remove the default tile layer
	    transition: 'layout',
	    leaflet: {
	      maxZoom: 8,
		  //zoom : 6,
	      minZoom: 3,
	      // Limit map panning and zoom to be roughly around USA  
		 maxBounds: L.latLngBounds(southwest, northeast),	    
	      maxBoundsViscosity: 1,
	    },
	  };
async  function klReady() {
  // data is defined in filtermap-data.js
	  chart.map().options(mapOptions);
	  chart.bind('selectionchange', onSelectionChange);
	  chart.bind('click', selectionchange);
	  addEventListeners();
	   
	  await chart.map().show();
	  mapBaseLayer();
	  applyMapStyling();  
}

async function startKeyLines() {	
  KeyLines.promisify();
  const options = { 
	iconFontFamily: 'Font Awesome 5 Free Solid',  
	imageAlignment: {
      [KeyLines.getFontIcon('fa-circle')]: { e: 1 },
      [KeyLines.getFontIcon('fa-map-marker')]: { e: 1.3 },
      [KeyLines.getFontIcon('fa-home')]: { e: 1 },
      
    },
	
    hover: 100,
    handMode: true,
  };
  chart = await KeyLines.create({
    container: 'klchart',
    options,
  });

  const data = {
		  "type": "LinkChart",
		  items: []
  }
 
  chart.load(data);
  // Bind a function called when the mouse goes over a node
  chart.bind('hover', nodeTooltip);
  // or tap it on a mobile device
  chart.bind('touchdown', nodeTooltip);
  // In order to make the tooltip less sticky, we can close it as soon as an event happens
  // The tooltip is going to disappear on scroll
  chart.bind('viewchange', closeTooltip);
  chart.bind('dblclick',dbClickHandler);
  //chart.layout();
  klReady();  
  setupButtons();
}
var kLdata ;
window.addEventListener('DOMContentLoaded', loadKeyLines);

var populatedData = [];
var allNodeids =[];
var assetList = [];
var ShipmentList = [];
var LocationList = [];
var routeList = [];
var routeNodeList = [];
var sensor = [];
var currentCombos = [];
var shipmentForAnalysis = [];

function wait(ms){
	   var start = new Date().getTime();
	   var end = start;
	   while(end < start + ms) {
	     end = new Date().getTime();
	  }
	}

var showAllGraph = false;
function setupButtons() {
	
	Array.from(dtCheckboxNodeList).forEach((checkbox) => {
		 checkbox.addEventListener('change', filterDTChart);
	  });
	
	 document.getElementById('showAllGraph').addEventListener( 'change', function() {
	     if(this.checked) {
			showAllGraph = true;			 
			getShowAllData();		
				
		} else {
			showAllGraph = false;			
			chart.clear();
			runLayout();
		}
	  });	
	/*
	document.getElementById('incidentGenerated').addEventListener('click', () => {
		combineAssetByIncident();
	});*/
	document.getElementById('clearChart').addEventListener('click', () => {
		clearChart();
	});
	
	document.getElementById('qtyAtCollectionCenter').addEventListener('click', () => {
		qtyAtCollectionCenter();
	});
	document.getElementById('qtyAtManufactring').addEventListener('click', () => {
		qtyAtManufactring();
	});
	document.getElementById('qtyAtIntransit').addEventListener('click', () => {
		qtyAtIntransit();
	});
	document.getElementById('qtyAtDistributionCenter').addEventListener('click', () => {
		qtyAtDistributionCenter();
	});
	
	document.getElementById('qtyAtIntransitMF').addEventListener('click', () => {
		qtyAtIntransitMF();
	});
	
	document.getElementById('shipmentByStatus').addEventListener('click', () => {
		shipmentByStatus();
	});
		
	document.getElementById('shipmentByMode').addEventListener('click', () => {
		combineShipmentByMode();
	});
	
	document.getElementById('searchShipment').addEventListener('click', () => {
	    searchShipment();
	  });
}

async function clearChart(){
	 await uncombineAll();	
	 chart.clear();
	 populatedData = [];
	 allNodeids =[];
	 assetList = [];
	 ShipmentList = [];
	 LocationList = [];
	 routeList = [];
	 routeNodeList = [];
	 sensor = [];
	 currentCombos = [];
	 shipmentForAnalysis = [];
	 uncheckAll();
	}

async function qtyAtCollectionCenter() {
	await uncombineAll();

	var selectedItems = chart.selection(); 
	if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'CollectionCenter'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}
    selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
	var selectedNodes  = chart.getItem(selectedItems);
	var uniqueCategory = selectedNodes.filter(x => x.type === 'node' && x.clfEntityType == 'CollectionCenter');
										
	for (var key in uniqueCategory) {		
		var id = uniqueCategory[key].id;
		var name = uniqueCategory[key].d.name;
		var count = uniqueCategory[key].d['Plasma:Quantity'];
		console.log(count);
		if(count == null){
			count  = 0;
			//continue;
		}
		chart.show(id, { animate: false });
		const moved  = await chart.combo().combine({
			ids: [id],
			label: name,
			open: false,
			style: {
				c: '#9767ba',
				e: 1.5,
				g: [
					{
						"c": "#b7336a",
						"b": "maroon",
						"t": count,
						"p": "ne",
						"e": 1.1
					}
				],
			},
			glyph: null,
		}, { arrange: 'concentric' });
		Array.prototype.push.apply(currentCombos, moved);		
	}

	runLayout();
	 chart.foreground(() => true);
}

async function qtyAtManufactring() {
	await uncombineAll();
	
	var selectedItems = chart.selection(); 
	if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'ManufacturingFactory'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}
    selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
	var selectedNodes  = chart.getItem(selectedItems);
	
	var uniqueCategory = 	selectedNodes.filter(x => x.type === 'node' && x.clfEntityType == 'ManufacturingFactory');
	for (var key in uniqueCategory) {
		
		var id = uniqueCategory[key].id;
		var name = uniqueCategory[key].d.name;
		var count = uniqueCategory[key].d['Plasma:Quantity'];
		console.log(count);
		if(count == null){
			count  = 0;
			//continue;
		}
		chart.show(id, { animate: false });
		const moved  = await chart.combo().combine({
			ids: [id],
			label: name,
			open: false,
			style: {
				c: '#9767ba',
				e: 1.5,
				g: [
					{
						"c": "#b7336a",
						"b": "maroon",
						"t": count,
						"p": "ne",
						"e": 1.1
					}
				],
			},
			glyph: null,
		}, { arrange: 'concentric' });
		Array.prototype.push.apply(currentCombos, moved);		
	}

	runLayout();
	chart.foreground(() => true);
}

async function qtyAtIntransit() {
	
	await uncombineAll();

	var selectedItems = chart.selection(); 
	if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'CollectionCenter' || node[key].d.type == 'ManufacturingFactory'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}
    selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
		
	var orginShipemntList = shipmentForAnalysis.filter(item => (item.d.hasOwnProperty('destinationId') && item.d.hasOwnProperty('orginId')) && (selectedItems.includes(item.d.orginId) || selectedItems.includes(item.d.destinationId)));
  
	var uniqueCategory = 	orginShipemntList.filter(x =>  x.d.shipmentType == 'collecion_To_Manufacturing' && x.d.status == 'intransit'  );
	for (var key in uniqueCategory) {		
		var id = uniqueCategory[key].id;
		var name = uniqueCategory[key].d.name;
		var count = uniqueCategory[key].d['Plasma:Quantity'];
		console.log(count);
		if(count == null){
			count  = 0;
			continue;
		}
		chart.show(id, { animate: false });
		const moved  = await chart.combo().combine({
			ids: [id],
			label: name,
			open: false,
			style: {
				c: '#9767ba',
				e: 1.5,
				g: [
					{
						"c": "#b7336a",
						"b": "maroon",
						"t": count,
						"p": "ne",
						"e": 1.1
					}
				],
			},
			glyph: null,
		}, { arrange: 'concentric' });
		Array.prototype.push.apply(currentCombos, moved);		
	}

	runLayout();
}

async function qtyAtDistributionCenter() {
	await uncombineAll();
	//find unique  orgin
	var uniqueCategory = 	populatedData.filter(x => x.type === 'node' && x.clfEntityType == 'DistributionCenter');
	chart.hide(allNodeids, { animate: false });
	for (var key in uniqueCategory) {
		
		var id = uniqueCategory[key].id;
		var name = uniqueCategory[key].d.name;
		var count = uniqueCategory[key].d['pharmaReady'];
		console.log(count);
		if(count == null){
			count  = 0;
			continue;
		}
		chart.show(id, { animate: false });
		const moved  = await chart.combo().combine({
			ids: [id],
			label: name,
			open: false,
			style: {
				c: '#9767ba',
				e: 1.5,
				g: [
					{
						"c": "#b7336a",
						"b": "maroon",
						"t": count,
						"p": "ne",
						"e": 1.1
					}
				],
			},
			glyph: null,
		}, { arrange: 'concentric' });
		Array.prototype.push.apply(currentCombos, moved);		
	}

	runLayout();
}



async function qtyAtIntransitMF() {
		await uncombineAll();

	var selectedItems = chart.selection(); 
	if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'CollectionCenter' || node[key].d.type == 'ManufacturingFactory'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}
    selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
		
	var orginShipemntList = shipmentForAnalysis.filter(item => (item.d.hasOwnProperty('destinationId') && item.d.hasOwnProperty('orginId')) && (selectedItems.includes(item.d.orginId) || selectedItems.includes(item.d.destinationId)));
	
	var uniqueCategory = 	orginShipemntList.filter(x => x.d.shipmentType == 'manufacturing_To_distribution' && x.d.status == 'intransit'  );
	
	for (var key in uniqueCategory) {
		
		var id = uniqueCategory[key].id;
		var name = uniqueCategory[key].d.name;
		var count = uniqueCategory[key].d['pharmaReady'];
		console.log(count);
		if(count == null){
			count  = 0;
			continue;
		}
		chart.show(id, { animate: false });
		const moved  = await chart.combo().combine({
			ids: [id],
			label: name,
			open: false,
			style: {
				c: '#9767ba',
				e: 1.5,
				g: [
					{
						"c": "#b7336a",
						"b": "maroon",
						"t": count,
						"p": "ne",
						"e": 1.1
					}
				],
			},
			glyph: null,
		}, { arrange: 'concentric' });
		Array.prototype.push.apply(currentCombos, moved);		
	}

	runLayout();
}



async function shipmentByStatus() {

	await uncombineAll();

	var selectedItems = chart.selection(); 
	/*if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'CollectionCenter' || node[key].d.type == 'ManufacturingFactory'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}
    selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
	*/

	var node =	chart.getItem(selectedNode); 
	var orginShipemntList = shipmentForAnalysis
								.filter(item =>  item.d.hasOwnProperty('orginId') && node.id == item.d.orginId   && item.d.status=='intransit' );
	var desitinatioShipemntList =  shipmentForAnalysis.filter(item =>  item.d.hasOwnProperty('destinationId') && node.id == item.d.destinationId && item.d.status=='intransit' );
	
	var shipmentIds = orginShipemntList.map(officer => officer.id);
	shipmentIds = shipmentIds.filter((item, i, ar) => ar.indexOf(item) === i);
	
	if (shipmentIds.length != 0) {
		chart.show(shipmentIds, { animate: false });
		const moved = await chart.combo().combine({
				ids: shipmentIds,
				label: 'Outgoing Shipments',
				open: false,
				style: {
					c: '#9767ba',
					e: 1.5,
					g: [
						{
							"c": "#b7336a",
							"b": "maroon",
							"t": shipmentIds.length,
							"p": "ne",
							"e": 1.1
						}
					],
				},
				glyph: null,
			}, { arrange: 'concentric' });
			Array.prototype.push.apply(currentCombos, moved);
	 }
	 
	 var shipmentIds = desitinatioShipemntList.map(officer => officer.id);
	 shipmentIds = shipmentIds.filter((item, i, ar) => ar.indexOf(item) === i);
	 if (shipmentIds.length != 0) {
		chart.show(shipmentIds, { animate: false });
		const moved = await chart.combo().combine({
				ids: shipmentIds,
				label: 'Incoming Shipments',
				open: false,
				style: {
					c: '#9767ba',
					e: 1.5,
					g: [
						{
							"c": "#b7336a",
							"b": "maroon",
							"t": shipmentIds.length,
							"p": "ne",
							"e": 1.1
						}
					],
				},
				glyph: null,
			}, { arrange: 'concentric' });
			Array.prototype.push.apply(currentCombos, moved);
	 }

	runLayout();
}



async function combineShipmentByMode() {

	await uncombineAll();
	
	var selectedItems = chart.selection(); 
	/*if(selectedItems.length == 0 ){
		  selectedItems = getSecondaryCheckboxStatuses();		  
		  if(selectedItems.length == 0 ){
			selectedItems = getDTCheckboxStatuses();	
			var node =	chart.getItem(selectedItems);
			for (var key in node) {
				if(node[key].d.type == 'CollectionCenter' || node[key].d.type == 'ManufacturingFactory'){
					selectedItems.push(node[key].id);		
				}else{
					const fromNeighbours = chart.graph().neighbours(node[key].id, { direction: 'any', all: true ,hops: 1});   
					var fromNeighbourNode = fromNeighbours.nodes;
					Array.prototype.push.apply(selectedItems,fromNeighbourNode );	
				}
			}
		  }
	}*/
	
    //selectedItems = selectedItems.filter((item, i, ar) => ar.indexOf(item) === i); 
	var node =	chart.getItem(selectedNode);
	
	var orginShipemntList = shipmentForAnalysis
								.filter(item =>  item.d.hasOwnProperty('orginId') && node.id == item.d.orginId   && item.d.status=='intransit' );
	var desitinatioShipemntList =  shipmentForAnalysis.filter(item =>  item.d.hasOwnProperty('destinationId') && node.id == item.d.destinationId && item.d.status=='intransit' );
		
	
	var shipmentIds = orginShipemntList.map(officer => officer.id);
	shipmentIds = shipmentIds.filter((item, i, ar) => ar.indexOf(item) === i);
	if (shipmentIds.length != 0) {
		chart.show(shipmentIds, { animate: false });
		const moved = await chart.combo().combine({
				ids: shipmentIds,
				label: 'Outgoing Pharma Shipments',
				open: false,
				style: {
					c: '#9767ba',
					e: 1.5,
					g: [
						{
							"c": "#b7336a",
							"b": "maroon",
							"t": shipmentIds.length * 90,
							"p": "ne",
							"e": 1.1
						}
					],
				},
				glyph: null,
			}, { arrange: 'concentric' });
			Array.prototype.push.apply(currentCombos, moved);
	 }
	 
	 var shipmentIds = desitinatioShipemntList.map(officer => officer.id);
	 shipmentIds = shipmentIds.filter((item, i, ar) => ar.indexOf(item) === i);
	 if (shipmentIds.length != 0) {
		chart.show(shipmentIds, { animate: false });
		const moved = await chart.combo().combine({
				ids: shipmentIds,
				label: 'Incoming Plasma Shipments',
				open: false,
				style: {
					c: '#9767ba',
					e: 1.5,
					g: [
						{
							"c": "#b7336a",
							"b": "maroon",
							"t": shipmentIds.length * 100,
							"p": "ne",
							"e": 1.1
						}
					],
				},
				glyph: null,
			}, { arrange: 'concentric' });
			Array.prototype.push.apply(currentCombos, moved);
	 }
	 var  count  = 0;
	 if(node.clfEntityType === 'ManufacturingFactory'){
		 count = node.d['Plasma:Quantity'];
	 }
	 
	 const newItems = [
  { id: 'newNode', type: 'node', t: 'New Node' },
  
];

	 var dummyNode =  {"id":node.id+"N1","t":node.name,"type":"node","x":0,"y":0};
	  var dummyLink = { id: node.id+'newLink', type: 'link',  'id1': node.id, 'id2': node.id+'N1' };
	 chart.merge(dummyNode);
	 chart.merge(dummyLink);
	 const newLinkStyle = {
		c: 'rgb(255, 127, 127)',
		w: 5,
		a2: true, // link directed to the new node
    };
	const moved = await chart.combo().combine({
				ids: [node.id+'N1'],
				label: 'Plasma Stock',
				open: false,
				style: {
					c: '#9767ba',
					e: 1.5,
					g: [
						{
							"c": "#b7336a",
							"b": "maroon",
							"t": count,
							"p": "ne",
							"e": 1.1
						}
					],
				},
				glyph: null,
			}, { arrange: 'concentric' });
			
	 Array.prototype.push.apply(currentCombos, moved);
	
	runLayout();
}

async function uncombineAll() {
	for (var key in currentCombos) {
		console.log("User " + currentCombos[key] + " is #" + key);
		try {
			chart.combo().info(currentCombos[key]).nodes.forEach((node) => {
				chart.hide(node.id, { animate: false });
			});
		} catch (err) {
			console.log(err.message);
		}
	}
	await chart.combo().uncombine(currentCombos, { animate: false, select: false });
	currentCombos = [];

	//await chart.hide(allNodeids, { animate: false });

	runLayout();
}


async function runLayout() {
	const layoutName = 'organic';
	const options = { packing: 'adaptive', animate: true, time: 1000, easing: 'linear' };
	await chart.layout(layoutName, options);
}



var loadedDTData = []; 	

async function filterDTChart(event) {
	var key =  event.target.id;
	var  state =  event.target.checked;
	const distNeighbours = chart.getItem(key);
	await chart.clear();
    if(!loadedDTData.includes(key)){
		await populateDigitalTwin(key);	
		//loadedDTData.push(key);
		await populateLocalScope(key);
		await populateCountCalulation(key);
		return;
	}
	if(state == true) {
		if(!distNeighbours){
				populateDigitalTwin(key);	
				loadedDTData.push(key);					
			}else{
				const distNeighbours = chart.graph().neighbours(key, { direction: 'any', all: true ,hops: 1});  
				chart.show(key, { animate: false });						
				chart.show(distNeighbours.nodes, { animate: false });				
				runLayout();
			}	  
	}else{
		if(distNeighbours){
				var toNodes = computeNeighboursOfSelection(key); 
				loadedDTData = loadedDTData.filter(item => item !== key)
				chart.removeItem(toNodes);	
			}	
	}	

	checkDTShow();	
}

function checkDTShow(){

  const checked = getDTCheckboxStatuses();
  let checkedIds = [];
    for (var key in checked) {
		var id  = checked[key];	
		const distNeighbours = chart.getItem(id);	
		if(!distNeighbours){
				populateDigitalTwin(id);					
		}else{
			const distNeighbours = chart.graph().neighbours(id, { direction: 'from', all: true ,hops: 1});  
			chart.show(id, { animate: false });						
			chart.show(distNeighbours.nodes, { animate: false });								
		}	    		
	}
	
	
	 runLayout();
}

function getDTCheckboxStatuses() {
  const checkedList = {};
  const elementList = Array.from(dtCheckboxNodeList);
  elementList.forEach((element) => {
    checkedList[element.id] = element.checked;
  });
   
  let checkedIds = [];
    for (var key in checkedList) { 
	    if(checkedList[key]){		 
			checkedIds.push(key);			
	    } 
	}  
  
  return checkedIds;
}

//returns an object with airline IDs as keys and bool values indicating if its checkbox is checked
function getCheckboxStatuses() {
  const checkedList = {};
  const elementList = Array.from(checkboxNodeList);
  elementList.forEach((element) => {
    checkedList[element.id] = element.checked;
  });
  return checkedList;
}

function getSecondaryCheckboxStatuses() {
	const checked = getCheckboxStatuses(checkboxNodeList);
	  let checkedIds = [];
	  var selected =  false;
		for (var key in checked) {		  
			if(checked[key]){
				checkedIds.push(key);							    		
			}
		}
	return checkedIds;	
}

function getDomainCheckboxStatuses(checkBoxList) {
	
	const checkedList = {};
	const elementList = Array.from(checkBoxList);
	elementList.forEach((element) => {
		checkedList[element.value] = element.checked;
	 });
	
	 let checkedIds = [];
	 var selected =  false;
		for (var key in checkedList) {		  
			if(checkedList[key]){
				checkedIds.push(key);							    		
			}
		}
	return checkedIds;	
}


async function populateDigitalTwin(id) {	
    var xhttp = new XMLHttpRequest();
    dashDTId = id;
	xhttp.onreadystatechange =async function() {
	  if (this.readyState == 4 && this.status == 200) {
		var kLdata = this.responseText;
		kLdata = JSON.parse(this.responseText);	
		populatedData =[];	
		Array.prototype.push.apply(populatedData, kLdata.items);			
		await chart.merge(kLdata.items);			
		//uncombineAll();					
		
		Array.prototype.push.apply(allNodeids,kLdata.items.filter(x => x.type === 'node').map(officer => officer.id));
		await chart.hide(allNodeids, { animate: false });	
		
		Array.prototype.push.apply(shipmentForAnalysis, kLdata.items.filter(x => x.clfEntityType === 'Shipment'));		
		var rootNode = kLdata.items.filter(x => x.type === 'link' && x.id1 == id).map(officer => officer.id2)		
		const distNeighbours = chart.graph().neighbours(rootNode, { direction: 'any', all: true ,hops: 1});  				
		chart.show(rootNode, { animate: false });						
		chart.show(distNeighbours.nodes, { animate: false });	
		if(mapMode == true){
			applyMapStyling();	
			cookMapLayout();
		}			
		runLayout();		
	  }
	};
	xhttp.open("GET",  "api/graph/digitaltwin/"+id, true);
	xhttp.send();   
}

async function populateLocalScope(id) {		
    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange =async function() {
	  if (this.readyState == 4 && this.status == 200) {
		var kLdata = this.responseText;		
		kLdata = JSON.parse(this.responseText);		
		var localScopeDiv = document.getElementById('localScope');
		localScopeDiv.innerHTML = '';
		for (var key in kLdata) {		  
			var data  = kLdata[key];
			var checkbox = document.createElement('input');
			checkbox.type = "checkbox";
			checkbox.name = data.name;
			checkbox.value = data.id;
			checkbox.id = data.id   
			//checkbox.innerHTML = '<span>'+data.name +'</span>' ; 
			localScopeDiv.appendChild(checkbox);
			var label = document.createElement('label')
			//label.htmlFor = data.id;
			label.appendChild(document.createTextNode(data.name));
			localScopeDiv.appendChild(label);
		}
	  }
	};
	xhttp.open("GET",  "api/graph/digitaltwin/location/"+id, true);
	xhttp.send();   
}

async function populateCountCalulation(id) {		
    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange =async function() {
	  if (this.readyState == 4 && this.status == 200) {
		var kLdata = this.responseText;		
		kLdata = JSON.parse(this.responseText);		
		var localScopeDiv = document.getElementById('towerData');
		localScopeDiv.innerHTML = '';
		var shipments =  null;
		var containers =  null; 
		var excursions =  null; 
		for (var key in kLdata) {		  
			var data  = kLdata[key];
			if(data.category[0] == 'null'){
				continue;
			}
			if(data.entityClass == 'Shipment' || data.entityClass == 'Container' ||  data.entityClass == 'StateNode'){
				
				var name = data.entityClass;
				
				if(name ==  'StateNode'){
					var excursions = document.createElement("p");
					excursions.classList.add('btn');
					excursions.style.margin = '2px';
					var node = document.createTextNode(data.count +' Excursions' );
					excursions.appendChild(node);
					
				}
				if(name ==  'Container'){
					var containers = document.createElement("p");
					containers.classList.add('btn');
					containers.style.margin = '2px';
					var node = document.createTextNode(data.count +' Assets(Containers)' );
					containers.appendChild(node);
					 
				}
				if(name ==  'Shipment'){
					var shipments = document.createElement("p");
					shipments.classList.add('btn');
					shipments.style.margin = '2px';
					var node = document.createTextNode(data.count +' Shipments' );
					shipments.appendChild(node);
					
					
				}
				
			}
		}
		
		 localScopeDiv.appendChild(containers);
		 localScopeDiv.appendChild(shipments);
		 localScopeDiv.appendChild(excursions);
	  }
	};
	xhttp.open("GET",  "api/graph/digitaltwin/count/"+id, true);
	xhttp.send();   
}



async function searchShipment() {
	
	var shipmentId =  document.getElementById('shipmentId').value;
		
	if(!shipmentId){
		alert('Please Enter Shipment Id ');
		return;
	}
	uncheckAll();
	await chart.clear();
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange =async function() {
	if (this.readyState == 4 && this.status == 200) {
		var kLdata = this.responseText;
		kLdata = JSON.parse(this.responseText);					
		chart.merge(kLdata.items);		
		var item =  kLdata.items.filter(x => x.clfEntityType === 'Shipment')[0];
		document.getElementById('shipmentWhere').innerHTML = '';
	if(item.hasOwnProperty('pos')){
		document.getElementById('shipmentWhere').innerHTML += ' <b>'+ JSON.stringify(item.pos) ;
	}
	var currentLocation  = kLdata.items.filter(x => item.type=='node' && item.d.hasOwnProperty('baseType') && x.d.baseType === 'Location');
	
	document.getElementById('shipmentLastLocation').innerHTML ='';
	if(currentLocation.length  != 0){
		var distNeighbours1 = chart.graph().neighbours(currentLocation[0].id, { direction: 'any', all: true, hops: 1 });		
		await chart.show(LocationList.filter(x => distNeighbours1.nodes.includes(x.id))[0].id, { animate: false });
		document.getElementById('shipmentLastLocation').innerHTML += ' <b>'+  currentLocation[0].d.name + '('+currentLocation[0].id+')';
	}
	var shipmentAssetList  = assetList.filter(x => distNeighbours.nodes.includes(x.id));
	document.getElementById('shipmentLoad').innerHTML ='';
	document.getElementById('shipmentSensorData').innerHTML ='';
	for (var key in shipmentAssetList){
		document.getElementById('shipmentLoad').innerHTML += ' <b> '+ key+1 +') '+ shipmentAssetList[key].d.name + '('+shipmentAssetList[key].id+') <br>';	
	
		if(shipmentAssetList[key].d.hasOwnProperty('37C7BB40-B06A-11E3-8000-B70F3AB862A4:37C7BBA1-B06A-11E3-8000-B70F3AB862A4')){
			document.getElementById('shipmentSensorData').innerHTML +=' <b> Temperature: '+  JSON.stringify(shipmentAssetList[key].d['37C7BB40-B06A-11E3-8000-B70F3AB862A4:37C7BBA1-B06A-11E3-8000-B70F3AB862A4'])  ;
		}		
		if(shipmentAssetList[key].d.hasOwnProperty('Shock:rxShock')){
			document.getElementById('shipmentSensorData').innerHTML +=' <br><b> Shock: '+  JSON.stringify(shipmentAssetList[key].d['Shock:rxShock'])  ;
		}
	}
	document.getElementById('shipmentCarrier').innerHTML ='';
	if(item.d.hasOwnProperty('carrier')){
		document.getElementById('shipmentCarrier').innerHTML += ' <b> '+item.d.carrier;
	}
	
	//get  Locaton Edge for shipment 
	var choosenNode = populatedData.filter(x => x.clfEntityType === 'LocationEdge' && distNeighbours.links.includes(x.id));
	document.getElementById('shipmentLocationHistory').innerHTML ='';
	if(choosenNode.length == 1){
		var locationHistory =  JSON.stringify(choosenNode[0].entityProps.value).substring(2, JSON.stringify(choosenNode[0].entityProps.value).length-2);
		var nameArr = locationHistory.split(',');
		for (var key in nameArr){
			var data =  nameArr[key].split('=');
			document.getElementById('shipmentLocationHistory').innerHTML += ' <b> '+ ++key +') '+ JSON.stringify(EpochToDate(data[0]/1000)).substring(1, 20)  + ' - ' +  data[1] +'<br>';		
		}
	}
	runLayout();
	  }
	};
	xhttp.open("GET",  "api/graph/keylines/linkchart/traverse?dept=1&direction=both&id=" + shipmentId, true);
	xhttp.send(); 
	
}

//Find the neighbours of the selection to two levels deep
function computeNeighboursOfSelection(checkedIds , hidden = true ,level = 3) {
   if(checkedIds.length == 0 ){
	 return [];  
   }
   var neiNodeList  = [];
   
   const fromNeighbours = chart.graph().neighbours(checkedIds, { direction: 'from', all: hidden ,hops: 1});   
   var fromNeighbourNode = fromNeighbours.nodes;
   Array.prototype.push.apply(neiNodeList,fromNeighbourNode );	
     
   var hop = 3 - 1 ;
   const distNeighbours = chart.graph().neighbours(fromNeighbourNode, { direction: 'any', all: hidden ,hops: hop});   
   Array.prototype.push.apply(neiNodeList, distNeighbours.nodes);	
			 
   return neiNodeList;
}



//If dblclick on the background create a new component,
//else if dblclick on node expand connections
async function dbClickHandler(id) {
	
	if(mapMode){
		return;
	} 	
	if (chart.combo().isCombo(id)) {
		comboHandler(id);
		return ;
	}
	
	const distNeighbours = chart.graph().neighbours(id, { direction: 'from', all: true ,hops: 1});   
	if(distNeighbours.nodes !=  0){
		chart.show(distNeighbours.nodes, { animate: false });
		runLayout();
		return ;
	}
	
	if (id) {
	 const item = chart.getItem(id);
	if (item && item.type === 'node') {
	   // remove glyph from selected node
	   chart.setProperties({ id: item.id, g: [] });
	   
	   var xhttp = new XMLHttpRequest();
	   xhttp.onreadystatechange = async function() {
		  if (this.readyState == 4 && this.status == 200) {
			 // console.log(this.responseText) ;  
			var kLdata = this.responseText;
			kLdata = JSON.parse(this.responseText);
			Array.prototype.push.apply(populatedData, kLdata.items);      

			//await chart.merge(kLdata.items);	
			//await timebar.merge(kLdata.items);				
			await runExpand(kLdata.items);
		  }
		};
		xhttp.open("GET", "api/graph/keylines/linkchart/traverse?direction=both&id="+id, true);
		xhttp.send(); 
	 }
	}
}


async function runExpand(itemsToExpand) {  
	  const layoutName = 'organic';
	  const fixOption = 'adaptive';
	  const options = {
	    name: layoutName,
	    fit: false,
	    tidy: true,
	    fix: fixOption,
	    consistent: fixOption !== 'none',
	    packing: (fixOption === 'none') ? 'circle' : 'adaptive',
	  };
	  
	  chart.lock(true);
	  await chart.expand(itemsToExpand, { layout: options });
	  chart.lock(false);
	}


function uncheckAll() {
	var checks = document.querySelectorAll(' input[type="checkbox"]');
	for (var i = 0; i < checks.length; i++) {
		var check = checks[i];
		if (!check.disabled) {
			check.checked = false;
		}
	}
	
	var ele  = document.querySelectorAll(' input[type="radio"]');
	for(var i=0;i<ele.length;i++)
      ele[i].checked = false;
}

async function getShowAllData() {
	   var xhttp = new XMLHttpRequest();
	   // xhttp.responseType = 'json';
		xhttp.onreadystatechange =async function() {
		  if (this.readyState == 4 && this.status == 200) {
			var kLdata = JSON.parse(this.responseText);
			populatedData = [];
	        Array.prototype.push.apply(populatedData, kLdata.items);    
 		    var orgUnitNodeList  = kLdata.items.filter(item => item.type == 'node' && item.d.hasOwnProperty('subDomain') && item.d.subDomain === 'OrgUnit');
			var orgUnitLinkList  = kLdata.items.filter(item => item.type == 'link' && !item.clfEntityType.equalsIgnoreCase('flowedge'));			
						
			await chart.merge(orgUnitNodeList);
			await chart.merge(orgUnitLinkList);					
			
			const layoutName = 'lens';
			const options = { packing: 'adaptive'  , animate: true, time: 1000, easing: 'linear' };
			await chart.layout(layoutName, options);	
			if(mapMode == true){
				applyMapStyling(false);	
				cookMapLayout(orgUnitNodeList,false);
			}		
		  }
		};
		xhttp.open("GET", "api/graph/keylines/linkchart/all", true);
		xhttp.send();   
}

var selectedNode  ;
async function selectionchange(id, x, y, button, sub) {
	chart.foreground(() => true);
	const item = chart.getItem(id);
	var   currentComboID ;
	var ids = [];
			if (item && item.type === 'node') {		
				//chart.selection([]);			
				//chart.selection(id);	
				selectedNode = id;
				currentComboID = chart.combo().find(id)	;		
				ids.push(id);	
				// making  node foreground 
				const neighbours = chart.graph().neighbours(id);
				const idsToForeground = [id].concat(neighbours.links);
				// foreground only links which will automatically foreground nodes at end of those links
				chart.foreground(item => idsToForeground.includes(item.id), { type: 'link' });				
			}
			
			if (currentComboID &&  item && item.type === 'node') {		
				    // Get, show (if required), and foreground the neighbours of the underlying items
					graphEngine.load(chart.serialize());
					// The method for getting neighbours of combos and noncombos is slightly different
					// So we have to use a different method for each
					const combos = ids.filter(id => chart.combo().isCombo(id));
					const comboNeighbours = chart.graph().neighbours(combos, { direction: 'any', all: true ,hops: 1});   
					const nonCombos = ids.filter(id => !chart.combo().isCombo(id));
					const nonComboNeighbours = graphEngine.neighbours(nonCombos, { direction: 'any', all: true ,hops: 1});   
										
					if(nonCombos.length != 0){
						var  currentComboID = chart.combo().find(nonCombos);
						const transferOptions = {};
						transferOptions.arrange = 'lens';
						transferOptions.animate =  false;
						transferOptions.resize =  false;
						chart.show(nonComboNeighbours.nodes, { animate: false });
						await chart.combo().transfer(nonComboNeighbours.nodes, currentComboID[0],transferOptions);
				  }
					
					// Get all the links involved
					const links = comboNeighbours.links.concat(nonComboNeighbours.links);
					// And filter them such that they only include ones linked to an open combo.
					chart.combo().reveal(links.filter(linkedToOpenCombo));
					if (combos.length) {
					  // This allows combos to become selected as there's no 'all' option for chart.foreground
					  chart.foreground(item => links.includes(item.id), { type: 'link', items: 'toplevel' });
					}
					if (nonCombos.length) {
					  chart.foreground(item => links.includes(item.id), { type: 'link' });
					}
			}		
}


async function comboHandler(comboId) {
	  
	  if (chart.combo().isCombo(comboId)) {
	    chart.foreground(() => true);
	    chart.combo().reveal([]);
	    if (chart.combo().isOpen(comboId)) {
	      await chart.combo().close(comboId);
	    } else {
	      await chart.combo().open(comboId);
	    }
	    chart.layout('tweak');
	  }
	}
	
	
String.prototype.equalsIgnoreCase = function (compareString) { return this.toUpperCase() === compareString.toUpperCase(); 
}; 

var controlLayersObj = null ;
var controlLayers;
async function cookMapLayout(data = populatedData, showDomain = true){
		
	var uniqueCategory = data.map(item => item.type=='node' && item.clfEntityType)
										.filter((value, index, self) => self.indexOf(value) === index);
	var  shipment =  null ;
	var	 container =  null
    uniqueCategory = uniqueCategory.filter(e => typeof e === 'string' && e);
	var localScopeDiv = document.getElementById('layers');
		localScopeDiv.innerHTML = '';
	for (var ckey in uniqueCategory) {
		
		if(uniqueCategory[ckey] == 'Airport' || uniqueCategory[ckey] == 'Asset' || uniqueCategory[ckey] == 'Shipment' || uniqueCategory[ckey] == 'Container' ){
			continue;
		}
		
		var nodeList = data.filter(x => x.type == 'node' && x.clfEntityType === uniqueCategory[ckey]);
		var layers = []
		if(nodeList.length == 0){
			continue;
		}
		if(!nodeList[0].hasOwnProperty('pos')){
				continue;
		}				
		var node = document.createElement('div');        
        node.innerHTML = '<input type="checkbox" id="'+ uniqueCategory[ckey] + '" name="' + uniqueCategory[ckey] + '" class="layerCheckbox"><label for="' + uniqueCategory[ckey] + '">'+ uniqueCategory[ckey] +'</label>';       		
        localScopeDiv.appendChild(node);	
	} 	
	var node = document.createElement('div');        
	node.innerHTML = '<input type="checkbox" id="route" name="route" class="layerCheckbox"><label for="route">Route</label>';       
	localScopeDiv.appendChild(node);
	if(showDomain){		 
		var hr = document.createElement('hr');
		localScopeDiv.appendChild(hr);
		
		var node = document.createElement('div'); 
		node.innerHTML = '<input type="checkbox" id="Container" name="Container" class="layerCheckbox"><label for="Container"> Assets </label>'; 
		container = localScopeDiv.appendChild(node);
		localScopeDiv.appendChild(container);	
		
		var node = document.createElement('div');
		node.innerHTML = '<input type="checkbox" id="Shipment" name="Shipment" class="layerCheckbox"><label for="Shipment"> Shipments </label>'; 
		shipment = localScopeDiv.appendChild(node);
		localScopeDiv.appendChild(shipment);
		
		
		
		// inventory
		 var node = document.createElement('div');        
		 node.innerHTML = '<input type="checkbox" id="inventory" name="inventory" class="layerCheckbox"><label for="inventory">Inventory</label>';       
		 localScopeDiv.appendChild(node);	
	 }
	 // adding lister for all  checkobox
	 const dtCheckboxNodeList = document.getElementsByClassName('layerCheckbox');
	 Array.from(dtCheckboxNodeList).forEach((checkbox) => {
		 checkbox.addEventListener('change', handleLayerClick);
	  });
}
async function handleLayerClick(){
		
	const checkBoxList = document.getElementsByClassName('layerCheckbox');
	const checkedList = {};
	const elementList = Array.from(checkBoxList);
	elementList.forEach((element) => {
		checkedList[element.id] = element.checked;
	 });	
	 let checkedIds = [];
	 var selected =  false;
		for (var key in checkedList) {		  
			if(checkedList[key]){
				var rootNode = populatedData.filter(x => x.type === 'node' && x.clfEntityType === key).map(officer => officer.id);													
				chart.show(rootNode, { animate: false });						    		
			}else{
				var rootNode = populatedData.filter(x => x.type === 'node' && x.clfEntityType === key).map(officer => officer.id);													
				chart.hide(rootNode, { animate: false });	
				if(key == 'route'){
					var flowEdges = populatedData.filter(x => x.type === 'link' && x.clfEntityType === 'FlowEdge').map(officer => officer.id);
					chart.removeItem(flowEdges);
					var airport = populatedData.filter(x => x.type === 'node' && x.clfEntityType === 'Airport').map(officer => officer.id);
					chart.removeItem(airport);
				}
			}
		}
		
		if(checkedList['inventory']){
			var rootNode = populatedData.filter(x => x.type === 'node' && x.clfEntityType === 'Shipment' && x.d.status != 'Completed').map(officer => officer.id);
			chart.show(rootNode, { animate: false });		
			var rootNode = populatedData.filter(x => x.type === 'node' && x.clfEntityType === 'CollectionCenter').map(officer => officer.id);
			chart.show(rootNode, { animate: false });		
			var rootNode = populatedData.filter(x => x.type === 'node' && x.clfEntityType === 'ManufacturingFactory').map(officer => officer.id);
			chart.show(rootNode, { animate: false });	
			var rootNode = populatedData.filter(x => x.type === 'node' && x.clfEntityType === 'InMarketNode').map(officer => officer.id);
			chart.show(rootNode, { animate: false });	
		}
		
		if(checkedList['route']){
			var flowEdges = populatedData.filter(x => x.type === 'link' && x.clfEntityType === 'FlowEdge')
			var airport = populatedData.filter(x => x.type === 'node' && x.clfEntityType === 'Airport')
			chart.merge(airport);
			chart.merge(flowEdges);
			var flowEdgesId1 = flowEdges.filter(x => x.type === 'link' && x.clfEntityType === 'FlowEdge').map(officer => officer.id1);
			var flowEdgesId2 = flowEdges.filter(x => x.type === 'link' && x.clfEntityType === 'FlowEdge').map(officer => officer.id2);
		
			var rootNode = populatedData.filter(x => x.type === 'node' && (flowEdgesId1.includes(x.id) || flowEdgesId2.includes(x.id)) ).map(officer => officer.id);
			rootNode = rootNode.filter((item, i, ar) => ar.indexOf(item) === i);
			var items = await chart.getItem(rootNode);
			items = items.filter(function(el) { return el; });
			await chart.merge(items);
			await applyMapStyling(false);	
			chart.show(rootNode, { animate: false });					
		}
		
}
//Epoch
function Epoch(date) {
    return Math.round(new Date(date).getTime() / 1000.0);
}

//Epoch To Date
function EpochToDate(epoch) {
    if (epoch < 10000000000)
        epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    var epoch = epoch + (new Date().getTimezoneOffset() * -1); //for timeZone        
    return new Date(epoch);
}

function loadKeyLines() {
  WebFont.load({
    custom: {
      // Be sure to include the CSS file in the page with the @font-face definition
      families: ['Font Awesome 5 Free Solid'],
    },
    // Start KeyLines if all the fonts have been loaded fine
    active: startKeyLines,
    // Start KeyLines otherwise
  //  inactive: startKeyLines,
    // 3 seconds is the default timeout
    //timeout: 3000,
  });
}