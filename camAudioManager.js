import * as THREE from 'three';

export class CameraAudioManager {

    constructor(camera) {
        this.camera = camera;
        this.replicated = 5

        // 1. Create the AudioListener and attach it to the camera
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        // 2. Get the audio context from the listener
        // const audioContext = this.listener.context;

        // // 3. Create a dynamics compressor and configure it
        // this.compressor = audioContext.createDynamicsCompressor();
        // this.compressor.threshold.setValueAtTime(-20, audioContext.currentTime);
        // this.compressor.knee.setValueAtTime(20, audioContext.currentTime);
        // this.compressor.ratio.setValueAtTime(6, audioContext.currentTime);
        // this.compressor.attack.setValueAtTime(0.01, audioContext.currentTime);
        // this.compressor.release.setValueAtTime(0.1, audioContext.currentTime);
        

        // // 4. Connect the listener's gain node to the compressor
        // this.listener.gain.connect(this.compressor);

        // // 5. Connect the compressor to the audio context's destination
        // this.compressor.connect(audioContext.destination);

        // 6. Set up the audio loader and sounds
        this.audioLoader = new THREE.AudioLoader();
        this.sounds = {};
    }

    async loadSound(path, tag, volume=1.0) {

        this.sounds[tag] = {individualSounds: [], index: 0, activeSounds: 0, volume: volume}
        
        this.audioLoader.load( path, ( buffer ) => {
            
            for (let i = 0; i < this.replicated; i++) {

                const sound = new THREE.PositionalAudio( this.listener );
                sound.setLoop(false)
                sound.setBuffer( buffer );
                sound.setVolume(volume); // Adjust the volume level as needed (0.0 to 1.0)
                sound.setRefDistance( 20 );
                // Connect the sound to the compressor
                //sound.getOutput().connect(this.compressor);

                this.sounds[tag].individualSounds.push(sound)

            }

        });

    }

    async loadNonPositionalSound(path, tag, volume=1.0) {

        this.sounds[tag] = {individualSounds: [], index: 0, activeSounds: 0, volume: volume}
        
        this.audioLoader.load( path, ( buffer ) => {
            
            for (let i = 0; i < this.replicated; i++) {

                const sound = new THREE.Audio( this.listener );
                sound.setLoop(false)
                sound.setBuffer( buffer )
                sound.setVolume(volume) // Adjust the volume level as needed (0.0 to 1.0)
                // Connect the sound to the compressor
                //sound.getOutput().connect(this.compressor);
                this.sounds[tag].individualSounds.push(sound)

            }

        });

    }

    getSounds(subTag) {
        let res = {}

        for ( let key of Object.keys(this.sounds)) {
     
            if (key.indexOf(subTag) == 0)
                res[key] = this.sounds[key]
        }

        return res
    }

    playSound(tag) {
        const soundElement = this.sounds[tag]
        const sound = soundElement.individualSounds[soundElement.index]
        soundElement.index = (soundElement.index + 1) % this.replicated
    
        if (sound) {

            // if (soundElement.activeSounds >= this.replicated) {
            //     console.log('Max simultaneous sounds reached, skipping this sound')
            //     return // Skip playing this sound to prevent saturation
            // }

            // Stop the sound if it's already playing to reset it
            if (sound.isPlaying) {
                sound.stop() // Stop the current sound to reset it
            }

            let volumeAdjustment = Math.max(0.1, soundElement.volume / (soundElement.activeSounds + 1))
            sound.setVolume(volumeAdjustment)

            sound.currentTime = 0
            sound.play()
            soundElement.activeSounds += 1

            sound.onEnded = () => {
                soundElement.activeSounds = Math.max(0, soundElement.activeSounds - 1)
            };
            // // Introduce a small random delay (e.g., between 0 and 50ms)
            // const delay = Math.random() * 50;
            
            // setTimeout(() => {
            // }, delay);
    
        } else {
            console.log('No individual sounds available');
        }
    }
    

    getSound(tag) {

        return this.sounds[tag]

    }

}