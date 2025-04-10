import * as THREE from 'three';
import { Bullet } from './bullet';

export class ShootingManager {

    constructor(world3d, gun, camera, camAudioManager, availableTargets) {

        this.gun = gun;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.enableAll();
        this.raycaster.far = 10000
        this.raycasterOrigin = new THREE.Vector3();
        this.raycasterDirection = new THREE.Vector3();

        this.world3d = world3d
        this.scene = world3d.scene;
        this.bullets = [];
        this.camera = camera
        this.availableTargets = availableTargets
        this.camAudioManager = camAudioManager

        this.rayHelper = false

        if (this.rayHelper) {
            this.rayHelper = new THREE.ArrowHelper(this.raycasterDirection, this.raycasterOrigin, 10, 0xff0000)
            this.world3d.scene.add(this.rayHelper)
        }
        
        this.shooting = false
        this.shootingInterval = null
        this.isAutomatic = this.gun.isAutomatic
        

    }

    shoot = () => {

        this.gun.shoot()
        this.#addBullet()


    }

    stopShooting() {
        clearInterval(this.shootingInterval);
        this.shooting = false;
    }

    startShooting() {

        if (this.isAutomatic) {
            if (!this.shooting) {
                this.shooting = true;
                this.shoot()
                this.shootingInterval = setInterval(() => {
                    this.shoot()
                }, this.gun.cadence) // Adjust the interval time (200 ms) as needed for automatic firing rate
            }
        } else {
            // Semiautomatic fires only once per trigger pull
            if (!this.shooting) {
                this.shoot();
                this.shooting = true; // Prevent continuous shooting until the mouse button is released
            }
        }

    }

    #addBullet() {

        let obj = new THREE.Object3D()
        this.bullets.push(new Bullet(this.world3d, obj, this.camera))

    }

    removeBullet(bullet) {
        // NOTE Remove bullet from the world
        bullet.remove()

        this.bullets.splice(this.bullets.indexOf(bullet), 1)
    }

    onTargetHit = async (target, bullet) => {

        // const boxHelper = new THREE.BoxHelper(target.object, 0xff0000); // Red wireframe box
        // this.world3d.scene.add(boxHelper);

        let parent = target.object.rootParent

        // this.world3d.addSphere(target.point, 1)

        if (parent) {

            if (parent.gameTag.includes('character')) {
                
                let character = this.world3d.characters.find(c => c.uid === parent.uid)
                character.hit(bullet)

            }

            let soundName
            if (target.object.name === 'Paladin_J_Nordstrom') soundName = 'headshot'
            else soundName = 'bullet_hit'
            this.camAudioManager.playSound(soundName)

        } 

    }

    updateBullets = () => {

        [...this.bullets].forEach((bullet) => {

            // NOTE Raycast from each bullet and see if it hit any target compatible with the idea of being hit by a bullet
            bullet.model.getWorldPosition(this.raycasterOrigin)
            bullet.model.getWorldDirection(this.raycasterDirection)

            // Ensure the direction is unitary
            this.raycasterDirection.normalize()
            this.raycasterDirection.multiplyScalar(-1)

            if (this.rayHelper) {
                this.rayHelper.setDirection(this.raycasterDirection);
                this.rayHelper.setLength(10); // You can adjust the length dynamically if needed
                this.rayHelper.position.copy(this.raycasterOrigin);
            }

            this.raycaster.set(this.raycasterOrigin, this.raycasterDirection)

            const hits = this.raycaster.intersectObjects(this.availableTargets, true)

            const remove = bullet.manage()
            if (remove) this.removeBullet(bullet)
            

            if (hits.length > 0) {

                const firstHitTarget = hits[0]

                // NOTE React to being hit by the bullet in some way, for example:
                this.onTargetHit(firstHitTarget, bullet)

                this.removeBullet(bullet)

            }

            // NOTE If no target was hit, just travel further, apply gravity to the bullet etc.
            bullet.model.position.add(this.raycasterDirection.multiplyScalar(bullet.speed));

        });
    };

    addTarget(target) {
        this.availableTargets.push(target)
    }

}
