import { Container, Grid, Image, Text } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IProps } from "./interface";

const FilePreview = ({ fileData }: IProps) => {
  return (
    <Container>
      <Grid.Container gap={1}>
        {fileData.map((file) => {
          return (
            <Container key={file.lastModified}>
              <Image
                src={URL.createObjectURL(file)}
                objectFit="contain"
                css={{ maxHeight: "100px", maxWidth: "100px" }}
              />
              <Text>{file.name}</Text>
            </Container>
          );
        })}
      </Grid.Container>
    </Container>
  );
};

export default FilePreview;
