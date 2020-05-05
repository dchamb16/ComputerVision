let video;
let poseNet;
let poses = [];


function Queue() {
    this.elements = [];
}

Queue.prototype.enqueue = function(e) {
    this.elements.push(e);
};

Queue.prototype.dequeue = function() {
    return this.elements.shift();
};

Queue.prototype.isEmpty = function() {
    return this.elements.length == 0;
};

Queue.prototype.peek = function() {
    return !this.isEmpty() ? this.elements[0] : undefined;
};

Queue.prototype.length = function() {
    return this.elements.length;
};

Queue.prototype.addToQueue = function(val, maxSize) {
    if (this.elements.length < maxSize) {
        this.enqueue(val);
    } else {
        this.dequeue();
        this.enqueue(val);
    };
};

// setup queues for shoulder X,Y coordinates
let leftShoulderX = new Queue();
let leftShoulderY = new Queue();
let rightShoulderX = new Queue();
let rightShoulderY = new Queue();

width = 1000;
height = 1000; 

//setup the video element 
function setup() {

  // Create the canvas element and the video element using p5js 
  createCanvas(500, 500);
  video = createCapture(VIDEO);
  video.size(500, 500);

  // Call poseNet model
  poseNet = ml5.poseNet(video, modelReady);

  // poseNet callback function 
  poseNet.on('pose', function (results) {
    poses = results;
  });

  // Hide the video element
  video.hide();
}


// a function callback once the function is loaded
function modelReady() {
  console.log('Model Loaded');
}

//drawing function for the keypoints 
function draw() {
  image(video, 0, 0, width, height);

  drawKeypoints();
}

// A function to draw circles over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];

      // log left shoulder X,Y coordinates
      if (keypoint.part === 'leftShoulder'){   
        leftShoulderX.addToQueue(keypoint.position.x, 105);
        leftShoulderY.addToQueue(keypoint.position.y, 105);
      };

      // log right shoulder X,Y coordinates
      if (keypoint.part === 'rightShoulder') {
          rightShoulderX.addToQueue(keypoint.position.x, 105);
          rightShoulderY.addToQueue(keypoint.position.y, 105);
      };

      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}