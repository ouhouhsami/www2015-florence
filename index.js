"use strict";


/* Prefix */

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);


/* AudioContext */

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/* decodeAudioData */

const snareDrumURL = './media/sd.wav';
const bassDrumURL = './media/bd.wav';

const bassDrumBt = document.querySelector("#bassDrumBt");
const snareDrumBt = document.querySelector("#snareDrumBt");

function loadSample(url){
    return new Promise(function(resolve, reject){
        fetch(url)
        .then((response) => {
            return response.arrayBuffer()
        })
        .then((buffer) =>{
            audioContext.decodeAudioData(buffer, (decodedAudioData) =>{
                resolve(decodedAudioData);
            })
        });
    })
};

const samples = Promise.all([loadSample(bassDrumURL), loadSample(snareDrumURL)])
.then(onSamplesDecoded);


/* AudioBufferSourceNode */

function playSample(buffer){
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(audioContext.destination);
    bufferSource.start();
}

function onSamplesDecoded(buffers){
    bassDrumBt.onclick = (evt) => {
        playSample(buffers[0]);
    }
    snareDrumBt.onclick = (evt) => {
        playSample(buffers[1]);
    }
}


/* MediaElementAudioSourceNode */

const guitarRiff = document.querySelector('#guitarRiff');
const guitarMediaElementSource = audioContext.createMediaElementSource(guitarRiff);

guitarMediaElementSource.connect(audioContext.destination)


/* MediaStreamAudioSourceNode */

let localStream;
const liveAudioInputBt = document.querySelector("#liveAudioInputBt");

liveAudioInputBt.onclick = function(evt){
    if (evt.target.checked) {
        navigator.getUserMedia({audio: true}, (stream) => {
            localStream = stream;
            const streamSource = audioContext.createMediaStreamSource(localStream);
            streamSource.connect(audioContext.destination);
        },
        function(err){console.log(err)});
    } else {
        localStream.stop();
    }
}


/* MediaStreamAudioDestinationNode */

const liveAudioOutputBt = document.querySelector("#liveAudioOutputBt");

liveAudioOutputBt.onclick = function(evt){
    if(evt.target.checked){
        var dest = audioContext.createMediaStreamDestination();
        guitarMediaElementSource.connect(dest);
        // Connect to peer to send stream
        var peer = new Peer('stream-gtr', {key: 'ubgje3sm5p0evcxr',
            debug: 3,
            logFunction: function() {
                var copy = Array.prototype.slice.call(arguments).join(' ');
            }
        });
        peer.on('call', function(call) {
            call.answer(dest.stream);
        });
    }
    else {
        // Disconnect peer
    }
}


/* ScriptProcessorNode */


const drumsLoop = document.querySelector('#drumsLoop');

const drumsLoopMediaElementSource = audioContext.createMediaElementSource(drumsLoop);
const scriptNode = audioContext.createScriptProcessor(16384, 1, 1);
drumsLoopMediaElementSource.connect(scriptNode)
scriptNode.connect(audioContext.destination)

scriptNode.bits = 8; // between 1 and 16
scriptNode.normfreq = 0.05; // between 0.0 and 1.0

let step = Math.pow(1/2, scriptNode.bits);
let phaser = 0;
let last = 0;


scriptNode.onaudioprocess = function(audioProcessingEvent) {

    let inputBuffer = audioProcessingEvent.inputBuffer;
    let outputBuffer = audioProcessingEvent.outputBuffer;

    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        let input = inputBuffer.getChannelData(channel);
        let output = outputBuffer.getChannelData(channel);
        for (let i = 0; i < 16384; i++) {
            phaser += scriptNode.normfreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    }
}

/* GainNode */

const drumsLoop2 = document.querySelector('#drumsLoop2');
const gainSlider = document.querySelector('#gainSlider');

const drumsLoop2MediaElementSource = audioContext.createMediaElementSource(drumsLoop2);
const gainNode = audioContext.createGain();

drumsLoop2MediaElementSource.connect(gainNode)
gainNode.connect(audioContext.destination)

gainSlider.oninput = function(evt){
    gainNode.gain.value = evt.target.value
}

/* BiquadFilterNode */

const drumsLoop3 = document.querySelector('#drumsLoop3');
const biquadFilterFrequencySlider = document.querySelector('#biquadFilterFrequencySlider');
const biquadFilterDetuneSlider = document.querySelector('#biquadFilterDetuneSlider');
const biquadFilterQSlider = document.querySelector('#biquadFilterQSlider');
const biquadFilterGainSlider = document.querySelector('#biquadFilterGainSlider');
const biquadFilterTypeSelector = document.querySelector('#biquadFilterTypeSelector');

const drumsLoop3MediaElementSource = audioContext.createMediaElementSource(drumsLoop3);
const filterNode = audioContext.createBiquadFilter();

drumsLoop3MediaElementSource.connect(filterNode)
filterNode.connect(audioContext.destination)

biquadFilterFrequencySlider.oninput = function(evt){
    filterNode.frequency.value = parseFloat(evt.target.value);
}

biquadFilterDetuneSlider.oninput = function(evt){
    filterNode.detune.value = parseFloat(evt.target.value);
}

biquadFilterQSlider.oninput = function(evt){
    filterNode.Q.value = parseFloat(evt.target.value);
}

biquadFilterGainSlider.oninput = function(evt){
    filterNode.gain.value = parseFloat(evt.target.value);
}

biquadFilterTypeSelector.onchange = function(evt){
    filterNode.type = evt.target.value;
}

/* DelayNode */

const guitarChunk = document.querySelector('#guitar-chunk');
const guitarChunkMediaElementSource = audioContext.createMediaElementSource(guitarChunk);
const delayNodeDelaySlider = document.querySelector('#delayNodeDelaySlider');

const delayNode = audioContext.createDelay();

guitarChunkMediaElementSource.connect(delayNode)
guitarChunkMediaElementSource.connect(audioContext.destination)
delayNode.connect(audioContext.destination)

delayNodeDelaySlider.oninput = function(evt){
    delayNode.delayTime.value = parseFloat(evt.target.value);
}

/* PannerNode */

const guitarMono = document.querySelector("#guitar-mono");
const guitarMonoMediaElementSource = audioContext.createMediaElementSource(guitarMono);

const pannerNodeXSlider = document.querySelector("#pannerNodeXSlider");
const pannerNodeYSlider = document.querySelector("#pannerNodeYSlider");
const pannerNodeZSlider = document.querySelector("#pannerNodeZSlider");

const pannerNode = audioContext.createPanner();

pannerNode.panningModel = 'HRTF';
pannerNode.distanceModel = 'inverse';
pannerNode.refDistance = 1;
pannerNode.maxDistance = 10000;
pannerNode.rolloffFactor = 1;
pannerNode.coneInnerAngle = 360;
pannerNode.coneOuterAngle = 0;
pannerNode.coneOuterGain = 0;

let xPanner = 0, yPanner = 0, zPanner = 0;

guitarMonoMediaElementSource.connect(pannerNode);
pannerNode.connect(audioContext.destination);

pannerNodeXSlider.oninput = function(evt){
    pannerNode.setPosition(parseFloat(evt.target.value), yPanner, zPanner);
}
pannerNodeYSlider.oninput = function(evt){
    pannerNode.setPosition(xPanner, parseFloat(evt.target.value), zPanner);
}
pannerNodeZSlider.oninput = function(evt){
    pannerNode.setPosition(xPanner, yPanner, parseFloat(evt.target.value));
}

/* ConvolverNode */

const guitarMono2 = document.querySelector("#guitar-mono2");
const guitarMono2MediaElementSource = audioContext.createMediaElementSource(guitarMono2);
const convolverNode = audioContext.createConvolver();
const impulseURL = './media/Scala-Milan-Opera-Hall.wav';

loadSample(impulseURL).then(function(buffer){
    convolverNode.buffer = buffer;
}, function(err){console.log(err)});

guitarMono2MediaElementSource.connect(convolverNode);
convolverNode.connect(audioContext.destination);

/* AnalyserNode */

const guitarMono3 = document.querySelector("#guitar-mono3");
const canvas = document.querySelector("#canvasContext");
const canvasContext = canvas.getContext("2d");
const guitarMono3MediaElementSource = audioContext.createMediaElementSource(guitarMono3);
const width=300;
const height=255;
let drawVisual;

const analyserNode = audioContext.createAnalyser();

analyserNode.fftSize = 128;
let bufferLength = analyserNode.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);
canvasContext.clearRect(0, 0, width, height);

guitarMono3MediaElementSource.connect(analyserNode);
analyserNode.connect(audioContext.destination);

function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyserNode.getByteFrequencyData(dataArray);

  canvasContext.fillStyle = 'rgb(0, 0, 0)';
  canvasContext.fillRect(0, 0, width, height);

  var barWidth = width / bufferLength;
  var barHeight;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    canvasContext.fillStyle = 'rgb(' + barHeight + ','+ (255-barHeight) +','+ (255-barHeight) +')';
    canvasContext.fillRect(x,height-barHeight,barWidth,barHeight);

    x += barWidth + 1;
}
};
draw();

/* ChannelSplitterNode */

const guitarRiff1 = document.querySelector("#guitarRiff1");
const leftGainSlider = document.querySelector("#leftGainSlider");
const rightGainSlider = document.querySelector("#rightGainSlider");

const guitarRiff1MediaElementSource = audioContext.createMediaElementSource(guitarRiff1);

const channelSplitterNode = audioContext.createChannelSplitter(2)
const channelMergerNode = audioContext.createChannelMerger(2)
const gainLNode = audioContext.createGain();
const gainRNode = audioContext.createGain();

guitarRiff1MediaElementSource.connect(channelSplitterNode)
channelSplitterNode.connect(gainLNode, 0);
channelSplitterNode.connect(gainRNode, 1);
gainLNode.connect(channelMergerNode, 0, 0)
gainRNode.connect(channelMergerNode, 0, 1)
channelMergerNode.connect(audioContext.destination)

leftGainSlider.oninput = function(evt){
    gainLNode.gain.value = parseFloat(evt.target.value);
}

rightGainSlider.oninput = function(evt){
    gainRNode.gain.value = parseFloat(evt.target.value);
}

/* DynamicsCompressorNode */

const guitarCompressor = document.querySelector("#guitar-compressor");
const guitarCompressorMediaElementSource = audioContext.createMediaElementSource(guitarCompressor);
const dynamicCompressorNode = audioContext.createDynamicsCompressor();

const thresholdCompressorSlider = document.querySelector("#thresholdCompressorSlider");
const kneeCompressorSlider = document.querySelector("#kneeCompressorSlider");
const ratioCompressorSlider = document.querySelector("#ratioCompressorSlider");
const reductionCompressorSlider = document.querySelector("#reductionCompressorSlider");
const attackCompressorSlider = document.querySelector("#attackCompressorSlider");
const releaseCompressorSlider = document.querySelector("#releaseCompressorSlider");

guitarCompressorMediaElementSource.connect(dynamicCompressorNode);
dynamicCompressorNode.connect(audioContext.destination);

thresholdCompressorSlider.oninput = function(evt){
    dynamicCompressorNode.threshold.value = parseFloat(evt.target.value);
}
kneeCompressorSlider.oninput = function(evt){
    dynamicCompressorNode.knee.value = parseFloat(evt.target.value);
}
ratioCompressorSlider.oninput = function(evt){
    dynamicCompressorNode.ratio.value = parseFloat(evt.target.value);
}
reductionCompressorSlider.oninput = function(evt){
    dynamicCompressorNode.reduction.value = parseFloat(evt.target.value);
}
attackCompressorSlider.oninput = function(evt){
    dynamicCompressorNode.attack.value = parseFloat(evt.target.value);
}
releaseCompressorSlider.oninput = function(evt){
    dynamicCompressorNode.release.value = parseFloat(evt.target.value);
}

/* WaveShaperNode */

const drumsLoop4 = document.querySelector("#drumsLoop4");
const amountDistortionSlider = document.querySelector('#amountDistortionSlider');
const drumsLoop4MediaElementSource = audioContext.createMediaElementSource(drumsLoop4);
const distortion = audioContext.createWaveShaper()

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
  n_samples = 44100,
  curve = new Float32Array(n_samples),
  deg = Math.PI / 180,
  i = 0,
  x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
}
return curve;
};


distortion.curve = makeDistortionCurve(0);
distortion.oversample = '4x';

drumsLoop4MediaElementSource.connect(distortion);
distortion.connect(audioContext.destination)

amountDistortionSlider.oninput = function(evt){
    distortion.curve = makeDistortionCurve(parseInt(evt.target.value));
}

/* OscillatorNode */

const frequencyOscillatorSlider = document.querySelector('#frequencyOscillatorSlider');
const startOscillator = document.querySelector('#startOscillator');
const stopOscillator = document.querySelector('#stopOscillator');

let oscillator;

stopOscillator.onclick = function(evt){
    oscillator.stop();
}
startOscillator.onclick = function(evt){
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    oscillator.connect(audioContext.destination)
    oscillator.start();
}
frequencyOscillatorSlider.oninput = function(evt){
    oscillator.frequency.value = parseFloat(evt.target.value);
}


/* AudioParam */

const attackADSR = document.querySelector('#attackADSR');
const decayADSR = document.querySelector('#decayADSR');
const sustainADSR = document.querySelector('#sustainADSR');
const releaseADSR = document.querySelector('#releaseADSR');

const startADSROscillator = document.querySelector('#startADSROscillator');
const stopADSROscillator = document.querySelector('#stopADSROscillator');

const adsrNode = audioContext.createGain();
let adsrOscillator;


adsrOscillator = audioContext.createOscillator();
adsrOscillator.type = 'sine';
adsrOscillator.frequency.value = 440;
adsrNode.gain.value = 0;

adsrOscillator.connect(adsrNode);
adsrNode.connect(audioContext.destination);
adsrOscillator.start(0);

stopADSROscillator.onclick = function(evt){
    // adsrOscillator.stop();
}
startADSROscillator.onclick = function(evt) {
    const attackTime = parseFloat(attackADSR.value);
    const releaseTime = parseFloat(releaseADSR.value);
    const decayTime = parseFloat(decayADSR.value);
    const sustainTime = parseFloat(sustainADSR.value);
    const now = audioContext.currentTime;

    adsrNode.gain.cancelScheduledValues(now);
    adsrNode.gain.setValueAtTime(adsrNode.gain.value, now);
    adsrNode.gain.linearRampToValueAtTime(0.7, now + attackTime);
    adsrNode.gain.linearRampToValueAtTime(0.4, now + attackTime + decayTime);
    adsrNode.gain.linearRampToValueAtTime(0.4, now + attackTime + decayTime + sustainTime);
    adsrNode.gain.exponentialRampToValueAtTime(0.00001, now + attackTime + decayTime + sustainTime + releaseTime);
}

