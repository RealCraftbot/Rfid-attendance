# RFID Attendance SaaS - Product Requirements Document

## 1. Executive Summary

### 1.1 Product Overview
A comprehensive RFID-based attendance management system designed for Nigerian schools, featuring multi-tenant architecture, real-time tracking, school bus monitoring, fee management, and academic performance tracking.

### 1.2 Target Market
- Primary/Secondary schools in Nigeria
- Private schools with 100-2,000 students
- Schools with transportation services
- Multi-campus institutions

### 1.3 Value Proposition
- **Accuracy**: Eliminate manual attendance errors with RFID technology
- **Real-time**: Instant notifications to parents
- **Multi-functional**: Attendance, bus tracking, fees, and grades in one platform
- **Mobile-first**: Optimized for smartphones used by parents and staff

---

## 2. User Personas & Roles

### 2.1 Super Admin (Platform Level)
- Manage organizations/schools
- View platform analytics
- Handle billing and subscriptions
- System configuration

### 2.2 School Admin
- Full access to school data
- Manage staff, students, parents
- Configure fee structures
- View all reports and analytics
- Manage RFID devices

### 2.3 Bursar
- Fee management and collection
- Payment verification and approval
- Bank account management
- Financial reporting
- Cannot access academic/attendance data

### 2.4 Teacher
- Mark attendance for their classes
- View student academic records
- Input grades and remarks
- View bus tracking for their students
- Access teacher attendance via RFID

### 2.5 Parent
- View children's attendance history
- Real-time bus tracking
- Pay school fees online
- View report cards and grades
- Receive notifications

### 2.6 Student (Future Enhancement)
- View own attendance
- Check fee balance
- View grades

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

#### 3.1.1 Multi-Role Login System
- Role-specific login pages (`/login/admin`, `/login/teacher`, `/login/parent`, `/login/bursar`)
- JWT-based session management
- Organization scoping for all queries
- Password reset via email

#### 3.1.2 Registration Workflows
- Admin registration with organization setup
- Teacher registration with classroom assignment
- Parent registration with student linking
- Bursar registration by Admin
- Email verification for all accounts

### 3.2 RFID Attendance System

#### 3.2.1 Core Scanning
- RFID card tap records timestamp instantly
- Support for multiple check types:
  - `check_in`: General school entry
  - `check_out`: General school exit
  - `bus_pickup_home`: Morning pickup
  - `bus_drop_school`: Arrival at school
  - `bus_pickup_school`: Afternoon pickup
  - `bus_drop_home`: Drop-off at home

#### 3.2.2 Device Management
- Device registration with unique IDs
- Device taoken authentiction (HMAC)
- Battery level monitoring
- Location assignment (gate, classroom, bus)
- Online/offline status tracking

#### 3.2.3 Idempotency
- 5-second deduplication window
- Prevents duplicate scans
- Unique idempotency keys per scan

#### 3.2.4 Teacher Attendance
- Teachers scan RFID to mark class attendance
- Records timestamp and classroom
- Separate from student attendance

### 3.3 Student Management

#### 3.3.1 Student Profiles
- Personal info (name, DOB, photo)
- RFID card UID assignment
- Guardian contact details
- Classroom assignment
- Admission number generation
- Bus route assignment (optional)

#### 3.3.2 Student Lifecycle
- Enrollment workflow
- Transfer between classes
- Graduation process
- Deactivation (withdrawal)

### 3.4 School Bus Tracking

#### 3.4.1 Bus Route Management
- Route creation with stops
- Stop ordering
- Estimated pickup/drop times
- Route assignment to students

#### 3.4.2 Journey Tracking
4-point journey monitoring:
1. **Waiting**: Student waiting at home stop
2. **On Bus to School**: Picked up, en route
3. **At School**: Arrived and checked in
4. **On Bus to Home**: School pickup, going home
5. **Home**: Dropped off at home stop

#### 3.4.3 Parent Notifications
- Real-time status updates
- Push notifications for each checkpoint
- ETA updates
- Delay alerts

### 3.5 Fee Management System

#### 3.5.1 Fee Structures
- Multiple fee types (tuition, levy, exam, etc.)
- Term-based configuration
- Class-specific fee amounts
- Academic year management

#### 3.5.2 Invoicing
- Automatic invoice generation
- Student-specific invoices
- Due date tracking
- Overdue notifications

#### 3.5.3 Payment Processing
- Multiple payment methods:
  - Bank transfer
  - Cash (in-person)
  - Cheque
  - POS terminal
  - Online payment (Paystack/Flutterwave integration)

#### 3.5.4 Payment Verification Workflow
1. Parent submits payment with proof (receipt/screenshot)
2. Bursar reviews submission
3. Approve: Mark as verified/completed
4. Reject: Provide reason, parent resubmits
5. Audit trail: Who approved, when, notes

#### 3.5.5 Bank Account Management
- Multiple school accounts
- Default account designation
- Bank details display for transfers
- Nigerian bank support (First Bank, GTB, UBA, etc.)

#### 3.5.6 Financial Reporting
- Collection rate analytics
- Outstanding balances
- Revenue by term/year
- Payment method breakdown

### 3.6 Academic & Grades

#### 3.6.1 Nigerian Curriculum Support
- Grade levels: Primary 1-6, JSS 1-3, SS 1-3
- Grading system: A1-F9 (WAEC/NECO standard)
- Subject management
- Term structure (1st, 2nd, 3rd term)

#### 3.6.2 Grade Entry
- Test scores (continuous assessment)
- Exam scores
- Automatic total calculation
- Grade letter assignment
- Teacher remarks

#### 3.6.3 Report Cards
- Termly report generation
- Subject-wise breakdown
- Cumulative GPA
- Teacher comments
- Principal comments
- Parent access via portal

### 3.7 Notifications & Communication

#### 3.7.1 Notification Types
- Attendance check-in/out
- Bus status updates
- Fee payment reminders
- Fee payment confirmations
- Grade publication
- General announcements

#### 3.7.2 Channels
- In-app notifications
- Email notifications
- SMS notifications (Twilio)
- Push notifications (mobile app)

### 3.8 Reporting & Analytics

#### 3.8.1 Attendance Reports
- Daily attendance sheets
- Monthly summary by class
- Individual student history
- Late arrivals tracking
- Absence patterns

#### 3.8.2 Financial Reports
- Revenue reports
- Outstanding payments
- Collection statistics
- Bank reconciliation

#### 3.8.3 Academic Reports
- Class performance averages
- Individual student progress
- Subject-wise analysis
- Grade distribution

#### 3.8.4 Export Options
- CSV export
- PDF generation
- Print-friendly formats

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time < 2 seconds
- RFID scan processing < 500ms
- Support 1,000 concurrent users
- 99.9% uptime SLA

### 4.2 Security
- Data encryption at rest (AES-256)
- TLS 1.3 for all communications
- Password hashing (bcrypt, 10 rounds)
- Rate limiting on API endpoints
- HMAC authentication for devices
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens

### 4.3 Scalability
- Horizontal scaling support
- Database connection pooling
- Redis caching (future)
- CDN for static assets

### 4.4 Data Privacy
- GDPR compliance principles
- Data retention policies
- Right to deletion
- Audit logs for data access

### 4.5 Localization
- Nigerian Naira (₦) currency
- West Africa Time (WAT, UTC+1)
- Nigerian date format (DD/MM/YYYY)
- Nigerian phone number validation

---

## 5. Technical Architecture

### 5.1 Tech Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod

#### Backend
- **Runtime**: Node.js 20
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js v4
- **Validation**: Zod v4

#### Database
- **Primary**: PostgreSQL 15
- **ORM**: Prisma
- **Schema**: Multi-tenant with `orgId` scoping

#### Infrastructure
- **Hosting**: Railway (Docker)
- **Database**: Railway PostgreSQL
- **File Storage**: AWS S3 / Cloudinary
- **Email**: SendGrid / AWS SES
- **SMS**: Twilio

### 5.2 Database Schema Highlights

#### Core Tables
- `Organization`: Multi-tenant boundary
- `User`: Authentication & roles
- `Student`: Student profiles with RFID
- `Classroom`: Classes/grades
- `AttendanceRecord`: Scan events
- `TeacherAttendance`: Teacher scans
- `Device`: RFID devices
- `BusRoute`: Bus routes
- `FeeStructure`: Fee definitions
- `Invoice`: Student invoices
- `PaymentTransaction`: Payment records
- `Grade`: Academic scores

### 5.3 API Design

#### RESTful Endpoints
```
POST   /api/scanAttendance          # RFID device scan
GET    /api/attendance/export        # Export attendance
POST   /api/attendance/teacher-scan  # Teacher attendance
GET    /api/dashboard                # Dashboard data
POST   /api/signup                   # User registration
```

#### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### 5.4 Security Architecture

#### Device Authentication
1. Device sends scan with HMAC signature
2. Server validates signature with device secret
3. Processes scan if valid

#### User Authentication
1. Login via NextAuth.js
2. JWT token issued
3. Session validated on each request
4. Role-based access control (RBAC)

#### Data Isolation
- All queries scoped to `orgId`
- Foreign key constraints
- Row-level security (future)

---

## 6. User Interface Requirements

### 6.1 Design Principles
- Mobile-first responsive design
- Clean, modern interface
- Consistent color scheme (blue primary)
- High contrast for readability
- Touch-friendly targets (min 44px)

### 6.2 Key Pages

#### Public Pages
- Landing page
- About, Contact, Support
- Login/Register (role-specific)

#### Dashboard (Admin)
- Overview with stats
- Student management
- Staff management
- Device management
- Bus tracking
- Attendance reports
- Fees management
- Grade management
- Settings

#### Dashboard (Teacher)
- My classes
- Mark attendance
- Input grades
- View students

#### Dashboard (Parent)
- My children overview
- Attendance history
- Bus tracking
- Pay fees
- View report cards
- Notifications

#### Dashboard (Bursar)
- Payment verification queue
- Transaction history
- Bank accounts
- Financial reports
- Fee structures

### 6.3 Mobile Considerations
- Bottom navigation for key actions
- Swipe gestures where appropriate
- Offline capability (future)
- Push notifications

---

## 7. Integration Requirements

### 7.1 Payment Gateways
- **Paystack**: Card, bank transfer, USSD
- **Flutterwave**: Alternative payment methods
- **Bank APIs**: For verification (future)

### 7.2 Communication
- **Twilio**: SMS notifications
- **SendGrid**: Email delivery
- **Firebase**: Push notifications (future)

### 7.3 Hardware
- **RFID Readers**: Compatible with ISO 14443A cards
- **Battery monitoring**: Low battery alerts
- **WiFi connectivity**: HTTP/HTTPS communication

---

## 8. Data Migration & Onboarding

### 8.1 Data Import
- CSV upload for students
- Bulk RFID card assignment
- Historical attendance import (optional)

### 8.2 Onboarding Flow
1. Super Admin creates organization
2. Admin account setup
3. Configure school settings
4. Add classrooms
5. Register devices
6. Import students
7. Assign RFID cards
8. Configure fees
9. Train staff

### 8.3 Training Materials
- Video tutorials
- User manuals
- Quick start guides
- FAQ section

---

## 9. Pricing Model (Future)

### 9.1 Subscription Tiers
- **Starter**: Up to 200 students, basic features
- **Professional**: Up to 1,000 students, full features
- **Enterprise**: Unlimited, custom integrations

### 9.2 Add-ons
- SMS credits
- Additional devices
- API access
- Custom development

---

## 10. Success Metrics

### 10.1 Adoption Metrics
- Daily Active Users (DAU)
- RFID scan volume
- Parent app downloads
- Fee payment online rate

### 10.2 Performance Metrics
- System uptime
- Average response time
- Error rates
- Support ticket resolution time

### 10.3 Business Metrics
- Customer Acquisition Cost (CAC)
- Monthly Recurring Revenue (MRR)
- Churn rate
- Net Promoter Score (NPS)

---

## 11. Roadmap

### Phase 1: MVP (Current)
- [x] Core attendance with RFID
- [x] Multi-role authentication
- [x] Basic student management
- [x] Bus tracking
- [x] Fee management
- [x] Grade management
- [x] Mobile-responsive UI

### Phase 2: Enhancement
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics
- [ ] Parent communication features
- [ ] Online payment integration
- [ ] Biometric backup (fingerprint)

### Phase 3: Scale
- [ ] AI-powered insights
- [ ] Integration with Learning Management Systems
- [ ] Government reporting (Nigeria)
- [ ] Multi-country support

---

## 12. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| RFID hardware failure | High | Spare devices, manual backup process |
| Network connectivity | Medium | Offline queue, sync when online |
| Data breach | Critical | Encryption, regular audits, access controls |
| User adoption | Medium | Training, intuitive UI, support |
| Payment disputes | Medium | Clear audit trail, receipt upload requirement |

---

## 13. Appendix

### 13.1 Glossary
- **RFID**: Radio Frequency Identification
- **Bursar**: School finance officer
- **JSS**: Junior Secondary School
- **SS**: Senior Secondary School
- **WAEC**: West African Examinations Council
- **NECO**: National Examinations Council

### 13.2 Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-03-24 | System | Initial PRD |

### 13.3 Approval
- [ ] Product Manager
- [ ] Technical Lead
- [ ] UX Designer
- [ ] QA Lead
