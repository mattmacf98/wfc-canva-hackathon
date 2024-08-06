import {ChangeEvent, FC, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import p5 from "p5";
import {Button, Col, Container, Row, Form, Card, Modal} from "react-bootstrap";
import {Sketch} from "./waveFunctionCollapse/Sketch";
declare global {
    interface Window {
        ai: {
            generateText: (prompt: { prompt: string }, options?: { onStreamResult: (res: { text: string }) => void }) => Promise<void>;
        }
    }
}

interface ICanvaFolder {
    name: string,
    id: string
}

interface ICanvaImageAsset {

    name: string,
    url: string,
    id: string
}

export const App = () => {
    const canvasDimension  = 700;
    const buttonSpacing = {
      margin: "0 20px"
    }
    const p5SketchRef = useRef(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [dimension, setDimension] = useState<number>(6);
    const [name, setName] = useState('MyImage');
    const [imageTileOptions, setImageTileOptions] = useState<ICanvaImageAsset[]>([]);
    const [folderOptions, setFolderOptions] = useState<ICanvaFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>("root");
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    // async function talkToAi() {
    //       const [ response ] = await window.ai.generateText(
    //         {
    //             prompt: "Hello world!"
    //         });
    //
    //       console.log(response);
    // }

    const handleClick = () => {
        window.open("http://127.0.0.1:3001/authorize", "_blank")
    }

    const handleImportImagesFromCanva = async (folder: string) => {
        const data = await fetch(`http://127.0.0.1:3001/folder?folderId=${folder}`, {credentials: "include"});
        const res = await data.json();
        setImageTileOptions(res.assets);
        setFolderOptions(res.folders);
    }

    const handleSelectFolder = (folder: string) => {
        setSelectedFolder(folder);
        handleImportImagesFromCanva(folder);
    }

    const handleSelectCanvasImages = (selectedImages: ICanvaImageAsset[]) => {
        setImageUrls(selectedImages.map(selectedImage => selectedImage.url));
        setImageTileOptions([]);
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImageUrls(Array.from(event.target.files).map(file => URL.createObjectURL(file)));
        }
    }

    const uploadToCanva = async () => {
        setUploadingImage(true);
        const canvas: HTMLCanvasElement = document.getElementsByClassName("p5Canvas")[0] as HTMLCanvasElement;
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'canvasImage.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`http://127.0.0.1:3001/upload?name=${name}`, {
                method: 'POST',
                body: formData,
                credentials: "include"
            });

            setUploadingImage(false)
            if (!response.ok) {
                throw new Error('Failed to upload file');
            } else {
                console.log("SUCCESS!")
            }
        }, "image/png")
    }


      return (
          <>
              <Container fluid className="d-flex flex-column vh-100">
                  <Row className="justify-content-center mb-3">
                      <Col xs="auto">
                          <h2>Wave Function Collapse Generator</h2>
                          <div className="p-3">
                              <Form.Group controlId="exampleForm.ControlRange1">
                                  <Form.Label>Enter a name:</Form.Label>
                                  <Form.Control
                                      type="text"
                                      placeholder="Enter name"
                                      value={name}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                  />

                                  <Form.Label>Choose a value:</Form.Label>
                                  <Form.Range
                                      min={4}
                                      max={30}
                                      value={dimension}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) => setDimension(Number(e.target.value))}
                                  />
                                  <Form.Text className="text-muted">
                                      {dimension}x{dimension}
                                  </Form.Text>
                              </Form.Group>
                          </div>
                      </Col>
                  </Row>
                  <Row className="flex-grow-1 justify-content-center align-items-center">
                      <Col lg={3}/>
                      <Col lg={6}>
                          <div style={
                              {
                                  border: '2px solid #ccc', borderRadius: '2px',
                                  overflow: 'hidden', width: `${canvasDimension}px`, height: `${canvasDimension}px`,
                                  margin: '0 auto'}
                          }>
                              {
                                  imageUrls.length > 0 &&
                                  <P5Sketch canvasDimension={canvasDimension} ref={p5SketchRef} imageUrls={imageUrls} dimension={dimension}/>
                              }
                          </div>
                      </Col>
                      <Col lg={3}>
                          <Row>
                              <Col lg={12}>
                                  <h2>Wave Function Controls</h2>
                              </Col>
                              <Col lg={4}>
                                  {

                                      imageUrls.length === 0 &&
                                      <FileUploadButton onChange={handleFileChange}/>
                                  }
                                  {
                                      imageUrls.length !== 0 &&
                                      <Button variant="danger" onClick={() => setImageUrls([])}>Clear Tiles</Button>
                                  }
                              </Col>
                              <Col lg={4}>
                                  <Button variant="primary" style={buttonSpacing} onClick={() => p5SketchRef.current.completeDrawing()}>Auto-complete</Button>
                              </Col>
                              <Col lg={4}>
                                  <Button variant="warning" style={buttonSpacing} onClick={() => p5SketchRef.current.startOver()}>Start Over</Button>
                              </Col>
                          </Row>

                          <Row>
                              <Col lg={12}>
                                  <h2>Canva Controls</h2>
                              </Col>
                              <Col lg={4}>
                                  <Button onClick={handleClick}>Authorize Canva</Button>
                              </Col>
                              <Col lg={4}>
                                  <Button onClick={() => handleImportImagesFromCanva(selectedFolder)}>Import Tiles From Canva</Button>
                              </Col>
                              <Col lg={4}>
                                  {
                                      uploadingImage ?
                                          <Button disabled>Uploading...</Button>
                                          :
                                          <Button onClick={uploadToCanva}>Upload Image</Button>
                                  }
                              </Col>
                          </Row>
                      </Col>
                  </Row>
                  <Row className="flex-grow-1 justify-content-center align-items-center">
                      <Col lg={5}/>
                      <Col lg={2}>
                          <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.goBack()}>Back</Button>
                          <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.drawNext()}>Next</Button>
                      </Col>
                      <Col lg={5}/>
                  </Row>
              </Container>

              <ImageTileSelectModal imageTileOptions={imageTileOptions} folderOptions={folderOptions} show={imageTileOptions.length > 0} onHide={() => setImageTileOptions([])}
              onSelect={handleSelectCanvasImages} onSelectFolder={handleSelectFolder} currentFolderId={selectedFolder}/>
          </>
      )
}

interface IImageTileSelectModalProps {
    currentFolderId: string;
    folderOptions: ICanvaFolder[];
    imageTileOptions: ICanvaImageAsset[];
    show: boolean;
    onHide: () => void;
    onSelect: (assets: ICanvaImageAsset[]) => void;
    onSelectFolder: (folder: string) => void;
}
const ImageTileSelectModal: FC<IImageTileSelectModalProps> = ({folderOptions,imageTileOptions,
                                                                  show, onHide, onSelect, onSelectFolder, currentFolderId}) => {
    const [selectedImages, setSelectedImages] = useState({});
    const selectedStyle = {
        border: '3px solid black',
        transform: 'scale(1.1)',
        transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out',
    };

    useEffect(() => {
        const selImgs = {};
        for (let i = 0; i < imageTileOptions.length; i++) {
            selImgs[i] = false;
        }
        setSelectedImages(selImgs);
    }, [imageTileOptions])
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Tile Select</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        {imageTileOptions.map((asset, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                    style={selectedImages[index] ? selectedStyle : {}}
                                    onClick={() => setSelectedImages(prevState => ({
                                        ...prevState,
                                        [index]: !prevState[index]
                                    }))}
                                >
                                    <Card.Img variant="top" src={asset.url} alt={asset.name}/>
                                </Card>
                            </Col>
                        ))}
                        {folderOptions.map((folder, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                    onClick={() => onSelectFolder(folder.id)}
                                >
                                    <Card.Body>
                                        <Card.Img variant="top" src={"/Folder-icon.png"}/>
                                        <Card.Title>{folder.name}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                        {
                            currentFolderId !== "root" &&
                            <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                    onClick={() => onSelectFolder("root")}
                                >
                                    <Card.Body>
                                        <Card.Img variant="top" src={"/Folder-icon.png"}/>
                                        <Card.Title>root</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        }
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => onSelect(imageTileOptions.filter((_, index) => selectedImages[index]))}>
                    Select
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

const FileUploadButton = () => {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        // Do something with the file, like upload it
        console.log('Uploaded file:', file.name);
    };

    return (
        <div style={{ display: 'inline-block', position: 'relative' }}>
            <label
                htmlFor="file-upload"
                style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}
            >
                Upload Files
            </label>
            <input
                id="file-upload"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
        </div>
    );
};

interface IProps {
    canvasDimension: number;
    dimension: number;
    imageUrls: string[];
}
const P5Sketch: FC = forwardRef((props: IProps, ref) => {
    const p5Ref = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Sketch | null>(null);

    useImperativeHandle(ref, () => ({
        drawNext: () => {
            sketchRef.current?.drawNext();
        },
        goBack: () => {
            sketchRef.current?.goBack();
        },
        completeDrawing: () => {
            sketchRef.current?.completeDrawing();
        },
        startOver: () => {
            sketchRef.current?.startOver();
        }
    }), [])

    useEffect(() => {
        sketchRef.current = new Sketch(props.canvasDimension, props.dimension, props.imageUrls);

        const p5Instance = new p5(sketchRef.current!.createSketch(), p5Ref.current!);

        return () => {
            p5Instance.remove();
        };
    }, [props.imageUrls, props.dimension])

    return <div ref={p5Ref} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}></div>
});

export default App
