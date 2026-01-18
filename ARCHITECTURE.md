# Architecture: From Marketplace to Personal Study System

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDY COMPANION AI                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 React 18 + TypeScript                    │   │
│  │          (UI Layer - Pages, Components, Hooks)           │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                        │
│  ┌──────────────────────┴──────────────────────────────────┐   │
│  │            React Router v6 (Navigation)                │   │
│  │  ┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Home   │  │Depts    │  │Courses   │  │Topics    │  │   │
│  │  └────────┘  └─────────┘  └──────────┘  └──────────┘  │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                        │
│  ┌─────────────────────┴──────────────────────────────────┐   │
│  │         StudyService (Business Logic)                  │   │
│  │                                                        │   │
│  │  getDepartments()      getCourses()                  │   │
│  │  createDepartment()    createCourse()               │   │
│  │  updateDepartment()    updateCourse()               │   │
│  │  deleteDepartment()    deleteCourse()               │   │
│  │                                                        │   │
│  │  getTopics()           getResources()               │   │
│  │  createTopic()         createResource()             │   │
│  │  updateTopic()         deleteResource()             │   │
│  │  deleteTopic()         getStudyStats()              │   │
│  └─────────────────────┬──────────────────────────────────┘   │
│                        │                                        │
│  ┌─────────────────────┴──────────────────────────────────┐   │
│  │      Supabase Client (Data Access)                    │   │
│  └─────────────────────┬──────────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ┌──────▼──────┐              ┌────────▼──────┐
    │  Supabase   │              │  Supabase     │
    │  Database   │              │  Auth         │
    │  (PostgreSQL)              │               │
    │             │              │               │
    │ • departments              │ • User login  │
    │ • courses    │              │ • Profiles    │
    │ • topics     │              │               │
    │ • resources  │              │               │
    └─────────────┘              └───────────────┘
```

## Data Flow

### Creating a Department
```
User Input → AddDepartmentModal Component
    ↓
handleAddDepartment(name) function
    ↓
StudyService.createDepartment(userId, name)
    ↓
supabase.from('departments').insert({...})
    ↓
Database INSERT with RLS check (user_id match)
    ↓
Success → Update local state
    ↓
UI re-renders with new department
```

### Viewing Departments
```
Page mounts → useEffect triggered
    ↓
loadDepartments() called
    ↓
StudyService.getDepartments(userId)
    ↓
supabase.from('departments').select('*')
    ↓
Database SELECT with RLS filter (WHERE user_id = auth.uid())
    ↓
Results returned
    ↓
setState(departments)
    ↓
UI renders departments grid
```

## Security with RLS (Row-Level Security)

```
Without RLS:
  User A can see User B's departments
  ❌ Data privacy breach

With RLS:
  Database Level:
    CREATE POLICY "Users can view their own departments"
    ON public.departments
    FOR SELECT
    USING (auth.uid() = user_id);
  
  Result:
    SELECT * FROM departments
    WHERE user_id = 'user123'  ← Automatic, enforced by database
  
  User A only sees User A's data
  ✅ Secure by design
```

## State Management

```
Component Level (useState):
├── departments: Department[]
├── courses: Course[]
├── topics: Topic[]
├── loading: boolean
├── error: string | null
└── modals: isAddModalOpen

Context Level (useAuth, useTheme):
├── AuthContext
│   ├── user
│   ├── profile
│   └── isLoggedIn
└── ThemeContext
    ├── isDark
    └── toggleTheme()
```

## Component Hierarchy

```
<App>
  ├── <AuthProvider>
  │   └── <ThemeProvider>
  │       ├── <Sidebar>           ← Navigation
  │       ├── <Routes>
  │       │   ├── <Home>
  │       │   ├── <Departments>
  │       │   │   ├── <AddDepartmentModal>
  │       │   │   └── DepartmentCard[]
  │       │   ├── <Courses>
  │       │   │   ├── <AddCourseModal>
  │       │   │   └── CourseCard[]
  │       │   ├── <Topics>
  │       │   │   ├── <AddTopicModal>
  │       │   │   └── TopicCard[]
  │       │   └── <Revisions>
  │       ├── <AIChatbot>          ← AI Assistant
  │       └── <ThemeToggle>        ← Dark mode
  │
  └── index.html
```

## Service Layer (StudyService)

```typescript
// All methods are user-scoped (userId parameter required)

class StudyService {
  // DEPARTMENTS
  static async getDepartments(userId)
  static async createDepartment(userId, name)
  static async updateDepartment(id, name)
  static async deleteDepartment(id)

  // COURSES
  static async getCourses(departmentId, userId)
  static async createCourse(userId, depId, name, code)
  static async updateCourse(id, name, code)
  static async deleteCourse(id)

  // TOPICS
  static async getTopics(courseId, userId)
  static async createTopic(userId, courseId, name, desc, tags)
  static async updateTopic(id, updates)
  static async deleteTopic(id)

  // RESOURCES
  static async getResources(topicId, userId)
  static async createResource(userId, topicId, type, title, url, content)
  static async deleteResource(id)

  // ANALYTICS
  static async getStudyStats(userId)
}
```

## Modal Forms Architecture

```
<AddDepartmentModal>
  ↓
Input: { name: string }
  ↓
onAdd(name) callback
  ↓
StudyService.createDepartment()
  ↓
Supabase INSERT
  ↓
Success: close modal + update list
Error: show error message

Pattern same for AddCourseModal and AddTopicModal
```

## Page Structure Pattern

All pages follow the same pattern:

```typescript
const PageComponent: React.FC = () => {
  // 1. Hooks & State
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 2. Load Data
  useEffect(() => {
    loadData();  // Called via StudyService
  }, [user?.id]);

  // 3. CRUD Operations
  const handleAdd = async (name) => { ... }
  const handleDelete = async (id) => { ... }
  const handleNavigate = (page) => { ... }

  // 4. Animations
  const containerVariants = { ... }
  const itemVariants = { ... }

  // 5. Render
  return (
    <Layout>
      <Header />
      <SearchBar />
      <Grid>
        {data.map(item => <Card key={item.id} {...item} />)}
      </Grid>
      <Modal {...modalProps} />
    </Layout>
  );
}
```

## Responsive Design

```
Desktop (1024px+):
  Sidebar: Always visible (64px width)
  Main content: Full width with ml-64
  Grid: lg:grid-cols-3

Tablet (768px - 1023px):
  Sidebar: Hamburger menu or collapsible
  Main content: Full width
  Grid: md:grid-cols-2

Mobile (< 768px):
  Sidebar: Hidden by default (hamburger)
  Main content: Full width
  Grid: Single column or md:grid-cols-2
```

## Dark Mode System

```
<ThemeContext>
  ├── isDark: boolean
  ├── toggleTheme(): void
  └── Applied using:
      ├── Tailwind dark: class
      ├── CSS variables
      └── Component-level logic

Usage in components:
  <div className={isDark ? 'bg-slate-900' : 'bg-white'}>
  <input className={isDark ? 'bg-slate-800 text-white' : '...'}/>
```

## Before vs After Comparison

### BEFORE (Marketplace Model)
```
Dependencies:
├── Hardcoded department array
├── Hardcoded course array
├── Hardcoded topic array
└── Mock data

Problems:
❌ Same data for all users
❌ Can't modify content
❌ Can't add personal courses
❌ Not suitable for study management
❌ No data persistence
```

### AFTER (Student-Led Model)
```
Dependencies:
├── Supabase client
├── StudyService class
├── Auth context
├── User database records
└── Real-time data

Benefits:
✅ Unique content per student
✅ Full CRUD operations
✅ Custom study structure
✅ Perfect for study management
✅ Cloud persistence
✅ Secure with RLS
✅ Real-time updates possible
```

## Type Safety

```typescript
// Service returns typed data
interface Department {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  courses?: Course[];
}

interface Course {
  id: string;
  department_id: string;
  user_id: string;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
  topics?: Topic[];
}

// Components expect correct types
type DepartmentCardProps = {
  department: Department;
  onDelete: (id: string) => void;
  onNavigate: (path: string) => void;
};
```

## Performance Optimizations

```typescript
// Lazy loading with useEffect
useEffect(() => {
  loadData();  // Only called when userId changes
}, [user?.id]);

// Optimistic updates
setCourses([newCourse, ...courses]);  // Update UI first
await StudyService.createCourse(...); // Then save

// Memoization ready
const MemoizedCard = React.memo(CourseCard);
```

---

**This architecture ensures:**
- ✅ Data privacy & security
- ✅ Scalability
- ✅ Type safety
- ✅ Easy maintenance
- ✅ Extensibility for new features
- ✅ Real-time capabilities
- ✅ Mobile-first responsiveness
