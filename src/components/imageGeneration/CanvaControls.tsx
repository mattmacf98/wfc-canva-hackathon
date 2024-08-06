import {FC, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";

const handleAuthorizeClick = () => {
    window.open("http://127.0.0.1:3001/authorize", "_blank")
}
export interface ICanvaControlsProps {
    openImageSelectModal: () => void;
    imageName: string;
}

export const CanvaControls: FC<ICanvaControlsProps> = ({openImageSelectModal, imageName}) => {
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const uploadToCanva = async () => {
        setUploadingImage(true);
        const canvas: HTMLCanvasElement = document.getElementsByClassName("p5Canvas")[0] as HTMLCanvasElement;
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'canvasImage.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`http://127.0.0.1:3001/upload?name=${imageName}`, {
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
        <Row>
            <Col lg={12}>
                <h2>Canva Controls</h2>
            </Col>
            <Col lg={4}>
                <Button onClick={handleAuthorizeClick}>Authorize Canva</Button>
            </Col>
            <Col lg={4}>
                <Button onClick={() => openImageSelectModal()}>Import Tiles From Canva</Button>
            </Col>
            <Col lg={4}>
                {
                    uploadingImage ?
                        <Button disabled>Uploading...</Button> : <Button onClick={uploadToCanva}>Upload Image</Button>
                }
            </Col>
        </Row>
    )
}
