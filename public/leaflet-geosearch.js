const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const ARROW_DOWN_KEY = 40;
const ARROW_UP_KEY = 38;
const ARROW_LEFT_KEY = 37;
const ARROW_RIGHT_KEY = 39;

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

/*searchElement*/

class SearchElement {
  constructor({ handleSubmit = () => {}, searchLabel = 'search', classNames = {} } = {}) {
    const container = createElement('div', ['geosearch', classNames.container].join(' '));
    const form = createElement('form', ['', classNames.form].join(' '), container);
    const input = createElement('input', ['glass', classNames.input].join(' '), form);

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
      this.onSubmit(event);
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

const Control = {
  initialize(options) {
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

    const button = createElement('a', classNames.button, container);
    button.title = searchLabel;
    button.href = '#';

    button.addEventListener('click', (e) => { this.onClick(e); }, false);

    const resetButton = createElement('a', classNames.resetButton, form);
    resetButton.innerHTML = 'x';
    button.href = '#';
    resetButton.addEventListener('click', () => { this.clearResults(null, true); }, false);

    if (autoComplete) {
      this.resultList = new ResultList({
        handleClick: ({ result }) => {
          input.value = result.label;
          this.onSubmit({ query: result.label, data: result });
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

    this.elements = { button, resetButton };
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
      this.onSubmit({ query: input.value, data: item });
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
      const results = await provider.search({ query });
      this.resultList.render(results);
    }
    else {
      this.resultList.clear();
    }
  },

  async onSubmit(query) {
    const { provider } = this.options;

    const results = await provider.search(query);

    if (results && results.length > 0) {
      this.showResult(results[0], query);
    }
  },

  showResult(result, { query }) {
    const { autoClose } = this.options;

    const markers = Object.keys(this.markers._layers);
    if (markers.length >= this.options.maxMarkers) {
      this.markers.removeLayer(markers[0]);
    }

    const marker = this.addMarker(result, query);
    this.centerMap(result);

    this.map.fireEvent('geosearch/showlocation', {
      location: result,
      marker,
    });

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

  async search({ query, data }) {
    // eslint-disable-next-line no-bitwise
    const protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';
    var mongo_response;

    const url = data
      ? this.endpointReverse({ data, protocol })
      : this.endpoint({ query, protocol });

    /*var socket = io.connect('http://localhost'); //da vedere
    socket.on('ack', function(data){
      socket.emit('mongoevent', {query});
      socket.on('mongoresp', function(d){
        mongo_response = d;
      });
    });*/

    const request = await fetch(url);
    const json = await request.json();
    return this.parse({ data: data ? [json] : json });
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

    const container = createElement('div', cx('results', classNames.container));
    const resultItem = createElement('div', cx(classNames.item));

    container.addEventListener('click', this.onClick, true);
    this.elements = { container, resultItem };
  }

  render(results = []) {
    const { container, resultItem } = this.elements;
    this.clear();

    results.forEach((result, idx) => {
      const child = resultItem.cloneNode(true);
      child.setAttribute('data-key', idx);
      child.innerHTML = result.label;
      container.appendChild(child);
    });

    if (results.length > 0) {
      addClassName(container, 'active');
    }

    this.results = results;
  }

  select(index) {
    const { container } = this.elements;

    // eslint-disable-next-line no-confusing-arrow
    Array.from(container.children).forEach((child, idx) => (idx === index)
      ? addClassName(child, 'active')
      : removeClassName(child, 'active'));

    this.selected = index;
    return this.results[index];
  }

  count() {
    return this.results ? this.results.length : 0;
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

    const idx = target.getAttribute('data-key');
    const result = this.results[idx];
    handleClick({ result });
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

