#import tensorflowjs as tfjs
from keras.models import Model, load_model
from keras.layers import Input, Dense, Dropout
import numpy as np
import pandas as pd


df = pd.read_csv('data.csv')

df.head()
df = df[['Left_Shoulder_Y', 'Right_Shoulder_Y']]
df.shape[1]

#df2 = StandardScaler().fit_transform(df.values)

input_dim = df.shape[1]
encoding_dim = 4
hidden_dim = int(encoding_dim / 2)

n_epoch = 300
batch_size = 128


input_layer = Input(shape=(input_dim,))
encoder = Dense(encoding_dim, activation='tanh')(input_layer)
encoder = Dense(hidden_dim, activation='relu')(encoder)
decoder = Dense(hidden_dim, activation='tanh')(encoder)
decoder = Dense(input_dim, activation='relu')(decoder)
autoencoder = Model(inputs=input_layer, outputs=decoder)

autoencoder.compile(metrics=['accuracy'],
    loss='mean_squared_error',
    optimizer='adam')


autoencoder.fit(df, df,
    epochs=n_epoch,
    batch_size = batch_size,
    shuffle=True,
    validation_data=(df, df))


model_name = 'fallDetector' # string used to define filename of saved model
autoencoder.save(model_name + '-decoder.hdf5')
cmd = 'tensorflowjs_converter --input_format keras ' + model_name + '-decoder.hdf5 ' + model_name + '-decoder-js'
os.system(cmd)