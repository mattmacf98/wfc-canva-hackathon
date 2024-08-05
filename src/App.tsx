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
    const [imageTileOptions, setImageTileOptions] = useState<ICanvaImageAsset[]>([]);

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

    const handleImportImagesFromCanva = async () => {
        const data = await fetch("http://127.0.0.1:3001/folder?folderId=FAFMpgBF-zI", {credentials: "include"});
        const res = await data.json()
        setImageTileOptions(res)
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
        const canvas: HTMLCanvasElement = document.getElementsByClassName("p5Canvas")[0] as HTMLCanvasElement;
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'canvasImage.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://127.0.0.1:3001/upload?name=test', {
                method: 'POST',
                body: formData,
                credentials: "include"
            });

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
                      <Col>
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
                  </Row>
                  <Row className="justify-content-center mb-3">
                      <Col xs="auto">
                          {
                              imageUrls.length === 0 &&
                              <input
                                  type="file"
                                  multiple
                                  onChange={handleFileChange}
                                  accept=".jpg,.jpeg,.png,.pdf"
                              />
                          }
                          {
                              imageUrls.length !== 0 &&
                              <Button variant="danger" onClick={() => setImageUrls([])}>Clear Tiles</Button>
                          }
                          <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.goBack()}>Back</Button>
                          <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.drawNext()}>Next</Button>
                          <Button variant="primary" style={buttonSpacing} onClick={() => p5SketchRef.current.completeDrawing()}>Auto-complete</Button>
                          <Button variant="warning" style={buttonSpacing} onClick={() => p5SketchRef.current.startOver()}>Start Over</Button>
                          {/*<Button onClick={() => talkToAi()}>Talk To AI</Button>*/}
                          <Button onClick={handleClick}>Authorize Canva</Button>
                          <Button onClick={handleImportImagesFromCanva}>Import Tiles From Canva</Button>
                          <Button onClick={uploadToCanva}>Upload Result</Button>
                      </Col>
                  </Row>
              </Container>

              <ImageTileSelectModal imageTileOptions={imageTileOptions} show={imageTileOptions.length > 0} onHide={() => setImageTileOptions([])}
              onSelect={handleSelectCanvasImages}/>
          </>
      )
}

interface IImageTileSelectModalProps {
    imageTileOptions: ICanvaImageAsset[];
    show: boolean;
    onHide: () => void;
    onSelect: (assets: ICanvaImageAsset[]) => void;
}
const ImageTileSelectModal: FC<IImageTileSelectModalProps> = ({imageTileOptions, show, onHide, onSelect}) => {
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
