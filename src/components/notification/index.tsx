import {useContext} from "react";
import {NotificationsContext} from "../../contexts/Notifications";
import {Alert, Button, Col, Container, Row} from "react-bootstrap";

const Notification = () => {
    const {notifications, removeNotification} = useContext(NotificationsContext);

    if (notifications.length === 0) {
        return null;
    }

    return (
        <Container>
            <Row>
                <Col lg={4}/>
                <Col lg={4}>
                    <Alert variant={notifications[0].type.toLocaleLowerCase()}>
                        <Alert.Heading>{notifications[0].message}</Alert.Heading>
                        <div className="d-flex justify-content-end">
                            <Button onClick={() => removeNotification(0)} variant="outline-secondary">
                                Close
                            </Button>
                        </div>
                    </Alert>
                </Col>
                <Col lg={4}/>
            </Row>
        </Container>

    )
}

export default Notification;
