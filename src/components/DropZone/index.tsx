import { useDropStore } from "@/store/drop";
import { Button, Card, Container, Text } from "@nextui-org/react";
import { FileArrowUp } from "phosphor-react";
import React, { ChangeEventHandler, DragEventHandler } from "react";
import FilePreview from "../FilePreview";

const DropZone = () => {
  const { setInDropZone, fileList, addFilesToList } = useDropStore();

  const handleDragEnter: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(true);
  };

  const handleDragLeave: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setInDropZone(false);
  };

  const handleDragOver: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    e.dataTransfer.dropEffect = "copy";
    setInDropZone(true);
  };

  const handleDrop: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let files = [...e.dataTransfer.files];

    console.log(files);

    if (files && files.length > 0) {
      const existingFiles = fileList.map((f) => f.name);
      files = files.filter((f) => !existingFiles.includes(f.name));
      addFilesToList(files);
      setInDropZone(false);
    }
  };

  const handleFileSelect: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return;

    let files = [...e.target.files];

    console.log(files);

    if (files && files.length > 0) {
      const existingFiles = fileList.map((f) => f.name);
      files = files.filter((f) => !existingFiles.includes(f.name));
      addFilesToList(files);
    }
  };

  return (
    <Container
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        id="fileSelect"
        type="file"
        multiple
        onChange={handleFileSelect}
        accept=".png,.jpeg,.jpg"
        style={{
          visibility: "hidden",
          display: "none",
        }}
      />
      <label htmlFor="fileSelect">
        <Card>
          <Card.Header>
            <Text h5>Drag &amp; drop your files here</Text>
          </Card.Header>
          <Card.Body
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {fileList.length ? (
              <FilePreview fileData={fileList} />
            ) : (
              <FileArrowUp size={32} />
            )}
          </Card.Body>
        </Card>
      </label>
    </Container>
  );
};

export default DropZone;
