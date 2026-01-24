import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DeveloperCredit } from '@/components/DeveloperCredit';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Loader, ChevronRight, BookOpen, Code, Clock, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StudyService, Department, Course, Topic, Resource } from '@/services/studyService';

type Section = 'departments' | 'courses' | 'topics' | 'search';

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

