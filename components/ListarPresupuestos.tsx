import React from "react";
import { View, Text } from "react-native";
import { Card, Title  } from "react-native-paper";

export default function ListarPresupuestos({ path }: { path: string }) {
    return (
        <View style={{ flex: 1, width:'100%', height: '100%', justifyContent: 'center', }}>
            <Card style={{ padding: 20, borderRadius: 4, width: '98%', alignSelf: 'center', height: '95%' }}>
                <Card.Content>
                    <Card.Title title= "Listado de presupuestos" />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                            Presupuestos
                        </Text>
                </Card.Content>
            </Card>
        </View>
    );
}