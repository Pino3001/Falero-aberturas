import React, { useState } from "react";
import { Dialog, Button, Text, PaperProvider } from "react-native-paper";
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
        <Dialog visible={showDialog} onDismiss={() => { setShowDialog(false); onCancel(); }} style={{position: 'absolute'}} >
            <Dialog.Title >{Title}</Dialog.Title>
            <Dialog.Content>
                <Text >{Content_text}</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { setShowDialog(false); onCancel(); }}>Cancelar</Button>
                <Button onPress={() => { setShowDialog(false); onConfirm(); }}>Confirmar</Button>
            </Dialog.Actions>
        </Dialog>
    );
};

export default DialogComponent;

