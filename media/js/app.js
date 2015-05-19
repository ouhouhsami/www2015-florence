"use strict";

let current = 0;

const sections = document.querySelectorAll('section');
const sectionsLenght = sections.length;

document.body.onkeypress = function(evt){
    if(evt.keyCode === 40 && current < sectionsLenght){
        evt.preventDefault();
        current += 1;
    }
    if(evt.keyCode === 38 && current > 0){
        evt.preventDefault();
        current -= 1;
    }
    sections[current].scrollIntoView(true);
    window.location.hash="#"+current;
};


window.onload = function(evt){
    console.log(window.location.hash);
    if(window.location.hash){
        current = parseInt(window.location.hash.substring(1));
        sections[current].scrollIntoView(true);
    }
};
