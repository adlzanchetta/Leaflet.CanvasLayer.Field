/**
 *   Control for a simple player for controlling canvas rotation
 */

L.Control.LayersPlayer = L.Control.extend({

    initialize: function (canvasList, options) {
        this.canvasList = canvasList;
        this.refreshTime = options.refreshTime ? options.refreshTime : 1500;
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
        /** Fix this entire function making better reference to the panes */
        let control = L.Control.LayersPlayer.lastCreated;  /** TODO: fix */
        if (control._map.getPanes().overlayPane.children.length == 0) {
            return;
        }
        control.canvasList.forEach(function (_, idxCurrent) {
            let paneChild = control._map.getPanes().overlayPane.children[idxCurrent];
            paneChild.style.display = (idxShow == idxCurrent) ? 'block' : 'none';
        });
    },
    
    goTo: function (idx) {
        this.currentFrame = idx;
        
        /** show idx canvas, hide other canvas */
        this.displayLayer(idx);
        
        /** update counter */
        this.div
            .querySelector('.leaflet-control-layersPlayer-frameCounter')
            .innerHTML = (idx+1) + '/' + this.canvasList.length;
        
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
            .style('display', 'block')
            .style('margin-bottom', '5px')
            .attr('class', 'leaflet-control-layersPlayer-frameCounter')
            .text('0/' + n);
        
        d3
            .select(d)
            .append('span')
            .style('color', this.options.textColor)
            .style('display', 'block')
            .style('margin-bottom', '5px')
            .attr('class', 'leaflet-control-layersPlayer-frameLabel')
            .text('Loading labels...');
        container.innerHTML += d.innerHTML;
        return null;
    },

    _createButtons: function (container) {
        
        let d = L.DomUtil.create(
            'div',
            null,
            container
        );
        d.style.width = '112px';
        
        this._createMoveFirstButton(d);
        this._createPlayBackwardsButton(d);
        this._createPreviousButton(d);
        
        this._createStopButton(d);
        
        this._createNextButton(d);
        this._createPlayForwardButton(d);
        this._createMoveLastButton(d);
    },
    
    _createMoveFirstButton: function (d) {
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '|<';
        
        L.DomEvent
            .addListener(button, 'click', this.goFirst);
    },
    
    _createPlayBackwardsButton: function (d) {
        
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '<-';
        
        L.DomEvent
            .addListener(button, 'click', this.playBackward);
    },
    
    _createPreviousButton: function (d) {
        
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '<';
        
        L.DomEvent
            .addListener(button, 'click', this.goPrev);
    },
    
    _createNextButton: function (d) {
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '>';
        
        L.DomEvent.addListener(button, 'click', this.goNext);
    },
    
    _createPlayForwardButton: function (d) {
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '->';
        
        L.DomEvent
            .addListener(button, 'click', this.playForward);
    },
    
    _createStopButton: function (d) {
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '&#9632;';
        
        L.DomEvent
            .addListener(button, 'click', this.playStop);
    },
    
    _createMoveLastButton: function (d) {
        let button = L.DomUtil.create(
            'div',
            null,
            d
        );
        button.style.float = 'left';
        button.style.display = 'block';
        button.style.width = '10px';
        button.style.backgroundColor = '#FFFFFF';
        button.style.border = '3px solid #DFDFDF';
        button.style.margin = '1px';
        button.style.cursor = 'pointer';
        button.style.color = '#333333';
        button.innerHTML = '>|';
        
        L.DomEvent
            .addListener(button, 'click', this.goLast);
    }
});

L.control.layersPlayer = function (canvasList, options) {
    L.Control.LayersPlayer.lastCreated = new L.Control.LayersPlayer(canvasList, options);
    return L.Control.LayersPlayer.lastCreated;  /** TODO - ugly solution */
};
