
# TaskFlow - Social Media Management Platform

A comprehensive social media management platform built with React, TypeScript, and Supabase. TaskFlow helps agencies and teams manage their social media campaigns, track performance, and coordinate content creation across multiple platforms.

## 🚀 Features Overview

TaskFlow is designed specifically for social media agencies and marketing teams to streamline their workflow from campaign planning to performance analysis.

### Core Capabilities
- **Campaign Management**: Create, assign, and track social media campaigns
- **Team Collaboration**: Manage team members and assign tasks
- **Client Management**: Organize clients and their associated campaigns
- **Analytics Dashboard**: Track performance metrics and team productivity
- **Real-time Updates**: Live synchronization across team members
- **Multi-platform Support**: Support for Instagram, Facebook, TikTok, LinkedIn, and Twitter

## 📱 Application Pages & Features

### 1. Dashboard (`/`)
**Purpose**: Central command center for overview and quick actions

**Features**:
- **Campaign Statistics**: Active campaigns, completion rates, team performance metrics
- **Social Media Metrics**: Platform-specific engagement data with visual charts
- **Campaign Overview**: Recent campaign status and priority breakdown
- **Task Board**: Kanban-style view of current tasks and their progress
- **Recent Activity**: Timeline of recent team actions and updates
- **Team Overview**: Current team member status and productivity

**Use Cases**:
- Morning standup reviews
- Quick status checks for managers
- Identifying bottlenecks and urgent tasks
- Overview of team workload distribution

### 2. Campaigns (`/tasks`)
**Purpose**: Comprehensive campaign and task management

**Features**:
- **Multiple View Modes**:
  - **Kanban Board**: Visual workflow with drag-and-drop task management
  - **List View**: Detailed table view with filtering and sorting
  - **Client View**: Organized by client with campaign groupings

- **Advanced Filtering**:
  - Search by campaign title or description
  - Filter by status (todo, in-progress, completed, archived)
  - Filter by priority (low, medium, high)
  - Filter by platform (Instagram, Facebook, TikTok, LinkedIn, Twitter)
  - Filter by assigned team member
  - Filter by client

- **Campaign Management**:
  - Create new campaigns with detailed information
  - Assign campaigns to team members
  - Set priorities and due dates
  - Track completion status
  - Add campaign descriptions and notes

- **Statistics Dashboard**:
  - Active campaigns count
  - In-production campaigns
  - Published content count
  - High-priority campaigns

**Use Cases**:
- Daily task assignment and tracking
- Project managers organizing team workload
- Content creators checking their assigned tasks
- Filtering campaigns by client or platform for focused work sessions

### 3. Clients (`/clients`)
**Purpose**: Client relationship and project management

**Features**:
- **Client Database**:
  - Comprehensive client information (name, company, email)
  - Client status tracking (active, inactive, archived)
  - Brand color customization for visual identification
  - Client descriptions and notes

- **Client Management**:
  - Add new clients with complete profiles
  - Edit existing client information
  - Archive or delete clients
  - Track client status changes

- **Campaign Association**:
  - View all campaigns per client
  - Client-specific campaign statistics
  - Team assignments per client

- **Advanced Search & Filtering**:
  - Search by client name, company, or email
  - Filter by client status
  - Clear filters functionality

**Use Cases**:
- Account managers tracking client portfolios
- Onboarding new clients
- Organizing campaigns by client for billing purposes
- Managing client relationships and status updates

### 4. Team (`/team`)
**Purpose**: Team member management and collaboration

**Features**:
- **Team Member Profiles**:
  - Complete member information and roles
  - Contact details and expertise areas
  - Performance tracking and statistics

- **Team Management**:
  - Add new team members
  - Edit member profiles and roles
  - Remove team members
  - Track team performance metrics

- **Collaboration Tools**:
  - Task assignment capabilities
  - Team productivity analytics
  - Role-based access and responsibilities

**Use Cases**:
- HR onboarding new team members
- Managers assigning tasks based on expertise
- Performance reviews and team analytics
- Resource planning and workload distribution

### 5. Analytics (`/analytics`)
**Purpose**: Comprehensive performance tracking and insights

**Features**:
- **Key Performance Metrics**:
  - Total tasks and completion rates
  - Average completion time per task
  - Overdue task tracking
  - Team productivity scores

- **Visual Analytics**:
  - **Platform Distribution**: Pie chart showing task distribution across social platforms
  - **Priority Breakdown**: Bar chart of high/medium/low priority tasks
  - **Team Performance**: Individual team member efficiency tracking
  - **Weekly Progress**: Line chart showing task creation vs completion trends

- **Detailed Insights**:
  - Individual team member performance
  - Platform-specific campaign analytics
  - Time-based trend analysis
  - Productivity benchmarking

**Use Cases**:
- Monthly performance reviews
- Identifying team training needs
- Resource allocation planning
- Client reporting and billing insights
- Process optimization based on completion times

### 6. Calendar (`/calendar`)
**Purpose**: Schedule management and deadline tracking

**Features**:
- **Campaign Scheduling**: Visual calendar view of all campaign deadlines
- **Team Schedule**: View team member availability and assignments
- **Deadline Management**: Track upcoming due dates and milestones
- **Event Planning**: Schedule meetings, reviews, and content creation sessions

**Use Cases**:
- Weekly planning sessions
- Deadline management
- Resource scheduling
- Client meeting coordination

### 7. Settings (`/settings`)
**Purpose**: User and application configuration

**Features**:
- **Profile Management**:
  - Personal information updates
  - Avatar upload and management
  - Contact details and bio

- **Notification Preferences**:
  - Email notification controls
  - Push notification settings
  - Task assignment alerts
  - Deadline reminders
  - Team update notifications

- **Security Settings**:
  - Password management
  - Two-factor authentication
  - Session timeout configuration
  - Login alerts

- **Application Preferences**:
  - Theme selection (light/dark/system)
  - Language preferences
  - Timezone configuration
  - Date format customization
  - Week start day preference

**Use Cases**:
- Initial user onboarding
- Personalizing notification preferences
- Security configuration
- Accessibility customization

## 🔄 Application Flow & Logic

### User Authentication Flow
1. **Access Control**: All pages require authentication except `/auth`
2. **Session Management**: Automatic session persistence and token refresh
3. **Profile Linking**: User profiles are automatically linked upon first login
4. **Redirect Logic**: Unauthenticated users are redirected to login page

### Data Architecture
- **Real-time Synchronization**: All data updates are synchronized in real-time across users
- **Row Level Security**: Data access is restricted based on user authentication
- **Optimistic Updates**: UI updates immediately with server sync in background
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Campaign Lifecycle
1. **Creation**: Campaigns are created with title, description, platform, and client assignment
2. **Assignment**: Tasks are assigned to team members with priority levels
3. **Progress Tracking**: Status updates (todo → in-progress → completed)
4. **Analytics**: Performance data is automatically tracked and aggregated

### Client Management Flow
1. **Onboarding**: New clients are added with complete profile information
2. **Campaign Association**: Campaigns are linked to specific clients
3. **Status Tracking**: Client status is maintained (active/inactive/archived)
4. **Reporting**: Client-specific analytics and campaign summaries

## 🛠 Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and developer experience
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first styling with responsive design
- **Shadcn/UI**: High-quality, accessible component library

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Real-time Subscriptions**: Live data synchronization
- **Row Level Security**: Database-level security policies
- **Authentication**: Built-in user management and session handling

### Key Libraries
- **React Router**: Client-side routing and navigation
- **React Query**: Data fetching and caching
- **Recharts**: Data visualization and analytics charts
- **React Hook Form**: Form handling and validation
- **Lucide React**: Consistent iconography

## 🎯 Use Cases by User Type

### Agency Managers
- Track overall team performance and productivity
- Manage client relationships and campaign portfolios
- Analyze completion rates and identify bottlenecks
- Assign campaigns based on team expertise and workload

### Project Managers
- Organize campaigns by client and priority
- Monitor deadlines and ensure timely delivery
- Coordinate team resources and assignments
- Generate client reports and performance metrics

### Content Creators
- View assigned campaigns and deadlines
- Update task progress and completion status
- Access client-specific requirements and brand guidelines
- Collaborate with team members on campaign execution

### Account Managers
- Manage client relationships and communication
- Track client-specific campaign performance
- Onboard new clients and maintain profiles
- Generate client-facing reports and analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project setup

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd taskflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📈 Future Enhancements

- **Advanced Analytics**: More detailed performance metrics and custom reporting
- **Client Portal**: Self-service portal for clients to view campaign progress
- **Integration APIs**: Connect with social media platforms for automated posting
- **Advanced Scheduling**: Bulk content scheduling and calendar integration
- **Mobile App**: Native mobile applications for on-the-go management
- **AI Insights**: Machine learning-powered recommendations and insights

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📞 Support

For support and questions, please contact our team or create an issue in the repository.
