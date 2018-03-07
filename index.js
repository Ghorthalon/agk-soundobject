/** Wrapper around Howler to support preloading of sounds and loading sounds from memory. */
import {Howl, Howler} from 'howler';

const isElectron = true;
let playOnceTimer;

/** One item in the soundObject array of sounds. If you're not modifying this library you need not worry about this constructor as the sound will be returned when you call the soundObject.create() method.
	@constructor
	* @param {string} file - the file to be loaded.
	* @param {function} Callback on loading complete.
	* @param {number} tag - Tags of 1 won't be cleared when you flush the soundObject cache, 0 will be cleared.
*/

class SoundObjectItem {
	constructor(file, callback = 0, tag = 0) {
		const that = this;
		this.onMemory = 0;
		this.fileName = file;
		this.sound = new Howl({
			src: file,
			onload() {
 that.doneLoading();
			}
		});
		this.timeout = setTimeout(() => {
 that.checkProgress();
		}, 2000);
		this.loaded = false;
		this.callback = callback;
		this.timeToLoad = performance.now();
		this.tag = tag;
	}

	/** Checks the progress of the loading sound. */
	checkProgress() {
		if (this.sound.state() === 'loaded') {
			this.doneLoading();
		} else {
			const that = this;
			this.timeout = setTimeout(() => {
 that.checkProgress();
			}, 500);
		}
	}

	/** Callback for when a sound is done loading. */
	doneLoading() {
			clearTimeout(this.timeout);
			this.loaded = true;
			if (this.callback !== 0) {
			this.callback();
			}
	}

	/** Plays the sound. */
	play() {
		this.sound.play();
	}

	/** Stops the sound. */
	stop() {
		this.sound.stop();
	}

	/** Destroys the sound and and unloads it. */
	destroy() {
			this.sound.unload();
	}

	/** Alias for destroy. */
	unload() {
		this.sound.unload();
	}

	/** Fired when you read  the .volume attribute on the sound. */
	get volume() {
		return this.sound.volume();
	}

	/** Fired when you change the .volume attribute of the sound. */
	set volume(v) {
		return this.sound.volume(v);
	}

	/** Fired when you change the .loop property of a sound. */
	set loop(v) {
		return this.sound.loop(v);
	}

	/** Fired when you get the loop property. */
	get loop() {
		return this.sound.loop();
	}

	/** Fired when you get the .playing status of a sound. */
	get playing() {
		return this.sound.playing();
	}

	/** Fired when you read .playbackRate of a sound. */
	get playbackRate() {
		return this.sound.rate();
	}
	/** Fired when you change .playbackRate of a sound. */

	set playbackRate(v) {
		return this.sound.rate(v);
	}

	/** Fired when you get the current elapsed time of a sound. */
	get currentTime() {
		return this.sound.seek();
	}
	/** Fired when you get the duration of the sound. */

	get duration() {
		return this.sound.duration;
	}
	/** Fired when you get the position of a sound. */

	get position() {
		return this.sound.seek();
	}

	/** Fired when you set the current elapsed time of a sound. */
	set currentTime(v) {
		return this.sound.seek(v);
	}

	/** Alias for setCurrentTime */
	seek(time) {
		return this.sound.seek(time);
	}
}

/** Base class for SoundObject. */
class SoundObject {
	constructor() {
		this.sounds = new Array();
		this.oneShots = new Array();
		this.debug = false;
		this.loadingQueue = false;
		this.queueCallback = 0;
		this.loadedSounds = 0;
		this.loadingSounds = 0;
		this.loadedCallback = 0;
		this.queue = new Array();
		this.queueLength = 0;
		this.statusCallback = null;
/*
		if (Howler.codecs('opus') === true) {
			this.extension = '.opus';
			this.directory = './soundsopus/';
		} else {
			this.directory = '../soundsm4a/';
			this.extension = '.m4a';
		}
*/
this.directory = "./sounds/";
this.extension = ".wav";
		this.oneShotSound = null;
	}

	/** Set the callback function on status changes, mainly for loading queue.
	* @param {function} callback - Function to be called expecting one parameter containing the percentage.
*/

	setStatusCallback(callback) {
		this.statusCallback = callback;
	}

	/** Internal function to find the sound file in memory based on a filename. */
	findSound(file) {
		for (const i in this.sounds) {
			if (this.sounds[i].fileName === file) {
				return this.sounds[i];
			}
		}
		return -1;
	}

	/** Internal function to find a sound file based on it's index in the sounds array. */
	findSoundIndex(file) {
		for (const i in this.sounds) {
			if (this.sounds[i].fileName === file) {
				return i;
			}
		}
		return -1;
	}

	/** Unloads all sounds preloaded in the queue and resets all callbacks. */
	resetQueuedInstance() {
		for (let i = 0; i < this.sounds.length; i++) {
			if (typeof this.sounds[i] !== 'undefined') {
				if (this.sounds[i].tag === 1) {
									this.sounds[i].sound.unload();
					this.sounds.splice(i, 1);
				}
			}
		}

		this.loadingQueue = false;
		this.queueCallback = 0;
		this.loadedSounds = 0;
		this.loadingSounds = 0;
		this.loadedCallback = 0;
		this.queue = new Array();
		this.queueLength = 0;
		this.statusCallback = null;
	}

	/** Creates an audio object from a file path using the set directory + this filename + the set extension.
	* @param {string} file - the relative filepath to the file from the set directory without extension.
	* @return {object} a soundObject item of the loaded sound.
*/
	create(file) {
		file = this.directory + file + this.extension;
		console.log('Loading: ' + file);
		let returnObject = null;
		const that = this;
		returnObject = new SoundObjectItem(file, (() => {
 that.doneLoading();
		}));
								this.sounds.push(returnObject);
								return returnObject;
	}

	/** Enqueue a file to be preloaded.
	* @param {string} file - the relative to the path without the base directory and extension.
*/
	enqueue(file) {
		file = this.directory + file + this.extension;
		this.queue.push(file);
		this.queueLength = this.queue.length;
	}

	/** Starts loading the enqueued files. */
	loadQueue() {
			this.handleQueue();
			this.loadingQueue = true;
	}

	/** Set the callback that gets called upon completion of queue loading.
	* @param {function} callback - the callback to be called.
	*/
	setQueueCallback(callback) {
		this.queueCallback = callback;
	}

	/** Resets the loading queue. */
	resetQueue() {
		this.queue = new Array();
		this.loadingQueue = false;
	}

	/** Internal function to advance the queue if a file has finished loading. */
	handleQueue() {
		if (this.queue.length > 0) {
			const that = this;
			if (typeof this.statusCallback !== 'undefined' && this.statusCallback !== null) {
				this.statusCallback(1 - this.queue.length / this.queueLength);
			}
			if (this.findSound(this.queue[0]) !== -1) {
				this.queue.splice(0, 1);
				this.handleQueue();
				return;
			}
			this.sounds.push(new SoundObjectItem(this.queue[0], (() => {
 that.handleQueue();
			}), 1));
			this.queue.splice(0, 1);
		} else {
			this.loadingQueue = false;
				console.log('finished with queue.');
				if (typeof this.queueCallback !== 'undefined' && this.queueCallback !== 0) {
					this.queueCallback();
				}
		}
	}

	/** Internal function to set the callback when a file has finished loading. */
	setCallback(callback) {
		this.loadedCallback = callback;
	}

	/** Internal function to be called when something's done loading. */
	doneLoading() {
		const result = this.isLoading();

		if (result === 1) {
			if (typeof this.loadedCallback !== 'undefined' && this.loadedCallback !== 0 && this.loadedCallback !== null) {
				this.loadedCallback();
			}
		}
	}

	/** Internal function to find out which sounds are still loading. */
	isLoading() {
		const loading = 0;
		this.loadedSounds = 0;
		this.loadingSounds = 0;
		const stillLoading = new Array();
		for (let i = 0; i < this.sounds.length; i++) {
			if (typeof this.sounds[i] !== 'undefined') {
				if (this.sounds[i].loaded === false) {
					this.loadingSounds++;
				} else {
					this.loadedSounds++;
				}
			}
		}

		return this.loadedSounds / this.sounds.length;
	}

	/** Plays a sound once, then destroys it.
	* @param {string} file - the relative path to the file without base directory and extension.
	*/
	playOnce(file) {
		this.oneShotSound = so.create(file);
		this.oneShots.push(this.oneShotSound);
		this.oneShotSound.play();
		const toDestroy = new Array();
		const that = this;
		this.oneShotSound.on('ended', () => {
			for (var i = 0; i < that.oneShots.length; i++) {
				if (that.oneShots[i].playing === false) {
that.oneShots[i].unload();
toDestroy.push(i);
				}
			}
			for (var i = 0; i < toDestroy.length; i++) {
				if (that.oneShotSounds[i].playing === false) {
				that.oneShotSounds.splice(toDestroy[i], 1);
				}
			}
		 });
	}
	/** Internal function to destroy a file. */

	destroy(file, callback = 0) {
		let noMore = false;
		const filename = this.directory + file + this.extension;
		while (!noMore) {
			const found = this.findSoundIndex(filename);
			if (found === -1 || this.sounds[found].sound.data === null) {
				noMore = true;
			} else {
																																				this.sounds[found].sound.unload();
												this.sounds.splice(found, 1);
			}
		}
		if (callback !== 0) {
callback();
		}
	}

	/** Whatever this does... I think it unloads everything. This lib needs a complete overhaul... Too many people had their fingers in here. */
	kill(callback = 0) {
		while (this.sounds.length > 0) {
															this.sounds[0].sound.unload();
					this.sounds.splice(0, 1);
		}
		if (callback !== 0) {
callback();
		}
	}
}
const so = new SoundObject();
export default so;
