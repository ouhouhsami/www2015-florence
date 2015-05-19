"use strict";

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

var peer = new Peer({key: 'ubgje3sm5p0evcxr',
    debug: 3,
    logFunction: function() {
        var copy = Array.prototype.slice.call(arguments).join(' ');
        console.log(copy);
    }});


navigator.getUserMedia({audio: true, video:false}, function(stream) {
  var call = peer.call('stream-gtr', stream);
  call.on('stream', function(remoteStream) {
    // Show stream in some video/canvas element.
    console.log(remoteStream);
    const streamSource = audioContext.createMediaStreamSource(remoteStream);
    streamSource1.connect(audioContext.destination);
});
}, function(err) {
  console.log('Failed to get local stream', err);
});
