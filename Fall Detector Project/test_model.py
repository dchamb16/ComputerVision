from keras.preprocessing.image import load_img, img_to_array
import requests, zipfile, glob
import numpy as np

import tensorflowjs as tfjs

url = 'http://bit.ly/celeba-sample'
data = requests.get(url, allow_redirects=True).content
open('celeba-sample.zip', 'wb').write(data)
zipfile.ZipFile('celeba-sample.zip').extractall()

read_img = lambda i: img_to_array(load_img(i, color_mode='grayscale'))
files = glob.glob('celeba-sample/*.jpg')
X = np.array([read_img(i) for i in files]).squeeze() / 255.0 

from keras.models import Model
from keras.layers import Input, Reshape, Dense, Flatten

class Autoencoder:
    def __init__(self, img_shape=(218,178), latent_dim=2, n_layers=2, n_units=128):
        if not img_shape: raise Exception('Please provide image shape')

        i = h = Input(img_shape)
        h = Flatten()(h)
        for _ in range(n_layers):
            h = Dense(n_units)(h)
        o = Dense(latent_dim)(h)
        self.encoder = Model(inputs=[i], outputs=[o])

        i = h = Input((latent_dim,))
        for _ in range(n_layers):
            h = Dense(n_units)(h)
        h = Dense(img_shape[0] * img_shape[1])(h)
        o = Reshape(img_shape)(h)
        self.decoder = Model(inputs=[i], outputs=[o])

        i = Input(img_shape)
        z = self.encoder(i)
        o = self.decoder(z)
        self.model = Model(inputs=[i],outputs=[o])
        self.model.compile(loss='mse',optimizer='adam')

autoencoder = Autoencoder()

autoencoder.model.fit(X,X,batch_size=64,epochs=40)

import matplotlib.pyplot as plt
z = autoencoder.encoder.predict(X)

plt.scatter(z[:,0],z[:,1],marker='o',s=0.1,c='#d53a26')
plt.show()

y = np.array([[10,50]])
prediction = autoencoder.decoder.predict(y)
plt.imshow(prediction.squeeze(),cmap='gray')

model_name = 'celeba' # string used to define filename of saved model
autoencoder.decoder.save(model_name + '-decoder.hdf5')
cmd = 'tensorflowjs_converter --input_format keras ' + model_name + '-decoder.hdf5 ' + model_name + '-decoder-js'
os.system(cmd)

