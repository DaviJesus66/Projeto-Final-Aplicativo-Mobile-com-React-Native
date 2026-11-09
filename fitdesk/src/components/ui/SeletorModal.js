import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { radius } from '../../constants/theme';

// options: [{ value, label, hint? }]
export default function SeletorModal({ visible, title, options, selected, onSelect, onClose }) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = item.value === selected;
            return (
              <Pressable
                onPress={() => onSelect(item.value)}
                style={[styles.option, { borderBottomColor: colors.border }]}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: isSelected ? '700' : '500' }}>
                    {item.label}
                  </Text>
                  {item.hint ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.hint}</Text> : null}
                </View>
                {isSelected ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { maxHeight: '60%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
