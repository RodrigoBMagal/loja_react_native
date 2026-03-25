import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useStock, CATEGORY_COLORS } from '../context/StockContext';

const StatCard = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation, route }) => {
  const { products, getLowStockProducts, getStats, loading, reload } = useStock();
  const [refreshing, setRefreshing] = React.useState(false);
  const user = route?.params?.user || { username: 'Usuário', role: 'Funcionário' };
  const stats = getStats();
  const lowStock = getLowStockProducts();

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const formatCurrency = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  const categoryCount = {};
  products.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user.username}! 👋</Text>
          <Text style={styles.role}>{user.role}</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 36 }}>🐾</Text>
        </View>
      </View>

      {/* Alerta de estoque baixo */}
      {lowStock.length > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => navigation.navigate('LowStock')}
        >
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{lowStock.length} produto(s) com estoque baixo!</Text>
            <Text style={styles.alertSub}>Toque para visualizar</Text>
          </View>
          <Text style={styles.alertArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Cards de estatísticas */}
      <Text style={styles.sectionTitle}>Resumo do Estoque</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="📦" label="Total de Produtos" value={stats.total} color="#1565C0" onPress={() => navigation.navigate('Products')} />
        <StatCard icon="⚠️" label="Estoque Baixo" value={stats.lowStock} color="#E65100"
          onPress={() => navigation.navigate('LowStock')} />
        <StatCard icon="❌" label="Sem Estoque" value={stats.outOfStock} color="#C62828" />
        <StatCard icon="🏷️" label="Categorias" value={stats.categories} color="#2E7D32" />
      </View>

      <View style={styles.valueCard}>
        <Text style={styles.valueLabel}>💰 Valor Total em Estoque</Text>
        <Text style={styles.valueAmount}>{formatCurrency(stats.totalValue)}</Text>
      </View>

      {/* Produtos com estoque crítico */}
      {lowStock.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔴 Estoque Crítico</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LowStock')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {lowStock.slice(0, 4).map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.criticalItem}
              onPress={() => navigation.navigate('AddEditProduct', { product: p, mode: 'edit' })}
            >
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[p.category] || '#999' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.criticalName}>{p.name}</Text>
                <Text style={styles.criticalCategory}>{p.category}</Text>
              </View>
              <View style={styles.criticalQty}>
                <Text style={[styles.criticalQtyText, p.quantity === 0 && styles.outOfStockText]}>
                  {p.quantity} / {p.minQuantity}
                </Text>
                <Text style={styles.criticalUnit}>{p.unit}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Distribuição por categoria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Por Categoria</Text>
        {Object.entries(categoryCount).map(([cat, count]) => (
          <View key={cat} style={styles.categoryRow}>
            <View style={[styles.categoryBar, { backgroundColor: CATEGORY_COLORS[cat] || '#999' }]}>
              <View
                style={[styles.categoryFill, {
                  width: `${(count / stats.total) * 100}%`,
                  backgroundColor: CATEGORY_COLORS[cat] || '#999',
                }]}
              />
            </View>
            <Text style={styles.categoryLabel}>{cat}</Text>
            <Text style={styles.categoryCount}>{count}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1B5E20', padding: 20, paddingTop: 16, paddingBottom: 24,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  role: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, textTransform: 'capitalize' },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF3E0', borderLeftWidth: 4, borderLeftColor: '#E65100',
    margin: 16, borderRadius: 10, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, elevation: 2,
  },
  alertIcon: { fontSize: 22, marginRight: 10 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#BF360C' },
  alertSub: { fontSize: 12, color: '#E65100', marginTop: 2 },
  alertArrow: { fontSize: 24, color: '#E65100' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, marginTop: 4 },
  statCard: {
    width: '46%', margin: '2%', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, elevation: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  valueCard: {
    backgroundColor: '#1B5E20', marginHorizontal: 16, borderRadius: 12,
    padding: 18, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, elevation: 3,
  },
  valueLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  valueAmount: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  section: { margin: 16, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', margin: 16, marginBottom: 8 },
  seeAll: { color: '#2E7D32', fontWeight: '600', fontSize: 14 },
  criticalItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 1,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  criticalName: { fontSize: 14, fontWeight: '600', color: '#333' },
  criticalCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  criticalQty: { alignItems: 'flex-end' },
  criticalQtyText: { fontSize: 14, fontWeight: 'bold', color: '#E65100' },
  outOfStockText: { color: '#C62828' },
  criticalUnit: { fontSize: 11, color: '#999', marginTop: 2 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  categoryBar: { height: 6, flex: 1, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden', marginRight: 10 },
  categoryFill: { height: '100%', borderRadius: 3 },
  categoryLabel: { width: 120, fontSize: 13, color: '#555' },
  categoryCount: { fontSize: 14, fontWeight: 'bold', color: '#333', width: 28, textAlign: 'right' },
});

export default HomeScreen;