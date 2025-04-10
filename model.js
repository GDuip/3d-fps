
import * as THREE from 'three';

export class Model{

    constructor(world3d) {

        this.world3d = world3d
        this.model = null
        this.animations = null
        this.scale = null
        this.size = null
        this.center = null
        this.box = null
        this.boxHelper = null
        this.mixer = null
        this.actions = {}
        this.currentAction = null

    }

    setSize(size) {

        this.scale = size / this.size.y

        this.model.scale.set(this.scale, this.scale, this.scale)
        this.model.updateMatrixWorld(true)

        this.updateDimensions()

    }

    hide() {
        this.model.visible = false
    }

    async load(modelPath) {

        //Load
        let gltf = await this.world3d.loadModel(modelPath)
        this.model = gltf.scene
        this.animations = gltf.animations

        //BBox
        this.boxHelper = new THREE.BoxHelper(this.model, 0xff0000); // Red wireframe box
        //this.world3d.scene.add(this.boxHelper);
        this.box = new THREE.Box3().setFromObject(this.model);

        //Animations mixer
        this.mixer = new THREE.AnimationMixer(this.model)

        if (this.animations && this.animations.length > 0) {

            this.animations.forEach(animationClip => {

              const action = this.mixer.clipAction(animationClip);
              
              this.actions[animationClip.name] = action

            });

          }

          this.updateDimensions()

    }

    updateAnimations = (delta) => {

        this.mixer.update(delta)

    }

    update = (delta) => {

        this.updateAnimations(delta)

    }

    handlePreviousAction(action) {

        // Ensure the current action smoothly fades out
        if (this.currentAction) {
            this.currentAction.crossFadeTo(action, 0.5, true) // Smooth transition over 0.5 seconds
        } else {
            action.fadeIn(0.5) // Fade in if there is no current action
        }
    
        // Reset and play the new action
        action.reset()

        action.timeScale = 1;
        this.mixer.timeScale = 1; // Ensure the time scale is set to 1 for normal speed
        
        action.play()
    
        // Update the current action reference
        this.currentAction = action;
    }

    act(actionName, loop = 'repeat') {
        let action = this.actions[actionName]

        if (loop === 'repeat') {
            action.setLoop(THREE.LoopRepeat)
        } else if (loop === 'once') {
            action.clampWhenFinished = true;  // Keeps the model in the last frame of the animation
            action.setLoop(THREE.LoopOnce)
        }

        this.handlePreviousAction(action)
    }

    getState() {

        if (this.currentAction) {
            return this.currentAction._clip.name
        }

        return false

    }

    doActionCicle() {
        const actionNames = Object.keys(this.actions); // Get all action names
        let currentIndex = 0; // Start with the first action
    
        const playNextAction = () => {

            const actionName = actionNames[currentIndex];
            const action = this.actions[actionName];
    
            this.handlePreviousAction(action); // Smoothly transition to the next action
    
            // Move to the next action in the list
            currentIndex = (currentIndex + 1) % actionNames.length; // Circular increment
    
            // Set a timeout to play the next action after 5 seconds
            setTimeout(playNextAction, 5000); // 5000 milliseconds = 5 seconds

        };
    
        // Start the action cycle
        playNextAction();
    }    

    updateDimensions() {

        const size = new THREE.Vector3();
        this.box.getSize(size); // Get the size (width, height, depth) of the bounding box
        this.size = size

        const center = new THREE.Vector3()
        this.box.getCenter(center)
        this.center = center

    }

}