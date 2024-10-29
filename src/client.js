import Scene from './scene.js';
import * as THREE from '/node_modules/three/build/three.module.js';

//A socket.io instance
const socket = io();
//const other_default_char = new THREE.TextureLoader().load( "/resources/default.png" );
const spr_other_s_char  = new THREE.TextureLoader().load( "/resources/sprite_wolf.png" ); // static

spr_other_s_char.magFilter = THREE.NearestFilter;   // sharp pixel sprite
spr_other_s_char.repeat.set( 1/12, 1/1 );
spr_other_s_char.offset.x = 0.083333 * 11; // from 1 to 9


//One WebGL context to rule them all !
let glScene = new Scene();
let id;
let instances = [];
let clients = new Object();

glScene.on('userMoved', ()=>{
  socket.emit('move', [glScene.player_x, glScene.player_y, glScene.player_z, glScene.player_dir, glScene.i_walk]);
});

//On connection server sends the client his ID
socket.on('introduction', (_id, _clientNum, _ids)=>{

  for(let i = 0; i < _ids.length; i++){
    if(_ids[i] != _id){
      clients[_ids[i]] = {
        mesh: new THREE.Sprite(
          new THREE.SpriteMaterial( { map: spr_other_s_char, color: 0xffffff } )
        )
        
        /*new THREE.Mesh(
          new THREE.PlaneGeometry(1.7 , 1.7),
          new THREE.MeshBasicMaterial( { map: other_default_char, alphaTest: 0.1 } )
        )*/
      }

      //Add initial users to the scene
      glScene.scene.add(clients[_ids[i]].mesh);
      //clients[_ids[i]].mesh.rotation.x = -1.5708;
    }
  }

  console.log(clients);

  id = _id;
  console.log('My ID is: ' + id);

});

socket.on('newUserConnected', (clientCount, _id, _ids)=>{
  console.log(clientCount + ' clients connected');
  let alreadyHasUser = false;
  for(let i = 0; i < Object.keys(clients).length; i++){
    if(Object.keys(clients)[i] == _id){
      alreadyHasUser = true;
      break;
    }
  }
  if(_id != id && !alreadyHasUser){
    console.log('A new user connected with the id: ' + _id);
    clients[_id] = {
      mesh:new THREE.Sprite(
        new THREE.SpriteMaterial( { map: spr_other_s_char, color: 0xffffff } )
      )
    }

    //Add initial users to the scene
    glScene.scene.add(clients[_id].mesh);
    //clients[_ids[i]].mesh.rotation.x = -1.5708;
  }

});

socket.on('userDisconnected', (clientCount, _id, _ids)=>{
  //Update the data from the server
  //document.getElementById('numUsers').textContent = clientCount;

  if(_id != id){
    console.log('A user disconnected with the id: ' + _id);
    glScene.scene.remove(clients[_id].mesh);
    delete clients[_id];
  }
});

socket.on('connect', ()=>{});

//Update when one of the users moves in space
socket.on('userPositions', _clientProps =>{
  //console.log('Positions of all users are ', _clientProps, id);
  // console.log(Object.keys(_clientProps)[0] == id);
  for(let i = 0; i < Object.keys(_clientProps).length; i++){
    if(Object.keys(_clientProps)[i] != id){

      //Store the values
      let oldPos = clients[Object.keys(_clientProps)[i]].mesh.position;
      let newPos = _clientProps[Object.keys(_clientProps)[i]].position;

      //Create a vector 3 and lerp the new values with the old values
      let lerpedPos = new THREE.Vector3();
      lerpedPos.x = THREE.Math.lerp(oldPos.x, newPos[0], 0.3);
      lerpedPos.y = THREE.Math.lerp(oldPos.y, newPos[1], 0.3);
      lerpedPos.z = THREE.Math.lerp(oldPos.z, newPos[2], 0.3);
      
      if(newPos[4]){
        clients[Object.keys(_clientProps)[i]].mesh.material.map = glScene.spr_other_a_char;
        clients[Object.keys(_clientProps)[i]].mesh.material.needsUpdate = true;
      }else{
        clients[Object.keys(_clientProps)[i]].mesh.material.map = spr_other_s_char;
        clients[Object.keys(_clientProps)[i]].mesh.material.needsUpdate = true;
      }
      //Set the position
      clients[Object.keys(_clientProps)[i]].mesh.scale.x = newPos[3] * -1;
      //clients[Object.keys(_clientProps)[i]].mesh.rotation.x = -1.5708;
      clients[Object.keys(_clientProps)[i]].mesh.position.set(lerpedPos.x, lerpedPos.y, lerpedPos.z);
    }
  }
});
