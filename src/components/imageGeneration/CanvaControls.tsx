import {FC, forwardRef, useContext, useImperativeHandle, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";
import {NotificationsContext} from "../../contexts/Notifications";

const handleAuthorizeClick = () => {
    window.open("http://127.0.0.1:3001/authorize", "_blank")
}
export interface ICanvaControlsProps {
    openImageSelectModal: () => void
}

export const CanvaControls: FC = forwardRef((props: ICanvaControlsProps, ref) => {
    const {imageName} = useContext(WaveFunctionCollapseContext);
    const {addNotification} = useContext(NotificationsContext);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        uploadToCanva: (name: string) => {
            uploadToCanva(name)
        }
    }), [])

    const uploadToCanva = async (name: string) => {
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
                addNotification({type: "Danger", message: "Error Uploading Image"})
            } else {
                addNotification({type: "Success", message: "Image Uploaded"})
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
                <Button onClick={() => props.openImageSelectModal()}>Import Tiles From Canva</Button>
            </Col>
            <Col lg={4}>
                {
                    uploadingImage ?
                        <Button disabled>Uploading...</Button> : <Button onClick={() => uploadToCanva(imageName)}>Upload Image</Button>
                }
            </Col>
        </Row>
    )
});
