// base
import Vector from './Vector.js';
window.L.Vector = Vector;

import Cell from './Cell.js';
window.L.Cell = Cell;

import Field from './Field.js';
window.L.Field = Field;

import ScalarField from './ScalarField.js';
window.L.ScalarField = ScalarField;

// import ScalarFieldAnim from './ScalarFieldAnim.js';  /** maybe unecessary */
// window.L.ScalarFieldAnim = ScalarFieldAnim;  /** maybe unecessary */

import VectorField from './VectorField.js';
window.L.VectorField = VectorField;

// layer
require('./layer/L.CanvasLayer.js');
require('./layer/L.CanvasLayer.SimpleLonLat.js');
require('./layer/L.CanvasLayer.Field.js');
require('./layer/L.CanvasLayer.ScalarField.js');
require('./layer/L.CanvasLayer.ScalarFieldAnim.js');
// require('./layer/L.CanvasLayer.VectorFieldAnim.js');  /** maybe unecessary */

// control
require('./control/L.Control.ColorBar.js');
require('./control/L.Control.LayersPlayer.js');
