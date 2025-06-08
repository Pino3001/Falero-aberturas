import Colors from "../utils/constants/Colors";
import React, { useState } from "react";
import { Dialog, Button, Text } from "react-native-paper";
 // Adjust the import path as needed


type DialogComponentProps = {
    Title: string,
    Content_text: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const DialogComponent: React.FC<DialogComponentProps> = ({ Title, Content_text, onCancel, onConfirm }) => {
    const [showDialog, setShowDialog] = useState(true);

    return (
        <Dialog visible={showDialog} onDismiss={() => { setShowDialog(false); onCancel(); }} style={{backgroundColor: Colors.colors.background_modal}}>
            <Dialog.Title style={{ color: Colors.colors.text }}>{Title}</Dialog.Title>
            <Dialog.Content>
                <Text style={{ color: Colors.colors.text }}>{Content_text}</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button textColor={Colors.colors.complementario} onPress={() => { setShowDialog(false); onCancel(); }}>Cancelar</Button>
                <Button textColor={Colors.colors.complementario} onPress={() => { setShowDialog(false); onConfirm(); }}>Confirmar</Button>
            </Dialog.Actions>
        </Dialog>
    );
};

export default DialogComponent;

function setShowDialog(arg0: boolean) {
    throw new Error("Function not implemented.");
}
