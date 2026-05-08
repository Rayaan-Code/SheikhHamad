import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ChevronRight, Search, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import type { Course, Content } from '../types';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Content[]>([]);
  const [searchParams] = useSearchParams();
  const selectedCourseId = searchParams.get('course');

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[]);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const q = query(
        collection(db, 'contents'),
        where('courseId', '==', selectedCourseId),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Content[]);
      });
      return () => unsubscribe();
    } else {
      setLessons([]);
    }
  }, [selectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-brown-dark mb-4 italic">Structured Courses</h1>
        <p className="text-brown-dark/50 max-w-xl text-sm leading-relaxed">
          Embark on a systematic journey of knowledge through our curated modules, designed to take you from fundamentals to advanced studies.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Course List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brown-dark/30 mb-6 px-4">Available Programs</h3>
          {courses.map((course) => (
            <Link 
              key={course.id} 
              to={`/courses?course=${course.id}`}
              className={`block p-6 rounded-3xl transition-all border ${
                selectedCourseId === course.id 
                  ? 'bg-purple text-white border-purple shadow-xl shadow-purple/20' 
                  : 'bg-white text-brown-dark border-beige-dark hover:border-purple/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap size={16} className={selectedCourseId === course.id ? 'text-white' : 'text-purple'} />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Module</span>
              </div>
              <h4 className="font-serif font-bold text-lg">{course.title}</h4>
            </Link>
          ))}
          {courses.length === 0 && (
             <p className="px-4 text-xs italic text-brown-dark/30">No courses listed yet.</p>
          )}
        </div>

        {/* Course Content Area */}
        <div className="lg:col-span-3">
          {selectedCourse ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={selectedCourse.id}
            >
              <div className="bg-purple/5 p-12 rounded-[3.5rem] border border-beige-dark mb-12">
                <h2 className="text-4xl font-serif font-bold text-purple mb-6 italic">{selectedCourse.title}</h2>
                <p className="text-brown-dark/70 leading-relaxed max-w-2xl">{selectedCourse.description}</p>
                
                <div className="mt-10 flex items-center gap-8">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-brown-dark/30">Total Lessons</span>
                      <span className="text-2xl font-serif font-bold text-brown-dark">{lessons.length}</span>
                   </div>
                   <div className="w-px h-10 bg-beige-dark"></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-brown-dark/30">Program status</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mt-2">Active Enrollment</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brown-dark/40 mb-8">Lesson Curriculum</h3>
                {lessons.map((lesson, idx) => (
                  <Link 
                    key={lesson.id} 
                    to={`/library/${lesson.slug}`}
                    className="group flex items-center justify-between bg-white p-6 rounded-2xl border border-beige-dark hover:border-purple/30 transition-all hover:shadow-lg hover:shadow-purple/5"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-beige/50 rounded-xl flex items-center justify-center text-purple text-xs font-black">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-brown-dark group-hover:text-purple transition-colors">{lesson.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[9px] uppercase font-bold text-brown-dark/30 tracking-wider flex items-center gap-1">
                             {lesson.type}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-beige/30 flex items-center justify-center text-brown-dark/20 group-hover:bg-purple group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </Link>
                ))}
                {lessons.length === 0 && (
                  <div className="py-20 text-center bg-beige/20 rounded-3xl border border-dashed border-beige-dark">
                    <BookOpen size={40} className="mx-auto text-brown-dark/10 mb-4" />
                    <p className="text-sm italic text-brown-dark/40">Curriculum is being prepared. Check back shortly.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-beige-subtle rounded-[3.5rem] border border-dashed border-beige-dark">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-brown-dark/10 shadow-sm mb-6">
                 <GraduationCap size={40} />
               </div>
               <h3 className="text-2xl font-serif font-bold text-brown-dark opacity-40 italic">Begin Your Journey</h3>
               <p className="text-sm text-brown-dark/30 max-w-xs mt-4">Select a course module from the side menu to view the lesson structure and syllabus.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
