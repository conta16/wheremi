const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const ARROW_DOWN_KEY = 40;
const ARROW_UP_KEY = 38;
const ARROW_LEFT_KEY = 37;
const ARROW_RIGHT_KEY = 39;

var r = {};

const SPECIAL_KEYS = [
  ENTER_KEY,
  ESCAPE_KEY,
  ARROW_DOWN_KEY,
  ARROW_UP_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
];

/*var myModule = require('../nod');
var _ = myModule._;*/

/* dom utils */

/* eslint-disable import/prefer-default-export */
const createElement = (element, classNames = '', parent = null) => {
  const el = document.createElement(element);
  el.className = classNames;

  if (parent) {
    parent.appendChild(el);
  }

  return el;
};

const createScriptElement = (url, cb) => {
  const script = createElement('script', null, document.body);
  script.setAttribute('type', 'text/javascript');

  return new Promise((resolve) => {
    window[cb] = (json) => {
      script.remove();
      delete window[cb];
      resolve(json);
    };

    script.setAttribute('src', url);
  });
};

const addClassName = (element, className) => {
  if (element && !element.classList.contains(className)) {
    element.classList.add(className);
  }
};

const removeClassName = (element, className) => {
  if (element && element.classList.contains(className)) {
    element.classList.remove(className);
  }
};

class ChoiceElement {
  constructor({classNames = {}} = {}){
    const container = createElement('div', ['geosearch', classNames.choice].join(' '));
    const header = createElement('div',[classNames.header].join(' '), container);
    const icon1 = createElement('form',[].join(' '), container);
    const icon2 = createElement('form',[].join(' '), container);
    const icon3 = createElement('form',[].join(' '), container);
    this.elements = {container};
  }
}

/*searchElement*/

class SearchElement {
  constructor({ handleSubmit = () => {}, searchLabel = 'search', classNames = {} } = {}) {
    const container = createElement('div', ['geosearch', classNames.container].join(' '));
    const form = createElement('form', ['', classNames.form].join(' '), container);
    const input = createElement('input', ['glass', classNames.input].join(' '), form);
    /*const choice = createElement('div', ['geosearch', classNames.container2].join(' '), container);*/

    input.type = 'text';
    input.placeholder = searchLabel;

    input.addEventListener('input', (e) => { this.onInput(e); }, false);
    input.addEventListener('keyup', (e) => { this.onKeyUp(e); }, false);
    input.addEventListener('keypress', (e) => { this.onKeyPress(e); }, false);
    input.addEventListener('focus', (e) => { this.onFocus(e); }, false);
    input.addEventListener('blur', (e) => { this.onBlur(e); }, false);

    this.elements = { container, form, input };
    this.handleSubmit = handleSubmit;
  }

  onFocus() {
    addClassName(this.elements.form, 'active');
  }

  onBlur() {
    removeClassName(this.elements.form, 'active');
  }

  async onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const { input, container } = this.elements;
    removeClassName(container, 'error');
    addClassName(container, 'pending');

    await this.handleSubmit({ query: input.value });
    removeClassName(container, 'pending');
  }

  onInput() {
    const { container } = this.elements;

    if (this.hasError) {
      removeClassName(container, 'error');
      this.hasError = false;
    }
  }

  onKeyUp(event) {
    const { container, input } = this.elements;

    if (event.keyCode === ESCAPE_KEY) {
      removeClassName(container, 'pending');
      removeClassName(container, 'active');

      input.value = '';

      document.body.focus();
      document.body.blur();
    }
  }

  onKeyPress(event) {
    if (event.keyCode === ENTER_KEY) {
      this.singleSearch(event);
    }
  }

  setQuery(query) {
    const { input } = this.elements;
    input.value = query;
  }
}

/*LeafletControl*/


const defaultOptions = () => ({
  position: 'topleft',
  style: 'button',
  showMarker: true,
  showPopup: false,
  popupFormat: ({ result }) => `${result.label}`,
  marker: {
    icon: new L.Icon.Default(),
    draggable: false,
  },
  maxMarkers: 1,
  retainZoomLevel: false,
  animateZoom: true,
  searchLabel: 'Enter address',
  notFoundMessage: 'Sorry, that address could not be found.',
  messageHideDelay: 3000,
  zoomLevel: 18,
  classNames: {
    container: 'leaflet-bar leaflet-control leaflet-control-geosearch',
    choice: 'leaflet-control-choice card',
    header: 'card-body',
    button: 'leaflet-bar-part leaflet-bar-part-single',
    resetButton: 'reset',
    msgbox: 'leaflet-bar message',
    form: '',
    input: '',
  },
  autoComplete: true,
  autoCompleteDelay: 250,
  autoClose: false,
  keepResult: true,
});

const wasHandlerEnabled = {};
const mapHandlers = [
  'dragging',
  'touchZoom',
  'doubleClickZoom',
  'scrollWheelZoom',
  'boxZoom',
  'keyboard',
];


const chControl = {
  initialize(options){
    this.options = {
      ...defaultOptions(),
      ...options,
    };
    const { style, classNames } = this.options;
    this.choiceElement = new ChoiceElement({
      ...this.options,
    });

    const { container } = this.choiceElement.elements;
  },
  onAdd(map) {
    const { showMarker, style } = this.options;

    this.map = map;
    if (showMarker) {
      //this.markers.addTo(map);
    }

    if (style === 'bar') {
      const { form } = this.searchElement.elements;
      const root = map.getContainer().querySelector('.leaflet-control-container');

      const container = createElement('div', 'leaflet-control-geosearch bar');
      container.appendChild(form);
      root.appendChild(container);
      this.elements.container = container;
    }

    return this.choiceElement.elements.container;
  },
};

const Control = {
  initialize(options) {
    parentThis = this;
    this.markers = new L.FeatureGroup();
    this.handlersDisabled = false;

    this.options = {
      ...defaultOptions(),
      ...options,
    };

    const { style, classNames, searchLabel, autoComplete, autoCompleteDelay } = this.options;
    if (style !== 'button') {
      this.options.classNames.container += ` ${options.style}`;
    }

    this.searchElement = new SearchElement({
      ...this.options,
      handleSubmit: query => this.onSubmit(query),
    });

    const { container, form, input } = this.searchElement.elements;


    /*this.choiceElement = new choice({
      ...this.options,
    });*/
    /*const button = createElement('a', classNames.button, container);
    button.title = searchLabel;
    button.href = '#';

    button.addEventListener('click', (e) => { this.onClick(e); }, false);*/

    const searchButton = createElement('a', classNames.button, container);
    //resetButton.innerHTML = 'x';
    //button.href = '#';
    searchButton.addEventListener('click', () => { this.singleSearch({query: input.value}); }, false);

    if (autoComplete) {
      this.resultList = new ResultList({
        handleClick: ({ result }, bool) => {
          if (bool){
            input.value = result.label;
            this.singleSearch({ query: result.label, data: result }, bool);
          }
          else {
            input.value = result.label;
            this.singleSearch({ query: result.label, data: result }, bool);
          }
        },
      });

      form.appendChild(this.resultList.elements.container);

      input.addEventListener('keyup',
        _.debounce(e => this.autoSearch(e), autoCompleteDelay), true);
      input.addEventListener('keydown', e => this.selectResult(e), true);
      input.addEventListener('keydown', e => this.clearResults(e, true), true);
    }

    form.addEventListener('mouseenter', e => this.disableHandlers(e), true);
    form.addEventListener('mouseleave', e => this.restoreHandlers(e), true);

    this.elements = {  }; //button
  },

  onAdd(map) {
    const { showMarker, style } = this.options;

    this.map = map;
    if (showMarker) {
      this.markers.addTo(map);
    }

    if (style === 'bar') {
      const { form } = this.searchElement.elements;
      const root = map.getContainer().querySelector('.leaflet-control-container');

      const container = createElement('div', 'leaflet-control-geosearch bar');
      container.appendChild(form);
      root.appendChild(container);
      this.elements.container = container;
    }

    return this.searchElement.elements.container;
  },

  onRemove() {
    const { container } = this.elements;
    if (container) {
      container.remove();
    }

    return this;
  },

  onClick(event) {
    event.preventDefault();

    const { container, input } = this.searchElement.elements;

    if (container.classList.contains('active')) {
      removeClassName(container, 'active');
      this.clearResults();
    }
    else {
      addClassName(container, 'active');
      input.focus();
    }
  },

  disableHandlers(e) {
    const { form } = this.searchElement.elements;

    if (this.handlersDisabled || (e && e.target !== form)) {
      return;
    }

    this.handlersDisabled = true;
    mapHandlers.forEach((handler) => {
      if (this.map[handler]) {
        wasHandlerEnabled[handler] = this.map[handler].enabled();
        this.map[handler].disable();
      }
    });
  },

  restoreHandlers(e) {
    const { form } = this.searchElement.elements;

    if (!this.handlersDisabled || (e && e.target !== form)) {
      return;
    }

    this.handlersDisabled = false;
    mapHandlers.forEach((handler) => {
      if (wasHandlerEnabled[handler]) {
        this.map[handler].enable();
      }
    });
  },

  selectResult(event) {
    if (![ENTER_KEY, ARROW_DOWN_KEY, ARROW_UP_KEY].includes(event.keyCode)) {
      return;
    }

    event.preventDefault();

    const { input } = this.searchElement.elements;

    const list = this.resultList;

    if (event.keyCode === ENTER_KEY) {
      const item = list.select(list.selected);
      this.singleSearch({ query: input.value, data: item },list.bool);
      return;
    }

    const max = list.count() - 1;
    if (max < 0) {
      return;
    }

    // eslint-disable-next-line no-bitwise
    const next = (event.code === 'ArrowDown') ? ~~list.selected + 1 : ~~list.selected - 1;
    // eslint-disable-next-line no-nested-ternary
    const idx = (next < 0) ? max : (next > max) ? 0 : next;

    const item = list.select(idx);
    input.value = item.label;
  },

  clearResults(event, force = false) {
    if (event && event.keyCode !== ESCAPE_KEY) {
      return;
    }

    const { input } = this.searchElement.elements;
    const { keepResult, autoComplete } = this.options;

    if (force || !keepResult) {
      input.value = '';
      this.markers.clearLayers();
    }

    if (autoComplete) {
      this.resultList.clear();
    }
  },

  async autoSearch(event) {
    if (SPECIAL_KEYS.includes(event.keyCode)) {
      return;
    }

    const query = event.target.value;
    const { provider } = this.options;

    if (query.length) {
      const results = await provider.search({ query },0);
      this.resultList.render(results);
    }
    else {
      this.resultList.clear();
    }
  },

  async singleSearch(query, bool = 0){
    const { provider } = this.options;

    const results = await provider.search2(query, bool);

    if (results && results.length > 0) {
      this.showResult(results[0], query, bool);
    }
  },

  async onSubmit(query, bool = 0) {
    const { provider } = this.options;

    const results = await provider.search(query, bool);

    if (results && results.length > 0) {
      this.showResult(results[0], query);
    }
  },

  showResult(result, { query }, bool) {
    const { autoClose } = this.options;

    const markers = Object.keys(this.markers._layers);
    if (markers.length >= this.options.maxMarkers) {
      this.markers.removeLayer(markers[0]);
    }


    if (!bool){
      const marker = this.addMarker(result, query);
      this.centerMap(result);

      this.options.provider.itinerary.setWaypoints([]);

      this.map.fireEvent('geosearch/showlocation', {
        location: result,
        marker,
      });
    }
    else{
      this.options.provider.itinerary.setWaypoints(result.waypoints);
    }

    if (autoClose) {
      this.closeResults();
    }
  },

  closeResults() {
    const { container } = this.searchElement.elements;

    if (container.classList.contains('active')) {
      removeClassName(container, 'active');
    }

    this.restoreHandlers();
    this.clearResults();
  },

  addMarker(result, query) {
    const { marker: options, showPopup, popupFormat } = this.options;
    const marker = new L.Marker([result.y, result.x], options);
    let popupLabel = result.label;

    if (typeof popupFormat === 'function') {
      popupLabel = popupFormat({ query, result });
    }

    marker.bindPopup(popupLabel);

    this.markers.addLayer(marker);

    if (showPopup) {
      marker.openPopup();
    }

    if (options.draggable) {
      marker.on('dragend', (args) => {
        this.map.fireEvent('geosearch/marker/dragend', {
          location: marker.getLatLng(),
          event: args,
        });
      });
    }

    return marker;
  },

  centerMap(result) {
    const { retainZoomLevel, animateZoom } = this.options;

    const resultBounds = new L.LatLngBounds(result.bounds);
    const bounds = resultBounds.isValid() ? resultBounds : this.markers.getBounds();

    if (!retainZoomLevel && resultBounds.isValid()) {
      this.map.fitBounds(bounds, { animate: animateZoom });
    }
    else {
      this.map.setView(bounds.getCenter(), this.getZoom(), { animate: animateZoom });
    }
  },

  getZoom() {
    const { retainZoomLevel, zoomLevel } = this.options;
    return retainZoomLevel ? this.map.getZoom() : zoomLevel;
  },
};

function GeoSearchControl(...options) {
  if (!L || !L.Control || !L.Control.extend) {
    throw new Error('Leaflet must be loaded before instantiating the GeoSearch control');
  }

  const LControl = L.Control.extend(Control);
  return new LControl(...options);
}

function ChoiceControl(...options) {
  if (!L || !L.Control || !L.Control.extend) {
    throw new Error('Leaflet must be loaded before instantiating the GeoSearch control');
  }

  const LControl = L.Control.extend(chControl);
  return new LControl(...options);
}

class BaseProvider {
  constructor(options = {}) {
    this.options = options;
  }

  getParamString(params) {
    return Object.keys(params).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    ).join('&');
  }

  async search({ query }) {
    // eslint-disable-next-line no-bitwise
    const protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';
    const url = this.endpoint({ query, protocol });

    const request = await fetch(url);
    const json = await request.json();
    return this.parse({ data: json });
  }
}

class OpenStreetMapProvider extends BaseProvider {
  constructor(itinerary){
    super();
    this.itinerary = itinerary;
  }

  endpoint({ query } = {}) {
    const { params } = this.options;

    const paramString = this.getParamString({
      ...params,
      format: 'json',
      q: query,
    });

    return `https://nominatim.openstreetmap.org/search?${paramString}`;
  }

  endpointReverse({ data } = {}) {
    const { params } = this.options;

    const paramString = this.getParamString({
      ...params,
      format: 'json',
      // eslint-disable-next-line camelcase
      osm_id: data.raw.osm_id,
      // eslint-disable-next-line camelcase
      osm_type: this.translateOsmType(data.raw.osm_type),
    });

    return `https://nominatim.openstreetmap.org/reverse?${paramString}`;
  }

  parse({ data }) {
    return data.map(r => ({
      x: r.lon,
      y: r.lat,
      label: r.display_name,
      bounds: [
        [parseFloat(r.boundingbox[0]), parseFloat(r.boundingbox[2])], // s, w
        [parseFloat(r.boundingbox[1]), parseFloat(r.boundingbox[3])], // n, e
      ],
      raw: r,
    }));
  }

  async search2({query, data}, bool = 0){
    if (!bool){
      // eslint-disable-next-line no-bitwise
      const protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';
      const url = data
        ? this.endpointReverse({ data, protocol })
        : this.endpoint({ query, protocol });

      const request = await fetch(url);
      const json = await request.json();
      return this.parse({ data: data ? [json] : json });
    }
    else {
      var dbResponse = {};
      await this.itinerary.GSItineraryFromDB(query).then((data) => {
        dbResponse = data;
      }).catch(() => {});
      return dbResponse.result;
    }
  }

  async search({ query, data }) {
    // eslint-disable-next-line no-bitwise
    const protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';
    var dbResponse = {};
    const url = data
      ? this.endpointReverse({ data, protocol })
      : this.endpoint({ query, protocol });

    await this.itinerary.GSItineraryFromDB(query).then((data) => {
      dbResponse = data;
    }).catch(() => {});

    console.log("pippo");

    const request = await fetch(url);
    const json = await request.json();
    const places = this.parse({ data: data ? [json] : json });
    return {
      places: places,
      dbResponse: dbResponse.result
    };
  }

  translateOsmType(type) {
    if (type === 'node') return 'N';
    if (type === 'way') return 'W';
    if (type === 'relation') return 'R';
    return ''; // Unknown
  }
}

/*ResultList*/

const cx = (...classnames) => classnames.join(' ').trim();

class ResultList {
  constructor({ handleClick = () => {}, classNames = {} } = {}) {
    this.props = { handleClick, classNames };
    this.selected = -1;
    this.results = [];
    this.bool = 0;

    const container = createElement('div', cx('results', classNames.container));
    const resultItem = createElement('div', cx());

    container.addEventListener('click', this.onClick, true);
    this.elements = { container, resultItem };
    this.container = container;
    this.resultItem = resultItem;
    r = this;
  }

  render(results = []) {
    const { container, resultItem } = this.elements;
    var idx = 0;
    this.clear();

    results.places.forEach((result, ids) => {
      const child = resultItem.cloneNode(true);
      child.setAttribute('data-key', idx); //unique even among dbResponse objects
      child.setAttribute('data-key2', ids); //not unique, used for indexing in array
      child.setAttribute('data-type', 'place');
      child.innerHTML = result.label;
      container.appendChild(child);
      idx+=1;
    });

    results.dbResponse.forEach((result, ids) => {
      const child = resultItem.cloneNode(true);
      child.setAttribute('data-key', idx);
      child.setAttribute('data-key2', ids);
      child.setAttribute('data-type', 'dbresponse');
      child.innerHTML = result.label;
      container.appendChild(child);
      idx+=1;
    });

    if (results.places.length > 0 || results.dbResponse.length > 0) {
      addClassName(container, 'active');
    }

    this.results = results;
  }

  select(index) {
    const { container } = this.elements;
    var ids = 0;
    this.bool = 0;
    // eslint-disable-next-line no-confusing-arrow
    Array.from(container.children).forEach((child, idx) => {
      if (idx === index){
        addClassName(child, 'active');
        if (child.getAttribute("data-type") == "dbresponse"){
          this.bool = 1;
          ids = child.getAttribute("data-key2");
        }
      }
      else {removeClassName(child, 'active');}
    });
    this.selected = index;
    if (this.bool) return this.results.dbResponse[ids];
    else return this.results.places[index];
  }

  count() {
    return this.results.places || this.results.dbResponse ? this.results.places.length + this.results.dbResponse.length : 0;
  }

  clear() {
    const { container } = this.elements;
    this.selected = -1;

    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }

    removeClassName(container, 'active');
  }

  onClick = ({ target } = {}) => {
    const { handleClick } = this.props;
    const { container } = this.elements;

    if (target.parentNode !== container || !target.hasAttribute('data-key')) {
      return;
    }

    var result = {};

    if (target.getAttribute('data-type') == 'dbresponse'){
      const ids = target.getAttribute('data-key2');
      result = this.results.dbResponse[ids];
      this.bool = 1;
    }
    else {
      const ids = target.getAttribute('data-key2');
      result = this.results.places[ids];
      this.bool = 0;
    }
    handleClick({ result }, this.bool);
  };
}



////////////////// ADDED CODE ////////////////////////

/*const provider = new OpenStreetMapProvider();
provider
  .search({ query: 'reggio emilia' })
  .then(function(result) {
    console.log(result);
  });*/

/*const form = document.querySelector('form');
const input = form.querySelector('input[type="text"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const results = await provider.search({ query: input.value });
  console.log(results); // » [{}, {}, {}, ...]
});*/

