import tensorflowjs as tfjs
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from keras.models import Model, load_model
from keras.layers import Input, Dense, Dropout
from keras.callbacks import ModelCheckpoint
from keras import regularizers
import numpy as np
import pandas as pd


df = pd.read_csv('./data.csv')

df.shape[1]

df2 = StandardScaler().fit_transform(df.values)

input_dim = df.shape[1]
encoding_dim = 4
hidden_dim = int(encoding_dim / 2)

n_epoch = 300
batch_size = 128
learning_rate = 0.1

input_layer = Input(shape=(input_dim,))
encoder = Dense(encoding_dim, activation='tanh',
    activity_regularizer=regularizers.l1(learning_rate))(input_layer)
encoder = Dense(hidden_dim, activation='relu')(encoder)
decoder = Dense(hidden_dim, activation='tanh')(encoder)
decoder = Dense(input_dim, activation='relu')(decoder)
autoencoder = Model(inputs=input_layer, outputs=decoder)

autoencoder.compile(metrics=['accuracy'],
    loss='mean_squared_error',
    optimizer='adam')


history = autoencoder.fit(df2, df2,
    epochs=n_epoch,
    batch_size = batch_size,
    shuffle=True,
    validation_data=(df2, df2))


plt.plot(history.history['loss'], linewidth=2, label='Train')
plt.plot(history.history['val_loss'], linewidth=2, label='Test')
plt.legend(loc='upper right')
plt.title('Model loss')
plt.ylabel('Loss')
plt.xlabel('Epoch')
#plt.ylim(ymin=0.70,ymax=1)
plt.show()

plt.plot(history.history['accuracy'], linewidth=2, label='Train')
plt.plot(history.history['val_accuracy'], linewidth=2, label='Test')
plt.legend(loc='upper right')
plt.title('Model Accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.ylim(ymin=0.0,ymax=1)
plt.show()


