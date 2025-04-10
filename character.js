import { ShootingManager } from "./ShootingManager"
import * as THREE from 'three';
import { generateUUID, updateHealthBar } from "./utils";
import { FirstPersonCamera } from "./controls";
import { Model } from "./model";
import { Camera } from "./camera";
import { HealthBar } from "./healthBar";
import { Gun } from "./gun";
import { getRandomPosition } from "./functions";

export class Character {

    constructor(world3d, layer) {

        this.active = false
        this.maxHealth = 100
        this.health = 100
        this.height = 15
        this.cameraHeight = 0.8
        this.baseHeight = 15
        this.gameTag = '_character_'
        this.gunSize = this.height * 0.15
        this.characterPath = 'models/medievalSoldier.glb'
        this.initialPosition = new THREE.Vector3(10*layer, 0, 20)

        this.world3d = world3d
        this.uid = generateUUID()
        this.heightRatio = this.height / this.baseHeight
        this.dead = false
        this.size
        this.boxHelper
        this.healthBar
        this.body = null
        this.character = new THREE.Group()
        this.models = {
            character: null, //die idle unarmedRun
            gun: null
        }
        this.modelKeys = Object.keys(this.models)
        this.layer = layer

        let camera = new Camera(world3d, layer)
        this.camera = camera.manageCamera()
        this.camAudioManager = camera.manageAudio()
        this.camManager = camera

        camera.manageScreenEffects()

    }

    use() {
        this.active = true
        localStorage.setItem('characterId', this.uid)
    }

    unUse() {
        this.active = false
    }

    hit = (bullet) => {

        if (this.health > 0) {

            this.health -= bullet.damage
    
            this.health = Math.max(0, this.health)
    
            updateHealthBar(this.healthBar.healthBar, this.health / this.maxHealth)
    
            if (this.health <= 0) {
                this.die()
            }

        }


    }

    respawn() {


    }

    remove() {
        this.character.visible = false
    }

    die = () => {
        
        this.models.character.act('die', 'once')
        this.healthBar.hide()
        this.gun.hide()

        setTimeout(() => {
            this.remove()
        }, 6000)

    }

    idle = () => {
        this.models.character.act('idle')
    }

    attacked() {

        this.camManager.showBloodEffect()

    }

    async initialize() {

        await this.loadGun()
        await this.loadCharacter()
        
        this.camera.camAudioManager = this.camAudioManager
        this.fpsCamera = new FirstPersonCamera(this.uid, this.heightRatio, this.camera, this.character, this.world3d)
        this.sm = new ShootingManager(this.world3d, this.gun, this.camera, this.camAudioManager, []) //this.world3d.terrain
        this.fpsCamera.input_.addShootingManager(this.sm)
        this.idle()

    }

    async loadGun() {
        this.gun = new Gun(this.world3d, this.camAudioManager, this.gunSize)
        this.models.gun = await this.gun.load()
    }


    initBBox = () => {

        this.boxHelper = new THREE.BoxHelper(this.character, 0xff0000); // Red wireframe box
        //this.world3d.scene.add(this.boxHelper);
        this.box = new THREE.Box3().setFromObject(this.character);
        const size = new THREE.Vector3();
        this.box.getSize(size); // Get the size (width, height, depth) of the bounding box
        this.size = size

        const center = new THREE.Vector3()
        this.box.getCenter(center)
        this.center = center

    }

    setTrace() {

        this.character.gameTag = this.gameTag
        this.character.uid = this.uid
        this.character.health = this.health
        this.character.traverse((child) => {
            child.layers.set(this.layer)
            child.gameTag = this.gameTag
            child.rootParent = this.character
        });

    }

    loadCharacter = async () => {

        this.models.character = new Model(this.world3d)
        await this.models.character.load(this.characterPath)
        this.models.character.setSize(this.height)

    
        this.character.add(this.models.character.model)

        this.world3d.scene.add(this.character)

        this.setTrace()

        this.character.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)

        this.initBBox()


        this.healthBar = new HealthBar(this.world3d, this.layer, this.height, this.baseHeight, this.size.y, this.character)

        this.character.add(this.camera)


        this.camera.position.set(0, this.size.y * this.cameraHeight, this.size.z / 2)

    }



    addTarget(target) {
        this.sm.addTarget(target)
    }

    update = (delta) => {

        if (this.active) {
            if (this.fpsCamera) this.fpsCamera.update(delta)
    
            if (this.sm) this.sm.updateBullets()
            
            this.#copyCameraRotation()
    
            if (this.boxHelper) this.boxHelper.update()
        }


        this.healthBar.update(this.health / this.maxHealth)

        for (let key of this.modelKeys) {

            if (this.models[key])
                this.models[key].update(delta)
        }


    }

    #copyCameraRotation() {

        this.character.children[0].children[0].rotation.z = this.camera.rotation.z - Math.PI

    }

}

