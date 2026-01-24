import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DeveloperCredit } from '@/components/DeveloperCredit';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Loader, ChevronRight, BookOpen, Code, Clock, Trash2, Sparkles, Grid3X3, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StudyService, Department, Course, Topic } from '@/services/studyService';

type Section = 'departments' | 'courses' | 'topics' | 'search';

const Dashboard: React.FC = () => {
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const { user } = useAuth();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [currentSection, setCurrentSection] = useState<Section>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadDepartments();
    }
  }, [user?.id]);

  const loadDepartments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await StudyService.getDepartments(user.id);
      setDepartments(data);
      setCurrentSection('departments');
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (deptId: string) => {
    if (!user?.id) return;
    try {
      const dept = departments.find(d => d.id === deptId);
      setSelectedDepartment(dept || null);
      const data = await StudyService.getCourses(deptId, user.id);
      setCourses(data);
      setCurrentSection('courses');
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadTopics = async (courseId: string) => {
    if (!user?.id) return;
    try {
      const course = courses.find(c => c.id === courseId);
      setSelectedCourse(course || null);
      const data = await StudyService.getTopics(courseId, user.id);
      setTopics(data);
      setCurrentSection('topics');
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user?.id || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setCurrentSection('search');
      const [courseResults, topicResults] = await Promise.all([
        StudyService.searchCourses(user.id, query),
        StudyService.searchTopics(user.id, query)
      ]);
      
      setSearchResults([
        ...courseResults.map(c => ({ ...c, type: 'course' })),
        ...topicResults.map(t => ({ ...t, type: 'topic' }))
      ]);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const addDepartment = async () => {
    if (!newDeptName.trim() || !user?.id) return;
    try {
      const dept = await StudyService.createDepartment(user.id, newDeptName);
      setDepartments([dept, ...departments]);
      setNewDeptName('');
      setShowDeptModal(false);
    } catch (error) {
      console.error('Failed to add department:', error);
    }
  };

  const addCourse = async () => {
    if (!newCourseName.trim() || !user?.id || !selectedDepartment?.id) return;
    try {
      const course = await StudyService.createCourse(user.id, selectedDepartment.id, newCourseName, newCourseCode);
      setCourses([course, ...courses]);
      setNewCourseName('');
      setNewCourseCode('');
      setShowCourseModal(false);
    } catch (error) {
      console.error('Failed to add course:', error);
    }
  };

  const addTopic = async () => {
    if (!newTopicName.trim() || !user?.id || !selectedCourse?.id) return;
    try {
      const topic = await StudyService.createTopic(user.id, selectedCourse.id, newTopicName, newTopicDesc);
      setTopics([topic, ...topics]);
      setNewTopicName('');
      setNewTopicDesc('');
      setShowTopicModal(false);
    } catch (error) {
      console.error('Failed to add topic:', error);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!window.confirm('Delete this department and all related content?')) return;
    try {
      await StudyService.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course and all related content?')) return;
    try {
      await StudyService.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!window.confirm('Delete this topic and all resources?')) return;
    try {
      await StudyService.deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const getRevisionText = (count: number) => {
    if (count === 0) return 'Not revised';
    if (count === 1) return 'Revised 1 time';
    return `${count} revisions`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Sidebar currentPage="dashboard" onToggleChatbot={handleToggleChatbot} />
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0 relative z-10">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Premium Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Grid3X3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Study Management
              </h1>
            </div>
            <p className="text-slate-400 text-lg ml-11">Organize your learning journey with intelligent hierarchy</p>
          </div>

          {/* Premium Search Bar */}
          <div className="mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-5 py-4 hover:border-slate-600/50 transition-colors">
                <Search className="w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search courses or topics..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-0 text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                  <Loader className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <p className="text-slate-400">Loading your study space...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Breadcrumb Navigation */}
              {currentSection !== 'departments' && currentSection !== 'search' && (
                <div className="flex items-center gap-2 mb-8 text-sm px-4 py-3 bg-slate-800/30 rounded-lg border border-slate-700/30 w-fit backdrop-blur">
                  <button
                    onClick={() => setCurrentSection('departments')}
                    className="text-blue-400 hover:text-blue-300 font-medium transition"
                  >
                    Departments
                  </button>
                  {currentSection !== 'departments' && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                      {selectedDepartment && (
                        <span className="text-slate-300 font-medium">{selectedDepartment.name}</span>
                      )}
                    </>
                  )}
                  {currentSection === 'topics' && selectedCourse && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                      <button
                        onClick={() => loadCourses(selectedDepartment!.id)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition"
                      >
                        Courses
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300 font-medium">{selectedCourse.name}</span>
                    </>
                  )}
                </div>
              )}

              {/* DEPARTMENTS SECTION */}
              {currentSection === 'departments' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">Departments</h2>
                    <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/50 transition-all">
                          <Plus className="w-4 h-4 mr-2" /> New Department
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader><DialogTitle className="text-white">Create Department</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Department name (e.g., Computer Science)"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                            onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                          />
                          <Button onClick={addDepartment} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">Add Department</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {departments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                        <BookOpen className="w-10 h-10 text-blue-400" />
                      </div>
                      <p className="text-slate-400 text-lg mb-4">No departments yet</p>
                      <p className="text-slate-500 text-sm">Create your first department to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {departments.map((dept, idx) => (
                        <div
                          key={dept.id}
                          onClick={() => loadCourses(dept.id)}
                          className="group cursor-pointer"
                          style={{ animation: `slideIn 0.5s ease-out ${idx * 0.1}s both` }}
                        >
                          <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-blue-500/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                                  <BookOpen className="w-6 h-6 text-blue-400" />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDepartment(dept.id);
                                  }}
                                  className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition">{dept.name}</h3>
                              <p className="text-slate-400 text-sm flex items-center gap-2 group-hover:text-slate-300 transition">
                                View courses <ChevronRight className="w-4 h-4" />
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COURSES SECTION */}
              {currentSection === 'courses' && selectedDepartment && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedDepartment.name}</h2>
                      <p className="text-slate-400">Manage courses in this department</p>
                    </div>
                    <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/50 transition-all">
                          <Plus className="w-4 h-4 mr-2" /> New Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader><DialogTitle className="text-white">Create Course</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Course name"
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                            onKeyPress={(e) => e.key === 'Enter' && addCourse()}
                          />
                          <Input
                            placeholder="Course code (optional)"
                            value={newCourseCode}
                            onChange={(e) => setNewCourseCode(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                            onKeyPress={(e) => e.key === 'Enter' && addCourse()}
                          />
                          <Button onClick={addCourse} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">Add Course</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {courses.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                        <Code className="w-10 h-10 text-purple-400" />
                      </div>
                      <p className="text-slate-400 text-lg mb-4">No courses yet</p>
                      <p className="text-slate-500 text-sm">Add your first course to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {courses.map((course, idx) => (
                        <div
                          key={course.id}
                          onClick={() => loadTopics(course.id)}
                          className="group cursor-pointer"
                          style={{ animation: `slideIn 0.5s ease-out ${idx * 0.1}s both` }}
                        >
                          <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-purple-500/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                                  <Code className="w-6 h-6 text-purple-400" />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCourse(course.id);
                                  }}
                                  className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition">{course.name}</h3>
                              {course.code && <p className="text-slate-400 text-sm mb-3">{course.code}</p>}
                              <p className="text-slate-400 text-sm flex items-center gap-2 group-hover:text-slate-300 transition">
                                View topics <ChevronRight className="w-4 h-4" />
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TOPICS SECTION */}
              {currentSection === 'topics' && selectedCourse && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedCourse.name}</h2>
                      <p className="text-slate-400">Manage topics and resources</p>
                    </div>
                    <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/50 transition-all">
                          <Plus className="w-4 h-4 mr-2" /> New Topic
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader><DialogTitle className="text-white">Create Topic</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Topic name"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                            onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                          />
                          <Input
                            placeholder="Description (optional)"
                            value={newTopicDesc}
                            onChange={(e) => setNewTopicDesc(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                            onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                          />
                          <Button onClick={addTopic} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">Add Topic</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {topics.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                        <Sparkles className="w-10 h-10 text-pink-400" />
                      </div>
                      <p className="text-slate-400 text-lg mb-4">No topics yet</p>
                      <p className="text-slate-500 text-sm">Create your first topic to start learning</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.map((topic, idx) => (
                        <div
                          key={topic.id}
                          style={{ animation: `slideIn 0.5s ease-out ${idx * 0.05}s both` }}
                        >
                          <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 ${
                            topic.completed
                              ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/30'
                              : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 hover:border-pink-500/50'
                          } hover:shadow-lg hover:shadow-pink-500/10`}>
                            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                              topic.completed
                                ? 'from-transparent to-transparent'
                                : 'from-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100'
                            }`}></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className={`text-xl font-bold mb-2 transition ${
                                    topic.completed
                                      ? 'text-slate-500 line-through'
                                      : 'text-white group-hover:text-pink-300'
                                  }`}>
                                    {topic.name}
                                  </h3>
                                  {topic.description && (
                                    <p className={`text-sm mb-4 ${topic.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                                      {topic.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTopic(topic.id)}
                                  className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-3 flex-wrap">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  topic.completed
                                    ? 'bg-slate-700/30'
                                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                                }`}>
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className={`text-sm font-medium ${topic.completed ? 'text-slate-500' : 'text-slate-300'}`}>
                                    {getRevisionText(topic.revision_count)}
                                  </span>
                                </div>

                                {topic.tags && topic.tags.length > 0 && (
                                  <div className="flex gap-2">
                                    {topic.tags.map(tag => (
                                      <Badge
                                        key={tag}
                                        className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border-blue-500/30 text-xs"
                                      >
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {topic.completed && (
                                  <Badge className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border-green-500/30 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEARCH RESULTS */}
              {currentSection === 'search' && (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-8">Search Results for "{searchQuery}"</h2>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                        <Search className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-lg">No results found</p>
                      <p className="text-slate-500 text-sm mt-2">Try searching with different keywords</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {searchResults.map((result, idx) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          style={{ animation: `slideIn 0.5s ease-out ${idx * 0.05}s both` }}
                        >
                          {result.type === 'course' && (
                            <div
                              className="group cursor-pointer rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 p-6 hover:shadow-lg hover:shadow-purple-500/10"
                              onClick={() => {
                                setSelectedDepartment(result.departments);
                                setSelectedCourse(result);
                                loadTopics(result.id);
                              }}
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex-shrink-0">
                                  <Code className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <Badge className="mb-2 bg-purple-500/30 text-purple-200 border-purple-500/30">Course</Badge>
                                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition">{result.name}</h3>
                                  <p className="text-slate-400 text-sm">
                                    {result.departments?.name || 'Unknown Department'} {result.code && `• ${result.code}`}
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition flex-shrink-0" />
                              </div>
                            </div>
                          )}
                          {result.type === 'topic' && (
                            <div
                              className="group cursor-pointer rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300 p-6 hover:shadow-lg hover:shadow-pink-500/10"
                              onClick={() => {
                                const course = result.courses;
                                if (course?.departments) {
                                  setSelectedDepartment(course.departments);
                                }
                                setSelectedCourse(course);
                                setTopics([result, ...topics.filter(t => t.id !== result.id)]);
                                setCurrentSection('topics');
                              }}
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-lg flex-shrink-0">
                                  <Sparkles className="w-6 h-6 text-pink-400" />
                                </div>
                                <div className="flex-1">
                                  <Badge className="mb-2 bg-pink-500/30 text-pink-200 border-pink-500/30">Topic</Badge>
                                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-300 transition">{result.name}</h3>
                                  <p className="text-slate-400 text-sm">
                                    {result.courses?.departments?.name} → {result.courses?.name}
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400 transition flex-shrink-0" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-16">
            <DeveloperCredit />
          </div>
        </div>
      </main>
      <AIChatbot ref={chatbotRef} />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

const Dashboard: React.FC = () => {
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const { user } = useAuth();
  
  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // UI state
  const [currentSection, setCurrentSection] = useState<Section>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadDepartments();
    }
  }, [user?.id]);

  const loadDepartments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await StudyService.getDepartments(user.id);
      setDepartments(data);
      setCurrentSection('departments');
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (deptId: string) => {
    if (!user?.id) return;
    try {
      const dept = departments.find(d => d.id === deptId);
      setSelectedDepartment(dept || null);
      const data = await StudyService.getCourses(deptId, user.id);
      setCourses(data);
      setCurrentSection('courses');
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadTopics = async (courseId: string) => {
    if (!user?.id) return;
    try {
      const course = courses.find(c => c.id === courseId);
      setSelectedCourse(course || null);
      const data = await StudyService.getTopics(courseId, user.id);
      setTopics(data);
      setCurrentSection('topics');
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user?.id || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setCurrentSection('search');
      const [courseResults, topicResults] = await Promise.all([
        StudyService.searchCourses(user.id, query),
        StudyService.searchTopics(user.id, query)
      ]);
      
      setSearchResults([
        ...courseResults.map(c => ({ ...c, type: 'course' })),
        ...topicResults.map(t => ({ ...t, type: 'topic' }))
      ]);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const addDepartment = async () => {
    if (!newDeptName.trim() || !user?.id) return;
    try {
      const dept = await StudyService.createDepartment(user.id, newDeptName);
      setDepartments([dept, ...departments]);
      setNewDeptName('');
      setShowDeptModal(false);
    } catch (error) {
      console.error('Failed to add department:', error);
    }
  };

  const addCourse = async () => {
    if (!newCourseName.trim() || !user?.id || !selectedDepartment?.id) return;
    try {
      const course = await StudyService.createCourse(user.id, selectedDepartment.id, newCourseName, newCourseCode);
      setCourses([course, ...courses]);
      setNewCourseName('');
      setNewCourseCode('');
      setShowCourseModal(false);
    } catch (error) {
      console.error('Failed to add course:', error);
    }
  };

  const addTopic = async () => {
    if (!newTopicName.trim() || !user?.id || !selectedCourse?.id) return;
    try {
      const topic = await StudyService.createTopic(user.id, selectedCourse.id, newTopicName, newTopicDesc);
      setTopics([topic, ...topics]);
      setNewTopicName('');
      setNewTopicDesc('');
      setShowTopicModal(false);
    } catch (error) {
      console.error('Failed to add topic:', error);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!window.confirm('Delete this department and all related content?')) return;
    try {
      await StudyService.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course and all related content?')) return;
    try {
      await StudyService.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!window.confirm('Delete this topic and all resources?')) return;
    try {
      await StudyService.deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const getRevisionText = (count: number) => {
    if (count === 0) return 'Not revised';
    if (count === 1) return 'Revised 1 time';
    return `${count} revisions`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar currentPage="dashboard" onToggleChatbot={handleToggleChatbot} />
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header with Search */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">Study Management</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search courses or topics..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Breadcrumb Navigation */}
              {currentSection !== 'departments' && currentSection !== 'search' && (
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <button
                    onClick={() => setCurrentSection('departments')}
                    className="text-primary hover:underline"
                  >
                    Departments
                  </button>
                  {currentSection !== 'departments' && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      {selectedDepartment && (
                        <span className="text-muted-foreground">{selectedDepartment.name}</span>
                      )}
                    </>
                  )}
                  {currentSection === 'topics' && selectedCourse && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <button
                        onClick={() => loadCourses(selectedDepartment!.id)}
                        className="text-primary hover:underline"
                      >
                        Courses
                      </button>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-muted-foreground">{selectedCourse.name}</span>
                    </>
                  )}
                </div>
              )}

              {/* DEPARTMENTS SECTION */}
              {currentSection === 'departments' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Departments</h2>
                  {departments.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">No departments yet</p>
                      <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
                        <DialogTrigger asChild>
                          <Button><Plus className="w-4 h-4 mr-2" />Create Department</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Department name (e.g., Computer Science)"
                              value={newDeptName}
                              onChange={(e) => setNewDeptName(e.target.value)}
                            />
                            <Button onClick={addDepartment} className="w-full">Add</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ) : (
                    <>
                      <div className="grid gap-4 mb-8">
                        {departments.map(dept => (
                          <Card
                            key={dept.id}
                            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => loadCourses(dept.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold">{dept.name}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDepartment(dept.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
                        <DialogTrigger asChild>
                          <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Add Department</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Department name"
                              value={newDeptName}
                              onChange={(e) => setNewDeptName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                            />
                            <Button onClick={addDepartment} className="w-full">Add</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              )}

              {/* COURSES SECTION */}
              {currentSection === 'courses' && selectedDepartment && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">{selectedDepartment.name} → Courses</h2>
                  {courses.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">No courses yet</p>
                      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
                        <DialogTrigger asChild>
                          <Button><Plus className="w-4 h-4 mr-2" />Create Course</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Course</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Course name"
                              value={newCourseName}
                              onChange={(e) => setNewCourseName(e.target.value)}
                            />
                            <Input
                              placeholder="Course code (optional)"
                              value={newCourseCode}
                              onChange={(e) => setNewCourseCode(e.target.value)}
                            />
                            <Button onClick={addCourse} className="w-full">Add</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ) : (
                    <>
                      <div className="grid gap-4 mb-8">
                        {courses.map(course => (
                          <Card
                            key={course.id}
                            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => loadTopics(course.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Code className="w-5 h-5 text-primary" />
                                <div>
                                  <h3 className="font-semibold">{course.name}</h3>
                                  {course.code && <p className="text-sm text-muted-foreground">{course.code}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCourse(course.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
                        <DialogTrigger asChild>
                          <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Add Course</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Course</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Course name"
                              value={newCourseName}
                              onChange={(e) => setNewCourseName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addCourse()}
                            />
                            <Input
                              placeholder="Course code (optional)"
                              value={newCourseCode}
                              onChange={(e) => setNewCourseCode(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addCourse()}
                            />
                            <Button onClick={addCourse} className="w-full">Add</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              )}

              {/* TOPICS SECTION */}
              {currentSection === 'topics' && selectedCourse && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">{selectedCourse.name} → Topics</h2>
                  {topics.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">No topics yet</p>
                      <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
                        <DialogTrigger asChild>
                          <Button><Plus className="w-4 h-4 mr-2" />Create Topic</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Topic</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Topic name"
                              value={newTopicName}
                              onChange={(e) => setNewTopicName(e.target.value)}
                            />
                            <Input
                              placeholder="Description (optional)"
                              value={newTopicDesc}
                              onChange={(e) => setNewTopicDesc(e.target.value)}
                            />
                            <Button onClick={addTopic} className="w-full">Add</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ) : (
                    <>
                      <div className="grid gap-4 mb-8">
                        {topics.map(topic => (
                          <Card key={topic.id} className={`p-4 ${topic.completed ? 'opacity-60' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className={`font-semibold ${topic.completed ? 'line-through' : ''}`}>
                                  {topic.name}
                                </h3>
                                {topic.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-3">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{getRevisionText(topic.revision_count)}</span>
                                  </div>
                                  {topic.tags && topic.tags.length > 0 && (
                                    <div className="flex gap-2">
                                      {topic.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                      ))}
                                    </div>
                                  )}
                                  {topic.completed && <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Completed</Badge>}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTopic(topic.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
                        <DialogTrigger asChild>
                          <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Add Topic</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Topic</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Topic name"
                              value={newTopicName}
                              onChange={(e) => setNewTopicName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                            />
                            <Input
                              placeholder="Description (optional)"
                              value={newTopicDesc}
                              onChange={(e) => setNewTopicDesc(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                            />
                            <Button onClick={addTopic} className="w-full">Add</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              )}

              {/* SEARCH RESULTS */}
              {currentSection === 'search' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>
                  {searchResults.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No results found</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {searchResults.map(result => (
                        <Card key={`${result.type}-${result.id}`} className="p-4">
                          {result.type === 'course' && (
                            <div
                              className="cursor-pointer hover:opacity-80"
                              onClick={() => {
                                setSelectedDepartment(result.departments);
                                setSelectedCourse(result);
                                loadTopics(result.id);
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>Course</Badge>
                              </div>
                              <h3 className="font-semibold">{result.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.departments?.name || 'Unknown Department'} {result.code && `• ${result.code}`}
                              </p>
                            </div>
                          )}
                          {result.type === 'topic' && (
                            <div
                              className="cursor-pointer hover:opacity-80"
                              onClick={() => {
                                const course = result.courses;
                                if (course?.departments) {
                                  setSelectedDepartment(course.departments);
                                }
                                setSelectedCourse(course);
                                setTopics([result, ...topics.filter(t => t.id !== result.id)]);
                                setCurrentSection('topics');
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>Topic</Badge>
                              </div>
                              <h3 className="font-semibold">{result.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.courses?.departments?.name} → {result.courses?.name}
                              </p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <DeveloperCredit />
        </div>
      </main>
      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Dashboard;

