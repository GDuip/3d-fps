import * as THREE from 'three';
import { getBloodMesh } from './functions';
import { CameraAudioManager } from './camAudioManager';

export class Camera {

    constructor(world3d, layer) {

        this.controls = null
        this.camera = null
        this.world3d = world3d
        this.layer = layer
        this.camAudioManager = null
        this.bloodMesh = null

    }

    manageCamera = () => {

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000)

        for (let i = 0; i < 32; i++) {

            if (i !== this.layer) this.camera.layers.enable(i)
            else this.camera.layers.disable(i)

        }

        this.world3d.scene.add(this.camera);

        return this.camera

    }


    manageAudio = () => {

        let camAudioManager = new CameraAudioManager(this.camera)

        //general non positional audio
        let audioFolder = './audio/'
        camAudioManager.loadNonPositionalSound(audioFolder + 'm4_silencer_short.mp3', 'm4_silencer', 0.3)
        camAudioManager.loadNonPositionalSound(audioFolder + 'blaster.mp3', 'blaster')
        camAudioManager.loadNonPositionalSound(audioFolder + 'cod_zombies_round.mp3', 'cod_zombies_round')
        camAudioManager.loadNonPositionalSound(audioFolder + 'linkedin_msg.mp3', 'linkedin_msg')
        camAudioManager.loadNonPositionalSound(audioFolder + 'fortnite_headshot.mp3', 'headshot')
        camAudioManager.loadNonPositionalSound(audioFolder + 'bullet_hit.mp3', 'bullet_hit', 0.5)
  

        //zombies sound
        let zombiesFolder = audioFolder + 'zombies/'
        camAudioManager.loadSound(zombiesFolder + 'zombie_35.mp3', "zombie_35")
        camAudioManager.loadSound(zombiesFolder + 'zombie_38.mp3', "zombie_38")
        camAudioManager.loadSound(zombiesFolder + 'zombie_39.mp3', "zombie_39")
        camAudioManager.loadSound(zombiesFolder + 'zombie_40.mp3', "zombie_40")
        camAudioManager.loadSound(zombiesFolder + 'zombie_41.mp3', "zombie_41")

        camAudioManager.loadSound(zombiesFolder + 'human_zombie_hit.mp3', "zombie_hit")

        this.camAudioManager = camAudioManager

        return this.camAudioManager

    }

    manageScreenEffects = () => {
        this.bloodMesh = getBloodMesh()
    }

    showBloodEffect() {

        // Add the blood mesh to the camera so it appears on the screen
        this.camera.add(this.bloodMesh);

        // Set a timeout to remove the blood effect after 1 second (1000 milliseconds)
        setTimeout(() => {
            this.camera.remove(this.bloodMesh);
        }, 3000);

    }

}