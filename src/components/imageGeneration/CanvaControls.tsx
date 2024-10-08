import {CSSProperties, FC, forwardRef, useContext, useImperativeHandle, useState} from "react";
import {Button, Col, Container, Row} from "react-bootstrap";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";
import {NotificationsContext} from "../../contexts/Notifications";
import {backendHost} from "../../config";

const handleAuthorizeClick = () => {
    window.open(`${backendHost}/authorize`, "_blank")
}
export interface ICanvaControlsProps {
    openImageSelectModal: () => void
    ref: any
}

export const CanvaControls: FC<ICanvaControlsProps> = forwardRef((props: ICanvaControlsProps, ref) => {
    const {imageName} = useContext(WaveFunctionCollapseContext);
    const {addNotification} = useContext(NotificationsContext);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        uploadToCanva: (name: string) => {
            uploadToCanva(name)
        }
    }), [])

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

    const uploadToCanva = async (name: string) => {
        setUploadingImage(true);
        const canvas: HTMLCanvasElement = document.getElementsByClassName("p5Canvas")[0] as HTMLCanvasElement;
        canvas.toBlob(async (blob) => {
            const file = new File([blob!], 'canvasImage.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${backendHost}/upload?name=${name}`, {
                method: 'POST',
                body: formData,
                credentials: "include"
            });

            setUploadingImage(false)
            if (!response.ok) {
                addNotification({type: "Danger", message: "Error Uploading Image"})
            } else {
                addNotification({type: "Success", message: "Image Uploaded"})
            }
        }, "image/png")
    }

    return (
        <Container>
            <Row style={containerStyle}>
                <Col lg={12} className="my-2">
                    <h3>Canva Controls</h3>
                </Col>
                <Col lg={12} className="my-2">
                    <Button onClick={handleAuthorizeClick} style={buttonStyle}>Authorize Canva</Button>
                </Col>
                <Col lg={12} className="my-2">
                    <Button onClick={() => props.openImageSelectModal()} style={buttonStyle}>Import Tiles From Canva</Button>
                </Col>
                <Col lg={12} className="my-2">
                    {
                        uploadingImage ?
                            <Button disabled style={buttonStyle}>Uploading...</Button> : <Button onClick={() => uploadToCanva(imageName)} style={buttonStyle}>Upload Image</Button>
                    }
                </Col>
            </Row>
        </Container>
    )
});
