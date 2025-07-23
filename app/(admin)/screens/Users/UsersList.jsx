import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ITEMS_PER_PAGE = 10;

export default function UsersList({ 
  users, 
  loading, 
  onRefresh, 
  onUserPress, 
  searchQuery, 
  onSearchChange,
  selectedFilter,
  onFilterChange 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedUsers, setPaginatedUsers] = useState([]);

  // Since filtering is done on the server side, we just use the users directly
  // Calculate pagination
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  useEffect(() => {
    const paginated = users.slice(startIndex, endIndex);
    setPaginatedUsers(paginated);
  }, [users, currentPage, startIndex, endIndex]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => onFilterChange(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => {
    const isActive = item.status === 'Active';
    const statusColor = isActive ? '#01B97F' : '#EF4444';
    const statusIcon = isActive ? 'user-check' : 'user-x';
    const statusBg = isActive ? '#e8f5f0' : '#fee2e2';

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => onUserPress(item)}
      >
        <View style={styles.userItemLeft}>
          <View style={[styles.userStatusIcon, { backgroundColor: statusBg }]}>
            <Feather name={statusIcon} size={16} color={statusColor} />
          </View>
          <View style={styles.userItemContent}>
            <Text style={styles.userItemName}>{item.name}</Text>
            <Text style={styles.userItemEmail}>{item.email}</Text>
            <View style={styles.userItemMeta}>
              <View style={[
                styles.roleBadge,
                { backgroundColor: item.role === 'Admin' ? '#e8f5f0' : '#f3f4f6' }
              ]}>
                <Text style={[
                  styles.roleText,
                  { color: item.role === 'Admin' ? '#01B97F' : '#6b7280' }
                ]}>
                  {item.role}
                </Text>
              </View>
              {item.isPremium && (
                <View style={[styles.roleBadge, { backgroundColor: '#fef3c7', marginLeft: 8 }]}>
                  <Text style={[styles.roleText, { color: '#d97706' }]}>
                    Premium
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.userItemRight}>
          <Feather name="chevron-right" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <TouchableOpacity
          key="prev"
          style={styles.paginationButton}
          onPress={() => setCurrentPage(currentPage - 1)}
        >
          <Feather name="chevron-left" size={16} color="#01B97F" />
        </TouchableOpacity>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.paginationButton,
            currentPage === i && styles.paginationButtonActive
          ]}
          onPress={() => setCurrentPage(i)}
        >
          <Text style={[
            styles.paginationText,
            currentPage === i && styles.paginationTextActive
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <TouchableOpacity
          key="next"
          style={styles.paginationButton}
          onPress={() => setCurrentPage(currentPage + 1)}
        >
          <Feather name="chevron-right" size={16} color="#01B97F" />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationInfoText}>
            Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} users
          </Text>
        </View>
        <View style={styles.paginationButtons}>
          {pages}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#01B97F" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or role (@admin, @user)..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
            selectionColor="#01B97F"
          />
        </View>
        {searchQuery && (searchQuery.toLowerCase().startsWith('@admin') || searchQuery.toLowerCase().startsWith('@user')) && (
          <View style={styles.searchHint}>
            <Feather name="info" size={12} color="#01B97F" />
            <Text style={styles.searchHintText}>
              Searching for {searchQuery.toLowerCase().startsWith('@admin') ? 'Admin' : 'User'} role
            </Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('active', 'Active')}
          {renderFilterButton('inactive', 'Inactive')}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={paginatedUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={onRefresh}
            tintColor="#01B97F"
            colors={["#01B97F"]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No users match the current filter'}
            </Text>
          </View>
        )}
        ListFooterComponent={renderPagination}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  searchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f5f0',
    borderRadius: 6,
  },
  searchHintText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#01B97F',
    marginLeft: 6,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e8f5f0',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  flatList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userItemContent: {
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  userItemEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  userItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  paginationContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  paginationInfo: {
    marginBottom: 12,
  },
  paginationInfoText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonActive: {
    backgroundColor: '#01B97F',
    borderColor: '#01B97F',
  },
  paginationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  paginationTextActive: {
    color: '#ffffff',
  },
});
