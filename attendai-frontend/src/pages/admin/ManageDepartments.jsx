import Icon from '../../components/common/Icon'

const DEPARTMENTS = [
  { id: 1, name: 'Computer Science & Engineering', courses: 6, students: 612, faculty: 28 },
  { id: 2, name: 'Artificial Intelligence & ML', courses: 4, students: 340, faculty: 16 },
  { id: 3, name: 'Electronics & Communication', courses: 5, students: 498, faculty: 22 },
  { id: 4, name: 'Mechanical Engineering', courses: 5, students: 470, faculty: 20 },
]

export default function ManageDepartments() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink900">Departments &amp; courses</h2>
          <p className="text-sm text-ink600 mt-1">Manage academic structure — departments, courses, subjects, sections</p>
        </div>
        <button className="btn-signal">
          <Icon name="plus" size={16} />
          Add department
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="reticle p-2.5 rounded bg-signal-50 text-signal-600">
                <Icon name="layers" size={18} />
              </div>
              <button className="text-ink400 hover:text-ink900">
                <Icon name="edit" size={15} />
              </button>
            </div>
            <h3 className="font-display font-semibold text-ink900 mt-3">{dept.name}</h3>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-line">
              <div>
                <p className="text-lg font-display font-semibold text-ink900">{dept.courses}</p>
                <p className="text-[11px] font-mono uppercase text-ink400">Courses</p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-ink900">{dept.students}</p>
                <p className="text-[11px] font-mono uppercase text-ink400">Students</p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-ink900">{dept.faculty}</p>
                <p className="text-[11px] font-mono uppercase text-ink400">Faculty</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
