import {Button, Col, Row, Form, Container} from "react-bootstrap";
import {ChangeEvent, CSSProperties, FC, useContext} from "react";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

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

    const buttonStyle: CSSProperties = {
        color: '#6f6fa2',
        backgroundColor: '#F5F5FA',
        border: 'none',
        borderRadius: '10px',
        padding: '10px 20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: 164
    };

    const containerStyle: CSSProperties = {
        border: "1px solid #f5f5f5",
        margin: 8,
        textAlign: "center",
        width: "60%",
        padding: 8,
        borderRadius: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }

    return (
        <Container>
            <Row style={containerStyle}>
                <Col lg={12} className="my-2">
                    <h3>WFC Controls</h3>
                </Col>
                <Col lg={12} className="my-2">
                    <Button onClick={() => p5SketchRef.current.startOver()} style={buttonStyle}>Start Over</Button>
                </Col>
                <Col lg={12} className="my-2">
                    <Button onClick={() => p5SketchRef.current.completeDrawing()} style={buttonStyle}>Auto Complete</Button>
                </Col>
                <Col lg={12} className="my-2">
                    {

                        imageUrls.length === 0 &&
                        <FileUploadButton handleFileUpload={handleFileChange}/>
                    }
                    {
                        imageUrls.length !== 0 &&
                        <Button variant="danger" onClick={() => setImageUrls([])} style={{...buttonStyle, background: "red", color: "white"}}>Clear Tiles</Button>
                    }
                </Col>
            </Row>
        </Container>

    )
}

const FileUploadButton = (props: {handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => void}) => (
            <div style={{ display: 'inline-block', position: 'relative' }}>
                    <label
                        htmlFor="file-upload"
                        style={{
                            color: '#6f6fa2',
                            backgroundColor: '#F5F5FA',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            width: 164,
                            display: 'inline-block',
                            cursor: 'pointer',
                            fontSize: '16px',
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
            <Col lg={1} className="text-center">
                <div onClick={() => props.p5SketchRef.current.goBack()} className="icon-button">
                    <BsChevronLeft size={32} />
                    <div>Back</div>
                </div>
            </Col>
            <Col lg={1} className="text-center">
                <div onClick={() => props.p5SketchRef.current.drawNext()} className="icon-button">
                    <BsChevronRight size={32} />
                    <div>Next</div>
                </div>
            </Col>
            <Col lg={5}/>
    </Row>
)

export const WaveFunctionCollapseImageControls: FC = () => {
    const {imageName, setImageName, dimension, setDimension} = useContext(WaveFunctionCollapseContext)
    const nameInputStyle: CSSProperties = {
        fontSize: "2em",
        fontWeight: "bold",
        border: "none",
        outline: "none",
        width: "100%",
        textAlign: "center"
    }

    const dimensionTextStyle: CSSProperties = {
        textAlign: "center",
        width: "100%",
        display: "block"
    }

    return (
        <Container>
            <Row className="justify-content-center mb-3">
                <Col xs="auto">
                    <div className="p-3">
                        <Form.Group controlId="exampleForm.ControlRange1">
                            <Form.Control
                                style={nameInputStyle}
                                type="text"
                                placeholder="Enter name"
                                value={imageName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setImageName(e.target.value)}
                            />

                            <Form.Range
                                min={4}
                                max={30}
                                value={dimension}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setDimension(Number(e.target.value))}
                            />
                            <Form.Text className="text-muted" style={dimensionTextStyle}>
                                {dimension}x{dimension}
                            </Form.Text>
                        </Form.Group>
                    </div>
                </Col>
            </Row>
        </Container>

    )
}
