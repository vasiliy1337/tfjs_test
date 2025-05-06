import mnist_pb2
from dataset_loader import DatasetLoader

loader = DatasetLoader()
loader.load_dataset("./model/dataset/t10k-images.idx3-ubyte",
                    "./model/dataset/t10k-labels.idx1-ubyte", 
                    "./model/dataset/train-images.idx3-ubyte", 
                    "./model/dataset/train-labels.idx1-ubyte")
loader.compute_cache(train=True)

dataset = mnist_pb2.Dataset()

for label in range(10):
    for _ in range(20):
        image = loader.get_rand(label)
        sample = dataset.samples.add()
        sample.label = label
        sample.pixels.extend(image.astype(float).tolist())

with open("sampled_mnist.pb", "wb") as f:
    f.write(dataset.SerializeToString())
