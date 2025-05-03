import tensorflow
from tensorflow import keras
from tensorflow.keras import Sequential, datasets, layers, models
from tensorflow.keras.layers import Dense, Flatten, Dropout, BatchNormalization 
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical

(x_train,y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

print("The Shape of train data : ", x_train.shape )
print("The Shape of test data : ", x_test.shape )

X_train = x_train / 255
X_test = x_test / 255

model = Sequential()

model = Sequential()
model.add(Flatten(input_shape=(28, 28)))
model.add(Dense(64, activation='relu'))
model.add(Dense(128, activation='relu'))
model.add(Dense(10, activation='softmax'))

model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy',metrics=['accuracy']) 
model.summary()

y_train = to_categorical(y_train, num_classes=10)
y_test = to_categorical(y_test, num_classes=10)

history = model.fit(X_train,y_train, epochs=10,validation_split=0.2)

y_prod = model.predict(X_test)
y_pred = y_prod.argmax(axis=1)

model.save("./model/model.h5")

# tensorflowjs_converter --input_format=keras ./model/model.h5 ./model/tfjs