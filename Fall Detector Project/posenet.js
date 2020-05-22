let video;
let poseNet;
let poses = [];


function mse(a, b) {
	let error = 0
	for (let i = 0; i < a.length; i++) {
		error += Math.pow((b[i] - a[i]), 2)
	}
	return error / a.length
}

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

//width = 1000;
//height = 1000; 

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

var modelPath = 'fallDetector-decoder-js/model.json';

async function load_model() {
  let m = await tf.loadLayersModel(modelPath)
  return m;
}

let model = load_model();



// const model = tf.loadLayersModel(modelPath).then(function(model){
//   var y = tf.tensor2d([[120,-10,20,38]]);
//   var prediction = model.predict(y).dataSync();
//   console.log(prediction);
// })




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
        var leftX = keypoint.position.x;
        leftShoulderY.addToQueue(keypoint.position.y, 105);
        var leftY = keypoint.position.y;
      };

      // log right shoulder X,Y coordinates
      if (keypoint.part === 'rightShoulder') {
          rightShoulderX.addToQueue(keypoint.position.x, 105);
          var rightX = keypoint.position.x;
          rightShoulderY.addToQueue(keypoint.position.y, 105);
          var rightY = keypoint.position.y;
      };

      //console.log(model.predict([leftX,leftY,rightX,rightY]).dataSync());
      model.then(function (res){
        let values = tf.tensor2d([[leftX,leftY,rightX,rightY]]);
        let prediction = res.predict(values).dataSync();
        //console.log(prediction);

        let mean_sq_error = mse([leftX,leftY,rightX,rightY], prediction);
        console.log('MSE:', mean_sq_error);
      }); 

      if (leftShoulderX.length % 1000 == 0){
        let model = model.fit(tf.tensor2d(leftShoulderX,leftShoulderY,rightShoulderX,rightShoulderY));
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