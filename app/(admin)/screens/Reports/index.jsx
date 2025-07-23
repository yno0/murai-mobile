import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ReportsOverview = require('./ReportsOverview').default;
const ReportsList = require('./ReportsList').default;
const MainHeader = require('../../../components/common/MainHeader').default;

export default function AdminReportsScreen() {
  const [reports, setReports] = useState([
    { id: '1', reportedText: 'This is inappropriate content', reportType: 'false_positive', category: 'harassment', status: 'pending', reportedBy: 'user123', reportedAt: new Date('2024-01-20'), reviewedBy: null, reviewedAt: null },
    { id: '2', reportedText: 'Missed toxic language here', reportType: 'false_negative', category: 'toxicity', status: 'reviewed', reportedBy: 'user456', reportedAt: new Date('2024-01-19'), reviewedBy: 'admin1', reviewedAt: new Date('2024-01-20') },
    { id: '3', reportedText: 'System flagged this incorrectly', reportType: 'false_positive', category: 'spam', status: 'in_progress', reportedBy: 'user789', reportedAt: new Date('2024-01-18'), reviewedBy: 'admin2', reviewedAt: null },
    { id: '4', reportedText: 'Should have been detected', reportType: 'false_negative', category: 'hate_speech', status: 'pending', reportedBy: 'user101', reportedAt: new Date('2024-01-17'), reviewedBy: null, reviewedAt: null },
    { id: '5', reportedText: 'Wrong classification', reportType: 'false_positive', category: 'profanity', status: 'reviewed', reportedBy: 'user202', reportedAt: new Date('2024-01-16'), reviewedBy: 'admin1', reviewedAt: new Date('2024-01-18') },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or 'list'

  const loadReports = useCallback(async () => {
    // Mock data loading - replace with actual API calls
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/reports');
      // const data = await response.json();
      // For now, just refresh the existing reports
      setReports(prevReports => [...prevReports]);
    } catch (_error) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openReportModal = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleReportAction = (reportId, action) => {
    setReports(prevReports =>
      prevReports.map(report => {
        if (report.id === reportId) {
          switch (action) {
            case 'approve':
              return { ...report, status: 'reviewed', reviewedBy: 'admin1', reviewedAt: new Date() };
            case 'reject':
              return { ...report, status: 'reviewed', reviewedBy: 'admin1', reviewedAt: new Date() };
            case 'complete':
              return { ...report, status: 'reviewed', reviewedBy: 'admin1', reviewedAt: new Date() };
            case 'reopen':
              return { ...report, status: 'pending', reviewedBy: null, reviewedAt: null };
            default:
              return report;
          }
        }
        return report;
      })
    );
  };

  const renderOverviewContent = () => (
    <ReportsOverview
      reports={reports}
      loading={loading}
      onRefresh={loadReports}
    />
  );

  const renderListContent = () => (
    <ReportsList
      reports={reports}
      loading={loading}
      onRefresh={loadReports}
      onReportPress={openReportModal}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedFilter={selectedFilter}
      onFilterChange={setSelectedFilter}
      onReportAction={handleReportAction}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <MainHeader
        title="Reports Management"
        subtitle="Review and manage user reports"
        rightActions={[
          {
            icon: 'refresh-cw',
            iconType: 'feather',
            onPress: loadReports
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[styles.viewToggleButton, currentView === 'overview' && styles.viewToggleButtonActive]}
          onPress={() => setCurrentView('overview')}
        >
          <Feather name="bar-chart-2" size={16} color={currentView === 'overview' ? '#01B97F' : '#6B7280'} />
          <Text style={[styles.viewToggleText, currentView === 'overview' && styles.viewToggleTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleButton, currentView === 'list' && styles.viewToggleButtonActive]}
          onPress={() => setCurrentView('list')}
        >
          <Feather name="list" size={16} color={currentView === 'list' ? '#01B97F' : '#6B7280'} />
          <Text style={[styles.viewToggleText, currentView === 'list' && styles.viewToggleTextActive]}>
            Reports List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on current view */}
      {currentView === 'overview' ? renderOverviewContent() : renderListContent()}

      {/* Report Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedReport && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Reported Content</Text>
                  <Text style={styles.reportedText}>&ldquo;{selectedReport.reportedText}&rdquo;</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Report Information</Text>
                  <View style={styles.detailsCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Type:</Text>
                      <Text style={styles.infoValue}>{selectedReport.reportType.replace('_', ' ')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Category:</Text>
                      <Text style={styles.infoValue}>{selectedReport.category}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <Text style={[styles.infoValue, { color: selectedReport.status === 'pending' ? '#F59E0B' : selectedReport.status === 'reviewed' ? '#01B97F' : '#3B82F6' }]}>
                        {selectedReport.status}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Reported By:</Text>
                      <Text style={styles.infoValue}>{selectedReport.reportedBy}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Reported At:</Text>
                      <Text style={styles.infoValue}>{selectedReport.reportedAt.toLocaleDateString()}</Text>
                    </View>
                    {selectedReport.reviewedBy && (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Reviewed By:</Text>
                          <Text style={styles.infoValue}>{selectedReport.reviewedBy}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Reviewed At:</Text>
                          <Text style={styles.infoValue}>{selectedReport.reviewedAt?.toLocaleDateString()}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonRow}>
                  {selectedReport.status !== 'reviewed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      activeOpacity={0.85}
                      onPress={() => {
                        handleReportAction(selectedReport.id, 'approve');
                        setModalVisible(false);
                      }}
                    >
                      <Feather name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {selectedReport.status !== 'reviewed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      activeOpacity={0.85}
                      onPress={() => {
                        handleReportAction(selectedReport.id, 'reject');
                        setModalVisible(false);
                      }}
                    >
                      <Feather name="x" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  )}
                  {selectedReport.status === 'reviewed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reopenButton]}
                      activeOpacity={0.85}
                      onPress={() => {
                        handleReportAction(selectedReport.id, 'reopen');
                        setModalVisible(false);
                      }}
                    >
                      <Feather name="refresh-cw" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.actionButtonText}>Reopen</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#e8f5f0',
  },
  viewToggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#01B97F',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reportedText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    fontStyle: 'italic',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#01B97F',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  approveButton: {
    backgroundColor: '#01B97F',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  reopenButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});