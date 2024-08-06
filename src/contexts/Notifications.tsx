import {createContext, FC, ReactNode, useState} from "react";

type Notification = {
    message:string,
    type: 'Success' | 'Danger' | 'Warning'
}

interface INotificationsContext {
    notifications: Notification[],
    addNotification: (notification:Notification) => void,
    removeNotification: (index:number) => void
}

const initialContext: INotificationsContext = {
    notifications: [],
    addNotification: () => {},
    removeNotification: () => {}
}

export const NotificationsContext = createContext<INotificationsContext>(initialContext);

interface IProps {
    children: ReactNode;
}
export const NotificationsProvider: FC<IProps> = ({children}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification:Notification) => {
        setNotifications([...notifications, notification]);
    }

    const removeNotification = (index:number) => {
        const newNotifications = [...notifications];
        newNotifications.splice(index, 1);
        setNotifications(newNotifications);
    }

    return (
        <NotificationsContext.Provider value={{notifications, addNotification, removeNotification}}>
            {children}
        </NotificationsContext.Provider>
    )
}
