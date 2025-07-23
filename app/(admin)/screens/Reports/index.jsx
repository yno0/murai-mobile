import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// API configuration
const API_BASE_URL = 'http://localhost:3000/api';

export default function AdminReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or 'list'
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    action: null,
    reportId: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: '',
    loading: false
  });


  // Debug function to check auth state
  const checkAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      const authState = {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
        user: parsedUser,
        isAdmin: parsedUser?.role === 'admin'
      };

      console.log('🔍 Auth State Check:', authState);

      if (!token) {
        Alert.alert('Authentication Required', 'Please log in as admin first to access reports management.');
      } else if (!parsedUser || parsedUser.role !== 'admin') {
        Alert.alert('Admin Access Required', 'You need admin privileges to access this feature.');
      }

      return authState;
    } catch (error) {
      console.error('Auth state check error:', error);
      return null;
    }
  }, []);

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, []);

  const loadReports = useCallback(async () => {
    console.log('🔄 Loading reports...');
    setLoading(true);
    try {
      const token = await getAuthToken();
      console.log('🔑 Token exists:', !!token);

      if (!token) {
        console.error('❌ No token found');
        Alert.alert('Error', 'Please log in as admin first');
        return;
      }

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        search: searchQuery,
        status: selectedFilter === 'all' ? '' : selectedFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      console.log('📡 Making API call to:', `${API_BASE_URL}/admin/reports?${params}`);
      const data = await makeAuthenticatedRequest(`/admin/reports?${params}`);
      console.log('✅ API response:', data);

      // Handle empty response
      if (!data.reports || data.reports.length === 0) {
        console.log('📊 No reports found');
        setReports([]);
        return;
      }

      // Transform the data to match the expected format
      const transformedReports = data.reports.map(report => {
        console.log('🔄 Transforming report:', report);
        return {
          id: report._id,
          reportedText: report.reportedText || report.description || 'No content provided',
          reportType: report.type || 'unknown',
          category: report.category || 'uncategorized',
          status: report.status,
          reportedBy: report.userId?.name || report.userId?.email || 'Unknown User',
          reportedAt: new Date(report.createdAt),
          reviewedBy: report.reviewedBy?.name || report.reviewedBy?.email || null,
          reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : null,
          description: report.description
        };
      });

      console.log('📊 Transformed reports:', transformedReports.length, 'reports');
      setReports(transformedReports);
    } catch (error) {
      console.error('❌ Load reports error:', error);
      Alert.alert('Error', error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFilter, makeAuthenticatedRequest]);

  // Show confirmation modal for actions
  const showConfirmation = (action, reportId, reportText) => {
    let title, message, confirmText, confirmColor;

    switch (action) {
      case 'approve':
        title = 'Approve Report';
        message = `Are you sure you want to approve this report?\n\nReported content:\n"${reportText?.substring(0, 120)}${reportText?.length > 120 ? '...' : ''}"`;
        confirmText = 'Approve Report';
        confirmColor = '#01B97F';
        break;
      case 'decline':
        title = 'Decline Report';
        message = `Are you sure you want to decline this report?\n\nReported content:\n"${reportText?.substring(0, 120)}${reportText?.length > 120 ? '...' : ''}"`;
        confirmText = 'Decline Report';
        confirmColor = '#EF4444';
        break;
      case 'reopen':
        title = 'Reopen Report';
        message = `Are you sure you want to reopen this report for review?\n\nReported content:\n"${reportText?.substring(0, 120)}${reportText?.length > 120 ? '...' : ''}"`;
        confirmText = 'Reopen Report';
        confirmColor = '#F59E0B';
        break;
      default:
        return;
    }

    setConfirmationModal({
      visible: true,
      action,
      reportId,
      title,
      message,
      confirmText,
      confirmColor
    });
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { action, reportId } = confirmationModal;

    // Show loading state
    setConfirmationModal({ ...confirmationModal, loading: true });

    try {
      await handleReportAction(reportId, action);
      setModalVisible(false);
      setConfirmationModal({ ...confirmationModal, visible: false, loading: false });
    } catch (_error) {
      // Reset loading state on error
      setConfirmationModal({ ...confirmationModal, loading: false });
    }
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setConfirmationModal({ ...confirmationModal, visible: false });
  };

  useEffect(() => {
    checkAuthState(); // Check auth state first
    loadReports();
  }, [loadReports, checkAuthState]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReports();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadReports]);

  // Reload reports immediately when filter changes (no debounce needed)
  useEffect(() => {
    loadReports();
  }, [selectedFilter, loadReports]);

  const openReportModal = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleReportAction = async (reportId, action) => {
    try {
      let updateData = {};
      let successMessage = '';

      switch (action) {
        case 'approve':
        case 'complete':
          updateData.status = 'resolved';
          successMessage = 'Report approved and resolved successfully';
          break;
        case 'reject':
        case 'decline':
          updateData.status = 'rejected';
          successMessage = 'Report declined successfully';
          break;
        case 'reopen':
          updateData.status = 'pending';
          successMessage = 'Report reopened successfully';
          break;
        default:
          throw new Error('Invalid action');
      }

      await makeAuthenticatedRequest(`/admin/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      // Update local state
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          const updatedReport = { ...report };
          updatedReport.status = updateData.status;

          if (updateData.status === 'resolved' || updateData.status === 'rejected') {
            updatedReport.reviewedBy = 'Current Admin'; // Will be updated from server response
            updatedReport.reviewedAt = new Date();
          } else if (updateData.status === 'pending') {
            updatedReport.reviewedBy = null;
            updatedReport.reviewedAt = null;
          }

          return updatedReport;
        }
        return report;
      });

      setReports(updatedReports);

      // Update selected report for modal
      if (selectedReport && selectedReport.id === reportId) {
        const updatedSelectedReport = updatedReports.find(r => r.id === reportId);
        setSelectedReport(updatedSelectedReport);
      }

      Alert.alert('Success', successMessage);

    } catch (error) {
      console.error('Report action error:', error);
      Alert.alert('Error', error.message || 'Failed to update report');
    }
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
            icon: 'info',
            iconType: 'feather',
            onPress: checkAuthState
          },
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
          {/* Enhanced Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalHeaderIcon}>
                <Feather name="flag" size={20} color="#01B97F" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Report Details</Text>
                <Text style={styles.modalSubtitle}>Review and manage report information</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedReport && (
              <>
                {/* Report Content Section */}
                <View style={styles.reportSection}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportIconContainer}>
                      <Feather
                        name={selectedReport.reportType === 'false_positive' ? 'alert-triangle' : 'eye-off'}
                        size={20}
                        color="#01B97F"
                      />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportType}>{selectedReport.reportType.replace('_', ' ').toUpperCase()}</Text>
                      <Text style={styles.reportCategory}>{selectedReport.category}</Text>
                      <View style={styles.reportBadges}>
                        <View style={[styles.badge, styles.statusBadge, {
                          backgroundColor: selectedReport.status === 'pending' ? '#fef3c7' :
                                         selectedReport.status === 'resolved' ? '#e8f5f0' :
                                         selectedReport.status === 'rejected' ? '#fee2e2' : '#f3f4f6'
                        }]}>
                          <Feather
                            name={selectedReport.status === 'pending' ? 'clock' :
                                  selectedReport.status === 'resolved' ? 'check-circle' :
                                  selectedReport.status === 'rejected' ? 'x-circle' : 'help-circle'}
                            size={12}
                            color={selectedReport.status === 'pending' ? '#d97706' :
                                   selectedReport.status === 'resolved' ? '#01B97F' :
                                   selectedReport.status === 'rejected' ? '#EF4444' : '#6b7280'}
                          />
                          <Text style={[styles.badgeText, {
                            color: selectedReport.status === 'pending' ? '#d97706' :
                                   selectedReport.status === 'resolved' ? '#01B97F' :
                                   selectedReport.status === 'rejected' ? '#EF4444' : '#6b7280'
                          }]}>
                            {selectedReport.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Reported Content */}
                  <View style={styles.contentCard}>
                    <Text style={styles.contentLabel}>Reported Content:</Text>
                    <Text style={styles.reportedText}>&ldquo;{selectedReport.reportedText}&rdquo;</Text>
                  </View>
                </View>

                {/* Report Information */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="info" size={16} color="#01B97F" />
                    <Text style={styles.sectionTitle}>Report Information</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather name="user" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Reported By</Text>
                      </View>
                      <Text style={styles.infoValue}>{selectedReport.reportedBy}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Reported Date</Text>
                      </View>
                      <Text style={styles.infoValue}>{selectedReport.reportedAt.toLocaleDateString()}</Text>
                    </View>
                    {selectedReport.reviewedBy && (
                      <>
                        <View style={styles.infoRow}>
                          <View style={styles.infoRowLeft}>
                            <Feather name="user-check" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Reviewed By</Text>
                          </View>
                          <Text style={styles.infoValue}>{selectedReport.reviewedBy}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <View style={styles.infoRowLeft}>
                            <Feather name="clock" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Reviewed Date</Text>
                          </View>
                          <Text style={styles.infoValue}>{selectedReport.reviewedAt?.toLocaleDateString()}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="settings" size={16} color="#01B97F" />
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                  </View>
                  <View style={styles.actionGrid}>
                    {selectedReport.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionCard, styles.approveCard]}
                          onPress={() => {
                            showConfirmation('approve', selectedReport.id, selectedReport.reportedText);
                          }}
                        >
                          <View style={styles.actionIconContainer}>
                            <Feather name="check-circle" size={24} color="#01B97F" />
                          </View>
                          <Text style={styles.actionTitle}>Approve</Text>
                          <Text style={styles.actionSubtitle}>Mark as resolved</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionCard, styles.declineCard]}
                          onPress={() => {
                            showConfirmation('decline', selectedReport.id, selectedReport.reportedText);
                          }}
                        >
                          <View style={styles.actionIconContainer}>
                            <Feather name="x-circle" size={24} color="#EF4444" />
                          </View>
                          <Text style={styles.actionTitle}>Decline</Text>
                          <Text style={styles.actionSubtitle}>Reject this report</Text>
                        </TouchableOpacity>
                      </>
                    )}



                    {(selectedReport.status === 'resolved' || selectedReport.status === 'rejected') && (
                      <TouchableOpacity
                        style={[styles.actionCard, styles.reopenCard]}
                        onPress={() => {
                          showConfirmation('reopen', selectedReport.id, selectedReport.reportedText);
                        }}
                      >
                        <View style={styles.actionIconContainer}>
                          <Feather name="refresh-cw" size={24} color="#f59e0b" />
                        </View>
                        <Text style={styles.actionTitle}>Reopen</Text>
                        <Text style={styles.actionSubtitle}>Reopen for review</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmationModal.visible}
        onRequestClose={cancelConfirmation}
      >
        <TouchableOpacity
          style={styles.confirmationOverlay}
          activeOpacity={1}
          onPress={cancelConfirmation}
        >
          <TouchableOpacity
            style={styles.confirmationModal}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.confirmationHeader}>
              <View style={[styles.confirmationIcon, { backgroundColor: `${confirmationModal.confirmColor}20` }]}>
                <Feather
                  name={confirmationModal.action === 'approve' ? 'check-circle' :
                        confirmationModal.action === 'decline' ? 'x-circle' : 'refresh-cw'}
                  size={24}
                  color={confirmationModal.confirmColor}
                />
              </View>
              <Text style={styles.confirmationTitle}>{confirmationModal.title}</Text>
            </View>

            <Text style={styles.confirmationMessage}>{confirmationModal.message}</Text>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmationButton,
                  styles.cancelButton,
                  confirmationModal.loading && styles.disabledButton
                ]}
                onPress={cancelConfirmation}
                disabled={confirmationModal.loading}
              >
                <Text style={[
                  styles.cancelButtonText,
                  confirmationModal.loading && styles.disabledText
                ]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmationButton,
                  styles.confirmButton,
                  { backgroundColor: confirmationModal.confirmColor },
                  confirmationModal.loading && styles.loadingButton
                ]}
                onPress={handleConfirmedAction}
                disabled={confirmationModal.loading}
              >
                {confirmationModal.loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.confirmButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>{confirmationModal.confirmText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
  // Modal Styles (matching Users management patterns)
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  // Report Section (matching overview card style)
  reportSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  reportCategory: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  reportBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  contentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#01B97F',
  },
  contentLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  reportedText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Section Header (matching overview patterns)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  // Info Card (matching overview card style)
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  // Action Grid (matching overview status cards)
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    minHeight: 100,
    width: '45%', // For 2 buttons in a row
    minWidth: 120,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  approveCard: {
    borderColor: '#f3f4f6',
  },
  declineCard: {
    borderColor: '#f3f4f6',
  },
  reopenCard: {
    borderColor: '#f3f4f6',
  },

  // Confirmation Modal Styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmationModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmationTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  confirmButton: {
    // backgroundColor will be set dynamically
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  loadingButton: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

});