import { Model } from "./model"

export class Gun {

    constructor(world3d, camAudioManager, size) {

        this.bulletsPerMinute = 300
        this.isAutomatic = true
        this.gunSound = 'm4_silencer'
        this.gunPath = 'models/weapons/csgo_weapon_m4.glb'
        this.world3d = world3d
        this.gunSize = size
        this.camAudioManager = camAudioManager
        this.cadence = this.#getCadence()
        this.model = null
        this.sound = null

    }

    hide() {
        this.model.hide()
    }

    update(delta) {
        this.model.update(delta)
    }

    shoot() {
        this.camAudioManager.playSound(this.gunSound)
    }

    load = async () => {

        this.model = new Model(this.world3d)
        await this.model.load(this.gunPath)
        this.model.setSize(this.gunSize)
        
        this.camAudioManager.camera.add(this.model.model);
        this.model.model.rotation.set(-Math.PI, 0, -Math.PI);
        this.model.model.position.set(0.1, -0.2, 0.1);

        return this.model

    }

    #getCadence() {
        return (1000 / (this.bulletsPerMinute / 60))
    }

}