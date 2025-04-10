
import { createHealthBar, updateHealthBar } from "./utils"

export class HealthBar{

    constructor(world3d, layer, height, baseHeight, sizeY, character) {

        this.healthBar = createHealthBar()
        this.healthBar.position.set(0, sizeY * 1.05, 0)
        this.health = 100
        this.maxHealth = 100
        this.world3d = world3d
        this.layer = layer
        this.height = height
        this.baseHeight = baseHeight
        this.character = character

        this.healthBar.scale.multiplyScalar(this.height / this.baseHeight)
        this.healthBar.layers.set(this.layer)
        this.world3d.scene.add(this.healthBar)

        this.character.add(this.healthBar);

    }

    hide() {
        this.healthBar.visible = false
    }

    update(healthPercentage) {
        updateHealthBar(this.healthBar, healthPercentage)
    }

}