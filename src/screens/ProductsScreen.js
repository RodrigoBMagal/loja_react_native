import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, RefreshControl, Modal, ScrollView,
} from 'react-native';
import { useStock, CATEGORIES, CATEGORY_COLORS } from '../context/StockContext';

const ProductItem = ({ product, onEdit, onDelete, onUpdateQty }) => {
  const isLow = product.quantity <= product.minQuantity;
  const isOut = product.quantity === 0;
  const color = CATEGORY_COLORS[product.category] || '#999';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    // Parse a data ISO (YYYY-MM-DD) corretamente no timezone local
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('pt-BR');
  };

  const statusColor = isOut ? '#C62828' : isLow ? '#E65100' : '#2E7D32';
  const statusLabel = isOut ? 'SEM ESTOQUE' : isLow ? 'ESTOQUE BAIXO' : 'OK';

  return (
    <View style={[styles.productCard, isLow && styles.productCardWarn]}>
      <View style={styles.productHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: color + '22' }]}>
          <View style={[styles.categoryDot, { backgroundColor: color }]} />
          <Text style={[styles.categoryText, { color }]}>{product.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productSupplier}>Fornecedor: {product.supplier}</Text>

      <View style={styles.productDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Qtd. Atual</Text>
          <Text style={[styles.detailValue, { color: statusColor }]}>
            {product.quantity} {product.unit}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Qtd. Mínima</Text>
          <Text style={styles.detailValue}>{product.minQuantity} {product.unit}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Preço Unit.</Text>
          <Text style={styles.detailValue}>
            R$ {parseFloat(product.price).toFixed(2)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Validade</Text>
          <Text style={styles.detailValue}>{formatDate(product.expiryDate)}</Text>
        </View>
      </View>

      {/* Controle de Quantidade */}
      <View style={styles.qtyControl}>
        <Text style={styles.qtyLabel}>Atualizar quantidade:</Text>
        <View style={styles.qtyButtons}>
          <TouchableOpacity style={[styles.qtyBtn, styles.qtyMinus]} onPress={() => onUpdateQty(product.id, -1)}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyDisplay}>{product.quantity}</Text>
          <TouchableOpacity style={[styles.qtyBtn, styles.qtyPlus]} onPress={() => onUpdateQty(product.id, 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qtyBtn, styles.qtyAdd5]} onPress={() => onUpdateQty(product.id, 5)}>
            <Text style={styles.qtySmall}>+5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qtyBtn, styles.qtyAdd10]} onPress={() => onUpdateQty(product.id, 10)}>
            <Text style={styles.qtySmall}>+10</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productActions}>
        <Text style={styles.lastUpdated}>
          Atualizado: {new Date(product.lastUpdated).toLocaleDateString('pt-BR')}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(product)}>
            <Text style={styles.editBtnText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(product)}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ProductsScreen = ({ navigation }) => {
  const { products, deleteProduct, updateQuantity, loading, reload } = useStock();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [showFilter, setShowFilter] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'Todas') list = list.filter(p => p.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'qty') return parseFloat(a.quantity) - parseFloat(b.quantity);
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price);
      return 0;
    });
    return list;
  }, [products, search, selectedCategory, sortBy]);

  const handleDelete = (product) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja remover "${product.name}" do estoque?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  const handleEdit = (product) => {
    navigation.navigate('AddEditProduct', { product, mode: 'edit' });
  };

  const allCategories = ['Todas', ...CATEGORIES];

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchText}
            placeholder="Buscar produto, fornecedor..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#999', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Text style={styles.filterBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Categorias */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {allCategories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resultado */}
      <Text style={styles.resultCount}>{filtered.length} produto(s) encontrado(s)</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateQty={updateQuantity}
          />
        )}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditProduct', { mode: 'add' })}
      >
        <Text style={styles.fabText}>+ Novo Produto</Text>
      </TouchableOpacity>

      {/* Modal de Filtro/Ordenação */}
      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={styles.filterModal}>
            <Text style={styles.filterTitle}>Ordenar por</Text>
            {[
              { key: 'name', label: '🔤 Nome (A-Z)' },
              { key: 'qty', label: '📦 Quantidade (menor primeiro)' },
              { key: 'price', label: '💰 Preço (menor primeiro)' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterOpt, sortBy === opt.key && styles.filterOptActive]}
                onPress={() => { setSortBy(opt.key); setShowFilter(false); }}
              >
                <Text style={[styles.filterOptText, sortBy === opt.key && styles.filterOptTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  searchBar: { flexDirection: 'row', padding: 12, gap: 8 },
  searchInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchText: { flex: 1, height: 44, fontSize: 15, color: '#333' },
  filterBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  filterBtnText: { fontSize: 20 },
  catScroll: { maxHeight: 48 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  catChipActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  catChipText: { fontSize: 13, color: '#555' },
  catChipTextActive: { color: '#fff', fontWeight: '600' },
  resultCount: { paddingHorizontal: 16, paddingVertical: 6, fontSize: 12, color: '#888' },
  productCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, elevation: 2,
  },
  productCardWarn: { borderLeftWidth: 3, borderLeftColor: '#E65100' },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  categoryText: { fontSize: 11, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  productSupplier: { fontSize: 12, color: '#888', marginBottom: 10 },
  productDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  detailItem: { flex: 1, minWidth: '40%', backgroundColor: '#F8F9FA', borderRadius: 8, padding: 8 },
  detailLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  qtyControl: { marginBottom: 10 },
  qtyLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  qtyButtons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyMinus: { backgroundColor: '#FFEBEE' },
  qtyPlus: { backgroundColor: '#E8F5E9' },
  qtyAdd5: { backgroundColor: '#E3F2FD', width: 38 },
  qtyAdd10: { backgroundColor: '#E3F2FD', width: 42 },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  qtySmall: { fontSize: 12, fontWeight: 'bold', color: '#1565C0' },
  qtyDisplay: { fontSize: 18, fontWeight: 'bold', color: '#333', minWidth: 36, textAlign: 'center' },
  productActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  lastUpdated: { fontSize: 11, color: '#bbb' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: '#FFEBEE', width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#999' },
  fab: {
    position: 'absolute', bottom: 20, right: 16, left: 16,
    backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, elevation: 5,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  filterModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  filterOpt: { padding: 14, borderRadius: 10, marginBottom: 8, backgroundColor: '#F5F5F5' },
  filterOptActive: { backgroundColor: '#E8F5E9' },
  filterOptText: { fontSize: 15, color: '#555' },
  filterOptTextActive: { color: '#2E7D32', fontWeight: '600' },
});

export default ProductsScreen;