# Final Project for Northwestern MSDS 462 (Computer Vision)

<p>
For this project I built a program that streams video from the webcam, passes that to TensorFlow JS's PoseNet model. 
From there, I grab the coordinates of the shoulder points and pass that into a autoencoder model. The MSE of the autoencoder results
is compared to the max value of the last 100 MSE values to determine if it is an outlier. If it is flagged as an outlier, then
a messages is displayed on the screen saying that a fall has been detected. Here is a demo of the project! https://youtu.be/lkh9dB2si_E
</p>
