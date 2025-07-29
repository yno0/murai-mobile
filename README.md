# Admin Dashboard System Analysis & Gap Report

## 1. Admin Screen Analysis

### Screens & Chart Components

#### Dashboard Screens (`app/(admin)/screens/Dashboard/`)
- **index.jsx**: Main dashboard overview
  - **Charts:**
    - LineChart (Detection & Reports over time)
      - Data: Detections, Reports (by time range)
    - Top flagged content, monitored websites, user activity (list, not chart)
  - **API Calls:**
    - `GET /api/dashboard/overview?timeRange=...` (stats)
    - `GET /api/dashboard/activity-chart?timeRange=...` (chart)
    - `GET /api/dashboard/insights` (AI insights)
    - `GET /api/dashboard/flagged-words` (flagged words)
    - `GET /api/dashboard/websites` (site analytics)
    - `GET /api/dashboard/user-activity` (user activity)

- **Detection.jsx**
  - **Charts:**
    - LineChart (Weekly Trend)
    - PieChart (Detection Types Distribution)
  - **Data:** Trending patterns, detected words (list)
  - **API Calls:** (Mocked, but should map to `/dashboard/flagged-words`)

- **Sites.jsx**
  - **Charts:**
    - BarChart (Detections Per Site)
    - PieChart (Site Type Distribution)
  - **Data:** Most active sites (list)
  - **API Calls:** (Mocked, but should map to `/dashboard/websites`)



- **Languages.jsx**
  - **Charts:**
    - PieChart (Language Distribution)
    - LineChart (Language Detection Trend)
  - **Data:** Language breakdown (list)
  - **API Calls:** (No direct endpoint, would require `/dashboard/flagged-words` with language aggregation)



#### Users Screens (`app/(admin)/screens/Users/`)
- **index.jsx, UsersOverview.jsx, UsersList.jsx**
  - **Charts:**
    - Role distribution (list, not chart)
    - Status breakdown (list, not chart)
    - User activity (list, not chart)
  - **API Calls:**
    - `GET /api/users` (should exist, but currently only `/me` and `/preferences`)
    - `GET /api/users/groups` (for group membership)
    - `PUT /api/users/:id` (for user status update, not implemented)

#### Reports Screens (`app/(admin)/screens/Reports/`)
- **ReportsOverview.jsx**
  - **Charts:**
    - BarChart (Category Breakdown)
  - **Data:**
    - Summary stats, report types, activity overview, detected words (list)
  - **API Calls:**
    - `GET /api/reports` (should exist, not found)

#### Profile Screens (`app/(admin)/screens/Profile/`)
- **SystemLogs.jsx**
  - **Data:** System logs (list)
  - **API Calls:**
    - `GET /api/admin/logs` (should exist, not found)

- **AccountSettings.jsx, PersonalDetails.jsx, ChangePassword.jsx**
  - **Data:** User profile, settings
  - **API Calls:**
    - `GET /api/users/me`, `GET /api/users/preferences`, `POST /api/auth/change-password` (should exist)

#### Home Screen (`app/(admin)/screens/Home/`)
- **index.jsx**
  - **Charts:**
    - LineChart (System Activity Trend)
  - **Data:** KPIs, critical events, notifications
  - **API Calls:**
    - `GET /admin/dashboard/overview`, `GET /admin/dashboard/activity-chart`, `GET /admin/dashboard/recent-activity`, `GET /admin/notifications` (should exist, not found)

---

## 2. Server-Side Model Evaluation

### Existing Models (from `murai-server/models/`)
- **User**: email, password, name, role, isActive, isVerified, createdAt, updatedAt
- **UserInfo**: userId, firstName, lastName, gender, phoneNumber, profilePicture, dateOfBirth, createAt, updateAt
- **Report**: userId, type (false_negative/false_positive), description, status, createAt, updateAt
- **Group**: name, description, userId (admin), createAt, updateAt, isActive
- **GroupMember**: userId, groupId, joinedAt
- **DetectedWord**: word, userId, context, sentimentScore, url, accuracy, responseTime, createdAt
- **UserActivity**: userId, activityType, activityDetails, createdAt, updatedAt
- **AdminLogs**: adminId, action, activityType, targetType, targetId, details, ipAddress, userAgent, status, errorMessage, createdAt
- **Notification**: userId, title, message, isRead, type, createdAt
- **Preference**: userId, language, whitelistSite, whitelistTerms, flagStyle, isHighlighted, color, extensionEnabled, totalActiveTime, lastActiveStart, sessionStartTime, createdAt, updatedAt
- **GroupCode**: groupId, code, createAt, updateAt, expiresAt

### Model Gaps vs. Dashboard Needs
- **DetectedWord**: Lacks fields for pattern type/category, language, severity, site type, etc. (needed for analytics)
- **Report**: Lacks fields for category, reportedText, reviewedBy, reviewedAt, etc. (needed for reports management)
- **User**: Lacks lastActive, joinedAt, status (active/inactive), role (admin/user distinction is present, but not for premium/suspended)
- **Group**: Lacks member count, group status (active/inactive/pending), group type
- **Notification**: No admin/global notifications (only per-user)
- **UserActivity**: Lacks activity breakdown by type, no direct mapping to dashboard activity types
- **No dedicated models for:**
  - Language analytics (language field missing in DetectedWord)
  - Pattern analytics (pattern/category field missing in DetectedWord)
  - System health (no model, could be derived from logs)

---

## 3. Gap Analysis & Recommendations

### A. API Endpoints Required (and Status)
| Endpoint | Method | Params | Exists? | Notes |
|----------|--------|--------|---------|-------|
| /api/dashboard/overview | GET | timeRange | Yes | OK |
| /api/dashboard/activity-chart | GET | timeRange | Yes | OK |
| /api/dashboard/flagged-words | GET | timeRange | Yes | OK |
| /api/dashboard/websites | GET | timeRange | Yes | OK |
| /api/dashboard/user-activity | GET | timeRange | Yes | OK |
| /api/dashboard/insights | GET |  | Yes | OK |
| /api/users | GET |  | No | Needed for user management |
| /api/users/:id | PUT | status, role | No | Needed for user status update |
| /api/reports | GET |  | No | Needed for reports management |
| /api/admin/logs | GET |  | No | Needed for system logs |
| /admin/dashboard/overview | GET | timeRange | No | Needed for admin home |
| /admin/notifications | GET |  | No | Needed for admin notifications |

### B. Model Changes Needed
- **DetectedWord**
  - Add: `patternType` (String, e.g. 'Profanity', 'Hate Speech', ...)
  - Add: `language` (String)
  - Add: `severity` (String, enum: 'low', 'medium', 'high')
  - Add: `siteType` (String, e.g. 'Social Media', 'Forum', ...)
- **Report**
  - Add: `category` (String)
  - Add: `reportedText` (String)
  - Add: `reviewedBy` (ObjectId, ref User)
  - Add: `reviewedAt` (Date)
- **User**
  - Add: `lastActive` (Date)
  - Add: `joinedAt` (Date)
  - Add: `status` (String, enum: 'active', 'inactive', 'suspended')
  - Add: `role` (expand enum: 'admin', 'user', 'premium', 'suspended')
- **Group**
  - Add: `memberCount` (Number, virtual or denormalized)
  - Add: `status` (String, enum: 'active', 'inactive', 'pending')
  - Add: `type` (String, e.g. 'public', 'private')
- **Notification**
  - Add: `isGlobal` (Boolean, for admin/global notifications)
- **UserActivity**
  - Add: `activityCategory` (String)

### C. New Endpoints Needed
- `/api/users` (GET, list/filter users)
- `/api/users/:id` (PUT, update user status/role)
- `/api/reports` (GET, list/filter reports)
- `/api/admin/logs` (GET, system logs)
- `/admin/dashboard/*` (GET, admin-specific dashboard data)
- `/admin/notifications` (GET, admin/global notifications)

### D. Implementation Priorities
1. **Critical**
   - Add missing fields to DetectedWord, Report, User models
   - Implement `/api/users` and `/api/reports` endpoints
   - Add `/api/admin/logs` and `/admin/notifications` endpoints
2. **High**
   - Add language, pattern, and severity analytics to DetectedWord
   - Add group status/type fields
   - Add global notification support
3. **Medium**
   - Add virtuals/aggregations for member counts, activity breakdowns
   - Add system health analytics (from logs)
4. **Low**
   - Refine models for extensibility (e.g. enums, references)

---

## 4. Summary Table: Dashboard Data vs. Model Support
| Dashboard Data | Model/Field | Exists? | Notes |
|----------------|-------------|---------|-------|
| Detections by pattern | DetectedWord.patternType | No | Add field |
| Detections by language | DetectedWord.language | No | Add field |
| User status/role | User.status, User.role | Partial | Expand enum |
| Group status/type | Group.status, Group.type | No | Add fields |
| Report category/type | Report.category, Report.reportedText | No | Add fields |
| System logs | AdminLogs | Yes | Expose via API |
| Notifications | Notification | Partial | Add isGlobal, admin endpoints |
| Activity breakdown | UserActivity.activityType | Yes | Add activityCategory for more detail |

---

## 5. Recommendations
- **Backend:**
  - Update models as above
  - Implement missing endpoints
  - Add aggregation endpoints for analytics (language, pattern, severity, group status, etc.)
- **Frontend:**
  - Refactor to use new endpoints/fields as they become available
  - Add error handling for missing data
- **Database:**
  - Migrate existing data to new schema (add default values for new fields)

---

*This document should be updated as new features and endpoints are implemented.*
