import {Button, Col, Row, Form} from "react-bootstrap";
import {ChangeEvent, FC, useContext} from "react";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";

export interface IWaveFunctionControlsProps {
    p5SketchRef: any
}

export const WaveFunctionControls: FC<IWaveFunctionControlsProps> = ({p5SketchRef}) => {
    const {imageUrls, setImageUrls} = useContext(WaveFunctionCollapseContext);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImageUrls(Array.from(event.target.files).map(file => URL.createObjectURL(file)));
        }
    }

    return (
        <Row>
            <Col lg={12}>
                <h2>Wave Function Controls</h2>
            </Col>
            <Col lg={4}>
                {

                    imageUrls.length === 0 &&
                    <FileUploadButton handleFileUpload={handleFileChange}/>
                }
                {
                    imageUrls.length !== 0 &&
                    <Button variant="danger" onClick={() => setImageUrls([])}>Clear Tiles</Button>
                }
            </Col>
            <Col lg={4}>
                <Button variant="primary" onClick={() => p5SketchRef.current.completeDrawing()}>Auto-complete</Button>
            </Col>
            <Col lg={4}>
                <Button variant="warning" onClick={() => p5SketchRef.current.startOver()}>Start Over</Button>
            </Col>
        </Row>
    )
}

const FileUploadButton = (props: {handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => void}) => (
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
                        onChange={props.handleFileUpload}
                    />
            </div>
);

export const WaveFunctionCollapseNextBackControls: FC<{ p5SketchRef: any}> = (props: {p5SketchRef: any}) => (
    <Row className="flex-grow-1 justify-content-center align-items-center">
            <Col lg={5}/>
            <Col lg={1}>
                    <Button variant="secondary" onClick={() => props.p5SketchRef.current.goBack()}>Back</Button>
            </Col>
            <Col lg={1}>
                    <Button variant="secondary" onClick={() => props.p5SketchRef.current.drawNext()}>Next</Button>
            </Col>
            <Col lg={5}/>
    </Row>
)

export const WaveFunctionCollapseImageControls: FC = () => {
    const {imageName, setImageName, dimension, setDimension} = useContext(WaveFunctionCollapseContext)
    return (
        <Row className="justify-content-center mb-3">
            <Col xs="auto">
                <h2>Wave Function Collapse Generator</h2>
                <div className="p-3">
                    <Form.Group controlId="exampleForm.ControlRange1">
                        <Form.Label>Enter a name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter name"
                            value={imageName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setImageName(e.target.value)}
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
    )
}
