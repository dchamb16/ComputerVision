
// const model = tf.loadModel('model/model.json');

// console.log(model.predict([120,20,-1,20]));




// const MODEL_URL = 'http://localhost:8000/model/model.json';

// //const model = await tf.loadLayersModel(MODEL_URL);


// let model;
// (async function () {
//     //model = await tf.loadModel("http://10.0.0.14:81/tfjs-models/VGG16/model.json");
//     model = await tf.loadLayersModel(MODEL_URL);
// })();


async function run() {
    const model = await tf.loadLayersModel('./model/model.json');
    console.log(model.summary());
    //const image = document.getElementById('daisy');
    //const predictions = await model.classify([120,20,-1,20]);
    //console.log(predictions);
    // Show the resulting object on the page.
    //const pre = document.createElement('pre');
    //pre.textContent = JSON.stringify(predictions, null, 2);
    //document.body.append(pre);
  }
  run();



// async function myFirstTfjs() {
//   const model=await tf.loadLayersModel('https://github.com/dchamb16/ComputerVision/blob/master/Fall%20Detector%20Project/model/model.json');
// }

// myFirstTfjs();