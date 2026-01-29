
import React, { useState, useEffect } from 'react';
import { User, Resolution, Category } from '../types';
import { BookOpen, Calendar, ShieldAlert, Award, ChevronRight, CheckCircle, ExternalLink, School, Users, X, FileText, MapPin, Layers, Image as ImageIcon, Trash2, ChevronDown, ChevronUp, Square, CheckSquare, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';

interface DashboardProps {
  user: User;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab }) => {
  const [tasks, setTasks] = useState<{ pending: Resolution[], completed: Resolution[] }>({ pending: [], completed: [] });
  const [selectedRes, setSelectedRes] = useState<Resolution | null>(null);
  const [stats, setStats] = useState({ workgroupRes: 0, councilRes: 0, workgroups: 0 });
  const [showCompleted, setShowCompleted] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const allRes = await dbService.getResolutions();
    const allCats = await dbService.getCategories();
    
    // مصوباتی که کاربر مسئول آن‌هاست
    const userRoleTitle = user.title;
    const myTasks = allRes.filter(r => r.executor === userRoleTitle);
    
    setTasks({
      pending: myTasks.filter(r => !r.isCompleted && !r.is_completed),
      completed: myTasks.filter(r => r.isCompleted || r.is_completed)
    });
    
    const wgCats = allCats.filter(c => c.type === 'workgroups');
    const wgIds = wgCats.map(c => c.id);
    
    setStats({
      workgroupRes: allRes.filter(r => wgIds.includes(r.parent_id || r.parentId || '')).length,
      councilRes: allRes.filter(r => (r.parent_id === 'council-root' || r.parentId === 'council-root')).length,
      workgroups: wgCats.filter(c => (c.parent_id === null || c.parentId === null)).length
    });
  };

  const toggleTaskStatus = async (task: Resolution) => {
    setIsActionLoading(task.id);
    try {
      const currentStatus = (task.isCompleted || task.is_completed);
      const updatedTask = { 
        ...task, 
        isCompleted: !currentStatus,
        is_completed: !currentStatus 
      };
      await dbService.saveResolution(updatedTask);
      await fetchData();
    } catch (err) {
      alert('خطا در به‌روزرسانی وضعیت');
    } finally {
      setIsActionLoading(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('آیا از حذف این مصوبه از لیست خود اطمینان دارید؟')) return;
    setIsActionLoading(taskId);
    try {
      await dbService.deleteResolution(taskId);
      await fetchData();
    } catch (err) {
      alert('خطا در حذف');
    } finally {
      setIsActionLoading(null);
    }
  };

  const statItems = [
    { label: 'مصوبات کارگروه ها', value: stats.workgroupRes, icon: BookOpen, color: 'bg-emerald-500' },
    { label: 'مصوبات شورا', value: stats.councilRes, icon: Calendar, color: 'bg-amber-500' },
    { label: 'کارگروه ها', value: stats.workgroups, icon: Users, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-right">
      <div className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <h1 className="text-3xl font-black mb-4">سلام، {user.fullName}</h1>
        <p className="text-emerald-100 text-lg opacity-90 font-bold">وظایف و مصوبات شما در یک نگاه</p>
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[500px]">
            <h3 className="text-2xl font-black text-black mb-8 flex items-center gap-3 border-r-4 border-emerald-500 pr-4">
              <CheckCircle className="text-emerald-500" size={28} /> چک‌لیست کارهای من
            </h3>
            
            <div className="space-y-4">
              {tasks.pending.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 font-bold">
                  در حال حاضر کار معلقی ندارید
                </div>
              )}

              {/* Pending Tasks */}
              {tasks.pending.map(task => (
                <div key={task.id} className="group flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-emerald-200 transition-all shadow-sm">
                  <button 
                    disabled={isActionLoading === task.id}
                    onClick={() => toggleTaskStatus(task)} 
                    className="text-emerald-600 hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {isActionLoading === task.id ? <Loader2 className="animate-spin" size={24} /> : <Square size={28} />}
                  </button>
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedRes(task)}>
                    <h4 className="font-black text-black text-lg">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">{task.workgroup}</span>
                      {task.grade && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">{task.grade}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTask(task.id)} 
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف از لیست من"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              {/* Completed Tasks Accordion */}
              {tasks.completed.length > 0 && (
                <div className="pt-6">
                   <button 
                     onClick={() => setShowCompleted(!showCompleted)}
                     className="w-full flex items-center justify-between p-5 bg-emerald-50 rounded-3xl text-emerald-800 font-black border border-emerald-100 shadow-sm"
                   >
                     <span className="flex items-center gap-2">
                       <CheckCircle size={22} className="text-emerald-600" /> کارهای انجام شده ({tasks.completed.length})
                     </span>
                     {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </button>
                   
                   {showCompleted && (
                     <div className="mt-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
                       {tasks.completed.map(task => (
                         <div key={task.id} className="group flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 opacity-70">
                           <button onClick={() => toggleTaskStatus(task)} className="text-emerald-600">
                             <CheckSquare size={24} />
                           </button>
                           <div className="flex-1 line-through font-bold text-gray-500 text-sm">
                             {task.title}
                           </div>
                           <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-300 hover:text-red-500">
                             <Trash2 size={18} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           {statItems.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                 <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                    <stat.icon size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-black text-black">{stat.value}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {selectedRes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setSelectedRes(null)} className="absolute top-8 left-8 p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-black text-black mb-8 border-r-8 border-emerald-500 pr-5 leading-tight">{selectedRes.title}</h2>
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 leading-relaxed text-lg font-bold text-justify">
                {selectedRes.description}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
