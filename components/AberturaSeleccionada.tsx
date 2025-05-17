import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from './Themed';
import { Button, Checkbox, Chip, TextInput } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import NotFoundScreen from '@/app/+not-found';
import { Dropdown } from 'react-native-element-dropdown';

type MaterialCosto = [string, number];

export default function AberturaSeleccionada() {
    const [checked, setChecked] = useState(false);
    const [selected, setSelected] = useState(false);

    const data = [
        { label: 'SERIE 20', value: 'op2' },
        { label: 'SERIE 25 2 hojas', value: 'op1' },
        { label: 'SERIE 25 en 3 hojas', value: 'op2' },
    ];
    return (
        <View style={{  width: '90%', backgroundColor: 'green', alignItems: "center", alignSelf:'center' }}>
            <View style={{ flexDirection: 'column', gap: 15, alignContent: "center",  alignItems: "center", width: '100%' }}>
                {/* Lista de materiales */}
                <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Text>Dimensiones</Text>
                    <View style={{ flexDirection: 'row', gap: 8,justifyContent: "flex-start", alignItems: "center", width: "70%" }}>
                    <TextInput
                        value='500'
                        label='Largo'
                        mode="outlined"
                        underlineColor='white'
                        style={{ height: 40 }}
                        keyboardType="numeric"
                        right={<TextInput.Affix text="cm" />} 
                        showSoftInputOnFocus={false}
                    />
                    <FontAwesome name="close" size={20} color="white" />
                    <TextInput
                        value='500'
                        label='Ancho'
                        mode="outlined"
                        underlineColor='white'
                        style={{ height: 40 }}
                        right={<TextInput.Affix text="cm" />} 
                        keyboardType="numeric"
                    />
                    </View>
                    
                </View>

                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: "100%",  alignItems: "center" }}>
                    <Text>Serie</Text>
                    <View style={{ width: "70%" }}>
                        <Dropdown
                            data={data}
                            labelField="label"
                            valueField="value"
                            style={styles.outputMaterial}
                            onChange={(item) => setSelected(item.value)}
                            value={selected}
                            placeholder=" Selecciona la serie"
                            placeholderStyle={{ color: 'white' }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <Text>Color</Text>
                    <View style={{ width: "70%" }}>
                        <Dropdown
                            data={data}
                            labelField="label"
                            valueField="value"
                            style={styles.outputMaterial}

                            onChange={(item) => setSelected(item.value)}
                            value={selected}
                            placeholder=" Selecciona el color"
                            placeholderStyle={{ color: 'white' }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", }}>
                    <Text>Cortina</Text>
                    <View style={{ width: "70%" }}>
                        { <Dropdown
                        data={data}
                        labelField="label"
                        valueField="value"
                        style={styles.outputMaterial}
                        onChange={(item) => setSelected(item.value)}
                        value={selected}
                        placeholder=" Selecciona la cortina"
                        placeholderStyle={{ color: 'white' }}
                    /> }
                    </View>
                </View>

                <View style={styles.ContainerMaterialesChip}>
                    <View style={{
                        minWidth: 120,
                    }}>
                        <Chip
                            icon={selected ? "check" : "close"}
                            onPress={() => setSelected(!selected)}
                            style={{
                                borderRadius: 16,
                                backgroundColor: selected ? '#6200ee' : 'grey',
                            }}
                        >
                            Mosquitero
                        </Chip>
                    </View>

                    <View style={{
                        minWidth: 120,
                    }}>
                        <Chip
                            icon={selected ? "check" : "close"}
                            onPress={() => setSelected(!selected)}
                            style={{
                                borderRadius: 16,
                                backgroundColor: selected ? '#6200ee' : 'grey',
                            }}
                        >
                            Vidrio
                        </Chip>
                    </View>

                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        //onPress={() => handleSelectMaterial(index)}
                        icon={() => <FontAwesome name="check" size={20} color="green" />} children
                        style={styles.button}
                    />
                    <Button
                        mode="contained"
                        // onPress={() => handleRemoveMaterial(index)}
                        icon={() => <FontAwesome name="close" size={20} color="red" />} children
                        style={[styles.button, { marginLeft: 5 }]}
                    />
                </View>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    Container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ContainerMateriales: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 10,
    },
    ContainerMaterialesChip: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    outputMaterial: {
        height: 40,
        borderColor: '#757575', // Color del borde
        borderWidth: 1.5,
        borderRadius: 4,
        backgroundColor: '#121212',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    button: {
        height: 40,
        justifyContent: 'center',
    },
    placeholderStyle: {
        color: 'white'
    }
});