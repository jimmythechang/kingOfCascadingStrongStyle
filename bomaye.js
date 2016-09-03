/*
 * Timing variables.
 */
var waveformDelay = 1700;
var flashDelay = 8000;
var filmstripDuration = 6000;
var nameDelay = 1500;

/**********
 * LIGHTS *
 **********/

/**
 * Returns a random int from a given interval.
 * 
 * @param {type} min
 * @param {type} max
 * @returns {Number}
 */
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min+1) + min);
}

/**
 * Initializes the canvas.
 * @returns {Element|initializeCanvas.canvas}
 */
function initializeCanvas() {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight;
    return canvas;
}

/**
 * Draws the waveform.
 */
function drawWaveform() {
    var canvas = initializeCanvas();
    return setInterval(function() {
            drawWaveformFrame(canvas);
    }, 1000 / 24);
}

/**
 * Draws one frame of the waveform.
 * 
 * @param {Element} canvas
 */
function drawWaveformFrame(canvas) {
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.strokeStyle = "#00FF00";
    context.lineWidth = 1;
    
    context.beginPath();
    
    var center = canvas.width/2;
    var y = -30;
    context.moveTo(center, y);
    
    /*
     * Generate points down the page.
     */
    for (var i = 0; i < 40; i++) {
        y += canvas.height/40;
        var xOffset = generateWaveformXOffset(i);
        context.lineTo(center + xOffset, y); ;
    }
    
    context.stroke();
}

/**
 * Generate the x offset for the next point.
 * 
 * @param {int} index
 * @returns {Number}
 */
function generateWaveformXOffset(index) {
    /*
     * Determines if the line is going "up" (really to the right).
     */
    var goingUp = index % 2 == 0;
    var xOffset = randomIntFromInterval(5, 300);
    if (!goingUp) {
        xOffset = xOffset * -1;
    }
    return xOffset;
}

/**
 * Creates a flash node.
 * 
 * @param {int} x
 * @param {int} y
 * @returns {DOMElement}
 */
function initializeFlash(x, y) {
    var flash = document.createElement("figure");
    flash.className = "flash";
    flash.style.left = x + "px";
    flash.style.top = y + "px";
    flash.addEventListener("animationend", function() {
        this.parentNode.removeChild(this);
    });
    
    return flash;
}

/**
 * Generates a run of staggered flash batches. The rest of the 
 * animations are triggered from this point.
 */
function generateFlashes() {    
    var batchCountMax = 60;
    var batchCount = 0;
    
    var intervalCallback = setInterval(function() {
        if (batchCount > batchCountMax) {
            clearInterval(intervalCallback);
            showFilmstrip(false);
        }
        else {
            batchCount++;
            generateFlashBatch();
        }
    }, 100);
}

/**
 * Generates a random number of flashes.
 */
function generateFlashBatch() {
    var flashesPerBatch = randomIntFromInterval(2, 3);

    /*
     * Vary the number of flashes per run.
     */
    for (var i = 0; i < flashesPerBatch; i++) {
        var x = randomIntFromInterval(0, 1600);
        var y = randomIntFromInterval(0, 700);

        var flash = initializeFlash(x, y);
        document.getElementById("flashContainer").appendChild(flash);
    }
}

/**********
 * CAMERA *
 **********/

/**
 * Displays the filmstrip.
 * 
 * @param {boolean} repeat determines if the filmstrip should run indefinitely
 */
function showFilmstrip(repeat) {
    var filmContainer = document.getElementById("filmContainer");
    filmContainer.style.display = "block";
    filmContainer.className = "fadeIn";
    
    if (!repeat) {
        setTimeout(function() {
            filmContainer.style.display = "none";
            filmContainer.className = "";
            
            setTimeout(showName, nameDelay);
        }, filmstripDuration);
    }
}

/**********
 * BOMAYE *
 **********/

/**
 * Pulls the query string from the URL and parses it for 
 * the user's name.
 * 
 * @returns {array}
 */
function getNameFromUrl() {
    var urlArray = document.URL.split("?");
    var name = escapeHtml(urlArray[1]);
    return name.split("_");
}

/**
 * Can't trust anyone anymore
 * 
 * @param {string} string
 * @returns {string}
 */
function escapeHtml(string) {
    if (string == null || !string.includes("_") || string.match(/(&|<|>|"|'|\/)/)) {
        return "shinsuke_nakamura";
    }
    else if (string.length > 21) {
        return "shorter_name";
    }
    return string;
}

/**
 * Sets the strings in the given array into containers on the page.
 * 
 * @param {array} nameArray
 */
function setName(nameArray) {
    var firstName = nameArray[0].toUpperCase();
    var lastName = nameArray[1].toUpperCase();
    
    document.getElementById("firstName").innerHTML = spannerize(firstName);
    document.getElementById("lastName").innerHTML = spannerize(lastName);    
}

/**
 * Iterates over a given string and wraps each character in a span.
 * 
 * @param {string} name
 * @returns {string}
 */
function spannerize(name) {
    var spannerizedString = "";
    for (var i = 0; i < name.length; i++) {
        spannerizedString += "<span>" + name.charAt(i) + "</span>";
    }
    return spannerizedString;
}

/**
 * Inserts a dynamically generated keyframe rule into the stylesheet.
 * Rules are named in the following format: [firstName/lastName]_letterZoom_[index].
 * 
 * @param {string} elementName
 * @param {int} spanNumber
 * @param {int} xOffset
 */
function insertDynamicZoomAnimationIntoStylesheet(elementName, spanNumber, xOffset) {
    var stylesheet = document.styleSheets[0];
        
    stylesheet.insertRule("@keyframes " + elementName + "_letterZoom_" + spanNumber + " {\n\
    from { opacity: 0; transform: perspective(800px) translateZ(150px) translateX(" + xOffset + "px) }\n\
    to { opacity: 1; transform: perspective(800px) translateZ(0px) translateX(0px); }\n\
    }", stylesheet.rules.length); 
}

/**
 * Generates dynamic keyframes for each span in a given element,
 * depending on its distance from the middle of the element.
 * 
 * @param {string} elementName
 */
function generateLetterAnimationRules(elementName) {
    var element = document.getElementById(elementName);
    var mid = element.childNodes.length / 2;
    
    /*
     * The letter slides in from the left or right by varying amounts, 
     * depending on how far from the center it is.
     */
    for (var i = 0; i < element.childNodes.length; i++) {
        var xOffset = (i - mid) * 20;
        insertDynamicZoomAnimationIntoStylesheet(elementName, i, xOffset);
    }
}

/**
 * Recursively sets the animation for each span in the given element.
 * 
 * @param {DOMElement} element
 * @param {int} index 
 * @param {int} timeout in milliseconds
 */
function setLetterAnimation(element, index, timeout) {    
    if (index < element.childNodes.length) {
        var span = element.childNodes[index];
        span.style.opacity = 1;
        span.style.animation = element.id + "_letterZoom_" + index + " 0.5s";
        
        setTimeout(function() {
           setLetterAnimation(element, ++index, timeout); 
        }, timeout);
    }
}

/**
 * Determines how much time should elapse before the
 * next letter in a name is revealed. Names with more letters
 * have less time between reveals.
 * 
 * @param {DOMElement} element
 * @returns {int} millseconds
 */
function getTimeBeforeNextLetter(element) {
    var totalTime = 800;
    var letterCount = element.childNodes.length;
    
    return totalTime / letterCount;
}

/**
 * Calls functions responsible for setting up the name animation. 
 */
function showName() {
    var nameArray = getNameFromUrl();
    setName(nameArray);
    
    var firstName = document.getElementById("firstName");
    var lastName = document.getElementById("lastName");
    
    generateLetterAnimationRules(firstName.id);
    generateLetterAnimationRules(lastName.id);
    
    setLetterAnimation(firstName, 0, getTimeBeforeNextLetter(firstName));
    setLetterAnimation(lastName, 0, getTimeBeforeNextLetter(lastName));
    
    setTimeout(function() {
        showFilmstrip(true);
    }, 2000);
}

window.onload = function() {
    /*
     * Show the waveform.
     */
    var waveformInterval;
    setTimeout(function() {
        waveformInterval = drawWaveform();
    }, waveformDelay);

    /*
     * Kill the waveform animation and queue the flashes.
     */
    setTimeout(function() {
        clearInterval(waveformInterval);
        var canvas = document.getElementById("canvas");
        canvas.parentNode.removeChild(canvas);
        
        generateFlashes();
    }, flashDelay);
};