import {FC, useEffect, useState} from "react";
import {ICanvaFolder, ICanvaImageAsset} from "../../interfaces/imageGeneration";
import {Button, Card, Col, Container, Modal, Row} from "react-bootstrap";

export interface IImageTileSelectModalProps {
    show: boolean;
    hide: () => void;
    setImageUrls: (urls: string[]) => void;
}
export const ImageTileSelectModal: FC<IImageTileSelectModalProps> = ({show, hide, setImageUrls}) => {
    const [selectedImages, setSelectedImages] = useState({});
    const [selectedFolder, setSelectedFolder] = useState<string>("root");
    const [imageTileOptions, setImageTileOptions] = useState<ICanvaImageAsset[]>([]);
    const [folderOptions, setFolderOptions] = useState<ICanvaFolder[]>([]);

    const selectedStyle = {
        border: '3px solid black',
        transform: 'scale(1.1)',
        transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out',
    };

    useEffect(() => {
        importImagesFromCanva()
    }, [selectedFolder])

    useEffect(() => {
        const selImgs = {};
        for (let i = 0; i < imageTileOptions.length; i++) {
            selImgs[i] = false;
        }
        setSelectedImages(selImgs);
    }, [imageTileOptions]);

    const handleSelectCanvasImages = (selectedImages: ICanvaImageAsset[]) => {
        setImageUrls(selectedImages.map(selectedImage => selectedImage.url));
        hide();
    }

    const importImagesFromCanva = async () => {
        const data = await fetch(`http://127.0.0.1:3001/folder?folderId=${selectedFolder}`, {credentials: "include"});
        const res = await data.json();
        setImageTileOptions(res.assets);
        setFolderOptions(res.folders);
    }

    return (
        <Modal show={show} onHide={hide}>
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
                                    onClick={() => setSelectedFolder(folder.id)}
                                >
                                    <Card.Body>
                                        <Card.Img variant="top" src={"/Folder-icon.png"}/>
                                        <Card.Title>{folder.name}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                        {
                            selectedFolder !== "root" &&
                            <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                    onClick={() => setSelectedFolder("root")}
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
                <Button variant="primary" onClick={() => handleSelectCanvasImages(imageTileOptions.filter((_, index) => selectedImages[index]))}>
                    Select
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
