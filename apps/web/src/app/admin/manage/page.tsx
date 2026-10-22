'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, BookOpen, GraduationCap, Layers, FileText, Code2, CheckSquare, Activity,
  Plus, Trash2, Edit3, Search, X, Database, Zap, AlertCircle, CheckCircle2
} from 'lucide-react';

type EntityType = 'Faculty' | 'Users' | 'Courses' | 'Enrolls' | 'Lectures' | 'Files' | 'Exercises' | 'Testcase' | 'user_exercise';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'json';
  options?: string[];
  required?: boolean;
  refEntity?: EntityType;
  displayField?: string;
}

interface EntityConfig {
  label: string;
  icon: React.ReactNode;
  fields: FieldConfig[];
}

export default function UniversalAdminPage() {
  const [activeEntity, setActiveEntity] = useState<EntityType>('Courses');
  const [tableData, setTableData] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [refOptions, setRefOptions] = useState<Record<string, { id: number; name: string }[]>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const entityConfigs: Record<EntityType, EntityConfig> = {
    Faculty: {
      label: 'Faculty (คณะ)',
      icon: <Building2 size={18} />,
      fields: [{ name: 'fac_name', label: 'ชื่อคณะ', type: 'text', required: true }]
    },
    Users: {
      label: 'Users (ผู้ใช้งาน)',
      icon: <Users size={18} />,
      fields: [
        { name: 'first_name', label: 'ชื่อจริง', type: 'text', required: true },
        { name: 'last_name', label: 'นามสกุล', type: 'text', required: true },
        { name: 'student_code', label: 'รหัสนักศึกษา/พนักงาน', type: 'text', required: true },
        { name: 'password', label: 'รหัสผ่าน', type: 'text', required: true },
        { name: 'role', label: 'สิทธิ์ (Role)', type: 'select', options: ['student', 'teacher', 'ta', 'admin'], required: true },
        { name: 'fac_id', label: 'สังกัดคณะ', type: 'number', refEntity: 'Faculty', displayField: 'fac_name' },
        { name: 'user_status', label: 'สถานะ', type: 'select', options: ['available', 'unavailable'] }
      ]
    },
    Courses: {
      label: 'Courses (คอร์สเรียน)',
      icon: <BookOpen size={18} />,
      fields: [
        { name: 'course_name', label: 'ชื่อคอร์ส', type: 'text', required: true },
        { name: 'creator_id', label: 'ผู้สร้างคอร์ส', type: 'number', required: true, refEntity: 'Users', displayField: 'first_name' },
        { name: 'course_status', label: 'สถานะ', type: 'select', options: ['available', 'unavailable'] }
      ]
    },
    Enrolls: {
      label: 'Enrolls (การลงทะเบียน)',
      icon: <GraduationCap size={18} />,
      fields: [
        { name: 'user_id', label: 'นักศึกษา', type: 'number', required: true, refEntity: 'Users', displayField: 'first_name' },
        { name: 'course_id', label: 'คอร์สเรียน', type: 'number', required: true, refEntity: 'Courses', displayField: 'course_name' },
        { name: 'enroll_status', label: 'สถานะ', type: 'select', options: ['active', 'unactive'] }
      ]
    },
    Lectures: {
      label: 'Lectures (บทเรียน)',
      icon: <Layers size={18} />,
      fields: [
        { name: 'lecture_name', label: 'ชื่อบทเรียน', type: 'text', required: true },
        { name: 'lecture_week', label: 'สัปดาห์ที่ (Week)', type: 'text', required: true },
        { name: 'course_id', label: 'คอร์สเรียน', type: 'number', required: true, refEntity: 'Courses', displayField: 'course_name' }
      ]
    },
    Files: {
      label: 'Files (ไฟล์ประกอบ)',
      icon: <FileText size={18} />,
      fields: [
        { name: 'file_name', label: 'ชื่อไฟล์', type: 'text', required: true },
        { name: 'file_size', label: 'ขนาดไฟล์ (Bytes)', type: 'number', required: true },
        { name: 'lecture_id', label: 'บทเรียน', type: 'number', required: true, refEntity: 'Lectures', displayField: 'lecture_name' },
        { name: 'status', label: 'สถานะ', type: 'select', options: ['available', 'unavailable'] }
      ]
    },
    Exercises: {
      label: 'Exercises (โจทย์)',
      icon: <Code2 size={18} />,
      fields: [
        { name: 'exc_name', label: 'ชื่อโจทย์', type: 'text', required: true },
        { name: 'lecture_id', label: 'บทเรียน', type: 'number', required: true, refEntity: 'Lectures', displayField: 'lecture_name' },
        { name: 'author_id', label: 'ผู้แต่งโจทย์', type: 'number', required: true, refEntity: 'Users', displayField: 'first_name' },
        { name: 'exc_difficulty', label: 'ความยาก', type: 'select', options: ['novice', 'adept', 'expert'] },
        { name: 'exc_type', label: 'ประเภท', type: 'select', options: ['practice', 'exam'] },
        { name: 'exc_engine', label: 'Grading Engine', type: 'select', options: ['QUERY', 'HTTP'] },
        { name: 'exc_schema', label: 'Schema SQL', type: 'textarea' },
        { name: 'exc_seed', label: 'Seed SQL', type: 'textarea' },
        { name: 'exc_solution', label: 'Solution SQL', type: 'textarea' },
        { name: 'order_matters', label: 'คำนึงถึงลำดับแถวหรือไม่', type: 'boolean' }
      ]
    },
    Testcase: {
      label: 'Testcases (เคสทดสอบ API)',
      icon: <CheckSquare size={18} />,
      fields: [
        { name: 'case_name', label: 'ชื่อ Testcase', type: 'text', required: true },
        { name: 'exercise_id', label: 'โจทย์ที่ผูก', type: 'number', required: true, refEntity: 'Exercises', displayField: 'exc_name' },
        { name: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        { name: 'path', label: 'Path URL', type: 'text', required: true },
        { name: 'expected_status', label: 'Expected Status Code', type: 'number' },
        { name: 'headers', label: 'Headers (JSON)', type: 'json' },
        { name: 'body', label: 'Request Body (JSON)', type: 'json' },
        { name: 'expected_body', label: 'Expected Body (JSON)', type: 'json' }
      ]
    },
    user_exercise: {
      label: 'User Submissions',
      icon: <Activity size={18} />,
      fields: [
        { name: 'user_id', label: 'ผู้ส่ง', type: 'number', required: true, refEntity: 'Users', displayField: 'first_name' },
        { name: 'exercise_id', label: 'โจทย์', type: 'number', required: true, refEntity: 'Exercises', displayField: 'exc_name' },
        { name: 'score', label: 'คะแนน', type: 'number', required: true },
        { name: 'attempt_number', label: 'ครั้งที่ส่ง (Attempt)', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['complete', 'ongoing', 'uncomplete'] },
        { name: 'verdict', label: 'Verdict', type: 'select', options: ['PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TLE', 'MLE', 'RUNTIME_ERROR', 'SYSTEM_ERROR'] },
        { name: 'code', label: 'Source Code', type: 'textarea' }
      ]
    }
  };

  useEffect(() => {
    setSearchQuery(''); // รีเซ็ตคำค้นหาเมื่อสลับ Table
    fetchEntityData(activeEntity);
  }, [activeEntity]);

  const fetchRefOptions = async (refEntity: EntityType, displayField?: string) => {
    if (refOptions[refEntity]) return;

    try {
      const res = await fetch(`/api/admin/crud?entity=${refEntity}`);
      if (res.ok) {
        const json = await res.json();
        const items = (json.data || []).map((item: any) => ({
          id: item.id,
          name: item[displayField || 'name'] || item.title || item.fac_name || item.course_name || item.lecture_name || item.exc_name || item.first_name || `ID: ${item.id}`,
        }));
        setRefOptions((prev) => ({ ...prev, [refEntity]: items }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEntityData = async (entity: EntityType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/crud?entity=${entity}`);
      if (res.ok) {
        const json = await res.json();
        setTableData(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic การกรองค้นหาแบบ Real-time
  const filteredData = tableData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(query);
      return String(val).toLowerCase().includes(query);
    });
  });

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({});
    entityConfigs[activeEntity].fields.forEach((field) => {
      if (field.refEntity) {
        fetchRefOptions(field.refEntity, field.displayField);
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row: any) => {
    setEditingId(row.id);
    setFormData(row);
    entityConfigs[activeEntity].fields.forEach((field) => {
      if (field.refEntity) {
        fetchRefOptions(field.refEntity, field.displayField);
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ ID: ${id}?`)) return;

    try {
      const res = await fetch(`/api/admin/crud?entity=${activeEntity}&id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setStatusMessage({ type: 'success', text: `ลบข้อมูล ID ${id} เรียบร้อยแล้ว` });
        fetchEntityData(activeEntity);
      } else {
        const json = await res.json();
        setStatusMessage({ type: 'error', text: json.error || 'ไม่สามารถลบข้อมูลได้เนื่องจากมีข้อมูลอื่นเชื่อมโยงอยู่' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editingId !== null;

    try {
      const res = await fetch('/api/admin/crud', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: activeEntity,
          id: editingId,
          data: formData,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({});
        setEditingId(null);
        setStatusMessage({ type: 'success', text: `${isEdit ? 'แก้ไข' : 'เพิ่ม'}ข้อมูลใน ${activeEntity} สำเร็จ!` });
        fetchEntityData(activeEntity);
      } else {
        const json = await res.json();
        setStatusMessage({ type: 'error', text: json.error || 'ไม่สามารถบันทึกข้อมูลได้' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการส่งข้อมูล' });
    }
  };

  const handleQuickAdd = async () => {
    setIsQuickAdding(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: activeEntity }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setStatusMessage({ type: 'success', text: json.message });
        fetchEntityData(activeEntity);
      } else {
        setStatusMessage({ type: 'error', text: json.message || 'เกิดข้อผิดพลาดในการสร้างข้อมูล' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อกับ Server ได้' });
    } finally {
      setIsQuickAdding(false);
    }
  };

  const currentConfig = entityConfigs[activeEntity];

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          <div className="p-4 flex items-center gap-3 border-b border-slate-800 bg-slate-950/50">
            <div className="w-9 h-9 rounded bg-purple-600 flex items-center justify-center text-white font-bold">
              <Database size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Database Admin</h4>
              <p className="text-[11px] text-slate-400">Direct Table Management</p>
            </div>
          </div>

          <nav className="p-3 space-y-1 text-xs">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Tables</div>
            {(Object.keys(entityConfigs) as EntityType[]).map((key) => (
              <button
                key={key}
                onClick={() => { setActiveEntity(key); setStatusMessage(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left font-medium transition ${
                  activeEntity === key ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {entityConfigs[key].icon}
                <span>{entityConfigs[key].label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {currentConfig.icon} {currentConfig.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">จัดการ แก้ไข ลบ และเพิ่มรายการใน {activeEntity}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleQuickAdd}
              disabled={isQuickAdding}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-3.5 py-2 rounded-md shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Zap size={14} className="text-indigo-600 fill-indigo-200" />
              {isQuickAdding ? 'กำลังเพิ่มด่วน...' : 'เพิ่มด่วน (Quick Add)'}
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={15} />
              เพิ่มข้อมูลเอง
            </button>
          </div>
        </header>

        {/* Status Alert Notification */}
        {statusMessage && (
          <div className={`mx-8 mt-4 p-3 rounded-md text-xs font-medium flex items-center justify-between shadow-xs ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-8 pt-4 pb-2 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="ค้นหาข้อมูลในตาราง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {searchQuery ? `พบ ${filteredData.length} จาก ${tableData.length} รายการ` : `ทั้งหมด ${tableData.length} รายการ`}
          </span>
        </div>

        {/* Table View */}
        <div className="flex-1 px-8 pb-8 overflow-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-500">กำลังโหลดข้อมูล...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                {searchQuery ? `ไม่พบข้อมูลที่ตรงกับคำค้นหา "${searchQuery}"` : `ยังไม่มีข้อมูลใน ${activeEntity}`}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">ID</th>
                    {currentConfig.fields.map((f) => (
                      <th key={f.name} className="p-3">{f.label}</th>
                    ))}
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-purple-700">{row.id}</td>
                      {currentConfig.fields.map((f) => (
                        <td key={f.name} className="p-3 max-w-xs truncate">
                          {typeof row[f.name] === 'object' ? JSON.stringify(row[f.name]) : String(row[f.name] ?? '-')}
                        </td>
                      ))}
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(row)}
                          className="text-slate-400 hover:text-purple-600 p-1 rounded hover:bg-purple-50 transition"
                          title="แก้ไข"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                          title="ลบ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* DYNAMIC FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                {editingId !== null ? <Edit3 size={16} className="text-purple-600" /> : <Plus size={16} className="text-purple-600" />}
                {editingId !== null ? `แก้ไขข้อมูล ID: ${editingId} ใน ${currentConfig.label}` : `สร้างข้อมูลใหม่ใน ${currentConfig.label}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {currentConfig.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.refEntity ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                    >
                      <option value="">-- เลือก {field.label} --</option>
                      {(refOptions[field.refEntity] || []).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          [ID: {opt.id}] {opt.name}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                    >
                      <option value="">-- เลือกรายการ --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  ) : field.type === 'boolean' ? (
                    <select
                      value={formData[field.name] ?? false}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value === 'true' })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                >
                  {editingId !== null ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}