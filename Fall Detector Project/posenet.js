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


///validate the queue functionality

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
let error_test = new Queue();
var errors = [];

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
        leftShoulderX.addToQueue(keypoint.position.x, 10000);
        var leftX = keypoint.position.x;
        leftShoulderY.addToQueue(keypoint.position.y, 10000);
        var leftY = keypoint.position.y;
      };

      // log right shoulder X,Y coordinates
      if (keypoint.part === 'rightShoulder') {
          rightShoulderX.addToQueue(keypoint.position.x, 10000);
          var rightX = keypoint.position.x;
          rightShoulderY.addToQueue(keypoint.position.y, 10000);
          var rightY = keypoint.position.y;
      };


      model.then(function (res){
        let values = tf.tensor2d([[leftY,rightY]]);
        let prediction = res.predict(values).dataSync();

        let mean_sq_error = mse([leftY, rightY], [prediction[0],prediction[1]]);
        
        //error_test.addToQueue(mean_sq_error, 100000);
        
        if (errors.length > 100){
          errors.pop();
        };
        
        errors.unshift(mean_sq_error);

        //console.log('errors: ', errors);
        var quant = d3.quantile(errors.sort(), .999);

        if (mean_sq_error > quant * 1.03) {
          console.log('FALL');
          console.log('MSE : ', mean_sq_error);
          console.log('Quant: ', quant);
          document.getElementById('fall-alert').innerHTML = 'There was a fall!!!'
          setTimeout(function(){
            document.getElementById("fall-alert").innerHTML = '';
        }, 5000);
        };


        // if (mean_sq_error > d3.quantile(error_test.elements, .999 )){
        //   var quant = d3.quantile(error_test.elements, .99);
        //   console.log('Fall Detected. Expected = ', mean_sq_error, ' Bounds = ', quant);
          
        // };
        
        //console.log('MSE: ', mean_sq_error);
        //console.log('99% Quantile: ', d3.quantile(error_test['elements'], .99));


      }); 

      // if (leftShoulderX.length % 100 == 0){
      //   let model = model.fit(tf.tensor2d(leftShoulderY['elements'],rightShoulderY['elements']));
      // };

      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}