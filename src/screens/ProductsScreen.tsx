import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, RefreshControl, Modal, Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStock, CATEGORY_COLORS } from '../context/StockContext';
import { MainTabParamList, RootStackParamList, Product } from '../types';
import { Button, Input, Card, Badge } from '@/components/ui';
import { colors, spacing, typography, borderRadius, getElevation, getCategoryBadgeBg, getSemanticBadgeBg } from '@/design/tokens';
import { productsApi } from '../services/api';

type Props = BottomTabScreenProps<MainTabParamList, 'Products'> & {
  navigation: CompositeNavigationProp<
    BottomTabScreenProps<MainTabParamList, 'Products'>['navigation'],
    StackNavigationProp<RootStackParamList>
  >;
};

type SortBy = 'name' | 'qty' | 'price';

interface ProductItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdateQty: (id: number, delta: number) => void;
  updatingId: number | null;
}
const ProductItem = ({ product, onEdit, onDelete, onUpdateQty, updatingId }: ProductItemProps) => {
  const isLow = product.quantity <= product.minQuantity;
  const isOut = product.quantity === 0;
  const color = CATEGORY_COLORS[product.category] || '#999';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('pt-BR');
  };

  const statusColor = isOut ? colors.semantic.danger : isLow ? colors.semantic.warning : colors.semantic.success;
  const statusLabel = isOut ? 'SEM ESTOQUE' : isLow ? 'ESTOQUE BAIXO' : 'OK';
  
  // Map category to lowercase key for tokens (remove accents)
  const categoryKey = product.category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') as keyof typeof colors.category;

  return (
    <Card variant="default" style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryBadgeBg(categoryKey) }]}>
          <View style={[styles.categoryDot, { backgroundColor: color }]} />
          <Text style={[styles.categoryText, { color }]}>{product.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getSemanticBadgeBg(statusLabel === 'SEM ESTOQUE' ? 'danger' : statusLabel === 'ESTOQUE BAIXO' ? 'warning' : 'success') }]}>
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
            R$ {Number(product.price).toFixed(2)}
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
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onUpdateQty(product.id, -1)}
            disabled={product.quantity === 0 || updatingId === product.id}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </Button>
          <Text style={styles.qtyDisplay}>{product.quantity}</Text>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onUpdateQty(product.id, 1)}
            disabled={updatingId === product.id}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onUpdateQty(product.id, 5)}
            disabled={updatingId === product.id}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtySmall}>+5</Text>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onUpdateQty(product.id, 10)}
            disabled={updatingId === product.id}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtySmall}>+10</Text>
          </Button>
        </View>
      </View>

      {/* Ações do produto */}
      <View style={styles.productActions}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => onEdit(product)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>✏️ Editar</Text>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => onDelete(product)}
          style={styles.actionBtn}
        >
          <Text style={[styles.actionBtnText, { color: colors.semantic.danger }]}>🗑️ Excluir</Text>
        </Button>
      </View>
    </Card>
  );
};

const ProductsScreen = ({ navigation }: Props) => {
  const { products, getLowStockProducts, reload } = useStock();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const lowStock = getLowStockProducts();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.supplier.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    switch (filter) {
      case 'low':
        result = result.filter(p => p.quantity <= p.minQuantity && p.quantity > 0);
        break;
      case 'out':
        result = result.filter(p => p.quantity === 0);
        break;
      case 'expired':
        result = result.filter(p => {
          if (!p.expiryDate) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const [y, m, d] = p.expiryDate.split('-');
          const expDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
          return expDate < today;
        });
        break;
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'qty':
          return a.quantity - b.quantity;
        case 'price':
          return Number(a.price) - Number(b.price);
      }
    });

    return result;
  }, [products, search, filter, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const { updateQuantity, deleteProduct } = useStock();

  // Prevent double-tap on quantity buttons
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);

  const handleEdit = (product: Product) => {
    navigation.navigate('AddEditProduct', { mode: 'edit', product });
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const handleUpdateQty = async (id: number, delta: number) => {
    // Prevent double-tap: ignore if already updating this product
    if (updatingQtyId === id) return;
    
    setUpdatingQtyId(id);
    try {
      await updateQuantity(id, delta);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Erro', 'Não foi possível atualizar a quantidade: ' + message);
    } finally {
      setUpdatingQtyId(null);
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setDeleteModalVisible(false);
        setProductToDelete(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        Alert.alert('Erro', 'Não foi possível excluir o produto: ' + message);
      }
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <View style={styles.container}>
      {/* Header com busca e filtros */}
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChangeText={setSearch}
            leftIcon="🔍"
            size="default"
            style={styles.searchInput}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>
              Filtro {filter !== 'all' && <Badge variant="category" category="vacinas" size="default">{filter}</Badge>}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddEditProduct', { mode: 'add' })} style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contadores */}
      <View style={styles.counters}>
        <Text style={styles.counter}>
          Total: <Text style={styles.counterValue}>{products.length}</Text>
        </Text>
        <Text style={[styles.counter, styles.counterWarn]}>
          Baixo: <Text style={styles.counterValue}>{lowStock.length}</Text>
        </Text>
        <Text style={[styles.counter, styles.counterDanger]}>
          Vencidos: <Text style={styles.counterValue}>
            {products.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length}
          </Text>
        </Text>
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateQty={handleUpdateQty}
            updatingId={updatingQtyId}
          />
        )}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: spacing[3] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand[600]]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {search || filter !== 'all'
                ? 'Nenhum produto encontrado'
                : 'Nenhum produto cadastrado'}
            </Text>
          </View>
        }
      />

      {/* Modal de Filtros */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.filterTitle}>Filtrar Produtos</Text>
            {(['all', 'low', 'out', 'expired'] as const).map(f => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterOpt,
                  filter === f && styles.filterOptActive,
                ]}
                onPress={() => {
                  setFilter(f);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.filterOptText,
                  filter === f && styles.filterOptTextActive,
                ]}>
                  {f === 'all' && 'Todos'}
                  {f === 'low' && '⚠️ Estoque Baixo'}
                  {f === 'out' && '🚫 Sem Estoque'}
                  {f === 'expired' && '📅 Vencidos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Excluir Produto</Text>
            <Text style={styles.deleteModalMessage}>
              Tem certeza que deseja excluir <Text style={styles.deleteModalProductName}>{productToDelete?.name}</Text>?
              Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.deleteModalButtons}>
              <Button
                variant="secondary"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.deleteModalBtn}
              >
                <Text style={styles.deleteModalBtnText}>Cancelar</Text>
              </Button>
              <Button
                variant="danger"
                onPress={confirmDelete}
                style={styles.deleteModalBtn}
              >
                <Text style={styles.deleteModalBtnTextConfirm}>Excluir</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  searchWrapper: { flex: 1, marginRight: spacing[2] },
  searchInput: { marginBottom: 0 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[2], paddingVertical: spacing[1], backgroundColor: colors.surface.secondary, borderRadius: borderRadius.full },
  filterBtnText: { color: colors.neutral[900], fontSize: typography.sizes.bodySm, fontWeight: '500' },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand[600], justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: typography.sizes.headingLg, fontWeight: 'bold', lineHeight: typography.lineHeights.headingLg, includeFontPadding: false },
  counters: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing[2], backgroundColor: colors.surface.secondary },
  counter: { fontSize: typography.sizes.bodySm, color: colors.neutral[600] },
  counterValue: { fontWeight: 'bold', color: colors.neutral[900], marginLeft: spacing[1] },
  counterWarn: { color: colors.semantic.warning },
  counterDanger: { color: colors.semantic.danger },
  productCard: { marginBottom: spacing[3], padding: spacing[3] },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.full },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing[1] },
  categoryText: { fontSize: typography.sizes.bodySm, fontWeight: '600' },
  statusBadge: { paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.full },
  statusText: { fontSize: typography.sizes.caption, fontWeight: 'bold' },
  productName: { fontSize: typography.sizes.bodyLg, fontWeight: 'bold', color: colors.neutral[900], marginBottom: spacing[1] },
  productSupplier: { fontSize: typography.sizes.bodySm, color: colors.neutral[600], marginBottom: spacing[2] },
  productDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], marginBottom: spacing[3] },
  detailItem: { flex: 1, minWidth: '40%' },
  detailLabel: { fontSize: typography.sizes.caption, color: colors.neutral[500], textTransform: 'uppercase', marginBottom: spacing[1] },
  detailValue: { fontSize: typography.sizes.bodyMd, fontWeight: '500', color: colors.neutral[900] },
  qtyControl: { borderTopWidth: 1, borderTopColor: colors.neutral[200], paddingTop: spacing[2] },
  qtyLabel: { fontSize: typography.sizes.bodySm, color: colors.neutral[600], marginBottom: spacing[2] },
  qtyButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  qtyBtn: { minWidth: 40 },
  qtyBtnText: { fontSize: typography.sizes.bodyMd },
  qtyDisplay: { alignSelf: 'center', fontSize: typography.sizes.bodyLg, fontWeight: 'bold', color: colors.neutral[900], minWidth: 40, textAlign: 'center' },
  qtySmall: { fontSize: typography.sizes.caption },
  productActions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.neutral[200] },
  actionBtn: { flex: 1 },
  actionBtnText: { textAlign: 'center', fontSize: typography.sizes.bodySm, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
  emptyIcon: { fontSize: 64, marginBottom: spacing[3] },
  emptyText: { fontSize: typography.sizes.bodyMd, color: colors.neutral[500], textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  filterModal: { width: '85%', backgroundColor: colors.surface.primary, borderRadius: borderRadius.lg, padding: spacing[4] },
  filterTitle: { fontSize: typography.sizes.bodyLg, fontWeight: 'bold', color: colors.neutral[900], marginBottom: spacing[3], textAlign: 'center' },
  filterOpt: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: borderRadius.md, marginVertical: spacing[1] },
  filterOptActive: { backgroundColor: colors.brand[100] },
  filterOptText: { fontSize: typography.sizes.bodyMd, color: colors.neutral[900] },
  filterOptTextActive: { color: colors.brand[600], fontWeight: '600' },
  deleteModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing[3] },
  deleteModalContainer: { width: '100%', maxWidth: 320, backgroundColor: colors.surface.primary, borderRadius: borderRadius.lg, padding: spacing[4] },
  deleteModalTitle: { fontSize: typography.sizes.bodyLg, fontWeight: 'bold', color: colors.neutral[900], marginBottom: spacing[2], textAlign: 'center' },
  deleteModalMessage: { fontSize: typography.sizes.bodyMd, color: colors.neutral[600], textAlign: 'center', marginBottom: spacing[4], lineHeight: 22 },
  deleteModalProductName: { fontWeight: 'bold', color: colors.neutral[900] },
  deleteModalButtons: { flexDirection: 'row', gap: spacing[2] },
  deleteModalBtn: { flex: 1 },
  deleteModalBtnText: { color: colors.neutral[900] },
  deleteModalBtnTextConfirm: { color: '#fff' },
});

export default ProductsScreen;