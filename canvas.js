/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function drawGraph() {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    var context = canvas.getContext("2d");
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.strokeStyle = "#00FF00";
    context.lineWidth = 1;
    
    var center = canvas.width/2;
    var yCoordinate = 0;
    
    context.moveTo(center, -20);
    for (var i = 0; i < 40; i++) {
        yCoordinate += canvas.height/40;
        var xOffset = generateXOffset(i);
        context.lineTo(center + generateXOffset(i), yCoordinate); ;
    }
    
    context.stroke();
}

function generateXOffset(index) {
    var goingUp = index % 2 == 0;
    
    var xOffset = randomIntFromInterval(10, 300);
    if (!goingUp) {
        xOffset = xOffset * -1;
    }
    
    return xOffset;
}
