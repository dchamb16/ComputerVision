
// const model = tf.loadModel('model/model.json');

// console.log(model.predict([120,20,-1,20]));


async function myFirstTfjs() {
  const model=await tf.loadLayersModel('C:/Users/dstnc/OneDrive/Documents/GitHub/ComputerVision/Fall%20Detector%20Project/model/model.json');
}

myFirstTfjs();