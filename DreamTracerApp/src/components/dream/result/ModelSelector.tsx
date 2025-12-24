import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../../../styles/colors';
import { AIModel } from '../../../services/aiService';

interface ModelSelectorProps {
  selectedModel: AIModel;
  availableModels: any[];
  onModelChange: (model: AIModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  availableModels,
  onModelChange
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 모델</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {availableModels.map((model) => (
          <TouchableOpacity
            key={model.model}
            style={[
              styles.button,
              selectedModel === model.model && styles.buttonActive
            ]}
            onPress={() => onModelChange(model.model)}
            disabled={!model.isAvailable}
          >
            <Text style={[
              styles.buttonText,
              selectedModel === model.model && styles.buttonTextActive,
              !model.isAvailable && styles.buttonDisabled
            ]}>
              {model.name}
            </Text>
            <Text style={styles.description}>{model.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  scrollView: {
    paddingLeft: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
  },
  buttonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextActive: {
    color: Colors.textInverse,
  },
  buttonDisabled: {
    color: Colors.textMuted,
  },
  description: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
