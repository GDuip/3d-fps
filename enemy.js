import * as THREE from 'three';
import { generateUUID } from "./utils";
import { Model } from './model';

export class Enemy {

    constructor (world3d, sounds, target) {

        this.uid = generateUUID()
        this.health = 100
        this.yellLow = 3
        this.fadeOutDuration = 5000
        this.initialPosition = new THREE.Vector3(0, 0, 20)
        this.height = 15
        this.yellHigh = 6
        this.sounds = sounds
        this.object = null
        this.world3d = world3d
        this.actions = {}
        this.currentAction = null
        this.model = new Model(this.world3d)
        this.target = target
        this.gameTag = '_zombie_'
        this.characterPath = 'models/ZombieGood.glb'

    }

    goToTarget(delta) {

        const direction = new THREE.Vector3();
        direction.y = 0
        direction.x = this.target.character.position.x - this.object.position.x
        direction.z = this.target.character.position.z - this.object.position.z
        direction.normalize();
    
        const objectPosition = new THREE.Vector3(this.object.position.x, 0, this.object.position.z);
        const cameraPosition = new THREE.Vector3(this.target.character.position.x, 0, this.target.character.position.z);
    
        const distance = objectPosition.distanceTo(cameraPosition);
    
        if (distance > 5) {
    
          let state = this.model.getState()
          let scalar = 0
    
          if (state == "FastRun") {
            scalar = 3 / 0.5666666626930237
          } else if (state == "Walk") {
            scalar = 1.46 / 4
          }
    
          // Move the zombie towards the camera
          this.object.position.add(direction.multiplyScalar(((scalar) * delta * this.model.scale)));
    
        } else {
    
          this.model.act('Attack')
    
        }
    
        const targetPosition = this.target.character.position.clone()
        targetPosition.y = this.object.position.y
        this.object.lookAt(targetPosition)
    
        this.update(delta)

    }

    setTarget(target) {
        this.target = target
    }

    update(delta) {
        this.model.update(delta)
    }

    async initialize() {

        this.model = new Model(this.world3d)
        await this.model.load(this.characterPath)
        this.model.setSize(this.height)
        
        this.object = this.model.model
        this.setTrace()

        this.object.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)

    }

    setTrace() {

        this.object.gameTag = this.gameTag
        this.object.uid = this.uid
        this.object.health = this.health
        this.object.traverse((child) => {
            child.layers.set(this.layer);
        });

    }

    //CHANGE FUNCTION TO MANAGE THE NEW SOUND CONFIGURATION
    yell = () => {


        // const randomDelay = Math.floor(Math.random() * (this.yellHigh - this.yellLow + 1) + this.yellLow) * 1000;
  
        // const keys = Object.keys(this.sounds)

        // this.sounds[keys[Math.floor(Math.random() * keys.length)]].play()
      
        // setTimeout(this.yell, randomDelay);

    }

}