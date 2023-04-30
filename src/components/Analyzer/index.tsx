import React, { useCallback, useEffect, useState } from "react";

import * as tf from "@tensorflow/tfjs";
import { Card, Progress, Table, Text } from "@nextui-org/react";
import { useDropStore } from "@/store/drop";

type Props = { name: string };

const Analyzer = ({ name }: Props) => {
  const [loading, setLoading] = useState(0);

  const { fileList } = useDropStore();

  const [predictions, setPredictions] =
    useState<(tf.Tensor<tf.Rank> | undefined)[]>();

  const loadTFModel = useCallback(async (db: IDBDatabase) => {
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

        // run predictions
        const predictions = await Promise.all([
          ...fileList.map(async (file) => await predictImage(model, file)),
        ]);
        const finalPredictions = predictions.map((value) => {
          if (Array.isArray(value)) return value[0];
          return value;
        });

        finalPredictions.map((p, i) => {
          if (!p) return p;
          console.log(fileList[i].name, p);
          //   console.log(p.argMax().arraySync());
          const logits = Array.from(p.dataSync());
          //   console.log(tf.argMax(p), logits.toString(), p.dataSync());
        });

        setPredictions(finalPredictions);
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

  const getImageSize = (
    url: string
  ): Promise<{ height: number; width: number }> => {
    const img = document.createElement("img");

    const promise = new Promise<{ height: number; width: number }>(
      (resolve, reject) => {
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          resolve({ width, height });
        };
        img.onerror = reject;
      }
    );

    img.src = url;
    return promise;
  };

  const predictImage = async (model: tf.LayersModel, file: File) => {
    tf.engine().startScope();

    const [modelWidth, modelHeight] = model.inputs[0].shape.slice(1, 3);

    const uint8array = (await file.stream().getReader().read()).value;
    if (!uint8array || !modelHeight || !modelWidth) return;
    const { height, width } = await getImageSize(URL.createObjectURL(file));
    const image = new ImageData(width, height);
    image.data.set(uint8array);

    const input = tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(image);
      return tf.image
        .resizeBilinear(imageTensor, [modelWidth, modelHeight])
        .div(255.0)
        .expandDims(0);
    });

    const result = model.predict(input);

    // console.log(file.name, input.toString(), result.toString());

    // tf.engine().endScope();

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
                  <Table.Cell>{}</Table.Cell>
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
