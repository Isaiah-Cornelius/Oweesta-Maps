/* global config csv2geojson turf Assembly $ */
'use strict';

// Create zoom variables
let mapZoom;

// Create a function to evaluate how large the map section is (subtract the Location List div) and set zoom values according to that size
function setZoomVariables(windowWidth) {
  let width = windowWidth;
  if (width >= 800) {
    width -= 360;
  }
  if (width <= 1000) {
    mapZoom = -6e-6 * width ** 2 + 0.0093 * width - 1.3786;
  } else {
    mapZoom = -9e-7 * width ** 2 + 0.004 * width - 0.9097;
  }
}

// Create a function to check if the listings have shifted to the bottom of the page
function checkListingsLocation(windowWidth, windowHeight) {
  const listings = document.getElementById('listings');
  // Check if screen width is less than 800px (Listings breakpoint set to shift to bottom when screen width is less that 800px)
  if (windowWidth < 800) {
    // sidebarA div has the 'py12' class which adds 12px of padding to the top and bottom of the rendered body height; add 24 to the height var.
    const sidebarADivHeight =
      document.querySelector('#sidebarA').clientHeight + 24;
    // listings div's parent's parent (grandparent?) has the 'viewport-third' class which sets the height at 33.3333vh; multiply the windowHeight by .333333 (1/3 of the viewheight) and subtract the sidebarADivHeight to get the properListingsDivHeight
    const properListingsDivHeight = windowHeight * 0.333333 - sidebarADivHeight;
    // Check if the 'viewport-twothirds' class is present; if so, remove it
    if (listings.classList.contains('viewport-twothirds')) {
      listings.classList.remove('viewport-twothirds');
    }
    // Set the listings div height to the properListingsDivHeight
    listings.style.height = properListingsDivHeight + 'px';
    // Check if the listings div needs the 'viewport-twothirds' class (if resizing from width < 800 to width >= 800)
  } else if (!listings.classList.contains('viewport-twothirds')) {
    listings.classList.add('viewport-twothirds');
  }
}

// Determine the window dimensions
function getWindowDimensions() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  setZoomVariables(windowWidth);
  checkListingsLocation(windowWidth, windowHeight);
}

// Call the getWindowDimensions function first to set the appropriate variable values
getWindowDimensions();

// Evaluate the window dimensions on resize to keep appropriate variable values
window.onresize = getWindowDimensions;

mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo;

let geojsonData = {};
const filteredGeojson = {
  type: 'FeatureCollection',
  features: [],
};

const map = new mapboxgl.Map({
  container: 'map',
  style: config.style,
  center: config.center,
  zoom: mapZoom,
  transformRequest: transformRequest,
});

function flyToLocation(currentFeature) {
  map.flyTo({
    center: currentFeature,
    zoom: 8,
  });
}

function flyToLocation2(currentFeature, zoom) {
  map.flyTo({
    center: currentFeature,
    zoom: zoom,
  });
}

function createPopup(currentFeature) {
  const popups = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popups[0]) popups[0].remove();

  // Create a variable to hold the html
  let html = '<div>';

  function addHeader(str) {
    html += '<div class="popupContent"><h3 class="header">' + str + '</h3>';
  }

  function closeHeader() {
    html += '</div>';
  }

  // Create a function to add Org info to the popup
  function buildOrgHeader() {
    addHeader(currentFeature.properties[config.popupLocation_Name]);
    if (currentFeature.properties[config.popupWebsite]) {
      html +=
        '<a href="' +
        currentFeature.properties[config.popupWebsite] +
        '" target="_blank">' +
        currentFeature.properties[config.popupWebsite] +
        '</a>';
    }
    if (currentFeature.properties[config.popupInvestorType]) {
      html +=
        '<h3> Investor Type:</h3><p>' +
        currentFeature.properties[config.popupInvestorType] +
        '</p>';
    }
    if (currentFeature.properties[config.popupMissionStatement]) {
      html +=
        '<h3> Mission:</h3><p>' +
        currentFeature.properties[config.popupMissionStatement] +
        '</p>';
    }
    closeHeader();
  }

  // Create a function to check an array of objects for properties. If the checked property is present, add html to the variable.
  function buildContactInfoHTML() {
    if (currentFeature.properties[config.popupContactInfo]) {
      // Use JSON parse to convert csv text (in array of objects format) to an array of objects
      const contactsArray = JSON.parse(
        currentFeature.properties[config.popupContactInfo],
      );
      addHeader('Contact');
      for (let i = 0; i < contactsArray.length; i++) {
        if (Object.prototype.hasOwnProperty.call(contactsArray[i], 'name')) {
          html += '<h3> ' + contactsArray[i].name + ' </h3>';
        }
        if (
          Object.prototype.hasOwnProperty.call(contactsArray[i], 'position')
        ) {
          html += '<p> ' + contactsArray[i].position + ' </p>';
        }
        if (Object.prototype.hasOwnProperty.call(contactsArray[i], 'phone')) {
          html += '<p> ' + contactsArray[i].phone + ' </p>';
        }
        if (Object.prototype.hasOwnProperty.call(contactsArray[i], 'email')) {
          html +=
            '<a href="mailto: ' +
            contactsArray[i].email +
            '"> ' +
            contactsArray[i].email +
            ' </a><br>';
        }
      }
      closeHeader();
    }
  }

  // Create a function to create an unordered list and add it to the html variable
  function buildInvestmentsTypeList() {
    if (currentFeature.properties[config.popupInvestmentsType]) {
      // Use JSON parse to convert csv text (in array of strings format) to an array of strings
      const investmentTypesArray = JSON.parse(
        currentFeature.properties[config.popupInvestmentsType],
      );
      addHeader('Investment Types');
      html += '<ul>';
      for (let i = 0; i < investmentTypesArray.length; i++) {
        html += '<li>  &bull; ' + investmentTypesArray[i] + '</li>';
      }
      html += '</ul>';
      closeHeader();
    }
  }

  // Create a function to create an unordered list and add it to the html variable
  function buildFocusAreaList() {
    if (currentFeature.properties[config.popupFocusAreas]) {
      // Use JSON parse to convert csv text (in array of strings format) to an array of strings
      const focusAreaArray = JSON.parse(
        currentFeature.properties[config.popupFocusAreas],
      );
      addHeader('Focus Areas');
      html += '<ul>';
      for (let i = 0; i < focusAreaArray.length; i++) {
        html += '<li>  &bull; ' + focusAreaArray[i] + '</li>';
      }
      html += '</ul>';
      closeHeader();
    }
  }

  // Create a function to add geographic info to the popup
  function buildGeographicAreasList() {
    if (currentFeature.properties[config.popupGeographicAreas]) {
      addHeader('Geographic Areas');
      html +=
        '<p>' + currentFeature.properties[config.popupGeographicAreas] + '</p>';
      closeHeader();
    }
  }
  // Create a function to add investment info info to the popup
  function buildInvestmentInfo() {
    addHeader('Investment Information');
    if (
      currentFeature.properties[config.popupPairEquityOrGrantsWithInvestments]
    ) {
      html +=
        '<h3> Org pairs equity or grants with investments:</h3><p> ' +
        currentFeature.properties[
          config.popupPairEquityOrGrantsWithInvestments
        ] +
        '</p>';
    }
    if (currentFeature.properties[config.popupInvestedInNCDFIPreviously]) {
      html +=
        '<h3> Org has previously invested in a Native CDFI:</h3><p> ' +
        currentFeature.properties[config.popupInvestedInNCDFIPreviously] +
        '</p>';
    }
    if (currentFeature.properties[config.popupMin]) {
      html +=
        '<h3> Minimum investment size:</h3><p> ' +
        currentFeature.properties[config.popupMin] +
        '</p>';
    }
    if (currentFeature.properties[config.popupMax]) {
      html +=
        '<h3> Maximum investment size:</h3><p> ' +
        currentFeature.properties[config.popupMax] +
        '</p>';
    }
    closeHeader();
  }

  // Create a function to check an array of objects for properties. If the checked property is present, add html to the variable.
  function buildInvestmentTermsInfoHTML() {
    if (currentFeature.properties[config.popupInvestmentTerms]) {
      // Use JSON parse to convert csv text (in array of objects format) to an array of objects
      const popupInvestmentTermsArray = JSON.parse(
        currentFeature.properties[config.popupInvestmentTerms],
      );
      addHeader('Investment Terms');
      for (let i = 0; i < popupInvestmentTermsArray.length; i++) {
        if (
          Object.prototype.hasOwnProperty.call(
            popupInvestmentTermsArray[i],
            'Desc',
          )
        ) {
          html += '<p> ' + popupInvestmentTermsArray[i].Desc + ' </p>';
        }
        if (
          Object.prototype.hasOwnProperty.call(
            popupInvestmentTermsArray[i],
            'Interest',
          )
        ) {
          html +=
            '<p> Interest: ' + popupInvestmentTermsArray[i].Interest + ' </p>';
        }
        if (
          Object.prototype.hasOwnProperty.call(
            popupInvestmentTermsArray[i],
            'Term',
          )
        ) {
          html += '<p> Term: ' + popupInvestmentTermsArray[i].Term + ' </p>';
        }
      }
      closeHeader();
    }
  }

  buildOrgHeader();
  buildContactInfoHTML();
  buildInvestmentsTypeList();
  buildFocusAreaList();
  buildGeographicAreasList();
  buildInvestmentInfo();
  buildInvestmentTermsInfoHTML();

  new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(html)
    .addTo(map);
}

function buildLocationList(locationData) {
  /* Add a new listing section to the sidebar. */
  const listings = document.getElementById('listings');
  listings.innerHTML = '';
  locationData.features.forEach((location, i) => {
    const prop = location.properties;

    const listing = listings.appendChild(document.createElement('div'));
    /* Assign a unique `id` to the listing. */
    listing.id = 'listing-' + prop.id;

    /* Assign the `item` class to each listing for styling. */
    listing.className = 'item';

    /* Add the link to the individual listing created above. */
    const link = listing.appendChild(document.createElement('button'));
    link.className = 'title';
    link.id = 'link-' + prop.id;
    link.innerHTML =
      '<p style="line-height: 1.25">' + prop[columnHeaders[0]] + '</p>';

    /* Add details to the individual listing. */
    const details = listing.appendChild(document.createElement('div'));
    details.className = 'content';

    for (let i = 1; i < columnHeaders.length; i++) {
      const div = document.createElement('div');
      div.innerText += prop[columnHeaders[i]];
      div.className;
      details.appendChild(div);
    }

    link.addEventListener('click', function () {
      const clickedListing = location.geometry.coordinates;
      flyToLocation(clickedListing);
      createPopup(location);

      const activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

      const divList = document.querySelectorAll('.content');
      const divCount = divList.length;
      for (i = 0; i < divCount; i++) {
        divList[i].style.maxHeight = null;
      }

      for (let i = 0; i < geojsonData.features.length; i++) {
        this.parentNode.classList.remove('active');
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });
}

// Build dropdown list function
// title - the name or 'category' of the selection e.g. 'Languages: '
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('h3');
  filterTitle.innerText = title;
  filterTitle.classList.add('py12', 'txt-bold');
  mainDiv.appendChild(filterTitle);

  const selectContainer = document.createElement('div');
  selectContainer.classList.add('select-container', 'center');

  const dropDown = document.createElement('select');
  dropDown.classList.add('select', 'filter-option');

  const selectArrow = document.createElement('div');
  selectArrow.classList.add('select-arrow');

  const firstOption = document.createElement('option');

  dropDown.appendChild(firstOption);
  selectContainer.appendChild(dropDown);
  selectContainer.appendChild(selectArrow);
  mainDiv.appendChild(selectContainer);

  for (let i = 0; i < listItems.length; i++) {
    const opt = listItems[i];
    const el1 = document.createElement('option');
    el1.textContent = opt;
    el1.value = opt;
    dropDown.appendChild(el1);
  }
  filtersDiv.appendChild(mainDiv);
}

// Build checkbox function
// title - the name or 'category' of the selection e.g. 'Languages: '
// listItems - the array of filter items
// To DO: Clean up code - for every third checkbox, create a div and append new checkboxes to it

function buildCheckbox(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('div');
  const formatcontainer = document.createElement('div');
  filterTitle.classList.add('center', 'flex-parent', 'py12', 'txt-bold');
  formatcontainer.classList.add(
    'center',
    'flex-parent',
    'flex-parent--column',
    'px3',
    'flex-parent--space-between-main',
  );
  const secondLine = document.createElement('div');
  secondLine.classList.add(
    'center',
    'flex-parent',
    'py12',
    'px3',
    'flex-parent--space-between-main',
  );
  filterTitle.innerText = title;
  mainDiv.appendChild(filterTitle);
  mainDiv.appendChild(formatcontainer);

  for (let i = 0; i < listItems.length; i++) {
    const container = document.createElement('label');

    container.classList.add('checkbox-container');

    const input = document.createElement('input');
    input.classList.add('px12', 'filter-option');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', listItems[i]);
    input.setAttribute('value', listItems[i]);

    const checkboxDiv = document.createElement('div');
    const inputValue = document.createElement('p');
    inputValue.innerText = listItems[i];
    checkboxDiv.classList.add('checkbox', 'mr6');
    checkboxDiv.appendChild(Assembly.createIcon('check'));

    container.appendChild(input);
    container.appendChild(checkboxDiv);
    container.appendChild(inputValue);

    formatcontainer.appendChild(container);
  }
  filtersDiv.appendChild(mainDiv);
}

const selectFilters = [];
const checkboxFilters = [];

function createFilterObject(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      checkboxFilters.push(keyValues);
    }
    if (filter.type === 'dropdown') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      selectFilters.push(keyValues);
    }
  });
}

function applyFilters() {
  const filterForm = document.getElementById('filters');

  filterForm.addEventListener('change', function () {
    const filterOptionHTML = this.getElementsByClassName('filter-option');
    const filterOption = [].slice.call(filterOptionHTML);

    const geojSelectFilters = [];
    const geojCheckboxFilters = [];

    filteredGeojson.features = [];
    // const filteredFeatures = [];
    // filteredGeojson.features = [];

    filterOption.forEach((filter) => {
      if (filter.type === 'checkbox' && filter.checked) {
        checkboxFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojCheckboxFilters.push(geojFilter);
            }
          });
        });
      }
      if (filter.type === 'select-one' && filter.value) {
        if (filter.value.length === 2) {
          const popups = document.getElementsByClassName('mapboxgl-popup');
          if (popups[0]) popups[0].remove();
          switch (filter.value) {
            case 'CA':
              flyToLocation2([-119.449444003504, 37.166098147632994], 4);
              break;
            case 'HI':
              flyToLocation2([-157.14479404845895, 20.95370568127875], 4);
              break;
            case 'MN':
              flyToLocation2([-94.32663165607144, 46.22603635718387], 4);
              break;
            case 'PA':
              flyToLocation2([-77.80275114833739, 40.87497964639171], 4);
              break;
            case 'UT':
              flyToLocation2([-111.68498927729787, 39.386650087399154], 4);
              break;
            case 'VT':
              flyToLocation2([-72.6608398768863, 44.13736867151776], 4);
              break;
          }
        }
        selectFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojSelectFilters.push(geojFilter);
            }
          });
        });
      }
    });

    if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
      geojsonData.features.forEach((feature) => {
        filteredGeojson.features.push(feature);
      });
    } else if (geojCheckboxFilters.length > 0) {
      geojCheckboxFilters.forEach((filter) => {
        geojsonData.features.forEach((feature) => {
          if (feature.properties[filter[0]].includes(filter[1])) {
            if (
              filteredGeojson.features.filter(
                (f) => f.properties.id === feature.properties.id,
              ).length === 0
            ) {
              filteredGeojson.features.push(feature);
            }
          }
        });
      });
      if (geojSelectFilters.length > 0) {
        const removeIds = [];
        filteredGeojson.features.forEach((feature) => {
          let selected = true;
          geojSelectFilters.forEach((filter) => {
            if (
              feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
              selected === true
            ) {
              selected = false;
              removeIds.push(feature.properties.id);
            } else if (selected === false) {
              removeIds.push(feature.properties.id);
            }
          });
        });
        const uniqueRemoveIds = [...new Set(removeIds)];
        uniqueRemoveIds.forEach((id) => {
          const idx = filteredGeojson.features.findIndex(
            (f) => f.properties.id === id,
          );
          filteredGeojson.features.splice(idx, 1);
        });
      }
    } else {
      geojsonData.features.forEach((feature) => {
        let selected = true;
        geojSelectFilters.forEach((filter) => {
          if (
            !feature.properties[filter[0]].includes(filter[1]) &&
            selected === true
          ) {
            selected = false;
          }
        });
        if (
          selected === true &&
          filteredGeojson.features.filter(
            (f) => f.properties.id === feature.properties.id,
          ).length === 0
        ) {
          filteredGeojson.features.push(feature);
        }
      });
    }

    map.getSource('locationData').setData(filteredGeojson);
    buildLocationList(filteredGeojson);
  });
}

function filters(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      buildCheckbox(filter.title, filter.listItems);
    } else if (filter.type === 'dropdown') {
      buildDropDownList(filter.title, filter.listItems);
    }
  });
}

function removeFilters() {
  const input = document.getElementsByTagName('input');
  const select = document.getElementsByTagName('select');
  const selectOption = [].slice.call(select);
  const checkboxOption = [].slice.call(input);
  filteredGeojson.features = [];
  checkboxOption.forEach((checkbox) => {
    if (checkbox.type === 'checkbox' && checkbox.checked === true) {
      checkbox.checked = false;
    }
  });

  selectOption.forEach((option) => {
    option.selectedIndex = 0;
  });

  map.getSource('locationData').setData(geojsonData);
  buildLocationList(geojsonData);
}

function removeFiltersButton() {
  const removeFilter = document.getElementById('removeFilters');
  removeFilter.addEventListener('click', () => {
    removeFilters();
  });
}

createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: true, // Use the geocoder's default marker style
  zoom: 11,
});

function sortByDistance(selectedPoint) {
  const options = { units: 'miles' };
  let data;
  if (filteredGeojson.features.length > 0) {
    data = filteredGeojson;
  } else {
    data = geojsonData;
  }
  data.features.forEach((data) => {
    Object.defineProperty(data.properties, 'distance', {
      value: turf.distance(selectedPoint, data.geometry, options),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  data.features.sort((a, b) => {
    if (a.properties.distance > b.properties.distance) {
      return 1;
    }
    if (a.properties.distance < b.properties.distance) {
      return -1;
    }
    return 0; // a must be equal to b
  });
  const listings = document.getElementById('listings');
  while (listings.firstChild) {
    listings.removeChild(listings.firstChild);
  }
  buildLocationList(data);
}

geocoder.on('result', (ev) => {
  const searchResult = ev.result.geometry;
  sortByDistance(searchResult);
});

map.on('load', () => {
  map.addControl(geocoder, 'top-right');

  // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
  console.log('loaded');
  $(document).ready(() => {
    console.log('ready');
    $.ajax({
      type: 'GET',
      url: config.CSV,
      dataType: 'text',
      success: function (csvData) {
        makeGeoJSON(csvData);
      },
      error: function (request, status, error) {
        console.log(request);
        console.log(status);
        console.log(error);
      },
    });
  });

  function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(
      csvData,
      {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ',',
      },
      (err, data) => {
        data.features.forEach((data, i) => {
          data.properties.id = i;
        });

        geojsonData = data;
        // Add the the layer to the map
        map.addLayer({
          id: 'locationData',
          type: 'circle',
          source: {
            type: 'geojson',
            data: geojsonData,
          },
          paint: {
            'circle-radius': 5, // size of circles
            'circle-color': '#3D2E5D', // color of circles ['get', 'Color']
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 0.7,
          },
        });
      },
    );

    map.on('click', 'locationData', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['locationData'],
      });
      const clickedPoint = features[0].geometry.coordinates;
      flyToLocation(clickedPoint);
      sortByDistance(clickedPoint);
      createPopup(features[0]);
    });

    map.on('mouseenter', 'locationData', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'locationData', () => {
      map.getCanvas().style.cursor = '';
    });
    buildLocationList(geojsonData);
  }
});

// Modal - popup for filtering results
const filterResults = document.getElementById('filterResults');
const exitButton = document.getElementById('exitButton');
const modal = document.getElementById('modal');

filterResults.addEventListener('click', () => {
  modal.classList.remove('hide-visually');
  modal.classList.add('z5');
});

exitButton.addEventListener('click', () => {
  modal.classList.add('hide-visually');
});

const title = document.getElementById('title');
title.innerText = config.title;
const description = document.getElementById('description');
description.innerText = config.description;

function transformRequest(url) {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=finder&') : url,
  };
}
