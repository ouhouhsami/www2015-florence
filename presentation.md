Web developer

As a member of the Analysis of Musical Pratices research team, from the begining, with Nicolas Donin musicologist and head of the team, we thought the web was the good place for digital musicology.

We have used a lot of multimedia content (sounds, images, videos, scores) to change the way we listen to music based on the way composers, performers or other music enthusiasts do. We build prototypes of listening guides to promote active listening of music, and especially for contemporary music.

I remember having done a lot of Flash experiments early in the century, when it was the only available solution, and I also remember that audio tag from HTML5 changed the situation.


Web Audio History

It has been taken quite a long time and a lot of experimentation to achieve a set of audio and music related web standards that today are implemented in all major browsers.

In 1995, occurred three rather experimental extensions that allowed for minimal sound playback in browsers incarned by <bgsound>, <embed>/<object> and <applet> tags. It was the “good old time” of background sound in web pages (often using MIDI files), the audio equivalent of the <blink> tag. There was no HTTP broadcast solutions and only proprietary ones using specific protocols (like RTP/RTSP).

From 1997, Flash took all the market on both, client side viewing and server side broadcasting (using Flash Media Server), and became de facto a standard for audiovisual content and interaction on web pages. Lot of successful services like YouTube relied on it. In October 2008, the Sound API proposed in ActionScript, the Flash scripting language allowed to do minimal audio processing (this was probably due to Andre Michelle former hack). At IRCAM, we experimented communication between Flash and Max (visual programming language for music and multimedia) using OSC communication, as the ActionScript minimal audio processing wasn’t enough efficient for our use cases.

From 2008, HTML5 with a set of web standards has established itself and made Flash obsolete. HTTP streaming (DASH), WebRTC and WebSockets are the foundations for exchanging data between connected devices. Proposed to the W3C Audio Working Group in 2010 and first implemented for Google Chrome in 2011, the Web Audio API will be soon available for all browsers (also on Edge!).
Today, 20 years after the first possibility to playback sound in a browser occurred, these standards provide a full set of features to deploy interactive real-time audio on the web.


Web Audio API

What's the Web Audio API

# Web Audio API

* High-level JavaScript API for processing and synthesizing audio in web applications.

* The paradigm: audio routing graph which connects AudioNodes to define an audio rendering.

* Underlying implementation in C / C++ code, but direct JavaScript processing and synthesis is supported


The Web Audio API involves handling audio operations inside an audio context, and has been designed to allow modular routing. Basic audio operations are performed with audio nodes, which are linked together to form an audio routing graph. Several sources — with different types of channel layout — are supported even within a single context. This modular design provides the flexibility to create complex audio functions with dynamic effects.

Audio nodes are linked via their inputs and outputs, forming a chain that starts with one or more sources, goes through one or more nodes, then ends up at a destination (although you don't have to provide a destination if you, say, just want to visualise some audio data.) A simple, typical workflow for web audio would look something like this:

    Create audio context
    Inside the context, create sources — such as <audio>, oscillator, stream
    Create effects nodes, such as reverb, biquad filter, panner, compressor
    Choose final destination of audio, for example your system speakers
    Connect the sources up to the effects, and the effects to the destination.



Goal

* <audio> HTML5 element allows for basic streaming and audio playback, in recent browsers no more need to Flash and QuickTime.

* But not enough for games and interactive applications, like DAW (Digital Audio Workstations), audio plugin effects and synthesizers ...

* But also innovative use cases, browser == platform for the web? bla bla bla

Key features

* Sample accurate scheduled sound playback
* Integration with audio/video media elements, getUserMedia(), WebRTC
* Spatialized audio
* Convolution engine
* Filters, Waveshaping, Oscillator
* AudioParameters
* Time-domain and frequency analysis (for visualisation only at this time)

API Overview

* AudioContext: contains the audio signal graph (connections between audio nodes) and the currentTime

* AudioNode
    * AudioDestinationNode
    * AudioBufferSourceNode
    * MediaElementAudioSourceNode
    * MediaStreamAudioSourceNode
    * MediaStreamAudioDestinationNode
    * AudioWorkerNode
    * ScriptProcessorNode (deprecated)
    * GainNode
    * BiquadFilterNode
    * DelayNode
    * PannerNode
    * StereoPannerNode
    * ConvolverNode
    * AnalyserNode
    * ChannelSplitterNode
    * ChannelMergerNode
    * DynamicsCompressorNode
    * WaveShaperNode
    * OscillatorNode

http://webaudioplayground.appspot.com/

* Others
    * AudioBuffer: audio buffer (non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1)
        used in ConvolverNode
        used in AudioProcessingEvent (son ScriptProcessorNode)
        used in AudioBufferSourceNode

    Use with AudioWorker
    * AudioWorker : main-thread representation of a worker "thread" that supports processing of audio in JavaScript. AudioWorker creates instances of AudioWorkerNode, which is the main-thread representation of an individual node processed by that AudioWorker
    * AudioWorkerGlobalScope
    * AudioWorkerNodeProcessor
    * AudioProcessEvent

    Use(d) with ScriptProcessorNode
        * AudioProcessingEvent

    * AudioParam
     * controls an individual aspect of an AudioNode's functioning, such as volume
     * can be a-rate or k-rate
     *
    setValueAtTime() - SetValue
    linearRampToValueAtTime() - LinearRampToValue
    exponentialRampToValueAtTime() - ExponentialRampToValue
    setTargetAtTime() - SetTarget
    setValueCurveAtTime() - SetValueCurve

    * AudioListener
        used in AudioContext listener that represents the position and orientation of the thing that's listening to the audio


# Web Audio Conference


# Web vs. Native

        Web Audio WITH audioworker :

        Performance
        Native : optimize CPU cache, Zero copy cross thread buffer transfer; pool allocations/reduce allocator, churn, SIMD, Lock-free/wait free programming

        CPU Cache : ArrayBuffers are linear in memory, very prone to cache-related speedups/slowdowns
        Zero copy cross-thread buffer transfer : ok in web worker
        asm.js (subset of javascript : no garbage collection because no malloc, which cause glitch) (just 1.5x the speed of c++ code gcc -02, straightforward to port to C/C++)
        SIMD.js (windows, linux, mac)
        Denormals: native __MM_DENORMALS_ZERO_ON, web js: nothing
        Lock-free/wait-free: "proposal for shared memory", but scary
        Data types quality: could be reduced but in web audio api 32 float buffer

        Latency
        Main thread load when key pressed for instance
        1. make sure to not have reflow, see the "timeline" in the debugger

        Native audio stack: context switch (not free) (spotify + daw)
        or better "ASIO" which bloc all, thread super high priority

        Browser audio stack : 2 context switch, and audioworker will go normal priority

        Ecosystem/Distribution
        independant vendor, untrusted code
        for "plugin" you want to dont give access to DOM, pb you need to share the audiocontext
        solve: ES6 Proxy complete isolation of you plugin!

For instance, in audio processing applications, denormal values usually represent a signal so quiet that it is out of the human hearing range. Because of this, a common measure to avoid denormals on processors where there would be a performance penalty is to cut the signal to zero once it reaches denormal levels

* 2015 Hot topics
* Next

