import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../src/config/supabase';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { BottomTabParamList } from '../navigation/types';

type ProfileScreenNavigationProp = BottomTabNavigationProp<
  BottomTabParamList,
  'Profile'
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

interface Template {
  id: number;
  title: string;
  plant: string;
  goal: string;
  solution: string;
  amount: string;
  countOfYear: string;
  createdAt: string;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTemplates = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Templates')
        .select('*')
        .eq('email', user.email)
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
      } else {
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTemplates();
    }, [user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTemplates();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณแน่ใจหรือไม่ว่าต้องการลบสูตรนี้?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('Templates')
                .delete()
                .eq('id', id);

              if (error) throw error;

              setTemplates(prev => prev.filter(item => item.id !== id));
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
            }
          }
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ออกจากระบบ', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>โปรไฟล์ 👤</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ข้อมูลผู้ใช้ */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.user_metadata?.full_name || 'เกษตรกรยุคใหม่'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>สมาชิกทั่วไป</Text>
              </View>
            </View>
          </View>

          {/* รายการสูตรปุ๋ย */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>สูตรปุ๋ยที่บันทึกไว้ ({templates.length})</Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
          ) : templates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>ไม่มีรายการที่บันทึกไว้</Text>
            </View>
          ) : (
            templates.map((item) => (
              <View key={item.id} style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateTitleContainer}>
                    <View style={styles.templateIconBg}>
                      <Ionicons name="leaf" size={16} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.templateTitle}>{item.title || 'ไม่มีชื่อ'}</Text>
                      <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.templateDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>พืช:</Text>
                    <Text style={styles.detailValue}>{item.plant} {item.countOfYear !== '-' && `(${item.countOfYear})`}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>เป้าหมาย:</Text>
                    <Text style={styles.detailValue}>{item.goal}</Text>
                  </View>
                </View>

                <View style={styles.formulaResult}>
                  <View style={styles.formulaItem}>
                    <Text style={styles.formulaLabel}>สูตรแนะนำ</Text>
                    <Text style={styles.formulaValue}>{item.solution}</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.formulaItem}>
                    <Text style={styles.formulaLabel}>ปริมาณรวม</Text>
                    <Text style={styles.formulaValueSmall}>{item.amount}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E8F5E9',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },

  // Template Card Styles
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  templateDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  formulaResult: {
    flexDirection: 'row',
    backgroundColor: '#F7FDF7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8F5E9'
  },
  formulaItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#C8E6C9',
    marginHorizontal: 10,
  },
  formulaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  formulaValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  formulaValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default ProfileScreen;