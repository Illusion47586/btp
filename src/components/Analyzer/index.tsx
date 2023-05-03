import React, { useCallback, useEffect, useState } from "react";

import * as tf from "@tensorflow/tfjs";
import { Card, Progress, Table, Text } from "@nextui-org/react";
import { useDropStore } from "@/store/drop";

type Props = { name: string };

const labels = {
  colon: ["Colon adenocarcinoma", "Benign"],
  kidneycyst: ["Cyst", "Normal"],
  tb: ["Normal", "Tb"],
  malaria: ["Malaria", "Normal"],
};

const Analyzer = ({ name }: Props) => {
  const [loading, setLoading] = useState(0);

  const { fileList } = useDropStore();

  const [predictions, setPredictions] = useState<string[]>();

  const loadTFModel = useCallback(async (db: IDBDatabase) => {
    tf.setBackend("webgl");

    let path = `/models/${name}/model.json`;

    const dbLocation = `indexeddb://${name}`;

    // if (db.objectStoreNames.contains("models_store")) {
    //   const models = await tf.io.listModels();
    //   if (dbLocation in models) path = dbLocation;
    // } else {
    //   db.createObjectStore("models_store");
    //   db.createObjectStore("model_info_store");
    //   const t = db.transaction(
    //     ["models_store", "model_info_store"],
    //     "readwrite"
    //   );
    //   t.commit();
    // }

    tf.loadLayersModel(path, {
      onProgress: (fractions) => setLoading(fractions),
    })
      .then(async (model) => {
        if (!model) return;

        // console.log(model);

        // warming up the model before using real data
        const shape = [...model.inputs[0].shape].map((v) => (v ? v : 1));
        const dummy = tf.ones(shape);
        const res = model.predict(dummy);

        // clear memory
        tf.dispose(res);
        tf.dispose(dummy);

        // save to state
        // await model.save(dbLocation);

        tf.engine().startScope();
        // run predictions
        const predictions = await Promise.all([
          ...fileList.map(async (file) => await predictImage(model, file)),
        ]);
        const finalPredictions = predictions.map((value) => {
          if (Array.isArray(value)) return value[0];
          return value;
        });

        const predictedLabels = finalPredictions.map((p, i) => {
          if (!p) return p;
          const prediction = p.dataSync();

          // Find the index of the highest value in the prediction array
          const maxIndex = prediction.indexOf(Math.max(...prediction));

          // Convert the index to a prediction label
          // @ts-ignore
          return labels[name][maxIndex];
        });

        setPredictions(predictedLabels);

        tf.engine().endScope();
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  useEffect(() => {
    const request = indexedDB.open("tensorflowjs", 1);
    request.onsuccess = (event) => {
      loadTFModel(request.result);
    };
  }, [loadTFModel]);

  const getImageSize = (url: string): Promise<HTMLImageElement> => {
    const img = document.createElement("img");

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => {
        resolve(img);
      };
      img.onerror = reject;
    });

    img.src = url;
    return promise;
  };

  const predictImage = async (model: tf.LayersModel, file: File) => {
    const [modelWidth, modelHeight] = model.inputs[0].shape.slice(1, 3);

    if (!modelHeight || !modelWidth) return;

    const image = await getImageSize(URL.createObjectURL(file));
    const input = tf.tidy(() => {
      return tf.browser
        .fromPixels(image)
        .resizeBilinear([modelWidth, modelHeight])
        .div(255.0)
        .toFloat()
        .expandDims(0);
    });

    const result = model.predict(input);

    return result;
  };

  return (
    <Card>
      <Card.Body>
        <Text h5 css={{ textAlign: "center" }}>
          {predictions
            ? "Here are your predictions."
            : `Loading the model, ${(loading * 100).toFixed(0)}% done.`}
        </Text>
        {predictions ? (
          <Table>
            <Table.Header>
              <Table.Column>Name</Table.Column>
              <Table.Column>Prediction</Table.Column>
            </Table.Header>
            <Table.Body>
              {predictions.map((value, i) => (
                <Table.Row key={fileList[i].lastModified}>
                  <Table.Cell>{fileList[i].name}</Table.Cell>
                  <Table.Cell>{value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Progress value={loading * 100} striped animated />
        )}
      </Card.Body>
    </Card>
  );
};

export default Analyzer;
