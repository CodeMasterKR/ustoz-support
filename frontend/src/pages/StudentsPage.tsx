import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users, Plus, Pencil, Trash2, Check, X, GraduationCap, UserPlus,
  Search, Layers, ChevronDown, Palette, Tag,
} from 'lucide-react'
import { clsx } from 'clsx'
import { loadStudents, addStudent, deleteStudent, updateStudent, type Student } from '@/utils/students'
import {
  loadGroups, addGroup, deleteGroup, updateGroup, toggleStudentInGroup,
  setGroupColor, GROUP_COLORS, type Group,
} from '@/utils/groups'
import { Button } from '@/components/ui/Button'

// ——— Avatar helpers ———
const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-primary-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-600',
]
function avatarColor(name: string) {
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ——— StudentCard ———
function StudentCard({
  student, idx, groups, editId, editName, deleteId,
  onEdit, onConfirmEdit, onCancelEdit, onEditName, onDeleteAsk, onDeleteConfirm, onDeleteCancel,
  onToggleGroup,
}: {
  student: Student; idx: number; groups: Group[]
  editId: string | null; editName: string; deleteId: string | null
  onEdit: (s: Student) => void
  onConfirmEdit: () => void
  onCancelEdit: () => void
  onEditName: (v: string) => void
  onDeleteAsk: (id: string) => void
  onDeleteConfirm: (id: string) => void
  onDeleteCancel: () => void
  onToggleGroup: (groupId: string, studentId: string) => void
}) {
  const [showGroups, setShowGroups] = useState(false)
  const myGroups = groups.filter((g) => g.studentIds.includes(student.id))
  const otherGroups = groups.filter((g) => !g.studentIds.includes(student.id))
  const isEditing = editId === student.id
  const isDeleting = deleteId === student.id

  return (
    <div className={clsx('card p-3.5 group transition-shadow', showGroups && 'shadow-md')}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0',
          avatarColor(student.name),
        )}>
          {initials(student.name)}
        </div>

        {/* Name / Edit */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              className="field w-full py-1 text-sm"
              value={editName}
              onChange={(e) => onEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirmEdit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              autoFocus
            />
          ) : (
            <>
              <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                <span className="text-[11px] text-gray-400">#{idx + 1}</span>
                {myGroups.map((g) => (
                  <span key={g.id} className={clsx('text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium', g.color)}>
                    {g.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={onConfirmEdit}
                className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={onCancelEdit}
                className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : isDeleting ? (
            <>
              <button onClick={() => onDeleteConfirm(student.id)}
                className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                O'chirish
              </button>
              <button onClick={onDeleteCancel}
                className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                Bekor
              </button>
            </>
          ) : (
            <>
              {/* Group assignment toggle */}
              {groups.length > 0 && (
                <button
                  onClick={() => setShowGroups((v) => !v)}
                  title="Guruhga biriktirish"
                  className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                    showGroups
                      ? 'bg-teal-100 text-teal-600'
                      : 'text-gray-300 hover:text-teal-500 hover:bg-teal-50 opacity-0 group-hover:opacity-100',
                  )}
                >
                  <Tag className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onEdit(student)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-primary-500 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDeleteAsk(student.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Group assignment panel */}
      {showGroups && groups.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 mb-2">Guruhlar</p>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => {
              const inGroup = g.studentIds.includes(student.id)
              return (
                <button
                  key={g.id}
                  onClick={() => onToggleGroup(g.id, student.id)}
                  className={clsx(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all',
                    inGroup
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                  )}
                  style={inGroup ? undefined : undefined}
                >
                  {inGroup && (
                    <span className={clsx('w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px]', g.color)}>
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {!inGroup && <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', g.color)} />}
                  <span className={inGroup ? clsx('font-semibold', g.color.replace('bg-', 'text-').replace('-500', '-700').replace('-600', '-800')) : ''}>
                    {g.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ——— GroupCard ———
function GroupCard({
  group, students, onDelete, onToggleStudent, onRename, onSetColor,
}: {
  group: Group
  students: Student[]
  onDelete: (id: string) => void
  onToggleStudent: (gId: string, sId: string) => void
  onRename: (id: string, name: string) => void
  onSetColor: (id: string, color: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [editName, setEditName] = useState(group.name)
  const [deleteAsk, setDeleteAsk] = useState(false)
  const [showColors, setShowColors] = useState(false)

  const members    = students.filter((s) => group.studentIds.includes(s.id))
  const nonMembers = students.filter((s) => !group.studentIds.includes(s.id))

  const confirmRename = () => {
    if (editName.trim()) onRename(group.id, editName)
    setEditing(false)
  }

  return (
    <div className="card overflow-hidden">
      {/* Group header */}
      <div
        className="p-4 flex items-center gap-3 cursor-pointer select-none"
        onClick={() => !editing && setExpanded((v) => !v)}
      >
        {/* Color dot */}
        <div className={clsx('w-3 h-3 rounded-full flex-shrink-0', group.color)} />

        {/* Name */}
        <div className="flex-1 min-w-0" onClick={(e) => editing && e.stopPropagation()}>
          {editing ? (
            <input
              className="field w-full py-1 text-sm"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename()
                if (e.key === 'Escape') { setEditName(group.name); setEditing(false) }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <p className="font-semibold text-gray-900 text-sm">{group.name}</p>
              <p className="text-xs text-gray-400">{members.length} ta o'quvchi</p>
            </>
          )}
        </div>

        {/* Member avatars preview */}
        {!editing && members.length > 0 && (
          <div className="flex -space-x-1.5 flex-shrink-0">
            {members.slice(0, 5).map((s) => (
              <div key={s.id} className={clsx(
                'w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold',
                avatarColor(s.name),
              )}>
                {initials(s.name)}
              </div>
            ))}
            {members.length > 5 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 text-[9px] font-bold">
                +{members.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Edit / confirm */}
        {editing ? (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={confirmRename}
              className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setEditName(group.name); setEditing(false) }}
              className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', expanded && 'rotate-180')} />
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Pencil className="w-3 h-3" /> Nomini o'zgartirish
            </button>
            <button
              onClick={() => setShowColors((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                showColors ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
              )}
            >
              <Palette className="w-3 h-3" /> Rang
            </button>
          </div>

          {/* Color picker */}
          {showColors && (
            <div className="flex gap-2 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { onSetColor(group.id, c); setShowColors(false) }}
                  className={clsx(
                    'w-6 h-6 rounded-full transition-transform hover:scale-110',
                    c,
                    group.color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110',
                  )}
                />
              ))}
            </div>
          )}

          {/* Members list */}
          {members.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Guruh a'zolari</p>
              <div className="flex flex-wrap gap-1.5">
                {members.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onToggleStudent(group.id, s.id)}
                    className="flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-xs font-medium text-gray-700 transition-colors group/chip"
                  >
                    <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold', avatarColor(s.name))}>
                      {initials(s.name)}
                    </div>
                    {s.name}
                    <X className="w-2.5 h-2.5 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add students */}
          {nonMembers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {members.length === 0 ? "O'quvchi qo'shish" : 'Yana qo\'shish'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {nonMembers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onToggleStudent(group.id, s.id)}
                    className="flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-medium transition-colors"
                  >
                    <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold', avatarColor(s.name))}>
                      {initials(s.name)}
                    </div>
                    {s.name}
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {students.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              Avval "O'quvchilar" bo'limida o'quvchi qo'shing
            </p>
          )}

          {/* Delete group */}
          <div className="pt-1 border-t border-gray-100">
            {deleteAsk ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Haqiqatan ham o'chirilsinmi?</span>
                <button onClick={() => onDelete(group.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                  O'chirish
                </button>
                <button onClick={() => setDeleteAsk(false)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                  Bekor
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteAsk(true)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Guruhni o'chirish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ——— Main page ———
export function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'groups' ? 'groups' : 'students'

  const [students, setStudents] = useState<Student[]>(() => loadStudents())
  const [groups,   setGroups]   = useState<Group[]>(() => loadGroups())

  // Students tab state
  const [newName,   setNewName]   = useState('')
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editName,  setEditName]  = useState('')
  const [deleteId,  setDeleteId]  = useState<string | null>(null)
  const [search,    setSearch]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Groups tab state
  const [newGroup, setNewGroup] = useState('')

  // ——— Student handlers ———
  const handleAddStudent = () => {
    if (!newName.trim()) return
    const s = addStudent(newName)
    setStudents((prev) => [s, ...prev])
    setNewName('')
    inputRef.current?.focus()
  }
  const handleDeleteStudent = (id: string) => {
    deleteStudent(id)
    setStudents((prev) => prev.filter((s) => s.id !== id))
    // Remove student from all groups
    setGroups(loadGroups())
    setDeleteId(null)
  }
  const confirmEdit = () => {
    if (!editId || !editName.trim()) return
    updateStudent(editId, editName)
    setStudents((prev) => prev.map((s) => s.id === editId ? { ...s, name: editName.trim() } : s))
    setEditId(null)
  }

  // ——— Group handlers ———
  const handleAddGroup = () => {
    if (!newGroup.trim()) return
    const g = addGroup(newGroup)
    setGroups((prev) => [g, ...prev])
    setNewGroup('')
  }
  const handleDeleteGroup = (id: string) => {
    deleteGroup(id)
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }
  const handleToggleStudent = (groupId: string, studentId: string) => {
    toggleStudentInGroup(groupId, studentId)
    setGroups(loadGroups())
  }
  const handleRenameGroup = (id: string, name: string) => {
    updateGroup(id, name)
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, name } : g))
  }
  const handleSetColor = (id: string, color: string) => {
    setGroupColor(id, color)
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, color } : g))
  }

  const filtered = search.trim()
    ? students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : students

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {tab === 'students'
            ? <><Users className="w-5 h-5 text-primary-600" /> O'quvchilarim</>
            : <><Layers className="w-5 h-5 text-teal-600" /> Guruhlar</>
          }
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {tab === 'students'
            ? (students.length > 0 ? `${students.length} ta o'quvchi` : "O'quvchilar ro'yxati")
            : (groups.length > 0 ? `${groups.length} ta guruh · ${students.length} ta o'quvchi` : 'Guruhlar bo\'limida o\'quvchilarni tartiblashtiring')
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200/60 p-1 rounded-xl mb-4">
        <button
          onClick={() => setSearchParams({})}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold transition-all',
            tab === 'students' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <Users className="w-3.5 h-3.5" />
          O'quvchilar
          {students.length > 0 && (
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold',
              tab === 'students' ? 'bg-primary-100 text-primary-600' : 'bg-gray-300 text-gray-500',
            )}>
              {students.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'groups' })}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold transition-all',
            tab === 'groups' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Guruhlar
          {groups.length > 0 && (
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold',
              tab === 'groups' ? 'bg-teal-100 text-teal-600' : 'bg-gray-300 text-gray-500',
            )}>
              {groups.length}
            </span>
          )}
        </button>
      </div>

      {/* ===== STUDENTS TAB ===== */}
      {tab === 'students' && (
        <>
          {/* Add student */}
          <div className="card p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-primary-500" />
              Yangi o'quvchi qo'shish
            </p>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                placeholder="Ism Familiya..."
                className="field flex-1"
                autoFocus
              />
              <Button onClick={handleAddStudent} disabled={!newName.trim()} icon={<Plus className="w-4 h-4" />}>
                Qo'shish
              </Button>
            </div>
          </div>

          {/* Search */}
          {students.length > 3 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="O'quvchi qidirish..."
                className="field pl-9 w-full"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Empty */}
          {students.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-600 mb-2">Hali o'quvchi yo'q</h2>
              <p className="text-sm text-gray-400">Yuqorida ism kiriting va "Qo'shish" tugmasini bosing</p>
            </div>
          )}

          {/* Search empty */}
          {students.length > 0 && filtered.length === 0 && (
            <div className="card p-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">"{search}" bo'yicha o'quvchi topilmadi</p>
            </div>
          )}

          {/* Student grid */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((student, idx) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  idx={students.indexOf(student)}
                  groups={groups}
                  editId={editId}
                  editName={editName}
                  deleteId={deleteId}
                  onEdit={(s) => { setEditId(s.id); setEditName(s.name) }}
                  onConfirmEdit={confirmEdit}
                  onCancelEdit={() => setEditId(null)}
                  onEditName={setEditName}
                  onDeleteAsk={setDeleteId}
                  onDeleteConfirm={handleDeleteStudent}
                  onDeleteCancel={() => setDeleteId(null)}
                  onToggleGroup={handleToggleStudent}
                />
              ))}
            </div>
          )}

          {students.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              O'quvchilar Bamboozle o'yini va vazifalarda ishlatiladi
            </p>
          )}
        </>
      )}

      {/* ===== GROUPS TAB ===== */}
      {tab === 'groups' && (
        <>
          {/* Add group */}
          <div className="card p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-500" />
              Yangi guruh yaratish
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                placeholder="Guruh nomi (mas: 7-A sinf)..."
                className="field flex-1"
                autoFocus={tab === 'groups'}
              />
              <Button
                onClick={handleAddGroup}
                disabled={!newGroup.trim()}
                icon={<Plus className="w-4 h-4" />}
                className="bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700"
              >
                Yaratish
              </Button>
            </div>
          </div>

          {/* Empty groups */}
          {groups.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-600 mb-2">Hali guruh yo'q</h2>
              <p className="text-sm text-gray-400">
                Guruh yarating va unga o'quvchilarni biriktiring
              </p>
            </div>
          )}

          {/* Groups list */}
          {groups.length > 0 && (
            <div className="space-y-2">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  students={students}
                  onDelete={handleDeleteGroup}
                  onToggleStudent={handleToggleStudent}
                  onRename={handleRenameGroup}
                  onSetColor={handleSetColor}
                />
              ))}
            </div>
          )}

          {groups.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Guruhlarni bosib o'quvchilarni biriktiring yoki olib tashlang
            </p>
          )}
        </>
      )}
    </div>
  )
}
