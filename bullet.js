
export class Bullet {

    constructor(world3d, model, camera) {

        this.world3d = world3d
        this.model = model
        this.camera = camera

        this.world3d.scene.add(model)
        this.camera.getWorldPosition(this.model.position)
        this.camera.getWorldQuaternion(this.model.quaternion)

        this.initialPosition = this.model.position.clone()

        this.maxDistance = 100
        this.damage = 20
        this.distance = 0
        this.speed = 10000

    }

    manage() {
        this.distance = this.initialPosition.distanceTo(this.model.position)
        if (this.distance > this.maxDistance) return true
        return false 
    }

    remove() {
        this.model.removeFromParent()
    }

}