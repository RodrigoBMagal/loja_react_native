import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useStock, CATEGORIES, CATEGORY_COLORS } from '../context/StockContext';

const Field = ({ label, required, children }) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      {label}{required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const Input = ({ value, onChangeText, placeholder, keyboardType = 'default', ...props }) => (
  <TextInput
    style={styles.input}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#aaa"
    keyboardType={keyboardType}
    {...props}
  />
);

const AddEditProductScreen = ({ navigation, route }) => {
  const { addProduct, updateProduct } = useStock();
  const isEdit = route?.params?.mode === 'edit';
  const existing = route?.params?.product;

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || CATEGORIES[0]);
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? ''));
  const [minQuantity, setMinQuantity] = useState(String(existing?.minQuantity ?? ''));
  const [unit, setUnit] = useState(existing?.unit || '');
  const [price, setPrice] = useState(existing?.price ? String(existing.price) : '');
  const [supplier, setSupplier] = useState(existing?.supplier || '');
  const [expiryDate, setExpiryDate] = useState(existing?.expiryDate || '');
  const [saving, setSaving] = useState(false);

  const UNITS = ['comprimidos', 'cápsulas', 'frascos', 'ampolas', 'doses', 'unidades', 'kg', 'g', 'ml', 'litros'];

  const formatDateInput = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const parseDateToISO = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [d, m, y] = dateStr.split('/');
    if (!d || !m || !y) return null;
    // Cria a data no timezone local, não em UTC
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseISOToDisplay = (isoStr) => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
  };

  useEffect(() => {
    if (existing?.expiryDate) {
      setExpiryDate(parseISOToDisplay(existing.expiryDate));
    }
  }, []);

  const validate = () => {
    if (!name.trim()) { Alert.alert('Erro', 'Informe o nome do produto.'); return false; }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) { Alert.alert('Erro', 'Informe uma quantidade válida.'); return false; }
    if (!minQuantity.trim() || isNaN(Number(minQuantity)) || Number(minQuantity) < 0) { Alert.alert('Erro', 'Informe a quantidade mínima válida.'); return false; }
    if (!unit.trim()) { Alert.alert('Erro', 'Informe a unidade de medida.'); return false; }
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) { Alert.alert('Erro', 'Informe um preço válido.'); return false; }
    if (!supplier.trim()) { Alert.alert('Erro', 'Informe o fornecedor.'); return false; }
    if (expiryDate && expiryDate.length > 0 && expiryDate.length !== 10) { Alert.alert('Erro', 'Data de validade inválida. Use DD/MM/AAAA.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unit: unit.trim(),
        price: parseFloat(price.replace(',', '.')),
        supplier: supplier.trim(),
        expiryDate: expiryDate ? parseDateToISO(expiryDate) : null,
      };
      if (isEdit) {
        await updateProduct(existing.id, data);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await addProduct(data);
        Alert.alert('Sucesso', 'Produto adicionado ao estoque!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const catColor = CATEGORY_COLORS[category] || '#999';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Categoria */}
        <Field label="Categoria" required>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
            {CATEGORIES.map(cat => {
              const active = category === cat;
              const c = CATEGORY_COLORS[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, active && { backgroundColor: c, borderColor: c }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, active && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Field>

        <Field label="Nome do Produto" required>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ex: Amoxicilina 50mg"
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Field label="Qtd. Atual" required>
              <Input
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Qtd. Mínima" required>
              <Input
                value={minQuantity}
                onChangeText={setMinQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
            </Field>
          </View>
        </View>

        {/* Unidade */}
        <Field label="Unidade de Medida" required>
          <Input value={unit} onChangeText={setUnit} placeholder="Ex: comprimidos, frascos..." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Field label="Preço Unitário (R$)" required>
              <Input
                value={price}
                onChangeText={setPrice}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Validade (DD/MM/AAAA)">
              <Input
                value={expiryDate}
                onChangeText={t => setExpiryDate(formatDateInput(t))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </Field>
          </View>
        </View>

        <Field label="Fornecedor" required>
          <Input value={supplier} onChangeText={setSupplier} placeholder="Ex: VetBras, Merial..." />
        </Field>

        {/* Preview */}
        {name || quantity ? (
          <View style={[styles.preview, { borderColor: catColor }]}>
            <Text style={styles.previewTitle}>Pré-visualização</Text>
            <View style={[styles.previewBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.previewCat, { color: catColor }]}>{category}</Text>
            </View>
            <Text style={styles.previewName}>{name || '(sem nome)'}</Text>
            <Text style={styles.previewDetails}>
              {quantity || '0'} {unit || 'unidades'} • Mín: {minQuantity || '0'} • R$ {price || '0,00'}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Botão salvar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : isEdit ? '💾 Salvar Alterações' : '✅ Adicionar Produto'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  required: { color: '#C62828' },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 15, color: '#333',
  },
  row: { flexDirection: 'row' },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0',
    marginRight: 8,
  },
  catChipText: { fontSize: 13, color: '#555' },
  unitChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 6,
  },
  unitChipActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  unitChipText: { fontSize: 12, color: '#666' },
  unitChipTextActive: { color: '#2E7D32', fontWeight: '600' },
  preview: {
    borderWidth: 2, borderRadius: 12, padding: 16, marginTop: 8,
    backgroundColor: '#fff',
  },
  previewTitle: { fontSize: 11, color: '#aaa', marginBottom: 8, fontWeight: '600' },
  previewBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  previewCat: { fontSize: 11, fontWeight: '600' },
  previewName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  previewDetails: { fontSize: 13, color: '#888' },
  footer: {
    flexDirection: 'row', padding: 16, gap: 10, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#EEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, elevation: 3,
  },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, color: '#666', fontWeight: '600' },
  saveBtn: {
    flex: 2, height: 50, borderRadius: 10, backgroundColor: '#2E7D32',
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
});

export default AddEditProductScreen;