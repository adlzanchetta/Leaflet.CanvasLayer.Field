/**
 *   Control for a simple player for controlling canvas rotation
 */

L.Control.LayersPlayer = L.Control.extend({

    initialize: function (canvasList, paneId, options) {
        this.canvasList = canvasList;
        this.paneId = paneId;
        this.refreshTime = options.refreshTime ? options.refreshTime : 1000;
        this.loop = options.loop ? options.loop : false;
        this.currentPlay = null;
        options.cvLst = this.canvasList;
        L.Util.setOptions(this, options);
    },
    
    onAdd: function (map) {
        this.currentFrame = 0;
        this._map = map;
        this.div = L.DomUtil.create(
            'div',
            'leaflet-control'
        );
        this.div.style.padding = '10px';

        L.DomEvent
            .addListener(this.div, 'click', L.DomEvent.stopPropagation)
            .addListener(this.div, 'click', L.DomEvent.preventDefault);
        this.div.style.backgroundColor = this.options.background;
        this.div.style.cursor = 'text';
        this._createLabels(this.div);
        this._createButtons(this.div);
        this.goTo(0);
        return this.div;
    },
    
    displayLayer: function (idxShow) {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        let paneChildren = control._map.getPane(control.paneId);
        paneChildren = paneChildren.children;
        
        if (paneChildren.length == 0) return;
        
        [...Array(control.canvasList.length).keys()].forEach(function (idxCurrent) {
            let paneChild = paneChildren[idxCurrent+1];
            paneChild.style.display = (idxShow == (idxCurrent+1)) ? 'block' : 'none';
        });
    },
    
    goTo: function (idx) {
        this.currentFrame = idx;
        
        /** show idx canvas, hide other canvas */
        this.displayLayer(idx+1);
        
        /** update counter */
        this.div
            .querySelector('.leaflet-control-layersPlayer-frameCounter')
            .innerHTML = this._zeroPad(idx+1, 2) + '/' + this._zeroPad(this.canvasList.length, 2);
        
        /** update label */
        this.div
            .querySelector('.leaflet-control-layersPlayer-frameLabel')
            .innerHTML = this.canvasList[idx][1];
        
        return this.div;
    },
    
    goFirst: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        control.goTo(0);
    },
    
    goLast: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        let lastId = control.canvasList.length - 1;
        
        control.goTo((lastId >= 0) ? lastId : 0);
    },
    
    goNext: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        let nextIdx = control.currentFrame + 1;
        
        if (nextIdx < control.canvasList.length){
            control.goTo(nextIdx);
        } else if (control.loop){
            control.goTo(0);
        } else {
            control.goTo(control.canvasList.length-1);
            control.playStop();
        }
    },
    
    goPrev: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        let nextIdx = control.currentFrame - 1;
        
        if (nextIdx >= 0){
            control.goTo(nextIdx);
        } else if (control.loop){
            control.goTo(control.canvasList.length-1);
        } else {
            control.goTo(0);
            control.playStop();
        }
    },
    
    playBackward: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        control.playStop();
        control.currentPlay = setInterval(control.goPrev, control.refreshTime);
    },
    
    playForward: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        control.playStop();
        control.currentPlay = setInterval(control.goNext, control.refreshTime);
    },
    
    playStop: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        if (control.currentPlay != null) {
            clearInterval(control.currentPlay);
            control.currentPlay = null;
        }
    },
    
    _createLabels: function (container) {
        let n = this.canvasList.length;
        let d = document.createElement('div');
        
        d3
            .select(d)
            .attr('class', 'leaflet-control-layersPlayer-title')  /** TODO - How to define it? */
            .attr('class', 'leaflet-control-colorBar-title');     /** TODO - review this */
        
        d3
            .select(d)
            .append('span')
            .style('color', this.options.textColor)
            .style('text-color', '#777777')
            .style('display', 'block')
            .style('margin-bottom', '5px')
            .style('width', '35px')
            .style('display', 'block')
            .style('float', 'left')
            .attr('class', 'leaflet-control-layersPlayer-frameCounter')
            .text('00/' + this._zeroPad(n, 2));
        
        d3
            .select(d)
            .append('span')
            .style('color', this.options.textColor)
            .style('display', 'block')
            .style('margin-bottom', '5px')
            .style('width', '125px')
            .style('display', 'block')
            .style('float', 'left')
            .attr('class', 'leaflet-control-layersPlayer-frameLabel')
            .text('Loading labels...');
        container.innerHTML += d.innerHTML;
        return null;
    },

    _createButtons: function (container) {
        let d = L.DomUtil.create('div', null, container);
        
        d.style.width = '160px';  /** TODO - make it custom */
        
        this._createMoveFirstButton(d);
        this._createPlayBackwardsButton(d);
        this._createPreviousButton(d);
        
        this._createStopButton(d);
        
        this._createNextButton(d);
        this._createPlayForwardButton(d);
        this._createMoveLastButton(d);
    },
    
    _createMoveFirstButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.moveFirst.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.moveFirst.innerHTML;
        } catch (ex) {
            button.innerHTML = '|&#9665;';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.goFirst);
    },
    
    _createPlayBackwardsButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.playBackward.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.playBackward.innerHTML;
        } catch (ex) {
            button.innerHTML = '&#9668;';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.playBackward);
    },
    
    _createPreviousButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.prev.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.prev.innerHTML;
        } catch (ex) {
            button.innerHTML = '&#9665;';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.goPrev);
    },
    
    _createNextButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.next.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.next.innerHTML;
        } catch (ex) {
            button.innerHTML = '&#9655;';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.goNext);
    },
    
    _createPlayForwardButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.playForward.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.playForward.innerHTML;
        } catch (ex) {
            button.innerHTML = '&#9658;';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.playForward);
    },
    
    _createStopButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.stop.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.stop.innerHTML || '&#9632;';
        } catch (ex) {
            button.innerHTML = '&#9632;';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.playStop);
    },
    
    _createMoveLastButton: function (d) {
        let button = L.DomUtil.create('div', null, d);
        
        try {
            this._addStyles(button, this.options.buttons.moveLast.style);
        } catch (ex) {
            this._addStyles(button, this._buttonsDefaultStyle);
        }
        try {
            button.innerHTML = this.options.buttons.moveLast.innerHTML;
        } catch (ex) {
            button.innerHTML = '&#9655;|';
        }
        
        L.DomEvent
            .addListener(button, 'click', this.goLast);
    },
    
    _addStyles: function (domUtilElement, styleDictionary) {
        Object.keys(styleDictionary).forEach(function(key) {
            domUtilElement.style[key] = styleDictionary[key];
        });
    },
    
    _zeroPad: function (num, places) {  /** TODO: this should not be around here */
        return String(num).padStart(places, '0');
    },
    
    _buttonsDefaultStyle: {
        'float': 'left',
        'display': 'block',
        'width': '16px',
        'backgroundColor': '#FFFFFF',
        'border': '3px solid #DFDFDF',
        'margin': '1px',
        'cursor': 'pointer',
        'color': '#333333',
        'textAlign': 'center'
    }
});

L.control.layersPlayer = function (canvasList, paneId, options) {
    L.Control.LayersPlayer.lastCreated = new L.Control.LayersPlayer(canvasList, paneId, options);
    return L.Control.LayersPlayer.lastCreated;  /** TODO - ugly solution */
};
