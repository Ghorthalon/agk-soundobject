#AGK-SoundObject

## Quick wrapper around Howler to improve preloading of sounds and loading sounds from memory

When you need to load a lot of sounds and those sounds aren't in audio sprites it can take a lot of time. Also, loading a lot of files at once sometimes messes up the webserver or your connection. This wrapper allows you to queue files to be loaded which will load one after another to circumvent theseproblems. Not the most elegant solution, however it does fix those problems.
It also wraps the API of whatever sound library in use, so it can be quickly switched out without rewriting a lot of the code in the actual game.

## installation

Using NPM:
npm install agk-soundobject

## usage

import so from "agk-soundobject"

// By default, SoundObject tries to determine the best extension to use. This can be overridden.
// Set the sound directory
so.directory = "./sounds/";
// set the extension
so.extension = ".webm";

// load the meow.webm file in the sounds directory.
const sound = so.create("meow");
// play the sound
sound.play();
// change volume to 50%
sound.volume = 0.5;
// Play the sound at half speed
sound.playbackRate = 0.5;
// check if the sound is playing
console.log(sound.playing);
// check the current time
console.log(sound.currentTime);
// Destroy the sound
sound.destroy();

## Contributing

This library needs major refactoring at the moment. It will probably change code-wise, but the API will stay similar. If you want to help make it better it would be greatly appreciated.

## License

This code is MIT licensed.
More info in LICENSE.md