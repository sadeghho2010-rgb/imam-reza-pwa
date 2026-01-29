
import { Folder, ChevronLeft, ChevronRight, Plus, FileText, Download, List, ClipboardList, StickyNote, FileCheck, Clock, ChevronDown, Edit, Image as ImageIcon, X, FileSearch, Layers, Loader2, Inbox, RefreshCw, Save, Search, MapPin, Users, Trash2, AlertTriangle, FileUp, ExternalLink, BookOpen, UserCheck } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/dbService';
import { Category, User, UserRole, Resolution, WorkgroupPDF } from '../types';
import ResolutionForm from './ResolutionForm';
import { GRADES } from '../constants';

interface TreeSectionProps {
  type: 'programs' | 'council' | 'workgroups' | 'by-grade';
  user: User;
  targetId?: string; 
}

const TreeSection: React.FC<TreeSectionProps> = ({ type, user, targetId }) => {
  const [currentPath, setCurrentPath] = useState<Category[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [viewMode, setViewMode] = useState<'selection' | 'grade' | 'title'>('selection');
  const [selectedDetail, setSelectedDetail] = useState<Resolution | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTitles, setAvailableTitles] = useState<string[]>([]);

  useEffect(() => {
    if (type === 'by-grade') {
      setViewMode('selection');
      fetchUniqueTitles();
    } else {
      loadData();
    }
  }, [type, targetId]);

  const fetchUniqueTitles = async () => {
    const all = await dbService.getResolutions();
    const titles = Array.from(new Set(all.map(r => r.executor).filter(Boolean)));
    setAvailableTitles(titles);
  };

  const loadData = async (filterValue?: string, isTitle: boolean = false) => {
    setIsLoading(true);
    try {
      if (type === 'by-grade') {
        const allRes = await dbService.getResolutions();
        if (isTitle) {
          setResolutions(allRes.filter(r => r.executor === filterValue));
        } else {
          setResolutions(allRes.filter(r => r.grade === filterValue));
        }
      } else {
        const parentId = targetId || (type === 'council' ? 'council-root' : type === 'programs' ? 'programs-root' : null);
        if (parentId) {
          const res = await dbService.getResolutions(parentId);
          setResolutions(res);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedGrade(null);
    setSelectedTitle(null);
    setViewMode('selection');
    setResolutions([]);
  };

  if (type === 'by-grade' && viewMode === 'selection') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 text-right">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
           <h2 className="text-3xl font-black text-black mb-2">مشاهده مصوبات</h2>
           <p className="text-gray-400 font-bold text-sm">روش نمایش مصوبات را انتخاب کنید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <button onClick={() => setViewMode('grade')} className="bg-white p-12 rounded-[3.5rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-6 group">
              <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Layers size={48} />
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-black block mb-2">بر اساس پایه‌ها</span>
                <span className="text-sm text-gray-400 font-bold">نمایش مصوبات تفکیک شده برای هر پایه</span>
              </div>
           </button>

           <button onClick={() => setViewMode('title')} className="bg-white p-12 rounded-[3.5rem] shadow-xl border-4 border-transparent hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-6 group">
              <div className="w-24 h-24 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <UserCheck size={48} />
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-black block mb-2">بر اساس عناوین (مسئولین)</span>
                <span className="text-sm text-gray-400 font-bold">نمایش مصوبات بر اساس شخص پیگیر</span>
              </div>
           </button>
        </div>
      </div>
    );
  }

  // Views for Grades or Titles list
  if (type === 'by-grade' && !selectedGrade && !selectedTitle) {
    return (
      <div className="space-y-6 text-right animate-in fade-in duration-500">
        <button onClick={resetSelection} className="flex items-center gap-2 text-gray-400 hover:text-emerald-600 font-black text-sm mb-4">
          <ChevronRight size={18} /> بازگشت به انتخاب روش نمایش
        </button>
        
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8">
           <h3 className="text-2xl font-black text-black">
             {viewMode === 'grade' ? 'پایه تحصیلی مورد نظر را انتخاب کنید' : 'مسئول پیگیری مورد نظر را انتخاب کنید'}
           </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {viewMode === 'grade' ? GRADES.map(grade => (
            <button key={grade} onClick={() => { setSelectedGrade(grade); loadData(grade, false); }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:bg-emerald-50 hover:border-emerald-500 transition-all font-black text-xl text-black flex items-center justify-center gap-3">
              <Layers size={20} className="text-emerald-500" /> {grade}
            </button>
          )) : availableTitles.map(title => (
            <button key={title} onClick={() => { setSelectedTitle(title); loadData(title, true); }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:bg-blue-50 hover:border-blue-500 transition-all font-black text-lg text-black flex items-center justify-center gap-3">
              <UserCheck size={20} className="text-blue-500" /> {title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <button onClick={resetSelection} className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-emerald-600 mb-2 uppercase">
              بازگشت به لیست <ChevronLeft size={10} />
              <span className="text-emerald-600">{selectedGrade || selectedTitle}</span>
            </button>
            <h2 className="text-3xl font-black text-black">
               مصوبات {selectedGrade || selectedTitle}
            </h2>
          </div>
          <button onClick={() => loadData(selectedGrade || selectedTitle || '', viewMode === 'title')} className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-emerald-50 transition-all">
             <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 size={48} className="animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resolutions.map(res => (
            <div key={res.id} onClick={() => setSelectedDetail(res)} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer group">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black">{res.workgroup}</span>
                     {res.grade && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black">{res.grade}</span>}
                     {(res.isCompleted || res.is_completed) && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black">انجام شده</span>}
                   </div>
                   <h4 className="text-xl font-black text-black group-hover:text-emerald-700">{res.title}</h4>
                   <p className="text-sm text-gray-500 font-bold line-clamp-1">{res.description}</p>
                </div>
                <div className="text-[10px] text-gray-400 font-bold">{res.createdAt || res.created_at}</div>
              </div>
            </div>
          ))}
          {resolutions.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-black">هیچ مصوبه‌ای یافت نشد.</div>
          )}
        </div>
      )}

      {selectedDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 relative animate-in zoom-in-95">
              <button onClick={() => setSelectedDetail(null)} className="absolute top-6 left-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={24} /></button>
              <h2 className="text-3xl font-black text-black mb-8 border-r-8 border-emerald-500 pr-5 leading-tight">{selectedDetail.title}</h2>
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <p className="whitespace-pre-line text-lg font-bold leading-loose text-black text-justify">{selectedDetail.description}</p>
                {selectedDetail.executor && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-2 text-emerald-700 font-black">
                    <UserCheck size={20} /> مسئول پیگیری: {selectedDetail.executor}
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TreeSection;
