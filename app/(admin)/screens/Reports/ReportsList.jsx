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

export default function ReportsList({ 
  reports, 
  loading, 
  onRefresh, 
  onReportPress, 
  searchQuery, 
  onSearchChange,
  selectedFilter,
  onFilterChange 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedReports, setPaginatedReports] = useState([]);

  // Filter reports based on search and filter
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchQuery ||
      report.reportedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || report.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  useEffect(() => {
    const paginated = filteredReports.slice(startIndex, endIndex);
    setPaginatedReports(paginated);
  }, [filteredReports, currentPage]);

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

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => onReportPress(item)}
    >
      <View style={styles.reportItemLeft}>
        <View style={[styles.reportStatusIcon, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status === 'pending' && <Feather name="clock" size={16} color="#F59E0B" />}
          {item.status === 'resolved' && <Feather name="check" size={16} color="#01B97F" />}
          {item.status === 'rejected' && <Feather name="x" size={16} color="#EF4444" />}
        </View>
        <View style={styles.reportItemContent}>
          <Text style={styles.reportItemText} numberOfLines={2}>
            &ldquo;{item.reportedText}&rdquo;
          </Text>
          <View style={styles.reportItemMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.reportItemMetaText}>{item.reportedBy}</Text>
          </View>
        </View>
      </View>
      <View style={styles.reportItemRight}>
        <Feather name="chevron-right" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fef3c7';
      case 'resolved': return '#e8f5f0';
      case 'rejected': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'profanity': return '#fee2e2';
      case 'harassment': return '#fef3c7';
      case 'positive': return '#e8f5f0';
      default: return '#f3f4f6';
    }
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
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
            placeholder="Search reports by content, user, or category..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
            selectionColor="#01B97F"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('pending', 'Pending')}
          {renderFilterButton('resolved', 'Resolved')}
          {renderFilterButton('rejected', 'Rejected')}
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={paginatedReports}
        renderItem={renderReportItem}
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
            <Feather name="file-text" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No reports match the current filter'}
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
  reportItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportItemContent: {
    flex: 1,
  },
  reportItemText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  reportItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportItemMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  reportItemRight: {
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
