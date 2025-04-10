import * as THREE from 'three';
import { World3d } from './3dworldManager';
import { Character } from './character';
import { Enemy } from './enemy';
import { Physics } from './physics';

//PhysicsWorld  START 

//World variables 

var characterIndex = 0
let camera

let characters = []
let numCharacters = 6
let characterCamera = true

let character

let enemy

let enemies = []

let delta = 0;

let scene
let camera1
let controls

const clock = new THREE.Clock();
const renderer = new THREE.WebGLRenderer();
const world3d = new World3d(renderer, characters, enemies)

let physics = new Physics(world3d)

//PhysicsWorld FINISH
const initThreeJS = async () => {

  await world3d.initialize()

  scene = world3d.scene

  await world3d.setupCameras()

  camera1 = world3d.cameras['main_camera'].cam
  controls = world3d.cameras['main_camera'].controls

  //SETUP CONFIGURATION START
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadows
  window.document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize, false);
  //SETUP CONFIGURATION FINISH


  const characterPromises = []

  for (let i = 0; i < numCharacters; i++) {

    let char = new Character(world3d, i)

    const charPromise = char.initialize().then(async () => {

      characters.push(char)

      // if (i == 0) {

      //   let sounds // = character.camAudioManager.getSounds('zombie')
      //   enemy = new Enemy(world3d, sounds, char)
      //   await enemy.initialize()
      //   // zombie.userData.sounds = sounds
      //   // for (let sound of Object.keys(sounds)) zombie.add(sounds[sound])
      //   char.addTarget(enemy.object)

      // }

    })

    characterPromises.push(charPromise);

  }

  await Promise.all(characterPromises);

  for (let i = 0; i < numCharacters; i++) {

    for (let j = 0; j < numCharacters; j++) {

      if (i != j) {
        characters[i].addTarget(characters[j].character.children[0])
      }

    }
  }

  character = characters[characterIndex]
  character.use()

}

const init = async () => {

  await initThreeJS()
  // await physics.initialize()
  renderer.setAnimationLoop(animate)
}

init()


function animate() {

  delta = clock.getDelta();

  if (enemy) {

    enemy.goToTarget(delta)

  }

  if (characterCamera && character) camera = character.camera
  else camera = camera1

  controls.update(delta)
  //PHYSICS STUFF START 
  // physics.update(delta)
  //PHYSICS STUFF FINISH


  for (let i = 0; i < characters.length; i++) {
    characters[i].update(delta)
  }

  render()

}

function render() {
  renderer.render(scene, camera);
}


//---------------------------------------------------------------------------------


// // Prevent the context menu for the entire document
// document.addEventListener('contextmenu', function (event) {
//   //event.preventDefault();
// });

function onWindowResize() {

  for (let i = 0; i < numCharacters; i++) {
    characters[i].camera.camera.aspect = window.innerWidth / window.innerHeight
    characters[i].camera.camera.updateProjectionMatrix()
  }

  camera1.aspect = window.innerWidth / window.innerHeight
  camera1.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  render()

}

document.addEventListener('keydown', function (event) {



  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {

    this.characters[characterIndex].unUse()
    if (event.key === 'ArrowRight') characterIndex = (characterIndex + 1) % numCharacters
    else characterIndex = (characterIndex - 1 + numCharacters) % numCharacters

    // Get the current character and update localStorage and camera
    camera = characters[characterIndex].camera;
    characters[characterIndex].use()

  }

  if (event.key === '1') {
    // Toggle characterCamera (assuming characterCamera is a boolean)
    characterCamera = !characterCamera;
  }
})

