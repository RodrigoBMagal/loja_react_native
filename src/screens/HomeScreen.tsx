import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleProp, ViewStyle, TextStyle,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useStock, CATEGORY_COLORS } from '../context/StockContext';
import { MainTabParamList, Product } from '../types';
import { Button, Card, Badge } from '@/components/ui';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}

const StatCard = ({ icon, label, value, color, onPress }: StatCardProps) => (
  <Button
    variant="ghost"
    fullWidth
    onPress={onPress}
    style={[styles.statCard, { borderLeftColor: color }] as StyleProp<ViewStyle>[]}
  >
    <View style={styles.statRow}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statTextContainer}>
        <Text style={[styles.statValue, { color }] as TextStyle[]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  </Button>
);

const HomeScreen = ({ navigation, route }: Props) => {
const { products, getLowStockProducts, getStats, getExpiryAlerts, reload } = useStock();
  const [refreshing, setRefreshing] = useState(false);
  const user = route?.params?.user || { username: 'Usuário', role: 'Funcionário' };
  const stats = getStats();
  const lowStock = getLowStockProducts();
  const expiryAlerts = getExpiryAlerts();
  const expiryCount = expiryAlerts.expired.length + expiryAlerts.expiring.length;

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);

  const categoryCount: Record<string, number> = {};
  products.forEach((p: Product) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand[600]]} />}
      contentContainerStyle={styles.contentContainer}
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

      {/* Alerta de validade */}
      {expiryCount > 0 && (
        <TouchableOpacity
          style={[styles.alertBanner, expiryAlerts.expired.length > 0 ? styles.expiredBanner : styles.expiringBanner]}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.alertIcon}>{expiryAlerts.expired.length > 0 ? '🚨' : '⏳'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              {expiryAlerts.expired.length > 0
                ? `${expiryAlerts.expired.length} produto(s) vencido(s)`
                : `${expiryAlerts.expiring.length} produto(s) vencem em até 30 dias`}
            </Text>
            <Text style={styles.alertSub}>Reveja as datas de validade agora</Text>
          </View>
          <Text style={styles.alertArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Alerta de estoque baixo */}
      {lowStock.length > 0 && (
        <TouchableOpacity style={styles.lowStockBanner} onPress={() => navigation.navigate('LowStock')}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{lowStock.length} produto(s) com estoque baixo</Text>
            <Text style={styles.alertSub}>Repor estoque para evitar rupturas</Text>
          </View>
          <Text style={styles.alertArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Cards de estatísticas */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="📦"
          label="Total de Produtos"
          value={stats.total}
          color={colors.category.medicamentos}
          onPress={() => navigation.navigate('Products')}
        />
        <StatCard
          icon="💊"
          label="Itens Únicos"
          value={totalQuantity}
          color={colors.category.vacinas}
          onPress={() => navigation.navigate('Products')}
        />
        <StatCard
          icon="⚠️"
          label="Estoque Baixo"
          value={stats.lowStock}
          color={colors.semantic.warning}
          onPress={() => navigation.navigate('LowStock')}
        />
        <StatCard
          icon="💰"
          label="Valor Total"
          value={formatCurrency(stats.totalValue)}
          color={colors.category.suplementos}
          onPress={() => navigation.navigate('Products')}
        />
      </View>

      {/* Valor total do estoque */}
      <Card variant="default" style={styles.valueCard}>
        <View style={styles.valueRow}>
          <View>
            <Text style={styles.valueLabel}>Valor Total do Estoque</Text>
            <Text style={styles.valueAmount}>{formatCurrency(stats.totalValue)}</Text>
          </View>
          <Badge variant="category" category="vacinas" size="default">
            Maior categoria
          </Badge>
        </View>
      </Card>

      {/* Produtos abaixo do mínimo */}
      {(lowStock.length > 0 || products.some(p => p.quantity === 0)) && (
        <View>
          <Text style={styles.sectionTitle}>Produtos Abaixo do Mínimo</Text>
          <Card variant="default" style={styles.criticalCard}>
            {(lowStock.length > 0 || products.some(p => p.quantity === 0)) ? (
              products
                .filter(p => p.quantity <= p.minQuantity)
                .slice(0, 5)
                .map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.criticalItem}
                    onPress={() => navigation.navigate('Products')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[product.category] || '#999' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.criticalName}>{product.name}</Text>
                      <Text style={styles.criticalCategory}>
                        {product.category} · {product.supplier}
                      </Text>
                    </View>
                    <View style={styles.criticalQty}>
                      <Text
                        style={[
                          styles.criticalQtyText,
                          product.quantity === 0 ? styles.outOfStockText : {},
                        ] as TextStyle[]}
                      >
                        {product.quantity} {product.unit}
                      </Text>
                      <Text style={styles.criticalUnit}>Mín: {product.minQuantity}</Text>
                    </View>
                    <Text style={styles.criticalArrow}>›</Text>
                  </TouchableOpacity>
                ))
            ) : (
              <View style={styles.allGood}>
                <Text style={styles.allGoodIcon}>✅</Text>
                <Text style={styles.allGoodTitle}>Tudo em dia!</Text>
                <Text style={styles.allGoodSub}>Todos os produtos têm estoque acima do mínimo</Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Distribuição por categoria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribuição por Categoria</Text>
        <Card variant="default" style={styles.categoryCard}>
          {Object.entries(categoryCount).map(([cat, count]) => {
            const catColor = CATEGORY_COLORS[cat] || '#999';
            const percentage = (count / stats.total) * 100;
            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryFill,
                      { width: `${percentage}%`, backgroundColor: catColor },
                    ]}
                  />
                </View>
                <Text style={styles.categoryLabel}>{cat}</Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            );
          })}
        </Card>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: colors.neutral[100] },
  contentContainer: { paddingBottom: spacing[6] },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.brand[700],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  greeting: {
    fontSize: typography.sizes.headingLg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[0],
  },
  role: {
    fontSize: typography.sizes.labelMd,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing[1],
  },
  date: {
    fontSize: typography.sizes.labelSm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing[1],
    textTransform: 'capitalize' as const,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  alertBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.brand[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.warning,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    ...getElevation(1),
  },
  expiringBanner: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#F9A825',
  },
  expiredBanner: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: colors.semantic.danger,
  },
  alertIcon: { fontSize: 22, marginRight: spacing[3] },
  alertTitle: {
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
    color: '#BF360C',
  },
  alertSub: {
    fontSize: typography.sizes.labelSm,
    color: '#E65100',
    marginTop: spacing[1],
  },
  alertArrow: { fontSize: 24, color: '#E65100' },
  lowStockBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.warning,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    ...getElevation(1),
  },
  bannerButton: {
    marginLeft: spacing[2],
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: spacing[2],
    marginTop: spacing[1],
  },
  statCard: {
    width: '48%' as any,
    margin: '1%',
    ...getElevation(1),
  },
  statRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  statIcon: { fontSize: 22, marginRight: spacing[2] },
  statTextContainer: { flex: 1 },
  statValue: {
    fontSize: typography.sizes.headingMd,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.labelSm,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  valueCard: {
    backgroundColor: colors.brand[700],
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
    ...getElevation(2),
  },
  valueRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  valueLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.sizes.labelLg,
  },
  valueAmount: {
    color: colors.neutral[0],
    fontSize: typography.sizes.headingLg,
    fontWeight: typography.weights.bold,
    marginTop: spacing[1],
  },
  section: { marginHorizontal: spacing[4], marginTop: spacing[2] },
  sectionTitle: {
    fontSize: typography.sizes.headingSm,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  criticalCard: { ...getElevation(1) },
  criticalItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
    ...getElevation(1),
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing[3] },
  criticalName: {
    fontSize: typography.sizes.bodyMd,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  criticalCategory: {
    fontSize: typography.sizes.labelMd,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  criticalQty: { alignItems: 'flex-end' as const, marginLeft: spacing[3] },
  criticalQtyText: {
    fontSize: typography.sizes.bodyMd,
    fontWeight: typography.weights.bold,
    color: colors.semantic.warning,
  },
  outOfStockText: { color: colors.semantic.danger },
  criticalUnit: {
    fontSize: typography.sizes.labelSm,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  criticalArrow: { fontSize: 24, color: colors.neutral[400], marginLeft: spacing[2] },
  categoryCard: { ...getElevation(1) },
  categoryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing[3],
  },
  categoryBar: {
    height: 6,
    flex: 1,
    borderRadius: 3,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden' as const,
    marginRight: spacing[3],
  },
  categoryFill: { height: '100%' as any, borderRadius: 3 },
  categoryLabel: { width: 120, fontSize: typography.sizes.bodySm, color: colors.neutral[600] },
  categoryCount: { fontSize: typography.sizes.bodyMd, fontWeight: typography.weights.bold, color: colors.neutral[900], width: 28, textAlign: 'right' as const },
  allGood: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: spacing[6] },
  allGoodIcon: { fontSize: 64, marginBottom: spacing[4] },
  allGoodTitle: { fontSize: typography.sizes.headingMd, fontWeight: typography.weights.bold, color: colors.brand[600] },
  allGoodSub: { fontSize: typography.sizes.bodyMd, color: colors.neutral[500], marginTop: spacing[2], textAlign: 'center' as const, paddingHorizontal: spacing[8] },
};

export default HomeScreen;