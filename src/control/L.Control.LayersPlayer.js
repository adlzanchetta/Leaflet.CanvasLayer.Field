/**
 *   Control for a simple player for controlling canvas rotation
 */

L.Control.LayersPlayer = L.Control.extend({

    initialize: function (canvasList, paneId, options) {
        this.activePopup = null;
        this.canvasList = canvasList;
        this.paneId = paneId;
        this.refreshTime = options.refreshTime ? options.refreshTime : 1000;
        this.loop = options.loop ? options.loop : false;
        this.currentPlay = null;
        options.cvLst = this.canvasList;
        L.Util.setOptions(this, options);
    },
    
    //------------------------------------------------------------------
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
    
    //------------------------------------------------------------------
    displayLayer: function (idxShow) {
        /**
         *
         * idxShow: int. From 1 to control.canvasList.length (inclusive)
         */
        
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        let paneChildren = control._map.getPane(control.paneId);
        paneChildren = paneChildren.children;
        
        if (paneChildren.length == 0) return;
        
        [...Array(control.canvasList.length).keys()].forEach(function (idxCurrent) {
            let paneChild = paneChildren[idxCurrent+1];
            let isActive = (idxShow == (idxCurrent+1));
            
            /** show or hide */
            paneChild.style.display = isActive ? 'block' : 'none';
            
            /** activate or deactivate onClick response */
            if (control.onClick && isActive) {
                control.canvasList[idxCurrent][0].on('click', control.onClick);
            } else {
                control.canvasList[idxCurrent][0].off('click');
            }
        });
    },
    
    //------------------------------------------------------------------
    goTo: function (idx) {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
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
            
        /** update onClick function */
        if (control.onClick) {
            this.canvasList[control.currentFrame][0].on('click', control.onClick);
        }
        
        /** update popup content */
        if (this.activePopup) {
            let latLng = this.activePopup._latlng;
            let activeField = this.canvasList[control.currentFrame][0];
            let cellValue = activeField._field['valueAt'](latLng.lng, latLng.lat);
            
            this.canvasList[control.currentFrame][0].fireEvent('click', {
                latlng: latLng,
                frameChange: true,
                value: cellValue
            });
        }
        
        return this.div;
    },
    
    //------------------------------------------------------------------
    goFirst: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        control.goTo(0);
    },
    
    //------------------------------------------------------------------
    goLast: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        let lastId = control.canvasList.length - 1;
        
        control.goTo((lastId >= 0) ? lastId : 0);
    },
    
    //------------------------------------------------------------------
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
    
    //------------------------------------------------------------------
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
    
    //------------------------------------------------------------------
    playBackward: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        control.playStop();
        control.currentPlay = setInterval(control.goPrev, control.refreshTime);
    },
    
    //------------------------------------------------------------------
    playForward: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        control.playStop();
        control.currentPlay = setInterval(control.goNext, control.refreshTime);
    },
    
    //------------------------------------------------------------------
    playStop: function() {
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        if (control.currentPlay != null) {
            clearInterval(control.currentPlay);
            control.currentPlay = null;
        }
    },
    
    //------------------------------------------------------------------
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

    //------------------------------------------------------------------
    _createButtons: function (container) {
        let d = L.DomUtil.create('div', null, container);
        
        d.style.width = 'auto';  /** TODO - make it custom */
        
        this._createMoveFirstButton(d);
        this._createPlayBackwardsButton(d);
        this._createPreviousButton(d);
        
        this._createStopButton(d);
        
        this._createNextButton(d);
        this._createPlayForwardButton(d);
        this._createMoveLastButton(d);
    },
    
    //------------------------------------------------------------------
    _createButton: function (d, id, defaults, onClickFunction) {
        let button = L.DomUtil.create('div', null, d);
        
        // set styles
        this._addStyles(button, this._buttonsDefaultStyle);
        try {
            this._addStyles(button, this.options.buttons[id].style);
        } catch (ex) {
            ex;  // simply ignores if nothing is past
        }
        
        // set innerHTML
        try {
            button.innerHTML = this.options.buttons[id].innerHTML || defaults.innerHTML;
        } catch (ex) {
            button.innerHTML = defaults.innerHTML;
        }
        
        // set tooltip
        try {
            button.setAttribute('title', this.options.buttons[id].title || defaults.title);
        } catch (ex) {
            button.setAttribute('title', defaults.title);
        }
        
        L.DomEvent
            .addListener(button, 'click', onClickFunction);
        
    },
    
    //------------------------------------------------------------------
    _createMoveFirstButton: function (d) {
        let defaults = {
            'innerHTML': '|&#9665;',
            'title': 'First frame'
        };
        this._createButton(d, 'moveFirst', defaults, this.goFirst);
    },
    
    //------------------------------------------------------------------
    _createPlayBackwardsButton: function (d) {
        let defaults = {
            'innerHTML': '&#9668;',
            'title': 'Play backwards'
        };
        this._createButton(d, 'playBackward', defaults, this.playBackward);
    },
    
    //------------------------------------------------------------------
    _createPreviousButton: function (d) {
        let defaults = {
            'innerHTML': '&#9665;',
            'title': 'Previous frame'
        };
        this._createButton(d, 'prev', defaults, this.goPrev);
    },
    
    //------------------------------------------------------------------
    _createNextButton: function (d) {
        let defaults = {
            'innerHTML': '&#9655;',
            'title': 'Next frame'
        };
        this._createButton(d, 'next', defaults, this.goNext);
    },
    
    //------------------------------------------------------------------
    _createPlayForwardButton: function (d) {
        let defaults = {
            'innerHTML': '&#9658;',
            'title': 'Play Forward'
        };
        this._createButton(d, 'playForward', defaults, this.playForward);
    },
    
    //------------------------------------------------------------------
    _createStopButton: function (d) {
        let defaults = {
            'innerHTML': '&#9632;',
            'title': 'Stop'
        };
        this._createButton(d, 'stop', defaults, this.playStop);
    },
    
    //------------------------------------------------------------------
    _createMoveLastButton: function (d) {
        let defaults = {
            'innerHTML': '&#9655;|',
            'title': 'Last frame'
        };
        this._createButton(d, 'moveLast', defaults, this.goLast);
    },
    
    //------------------------------------------------------------------
    _addStyles: function (domUtilElement, styleDictionary) {
        Object.keys(styleDictionary).forEach(function(key) {
            domUtilElement.style[key] = styleDictionary[key];
        });
    },
    
    //------------------------------------------------------------------
    _zeroPad: function (num, places) {  /** TODO: this should not be around here */
        return String(num).padStart(places, '0');
    },
    
    //------------------------------------------------------------------
    _buttonsDefaultStyle: {
        'float': 'left',
        'display': 'block',
        'width': '16px',
        'backgroundColor': '#FFFFFF',
        'padding': '2px',
        'border': '1px solid #333333',
        'cursor': 'pointer',
        'color': '#111111',
        'textAlign': 'center'
    }
});

L.control.layersPlayer = function (canvasList, paneId, options) {
    L.Control.LayersPlayer.lastCreated = new L.Control.LayersPlayer(canvasList, paneId, options);
    return L.Control.LayersPlayer.lastCreated;  /** TODO - ugly solution */
};
