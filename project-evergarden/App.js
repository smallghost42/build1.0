import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { TextInput, Button, Card, Text, IconButton, FAB, Divider, Chip } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [currentItemDesc, setCurrentItemDesc] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [links, setLinks] = useState([]);
  const [items, setItems] = useState([]);

  const addLink = () => {
    if (linkLabel && linkValue) {
      setLinks([...links, { label: linkLabel, value: linkValue, id: Date.now().toString() }]);
      setLinkLabel('');
      setLinkValue('');
    }
  };

  const removeLink = (idToRemove) => {
    setLinks(links.filter(link => link.id !== idToRemove));
  };

  const validateItem = () => {
    if (currentItemDesc && links.length > 0) {
      setItems([...items, { description: currentItemDesc, data: links, id: Date.now().toString() + '_item' }]);
      setCurrentItemDesc('');
      setLinks([]);
    } else if (!currentItemDesc) {
      alert('Please enter an item description.');
    } else if (links.length === 0) {
      alert('Please add at least one column.');
    }
  };

  const exportCSV = async () => {
    if (items.length === 0) {
      alert('No items to export.');
      return;
    }
    const csv = items.map((item) => {
      const headers = item.data.map(e => e.label).join(',');
      const values = item.data.map(e => e.value).join(',');
      return `${item.description}\n${headers}\n${values}`;
    }).join('\n\n');
    const fileUri = FileSystem.documentDirectory + 'data.csv';
    try {
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      alert('Exported to CSV:\n' + fileUri);
    } catch (error) {
      console.error("Failed to export CSV", error);
      alert('Failed to export CSV. Check console for details.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Create New Item"
          left={(props) => <IconButton {...props} icon="playlist-plus" />}
        />
        <Card.Content>
          <TextInput
            label="Item Description (e.g. 'Wood Order #1')"
            value={currentItemDesc}
            onChangeText={setCurrentItemDesc}
            mode="outlined"
            style={styles.inputField}
          />

          <Divider style={styles.divider} />
          <Text style={styles.subHeader}>Add Columns</Text>

          <View style={styles.inputRow}>
            <TextInput
              label="Column Name"
              value={linkLabel}
              onChangeText={setLinkLabel}
              mode="outlined"
              style={[styles.inputHalf, styles.inputField]}
            />
            <TextInput
              label="Value"
              value={linkValue}
              onChangeText={setLinkValue}
              mode="outlined"
              style={[styles.inputHalf, styles.inputField]}
            />
          </View>
          <Button icon="plus-circle-outline" mode="contained" onPress={addLink} style={styles.button}>
            Add Column
          </Button>

          {links.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.subHeader}>Current Columns for this Item:</Text>
              <View style={styles.linksContainer}>
                {links.map((link) => (
                  <Chip
                    key={link.id}
                    icon="tag-outline"
                    onClose={() => removeLink(link.id)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {`${link.label}: ${link.value}`}
                  </Chip>
                ))}
              </View>
            </>
          )}
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
           <Button
            icon="history"
            mode="outlined"
            onPress={() => { /* Implement history functionality if needed */ }}
            style={styles.historyButton}
          >
            History
          </Button>
          <Button
            icon="check-bold"
            mode="contained-tonal"
            onPress={validateItem}
            style={styles.button}
            disabled={!currentItemDesc || links.length === 0}
          >
            Validate and Add Item
          </Button>
        </Card.Actions>
      </Card>

      {items.length > 0 && <Divider style={styles.dividerBold} />}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <Card.Title title={item.description} />
            <ScrollView horizontal>
              <View>
                <View style={styles.tableRow}>
                  {item.data.map((col) => (
                    <Text key={col.id + '_header'} style={[styles.tableCell, styles.headerCell]}>
                      {col.label}
                    </Text>
                  ))}
                </View>
                <View style={styles.tableRow}>
                  {item.data.map((col) => (
                    <Text key={col.id + '_value'} style={styles.tableCell}>
                      {col.value}
                    </Text>
                  ))}
                </View>
              </View>
            </ScrollView>
          </Card>
        )}
        ListHeaderComponent={items.length > 0 ? <Text style={styles.validatedItemsHeader}>Validated Items</Text> : null}
        contentContainerStyle={styles.itemsContainer}
      />


      <FAB
        icon="file-export"
        label="Export CSV"
        style={styles.fab}
        onPress={exportCSV}
        visible={items.length > 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f4f8', // Light background
  },
  header: {
    fontSize: 24, // Increased size
    fontWeight: 'bold',
    marginVertical: 15, // Adjusted margin
    textAlign: 'center',
    color: '#333', // Darker color
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600', // Semibold
    marginTop: 5,
    marginBottom: 10,
    color: '#555',
  },
  card: {
    marginVertical: 10,
    borderRadius: 8, // Rounded corners
    elevation: 3, // Shadow for Android
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputHalf: {
    flex: 1,
  },
  inputField: {
    marginBottom: 5,
    height: 40,
  },
  button: {
    marginTop: 10,
    borderRadius: 20,
  },
  historyButton: {
    marginRight: 'auto',
    borderRadius: 20,
  },
  cardActions: {
    paddingHorizontal: 16, // Padding for actions
    paddingBottom: 10,
    justifyContent: 'flex-end', // Align buttons to the right
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow chips to wrap
    marginTop: 5,
    marginBottom: 10,
  },
  chip: {
    margin: 4,
    backgroundColor: '#e0e0e0', // Lighter chip background
  },
  chipText: {
    fontSize: 13,
  },
  divider: {
    marginVertical: 15,
  },
  dividerBold: {
    marginVertical: 20,
    height: 2,
    backgroundColor: '#c0c0c0'
  },
  validatedItemsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#444',
  },
  itemsContainer: {
    paddingBottom: 100, // Ensure space for FAB
  },
  itemCard: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 110, 
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#d7eaf7',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4caf50',
  },
});