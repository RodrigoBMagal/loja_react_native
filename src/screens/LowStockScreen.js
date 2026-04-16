import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useStock, CATEGORY_COLORS } from '../context/StockContext';

const LowStockItem = ({ product, onEdit, onUpdateQty }) => {
  const isOut = product.quantity === 0;
  const percent = Math.min((product.quantity / product.minQuantity) * 100, 100);
  const color = CATEGORY_COLORS[product.category] || '#999';
  const urgencyColor = isOut ? '#C62828' : product.quantity <= product.minQuantity * 0.5 ? '#E65100' : '#F9A825';

  return (
    <View style={[styles.card, { borderLeftColor: urgencyColor }]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <View style={[styles.catBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.catText, { color }]}>{product.category}</Text>
            </View>
            {isOut && (
              <View style={styles.outBadge}>
                <Text style={styles.outBadgeText}>SEM ESTOQUE</Text>
              </View>
            )}
          </View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.supplier}>Fornecedor: {product.supplier}</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Estoque atual</Text>
          <Text style={[styles.progressValue, { color: urgencyColor }]}>
            {product.quantity} de {product.minQuantity} {product.unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: urgencyColor }]} />
        </View>
        <Text style={styles.progressPercent}>{percent.toFixed(0)}% do mínimo</Text>
      </View>

      {/* Sugestão de reposição */}
      <View style={styles.suggestion}>
        <Text style={styles.suggestionIcon}>💡</Text>
        <Text style={styles.suggestionText}>
          Repor: <Text style={styles.suggestionBold}>{product.minQuantity - product.quantity} {product.unit}</Text> para atingir o mínimo
        </Text>
      </View>

      {/* Botões de ação rápida */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.addBtn} onPress={() => onUpdateQty(product.id, 5)}>
          <Text style={styles.addBtnText}>+5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => onUpdateQty(product.id, 10)}>
          <Text style={styles.addBtnText}>+10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => onUpdateQty(product.id, product.minQuantity - product.quantity)}>
          <Text style={styles.addBtnText}>Repor min.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(product)}>
          <Text style={styles.editBtnText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const LowStockScreen = ({ navigation }) => {
  const { getLowStockProducts, updateQuantity: updateQtyApi, reload } = useStock();
  const [refreshing, setRefreshing] = useState(false);

  const handleUpdateQuantity = async (id, delta) => {
    try {
      await updateQtyApi(id, delta);
    } catch (err) {
      // Erro já foi tratado pelo contexto
    }
  };

  const lowStock = getLowStockProducts();
  const outOfStock = lowStock.filter(p => p.quantity === 0);
  const critical = lowStock.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity * 0.5);
  const low = lowStock.filter(p => p.quantity > p.minQuantity * 0.5);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const sections = [
    { title: '❌ Sem Estoque', color: '#C62828', data: outOfStock },
    { title: '🔴 Crítico (< 50% do mínimo)', color: '#E65100', data: critical },
    { title: '🟡 Baixo (< 100% do mínimo)', color: '#F9A825', data: low },
  ];

  return (
    <View style={styles.container}>
      {/* Header de resumo */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#C62828' }]}>{outOfStock.length}</Text>
          <Text style={styles.summaryLabel}>Sem estoque</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#E65100' }]}>{critical.length}</Text>
          <Text style={styles.summaryLabel}>Crítico</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#F9A825' }]}>{low.length}</Text>
          <Text style={styles.summaryLabel}>Baixo</Text>
        </View>
      </View>

      {lowStock.length === 0 ? (
        <View style={styles.allGood}>
          <Text style={styles.allGoodIcon}>✅</Text>
          <Text style={styles.allGoodTitle}>Estoque em dia!</Text>
          <Text style={styles.allGoodSub}>Todos os produtos estão acima do nível mínimo.</Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {sections.map(section =>
                section.data.length > 0 ? (
                  <View key={section.title}>
                    <View style={[styles.sectionHeader, { borderLeftColor: section.color }]}>
                      <Text style={[styles.sectionTitle, { color: section.color }]}>
                        {section.title}
                      </Text>
                      <Text style={styles.sectionCount}>{section.data.length} produto(s)</Text>
                    </View>
                    {section.data.map(product => (
                      <LowStockItem
                        key={product.id}
                        product={product}
                        onEdit={(p) => navigation.navigate('AddEditProduct', { product: p, mode: 'edit' })}
                        onUpdateQty={handleUpdateQuantity}
                      />
                    ))}
                  </View>
                ) : null
              )}
              <View style={{ height: 24 }} />
            </>
          }
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  summaryHeader: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 26, fontWeight: 'bold' },
  summaryLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { width: 1, backgroundColor: '#E0E0E0', marginVertical: 4 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderLeftWidth: 4, paddingLeft: 10, marginVertical: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold' },
  sectionCount: { fontSize: 13, color: '#888' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, elevation: 2,
  },
  cardTop: { flexDirection: 'row', marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 11, fontWeight: '600' },
  outBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  outBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#C62828' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  supplier: { fontSize: 12, color: '#888', marginTop: 2 },
  progressContainer: { marginVertical: 10 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: '#888' },
  progressValue: { fontSize: 12, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPercent: { fontSize: 11, color: '#aaa', marginTop: 4 },
  suggestion: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', borderRadius: 8, padding: 10, marginVertical: 8 },
  suggestionIcon: { fontSize: 16, marginRight: 8 },
  suggestionText: { fontSize: 13, color: '#555', flex: 1 },
  suggestionBold: { fontWeight: 'bold', color: '#E65100' },
  quickActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  addBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
  editBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  editBtnText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  allGood: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  allGoodIcon: { fontSize: 64, marginBottom: 16 },
  allGoodTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  allGoodSub: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
});

export default LowStockScreen;