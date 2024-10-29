//Three.js
import * as THREE from '/node_modules/three/build/three.module.js';

//import FirstPersonControls from '/src/fpscontrols.js';
//FirstPersonControls(THREE);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_VALUES = {
    emitDelay: 10,
    strictMode: false
};

/**
 * @typedef {object} EventEmitterListenerFunc
 * @property {boolean} once
 * @property {function} fn
 */

/**
 * @class EventEmitter
 *
 * @private
 * @property {Object.<string, EventEmitterListenerFunc[]>} _listeners
 * @property {string[]} events
 */

var EventEmitter = function () {

    /**
     * @constructor
     * @param {{}}      [opts]
     * @param {number}  [opts.emitDelay = 10] - Number in ms. Specifies whether emit will be sync or async. By default - 10ms. If 0 - fires sync
     * @param {boolean} [opts.strictMode = false] - is true, Emitter throws error on emit error with no listeners
     */

    function EventEmitter() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_VALUES : arguments[0];

        _classCallCheck(this, EventEmitter);

        var emitDelay = void 0,
            strictMode = void 0;

        if (opts.hasOwnProperty('emitDelay')) {
            emitDelay = opts.emitDelay;
        } else {
            emitDelay = DEFAULT_VALUES.emitDelay;
        }
        this._emitDelay = emitDelay;

        if (opts.hasOwnProperty('strictMode')) {
            strictMode = opts.strictMode;
        } else {
            strictMode = DEFAULT_VALUES.strictMode;
        }
        this._strictMode = strictMode;

        this._listeners = {};
        this.events = [];
    }

    /**
     * @protected
     * @param {string} type
     * @param {function} listener
     * @param {boolean} [once = false]
     */


    _createClass(EventEmitter, [{
        key: '_addListenner',
        value: function _addListenner(type, listener, once) {
            if (typeof listener !== 'function') {
                throw TypeError('listener must be a function');
            }

            if (this.events.indexOf(type) === -1) {
                this._listeners[type] = [{
                    once: once,
                    fn: listener
                }];
                this.events.push(type);
            } else {
                this._listeners[type].push({
                    once: once,
                    fn: listener
                });
            }
        }

        /**
         * Subscribes on event type specified function
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'on',
        value: function on(type, listener) {
            this._addListenner(type, listener, false);
        }

        /**
         * Subscribes on event type specified function to fire only once
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'once',
        value: function once(type, listener) {
            this._addListenner(type, listener, true);
        }

        /**
         * Removes event with specified type. If specified listenerFunc - deletes only one listener of specified type
         * @param {string} eventType
         * @param {function} [listenerFunc]
         */

    }, {
        key: 'off',
        value: function off(eventType, listenerFunc) {
            var _this = this;

            var typeIndex = this.events.indexOf(eventType);
            var hasType = eventType && typeIndex !== -1;

            if (hasType) {
                if (!listenerFunc) {
                    delete this._listeners[eventType];
                    this.events.splice(typeIndex, 1);
                } else {
                    (function () {
                        var removedEvents = [];
                        var typeListeners = _this._listeners[eventType];

                        typeListeners.forEach(
                        /**
                         * @param {EventEmitterListenerFunc} fn
                         * @param {number} idx
                         */
                        function (fn, idx) {
                            if (fn.fn === listenerFunc) {
                                removedEvents.unshift(idx);
                            }
                        });

                        removedEvents.forEach(function (idx) {
                            typeListeners.splice(idx, 1);
                        });

                        if (!typeListeners.length) {
                            _this.events.splice(typeIndex, 1);
                            delete _this._listeners[eventType];
                        }
                    })();
                }
            }
        }

        /**
         * Applies arguments to specified event type
         * @param {string} eventType
         * @param {*[]} eventArguments
         * @protected
         */

    }, {
        key: '_applyEvents',
        value: function _applyEvents(eventType, eventArguments) {
            var typeListeners = this._listeners[eventType];

            if (!typeListeners || !typeListeners.length) {
                if (this._strictMode) {
                    throw 'No listeners specified for event: ' + eventType;
                } else {
                    return;
                }
            }

            var removableListeners = [];
            typeListeners.forEach(function (eeListener, idx) {
                eeListener.fn.apply(null, eventArguments);
                if (eeListener.once) {
                    removableListeners.unshift(idx);
                }
            });

            removableListeners.forEach(function (idx) {
                typeListeners.splice(idx, 1);
            });
        }

        /**
         * Emits event with specified type and params.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emit',
        value: function emit(type) {
            var _this2 = this;

            for (var _len = arguments.length, eventArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                eventArgs[_key - 1] = arguments[_key];
            }

            if (this._emitDelay) {
                setTimeout(function () {
                    _this2._applyEvents.call(_this2, type, eventArgs);
                }, this._emitDelay);
            } else {
                this._applyEvents(type, eventArgs);
            }
        }

        /**
         * Emits event with specified type and params synchronously.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emitSync',
        value: function emitSync(type) {
            for (var _len2 = arguments.length, eventArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                eventArgs[_key2 - 1] = arguments[_key2];
            }

            this._applyEvents(type, eventArgs);
        }

        /**
         * Destroys EventEmitter
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this._listeners = {};
            this.events = [];
        }
    }]);

    return EventEmitter;
}();
// Event emitter implementation for ES6
//import { EventEmitter } from '/node_modules/event-emitter-es6/index.js';
// ------------------------------------------------------------------------------------------
var d_world_map = [];         // DUE TO ASYNC SHIT THESE MUST BE GLOBAL
var is_able_to_build = false;
var can_int = false;
// ------------------------------------------------------------------------------------------
class Scene extends EventEmitter { // everything is inside an object
  constructor(domElement = document.getElementById('gl_context'),
              _width = window.innerWidth,
              _height = window.innerHeight,
              hasControls = true,
              clearColor = 'black'){

    //Since we extend EventEmitter we need to instance it from here
    super();
    
    // -------------------------------------------------------------------------------------------------
    // - . + * THIS IS THE CONFIGURATION PART IT IS THE MOST IMPORTANT PART IN CUSTOMIZATION!!!! * + . -
    // -------------------------------------------------------------------------------------------------
    var region_map_file = "/world-data/mainland.json";
    // -------------------------------------------------------------------------------------------------
    //THREE scene
    this.scene = new THREE.Scene();
    // --------------------------------------------
    var getJSON = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
          var status = xhr.status;
          if (status === 200) {
            callback(null, xhr.response);
          } else {
            callback(status, xhr.response);
          }
        };
        xhr.send();
    };
    
    getJSON( region_map_file,
        function(err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            //alert('Your query count: ' + data.query.count);
            console.log(data.mapname);
            //this.is_able_to_build = data.can_build;
            d_world_map = data.worldmap;
            console.log(d_world_map);
            can_int = true;
        }
    });
    // ------------------------------------
    // - SOME UTILITIES FUNCTIONS IN HERE -
    // ------------------------------------
    function romveFunction(inputString) {
        return inputString.replace(/./g, char => {
            if (/[a-zA-Z0-9 ]/.test(char)) {
                return char;
            }
            return '';
        });
    }
    // -------------------------------------------------------
    // - THIS IS THE ACCOUNT SYSTEM AND PLAYER CUSTOMIZATION -
    // -------------------------------------------------------
    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    }

    // -------------------------------------------
    this.client_username = romveFunction(findGetParameter("WOLFname"));
    console.log("hello! " + this.client_username);
    document.cookie = "username=" + this.client_username;
    // -------------------------------------------
    // - TEXTURE INITIALIZATION PART GOES HERE   -
    // -------------------------------------------
    this.spr_other_a_char   = new THREE.TextureLoader().load( "/resources/sprite_wolf.png" ); // animated
    this.spr_animated_char  = new THREE.TextureLoader().load( "/resources/sprite_wolf.png" );
    this.default_char       = new THREE.TextureLoader().load( "/resources/default.png" );
    this.background_texture = new THREE.TextureLoader().load( "/resources/water.png" );
    this.ground_texture     = new THREE.TextureLoader().load( "/resources/grass.png" );
    this.torch_texture     = new THREE.TextureLoader().load( "/resources/torch.png" );
    this.tree_texture     = new THREE.TextureLoader().load( "/resources/tree.png" );
    // --------------------------------------------
    // - WORLD PREFABRICATED OBJECTS WILL GO HERE -
    // --------------------------------------------
    this.torch_geometry = new THREE.PlaneGeometry( 1, 1 ); 
    this.torch_material = new THREE.MeshPhongMaterial( {map: this.torch_texture, alphaTest: 0.5} ); 
    
    this.tree_geometry = new THREE.PlaneGeometry( 4, 4 ); 
    this.tree_material = new THREE.MeshPhongMaterial( {map: this.tree_texture, alphaTest: 0.5} ); 
    
    // THIS IS THE CLOCK CONTROLLER FOR ANIMATION
    this.clock = new THREE.Clock();
    this.current_frame = 9;
    this.i_walk = false;
    this.elapsedDelta = 0;

    //Utility
    this.width = _width;
    this.height = _height;
    // ---------------------------------------
    // - THIS IS THE KEYBOARD DETECTION VARS -
    // ---------------------------------------
    this.w_key = false;
    this.a_key = false;
    this.s_key = false;
    this.d_key = false;
    // -------------------------------------
    // - THIS RENDERS THE MAIN PLAYER SELF -
    // -------------------------------------
    this.player_x = 0; // My player X
    this.player_y = 0; // My player Y
    this.player_z = 0; // My player z
    this.player_dir = 1;// Looking At
    // -------------------------------------------
    // - THIS RENDERS THE ACTUAL PLAYER (CLIENT) -
    // -------------------------------------------
    //this.player_geometry = new THREE.PlaneGeometry( 1.7, 1.7 );
    this.player_material = new THREE.SpriteMaterial( { map: this.spr_animated_char, color: 0xffffff } );
    this.player_material.magFilter = THREE.NearestFilter;   // sharp pixel sprite
    this.spr_animated_char.repeat.set( 1/12, 1/1 );
    //this.player_client = new THREE.Mesh( this.player_geometry, this.player_material );
    this.player_client = new THREE.Sprite( this.player_material );
    this.player_client.scale.set(0, -1, 1);
    this.scene.add( this.player_client );
    this.spr_animated_char.offset.x = 0.083333 * 11; // from 1 to 9
    //this.player_client.rotation.x = -1.5708;
    //this.player_client.position.y = 1.1;
    // --------------------------------------------

    //THREE Camera
    //this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 20); // main camera
    this.camera = new THREE.OrthographicCamera( this.width / - 230, this.width / 230, this.height / 230, this.height / - 230, 1, 20 );
    this.camera.position.y = 8;
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    //THREE WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ // rendering options
      antialiasing: false
    });

    // -------------------------------------------
    // - TEXTURE SPECIAL PROPERTIES WILL GO HERE - (I promise this will be the only horribly hardcoded part)
    // -------------------------------------------
    this.background_texture.wrapS = THREE.RepeatWrapping;
    this.background_texture.wrapT = THREE.RepeatWrapping;
    this.background_texture.repeat.set( 16, 16 );

    this.spr_other_a_char.magFilter = THREE.NearestFilter;   // sharp pixel sprite
    this.spr_other_a_char.repeat.set( 1/12, 1/1 );
    this.spr_other_a_char.offset.x = 0.083333 * 11; // from 1 to 9

    this.ground_texture.wrapS = THREE.RepeatWrapping;
    this.ground_texture.wrapT = THREE.RepeatWrapping;
    this.ground_texture.repeat.set( 96, 96 );
    // --------------------------------------------------------------------------
    this.scene.background =  this.background_texture; // background color
    // --------------------------------------------------------------------------
    this.renderer.setSize(this.width, this.height);
    // ---------------------------------------------------------------------------
    // - BASIC SCENE CONSTRUCTION FOR GENERIC USE GOES HERE -
    // ------------------------------------------------------
    
    this.light = new THREE.AmbientLight( 0xDDDDDD ); // soft white light
    this.scene.add( this.light );

    this.world_grnd_geo = new THREE.BoxGeometry( 150, 150 );
    this.world_grnd_mat = new THREE.MeshPhongMaterial( { map: this.ground_texture } );
    this.world_grnd_msh = new THREE.Mesh( this.world_grnd_geo, this.world_grnd_mat );
    this.scene.add( this.world_grnd_msh );
    this.world_grnd_msh.rotation.x = -1.5708;
    this.world_grnd_msh.position.y = -0.8;

    // ---------------------------------------------------------------------------
    //Push the canvas to the DOM
    domElement.append(this.renderer.domElement);

    //Setup event listeners for events and handle the states
    window.addEventListener('resize', e => this.onWindowResize(e), false);
    domElement.addEventListener('mouseenter', e => this.onEnterCanvas(e), false);
    domElement.addEventListener('mouseleave', e => this.onLeaveCanvas(e), false);
    window.addEventListener('keydown', e => this.onKeyDown(e), false);
    window.addEventListener('keyup', e => this.onKeyUp(e), false);

    this.update();

  }

  drawUsers(positions, id){
    for(let i = 0; i < Object.keys(positions).length; i++){
      if(Object.keys(positions)[i] != id){
        this.users[i].position.set(positions[Object.keys(positions)[i]].position[0],
                                   positions[Object.keys(positions)[i]].position[1],
                                   positions[Object.keys(positions)[i]].position[2]);
      }
    }
  }

  world_map_build() {
    if(can_int){
        let tmp; let tmp2; let has2 = false;
        //console.log(world_map);
        console.log(d_world_map.length);
        for(let i = 0; i < d_world_map.length; i+=4){
            //console.log(world_map[i]);
            switch(d_world_map[i]){
                    case 1:
                        tmp = new THREE.Mesh( this.torch_geometry, this.torch_material ); 
                        tmp.rotation.x = -1.5708;
                        tmp.position.x = d_world_map[i + 1];
                        tmp.position.z = d_world_map[i + 3];
                        tmp.position.y = d_world_map[i + 2] + (tmp.position.z / 1000);// - 0.1;
                        tmp2 = new THREE.PointLight(0xffffff, 0.3);
                        tmp2.position.x = d_world_map[i + 1];
                        tmp2.position.y = d_world_map[i + 2]+1;
                        tmp2.position.z = d_world_map[i + 3]-0.5;
                        has2 = true;
                    break;

                    case 2:
                        tmp = new THREE.Mesh( this.tree_geometry, this.tree_material ); 
                        tmp.rotation.x = -1.5708;
                        tmp.position.x = d_world_map[i + 1];
                        tmp.position.z = d_world_map[i + 3];
                        tmp.position.y = d_world_map[i + 2] + (tmp.position.z / 1000);// - 0.1;
                        
                        has2 = false;
                    break;
            }   

            if(has2){this.scene.add(tmp2);has2=false;}
            this.scene.add( tmp );
        }
        can_int = false;
    }
  }

  user_movs () {
    if(this.w_key){this.player_z-=0.06;}
    if(this.a_key){this.player_x-=0.06;this.player_dir = -1;}
    if(this.s_key && !this.w_key){this.player_z+=0.06;}
    if(this.d_key && !this.a_key){this.player_x+=0.06;this.player_dir = 1;}

    if(this.w_key || this.a_key || this.s_key || this.d_key ){
        this.i_walk = true;
    }else{
        this.i_walk = false;
    }

    this.player_y = this.player_z / 1000;
  }

  animation_update (delta){
    this.elapsedDelta += delta * 6;
    //console.log(this.elapsedDelta);
    if(this.elapsedDelta > 0.5){
        this.elapsedDelta = 0;
        this.current_frame += 1;
        if(this.current_frame > 10){
            this.current_frame = 0;
        }
    }
    //
    this.spr_other_a_char.offset.x = 0.083333 * this.current_frame;
    if(this.i_walk){
        this.spr_animated_char.offset.x = 0.083333 * this.current_frame; // from 1 to 9
    }else{
        this.spr_animated_char.offset.x = 0.083333 * 11; // from 1 to 9
    }
  }

  update(){
    this.world_map_build();
    requestAnimationFrame(() => this.update());
    this.player_client.position.x = this.player_x;
    this.player_client.position.y = this.player_y;
    this.player_client.position.z = this.player_z;
    this.player_client.scale.x = this.player_dir;
    this.camera.position.x = this.player_x;
    this.camera.position.z = this.player_z;
    //this.controls.update(this.clock.getDelta());
    //this.controls.target = new THREE.Vector3(0,0,0);
    //console.log( this.clock.getDelta() );
    this.animation_update( this.clock.getDelta() );
    this.user_movs();
    this.render();
    this.emit('userMoved');
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

    //controls.handleResize();
  }

  onLeaveCanvas(e){
    //this.controls.enabled = false;
  }
  onEnterCanvas(e){
    //this.controls.enabled = true;
  }
  onKeyDown(e){
    this.emit('userMoved');
    console.log(e);
    switch (e.key){
      case 'w':this.w_key = true;break;
      case 'a':this.a_key = true;break;
      case 's':this.s_key = true;break;
      case 'd':this.d_key = true;break;
    }
  }

  onKeyUp(e){
   switch (e.key){
     case 'w':this.w_key = false;break;
     case 'a':this.a_key = false;break;
     case 's':this.s_key = false;break;
     case 'd':this.d_key = false;break;
   }
   // console.log("prian");
  }
}

export default Scene;
